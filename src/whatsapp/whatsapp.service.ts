import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { OpenaiService } from '../openai/openai.service';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageLog } from '../entities/message-log.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { ComplainEntity } from '../entities/complain.entity';

@Injectable()
export class WhatsappService {
    private readonly logger = new Logger(WhatsappService.name);

    constructor(
        private openaiService: OpenaiService,
        @InjectRepository(MessageLog)
        private readonly messageLogRepo: Repository<MessageLog>,
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
        @InjectRepository(ComplainEntity)
        private readonly complainRepo: Repository<ComplainEntity>,
    ) {}

    async sendmassage(to: string, massage: string) {
        let data = JSON.stringify({
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "text",
            "text": {
                "preview_url": false,
                "body": massage
            }
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `https://graph.facebook.com/${process.env.Version}/${process.env.PhoneNumberID}/messages`,
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${process.env.WhatsappToken}`
            },
            data : data
        };

        try {
            const response = await axios.request(config);
            console.log(JSON.stringify(response.data));
        } catch (error) {
            console.log(error);
        }
    }

    async processWebhook(entry: any) {
        try {
            if (entry && Array.isArray(entry)) {
                for (const e of entry) {
                    const webhookId = e.id;

                    for (const change of e.changes) {
                        const value = change.value;
                        const message = value.messages?.[0];
                        const contact = value.contacts?.[0];

                        if (message && contact) {
                            const sender = message.from;
                            const content = message.text?.body || '';
                            const timestamp = Number(message.timestamp) * 1000; // Convert to milliseconds
                            const date = new Date(timestamp);

                            // Check if sender exists in user_entity with state true
                            let user;
                            try {
                                // Match last 9 digits of sender with contact_no in DB
                                const localSender = sender.slice(-9);
                                user = await this.userRepo.findOne({ where: { contactNo: localSender, state: true } });
                            } catch (dbError) {
                                this.logger.error('Database or mapping error:', dbError);
                                await this.sendmassage(sender, 'Error: Could not fetch user data.');
                                continue;
                            }

                            if (user) {
                                // User found and state is true
                                // 1. Get reg_no
                                const regNo = user.regNo;

                                // 2. Ask OpenAI to extract complain fields with improved prompt and strict category set
                                const categories = ["maintenance", "cleanliness", "food", "security", "other"];
                                const aiPrompt = `
                                  You are an assistant for a hostel complaint system. Classify the following message into one of these categories: maintenance, cleanliness, food, security, other. Extract the main complaint content, and if a date or time is mentioned, extract them as well. If not, leave them blank.\n
                                  Respond ONLY in this JSON format: { "category": "<category>", "content": "<main complaint>", "date": "<YYYY-MM-DD or blank>", "time": "<HH:mm or blank>" }\n
                                  Message: "${content}"
                                `;
                                let aiExtractedRaw = await this.openaiService.getProfessionalResponse(aiPrompt);
                                let aiExtracted: any = {};
                                try {
                                    aiExtracted = JSON.parse(aiExtractedRaw);
                                } catch (e) {
                                    this.logger.warn('AI response not valid JSON, using fallback.');
                                    aiExtracted = {};
                                }

                                // 3. Ensure date and time are present and valid, fallback to WhatsApp timestamp if not
                                function isValidDate(d: string) {
                                    return /^\d{4}-\d{2}-\d{2}$/.test(d);
                                }
                                function isValidTime(t: string) {
                                    return /^\d{2}:\d{2}(:\d{2})?$/.test(t);
                                }
                                const pad = (n: number) => n.toString().padStart(2, '0');
                                const waDate = `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
                                const waTime = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

                                let complaintDate = aiExtracted.date && isValidDate(aiExtracted.date) ? aiExtracted.date : waDate;
                                let complaintTime = aiExtracted.time && isValidTime(aiExtracted.time) ? (aiExtracted.time.length === 5 ? aiExtracted.time+':00' : aiExtracted.time) : waTime;
                                let complaintCategory = (aiExtracted.category && categories.includes(aiExtracted.category.toLowerCase())) ? aiExtracted.category : 'Other';
                                let complaintContent = aiExtracted.content && aiExtracted.content.trim() ? aiExtracted.content : content;

                                // 4. Compose response
                                let responseMsg = `Your reg_no: ${regNo}\nComplain Details:\nCategory: ${complaintCategory}\nContent: ${complaintContent}\nDate: ${complaintDate}\nTime: ${complaintTime}`;
                                await this.sendmassage(sender, responseMsg);

                                // 5. Save to database if all fields are present
                                if (regNo && complaintCategory && complaintContent && complaintDate && complaintTime) {
                                    try {
                                        const newComplain = this.complainRepo.create({
                                            catagory: complaintCategory,
                                            content: complaintContent,
                                            date: complaintDate,
                                            status: 'Pending',
                                            time: complaintTime,
                                            studentId: regNo,
                                            wardenId: undefined // Use undefined instead of null for TypeORM
                                        });
                                        await this.complainRepo.save(newComplain);
                                        this.logger.log('Complaint saved to database.');
                                    } catch (err) {
                                        this.logger.error('Failed to save complaint:', err);
                                    }
                                }
                            } else {
                                // User not found or state is not true
                                await this.sendmassage(sender, 'Access denied or not registered as an active user.');
                            }

                            this.logger.log('Webhook ID      :' + webhookId);
                            this.logger.log('Sender WA ID    :' + sender);
                            this.logger.log('Sender Name     :' + contact.profile?.name);
                            this.logger.log('Message Content :' + content);
                            this.logger.log('Time            :' + date.toTimeString());
                            this.logger.log('Date            :' + date.toDateString());
                        }
                    }
                }
            }
        } catch (error) {
            this.logger.error('Error processing webhook:', error);
        }
    }

    verifyChallenge(query: any): { status: number, body?: any } {
        // Parse the query params
        let mode = query["hub.mode"];
        let token = query["hub.verify_token"];
        let challenge = query["hub.challenge"];

        // Check if a token and mode is in the query string of the request
        if (mode && token) {
            // Check the mode and token sent is correct
            if (mode === "subscribe" && token === process.env.WHATSAPP_CHALLANGE_KEY) {
                this.logger.log("WEBHOOK_VERIFIED");
                return { status: 200, body: challenge };
            } else {
                return { status: 403 };
            }
        }
        return { status: 400 };
    }
}
