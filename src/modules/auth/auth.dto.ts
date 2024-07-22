import { IsJWT } from 'class-validator';

export class AuthSignInBodyDto {
  @IsJWT()
  credential: string;
}

export class AuthRefreshBodyDto {
  @IsJWT()
  refreshToken: string;
}
