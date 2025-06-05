import { Controller, Get, Post, Req, Request, Res } from '@nestjs/common';

@Controller('whatsapp')
export class WhatsappController {
    @Get('test')
    test(){
        return("Hii I am Sachintha");
    }

    @Get('webhook')
    chalange(@Req() req, @Res() res){
        // Parse the query params
        let mode = req.query["hub.mode"];
        let token = req.query["hub.verify_token"];
        let challenge = req.query["hub.challenge"];

        // Check if a token and mode is in the query string of the request
        if (mode && token) {
            // Check the mode and token sent is correct
            if (mode === "subscribe" && token === '123456789') {
            // Respond with the challenge token from the request
            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
            } else {
            // Respond with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
            }
        }
    }

    @Post('webhook')
    handlewebhook(@Req() req, @Res() res){
        const entries = req.body.entry;
        for (const entry of entries) {
        for (const change of entry.changes) {
            const value = change.value;

            const contact = value.contacts?.[0];
            const message = value.messages?.[0];

            if (contact && message) {
                const number = contact.wa_id;
                const name = contact.profile.name;
                const text = message.text?.body || '';
                const timestamp = message.timestamp;

                // Convert Unix timestamp to readable time (optional)
                const date = new Date(Number(timestamp) * 1000);

                console.log('--- Webhook Message ---');
                console.log('Number:', number);
                console.log('Name:', name);
                console.log('Message:', text);
                console.log('Time:', date.toString());
            }
        }
    }

    }
}
