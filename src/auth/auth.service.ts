import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Credenciales invalidas');

    const { password: _, ...result } = user;
    return result
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload)
    }
  }

  async register(email: string, password: string) {
    try {
      const userExists = await this.usersService.findByEmail(email);
      if (userExists) {
        throw new ConflictException('El correo ya está registrado');
      }
    
      const user = await this.usersService.createUser(email, password);
      return {
        id: user.id,
        email: user.email,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

}
