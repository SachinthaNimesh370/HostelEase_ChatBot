import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { OpenaiService } from '../openai/openai.service';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageLog } from '../entities/message-log.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class WhatsappService {
    private readonly logger = new Logger(WhatsappService.name);

    constructor(
        private openaiService: OpenaiService,
        @InjectRepository(MessageLog)
        private readonly messageLogRepo: Repository<MessageLog>,
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
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

                            try {
                                // If message is 'mg', return all user names
                                if (content.trim().toLowerCase() === 'mg') {
                                    const users = await this.userRepo.find();
                                    this.logger.log('Fetched users:', users);
                                    const names = users.map(u => `${u.fName} ${u.lName}`).join(', ');
                                    await this.sendmassage(sender, names || 'No users found.');
                                    continue;
                                }

                                // If message is 'all', return all user entity data
                                if (content.trim().toLowerCase() === 'all') {
                                    const users = await this.userRepo.find();
                                    this.logger.log('Fetched all user data:', users);
                                    const allData = users.map(u => JSON.stringify(u)).join('\n');
                                    await this.sendmassage(sender, allData || 'No users found.');
                                    continue;
                                }
                            } catch (dbError) {
                                this.logger.error('Database or mapping error:', dbError);
                                await this.sendmassage(sender, 'Error: Could not fetch user data.');
                                continue;
                            }

                            // Get professional response from OpenAI
                            let aiResponse = await this.openaiService.getProfessionalResponse(content);
                            try {
                                // Fetch all emails from user_entity
                                const users = await this.userRepo.find();
                                const emails = users.map(u => u.email).filter(Boolean).join(', ');
                                aiResponse += emails ? `\nUser Emails: ${emails}` : '\nNo user emails found.';
                            } catch (dbError) {
                                this.logger.error('Database or mapping error:', dbError);
                                aiResponse += '\n[Error: Could not fetch user emails]';
                            }
                            await this.sendmassage(sender, aiResponse);

                            // Save to database
                            await this.messageLogRepo.save({ sender, message: content, aiResponse });

                            this.logger.log('Webhook ID      :' + webhookId);
                            this.logger.log('Sender WA ID    :' + sender);
                            this.logger.log('Sender Name     :' + contact.profile?.name);
                            this.logger.log('Message Content :' + content);
                            this.logger.log('AI Response     :' + aiResponse);
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
