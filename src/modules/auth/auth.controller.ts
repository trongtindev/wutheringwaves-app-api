import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Redirect,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRefreshBodyDto, AuthSignInBodyDto } from './auth.dto';
import { Throttle } from '@nestjs/throttler';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Throttle({ signIn: { limit: 5, ttl: 60000 } })
  @Post('signin')
  async signIn(@Body() body: AuthSignInBodyDto) {
    return await this.authService.signIn({
      code: body.code,
      idToken: body.idToken,
    });
  }

  @Post('refresh')
  async refresh(@Body() body: AuthRefreshBodyDto) {
    return await this.authService.refreshToken(body.refreshToken);
  }

  @Get('redirect')
  @Redirect()
  async redirect() {
    const url = await this.authService.getRedirectUrl();
    return { url };
  }

  @Post('anonymous')
  async anonymous(@Body() body: { AUTH_SECRET: string }) {
    const { AUTH_SECRET, AUTH_ANONYMOUS_USER } = process.env;
    if (AUTH_SECRET !== body.AUTH_SECRET) {
      throw new ForbiddenException();
    }

    const user = await this.userService.upsert({
      email: AUTH_ANONYMOUS_USER,
      name: 'Anonymous',
      photoUrl: '',
    });
    return await this.authService.createToken(user);
  }
}
