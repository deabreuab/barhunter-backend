import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async register(email: string, password: string) {
    const userExists = await this.usersService.findByEmail(email);
    if (userExists) {
      throw new Error('Email ya esta registrado');
    }

    const user = await this.usersService.createUser(email, password);
    return {
      id: user.id,
      email: user.email,
    };
  }
}
