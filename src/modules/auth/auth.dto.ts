import { IsJWT, IsString } from 'class-validator';

export class SignInBodyDto {
  @IsString()
  playerId: string;

  @IsJWT()
  accessToken: string;

  integrityToken: string;
}
