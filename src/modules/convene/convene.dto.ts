import { IsNumber, IsString, IsUrl } from 'class-validator';

export class ImportConveneBodyDto {
  @IsUrl()
  url: string;

  @IsString()
  userAgent: string;

  @IsNumber()
  cardPoolType: number;
}
