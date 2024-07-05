import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUrl } from 'class-validator';

export class ImportConveneBodyDto {
  @ApiProperty({ description: '...' })
  @IsUrl()
  url: string;

  @ApiProperty({ description: '...' })
  @IsString()
  userAgent: string;

  @ApiProperty({ description: '...' })
  @IsBoolean()
  @IsOptional()
  skipMerge?: boolean;
}
