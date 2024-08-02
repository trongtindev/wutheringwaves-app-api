import { IsBoolean, IsOptional, IsString, IsUrl } from 'class-validator';

export class ImportConveneBodyDto {
  @IsUrl()
  url: string;

  @IsString()
  userAgent: string;

  @IsBoolean()
  @IsOptional()
  skipMerge?: boolean;
}
