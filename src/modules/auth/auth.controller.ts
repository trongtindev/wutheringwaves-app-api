import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRefreshBodyDto, AuthSignInBodyDto } from './auth.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Throttle({ signIn: { limit: 5, ttl: 60000 } })
  @Post('signin')
  async signIn(@Body() body: AuthSignInBodyDto) {
    return await this.authService.signIn(body.credential);
  }

  @Post('refresh')
  async refresh(@Body() body: AuthRefreshBodyDto) {
    return await this.authService.refreshToken(body.refreshToken);
  }
}
