import { Type } from 'class-transformer';
import { IsBoolean, IsJSON, IsOptional, MaxLength } from 'class-validator';

export class GetBackupQueryDto {
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  withData?: boolean;
}

export class PutBackupBodyDto {
  @MaxLength(1024 * 1024 * 5)
  @IsJSON()
  data: string;
}
