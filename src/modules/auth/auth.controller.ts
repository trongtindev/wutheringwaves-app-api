import { Body, Controller, Get, Post, Redirect } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRefreshBodyDto, AuthSignInBodyDto } from './auth.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Throttle({ signIn: { limit: 5, ttl: 60000 } })
  @Post('signin')
  async signIn(@Body() body: AuthSignInBodyDto) {
    return await this.authService.signIn({
      code: body.code,
      idToken: body.idToken
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
}
