import { BaseResponse } from './response';

export class BaseException extends BaseResponse {
  status: number;
  message?: string;

  constructor(status: number, message: string) {
    super(status, { status, message });

    this.status = status;
    this.message = message;
  }
}

export class ForbiddenException extends BaseException {
  constructor() {
    super(403, 'ForbiddenException');
  }
}

export class BadRequestException extends BaseException {
  constructor(message?: string) {
    super(400, message || 'BadRequestException');
  }
}

export class UnauthorizedException extends BaseException {
  constructor(message?: string) {
    super(401, message || 'UnauthorizedException');
  }
}

export class InternalServerErrorException extends BaseException {
  constructor(message?: string) {
    super(500, message || 'InternalServerErrorException');
    console.error(message || 'InternalServerErrorException');
  }
}
