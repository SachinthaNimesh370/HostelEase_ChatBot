import { Controller, Get, Post, Req, Request, Res, Logger } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

@Controller('whatsapp')
export class WhatsappController {
    private readonly logger = new Logger(WhatsappController.name);
    constructor(private whatsapp:WhatsappService){}

    @Get('test')
    test(){
        return "Whatsapp Controller test"
    }

    @Get('webhook')
    chalange(@Req() req, @Res() res){
        const result = this.whatsapp.verifyChallenge(req.query);
        if (result.status === 200) {
            res.status(200).send(result.body);
        } else {
            res.sendStatus(result.status);
        }
    }
    @Post('webhook')
    async handlewebhook(@Req() req: ExpressRequest, @Res() res: ExpressResponse) {
        if (req.body && req.body.entry) {
            await this.whatsapp.processWebhook(req.body.entry);
            res.sendStatus(200);
        } else {
            this.logger.error('Request body or entry is missing');
            res.status(400).send('Invalid request: body or entry missing');
        }
    }
}

