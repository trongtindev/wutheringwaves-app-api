import { IsString } from 'class-validator';

export class ImportConveneBodyDto {
  chunks: any[][];

  @IsString()
  playerId: string;

  @IsString()
  serverId: string;
}
