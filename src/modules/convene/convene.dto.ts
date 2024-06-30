import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';

export class ImportConveneBodyDto {
  @ApiProperty({ description: '...' })
  @IsUrl()
  url: string;

  @ApiProperty({ description: '...' })
  @IsString()
  userAgent: string;
}
