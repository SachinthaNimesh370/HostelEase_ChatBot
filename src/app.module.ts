import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhatsappController } from './whatsapp/whatsapp.controller';
import { WhatsappService } from './whatsapp/whatsapp.service';
import { OpenaiService } from './openai/openai.service';
import { MessageLog } from './entities/message-log.entity';
import { UserEntity } from './entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3307,
      username: 'root',
      password: '123123',
      database: 'hostel_ease',
      autoLoadEntities: true,
      synchronize: false,
    }),
    TypeOrmModule.forFeature([MessageLog, UserEntity]),
  ],
  controllers: [AppController, WhatsappController],
  providers: [AppService, WhatsappService, OpenaiService],
})
export class AppModule {}
