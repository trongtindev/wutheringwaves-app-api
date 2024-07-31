import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.auth;
  },
);
