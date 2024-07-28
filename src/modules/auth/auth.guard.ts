import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private logger = new Logger(AuthGuard.name);

  constructor(
    private authService: AuthService,
    private userService: UserService
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
      this.logger.verbose(error);
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
    private userService: UserService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<any>();
    const token = this.extractTokenFromHeader(request);
    if (!token) return true;

    try {
      request.auth = await this.authService.verifyAccessToken(token);
      request.user = await this.userService.findByEmail(request.auth.email);
    } catch (error) {
      this.logger.verbose(error);
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
