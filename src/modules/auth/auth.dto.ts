import { IsJWT, IsOptional, IsString } from 'class-validator';

export class AuthSignInBodyDto {
  @IsString()
  @IsOptional()
  code: string;

  @IsJWT()
  @IsOptional()
  idToken: string;
}

export class AuthRefreshBodyDto {
  @IsJWT()
  refreshToken: string;
}
