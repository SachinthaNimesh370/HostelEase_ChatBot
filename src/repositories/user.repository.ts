import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async getAllUserNames(): Promise<string[]> {
    const users = await this.repo.find();
    return users.map(u => `${u.fName} ${u.lName}`);
  }
}
