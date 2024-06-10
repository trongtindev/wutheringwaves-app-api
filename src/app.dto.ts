import { Max, Min, ValidateIf } from 'class-validator';

export class QueryDto {
  @ValidateIf((object, value) => typeof value !== 'undefined')
  @Min(1)
  @Max(100)
  limit?: number;

  @ValidateIf((object, value) => typeof value !== 'undefined')
  @Min(0)
  offset?: number;
}
