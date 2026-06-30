/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import posthog from '../posthog';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    Logger.log(email);

    try {
      const user = await this.usersService.findByEmail(email);

      // TODO add bcrypt
      if (user.password === password) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return result;
      }

      posthog.capture({
        distinctId: email,
        event: 'login failed',
        properties: {
          email,
          reason: 'invalid_credentials',
        },
      });

      return null;
    } catch (error) {
      posthog.captureException(error, email, { email });
      posthog.capture({
        distinctId: email,
        event: 'login failed',
        properties: {
          email,
          reason: 'user_not_found',
        },
      });
      return null;
    }
  }

  async login(user: any) {
    const payload = {
      username: user.username,
      email: user.email,
      sub: user.id,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
