import {
  Injectable,
  CanActivate,
  // , ExecutionContext
} from '@nestjs/common';
import { Observable } from 'rxjs';
// import { Request } from 'express';

@Injectable()
export class AppGuard implements CanActivate {
  canActivate() // context: ExecutionContext
  : boolean | Promise<boolean> | Observable<boolean> {
    // const request = context.switchToHttp().getRequest<Request>();
    // const ip = request.ips.length ? request.ips[0] : request.ip;
    // console.log('ip', ip, request.headers);
    return true;
  }
}
