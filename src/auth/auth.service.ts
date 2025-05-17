import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../features/user-management/user.service';
import { UserEntity } from '../features/user-management/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    const fs = require('fs');
    fs.appendFileSync('diagnostic.log', `LOGIN ATTEMPT: ${username} ${password}\n`);
    const user = await this.userService.validateUser(username, password);
    fs.appendFileSync('diagnostic.log', `LOGIN USER RESULT: ${JSON.stringify(user)}\n`);
    if (!user) throw new UnauthorizedException('Login yoki parol noto‘g‘ri.');
    const payload = { sub: user.id, username: user.username, role: user.role };
    fs.appendFileSync('diagnostic.log', `JWT PAYLOAD: ${JSON.stringify(payload)}\n`);
    let token: string;
    try {
      token = this.jwtService.sign(payload);
      fs.appendFileSync('diagnostic.log', `JWT TOKEN: ${token}\n`);
    } catch (e) {
      fs.appendFileSync('diagnostic.log', `JWT SIGN ERROR: ${e && e.stack ? e.stack : e}\n`);
      throw e;
    }
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  async getMe(user: any) {
    return this.userService.findById(user.sub);
  }
}
