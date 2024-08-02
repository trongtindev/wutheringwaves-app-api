import { Type } from 'class-transformer';
import { IsBoolean, IsJSON, IsOptional, MaxLength } from 'class-validator';

export class SyncPullQueryDto {
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  withData?: boolean;
}

export class SyncPushBodyDto {
  @MaxLength(1024 * 1024 * 5)
  @IsJSON()
  data: string;
}
