import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  public async findById(userId: number): Promise<User> {
    return await this.usersRepository.findOneOrFail(userId);
  }

  public async findByEmail(email: string): Promise<User> {
    return await this.usersRepository.findOneOrFail({ email: email });
  }
}
