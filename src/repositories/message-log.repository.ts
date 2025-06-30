import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageLog } from '../entities/message-log.entity';

@Injectable()
export class MessageLogRepository {
  constructor(
    @InjectRepository(MessageLog)
    private readonly repo: Repository<MessageLog>,
  ) {}

  async saveLog(sender: string, message: string, aiResponse: string): Promise<MessageLog> {
    const log = this.repo.create({ sender, message, aiResponse });
    return this.repo.save(log);
  }
}
