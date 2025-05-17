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
    const user = await this.userService.validateUser(username, password);
    if (!user) throw new UnauthorizedException('Login yoki parol noto‘g‘ri.');
    const payload = { sub: user.id, username: user.username, role: user.role };
    return {
      token: this.jwtService.sign(payload),
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
