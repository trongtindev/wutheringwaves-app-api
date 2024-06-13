import { Type } from 'class-transformer';
import { Max, Min, IsOptional } from 'class-validator';

export class QueryDto {
  @Type(() => Number)
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number;

  @Type(() => Number)
  @IsOptional()
  @Min(0)
  offset?: number;
}
