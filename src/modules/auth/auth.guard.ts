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
    const authorization = this.extractTokenFromHeader(request);
    if (!authorization) throw new UnauthorizedException();

    try {
      request.auth = await this.authService.verifyIdToken(authorization);
      request.user = await this.userService.findByUid(request.auth.uid);
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
    const authorization = this.extractTokenFromHeader(request);
    if (!authorization) return true;

    try {
      request.auth = await this.authService.verifyIdToken(authorization);
      request.user = await this.userService.findByUid(request.auth.uid);
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
