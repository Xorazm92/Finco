import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with username and password' })
  @ApiBody({
    schema: {
      properties: {
        username: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Login successful' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async login(@Body() body: { username: string; password: string }) {
    if (
      !body ||
      typeof body.username !== 'string' ||
      typeof body.password !== 'string'
    ) {
      return { statusCode: 400, message: 'username va password majburiy!' };
    }
    return this.authService.login(body.username, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({ status: 200, description: 'Current user info' })
  async me(@Req() req: any) {
    return this.authService.getMe(req.user);
  }
}
