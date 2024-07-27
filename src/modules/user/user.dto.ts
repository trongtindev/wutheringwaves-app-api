import { IsJWT, IsOptional } from 'class-validator';

export class UserVerifyBodyDto {
  @IsJWT()
  code: string;
}

export class UserGetRolesQueryDto {
  @IsOptional()
  refresh?: boolean;
}
