import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenaiService {
    private openai: OpenAI;
    private model: string;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OpenAiKey?.trim(),
        });
        this.model = process.env.OpenAiKeyModel?.trim() || 'gpt-3.5-turbo';
    }

    async getProfessionalResponse(prompt: string): Promise<string> {
        try {
            const completion = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    { role: 'system', content: 'You are a professional assistant. Respond concisely and helpfully.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 512,
                temperature: 0.7,
            });
            return completion.choices[0]?.message?.content?.trim() || '';
        } catch (error) {
            console.error('OpenAI API error:', error);
            return 'Sorry, I could not generate a response at this time.';
        }
    }
}
