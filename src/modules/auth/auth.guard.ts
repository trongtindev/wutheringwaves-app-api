import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JsonWebTokenError } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  private logger = new Logger(AuthGuard.name);

  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<any>();
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException();

    try {
      request.auth = await this.authService.verifyAccessToken(token);
      request.user = await this.userService.findByEmail(request.auth.email);
      if (!request.user) throw new UnauthorizedException();
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        if (error.message === 'invalid signature') {
          this.logger.verbose(`canActivate() ${error.message}`);
          return;
        }
      }

      this.logger.error(error);
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

@Injectable()
export class AuthGuardNullable implements CanActivate {
  private logger = new Logger(AuthGuard.name);

  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<any>();
    const token = this.extractTokenFromHeader(request);
    if (!token) return true;

    try {
      request.auth = await this.authService.verifyAccessToken(token);
      request.user = await this.userService.findByEmail(request.auth.email);
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        if (error.message === 'invalid signature') {
          this.logger.verbose(`canActivate() ${error.message}`);
          return;
        }
      }

      this.logger.error(error);
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
