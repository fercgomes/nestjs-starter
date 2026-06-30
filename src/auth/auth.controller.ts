/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Controller, UseGuards, Post, Request, Get } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt.guard';
import posthog from '../posthog';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    const result = await this.authService.login(req.user);
    const distinctId = String(req.user.id);

    posthog.identify({
      distinctId,
      properties: {
        email: req.user.email,
        username: req.user.username,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
      },
    });

    posthog.capture({
      distinctId,
      event: 'user logged in',
      properties: {
        email: req.user.email,
        username: req.user.username,
      },
    });

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    posthog.capture({
      distinctId: String(req.user.userId),
      event: 'profile viewed',
      properties: {
        email: req.user.email,
        username: req.user.username,
      },
    });

    return req.user;
  }
}
