
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { UserService } from '../user-management/user.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.userService.findByTelegramIdOrUsername(username);
    if (!user) throw new UnauthorizedException('User not found');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid password');

    return user;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    const token = this.jwtService.sign(payload);
    
    await this.authClient.emit('user_logged_in', {
      userId: user.id,
      timestamp: new Date(),
    }).toPromise();

    return {
      access_token: token,
      user: {
        id: user.id,
        username: user.username,
        roles: user.roles,
      }
    };
  }

  async verify(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.userService.findById(decoded.sub);
      return user;
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
