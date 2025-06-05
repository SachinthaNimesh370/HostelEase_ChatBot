import { Controller, Get } from '@nestjs/common';

@Controller('whatsapp')
export class WhatsappController {
    @Get('test')
    test(){
        return("Hii I am Sachintha");
    }
}
