import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class MapPinSummaryParamDto {
  @IsNumber()
  @Type(() => Number)
  id: string;
}

export class MapPinSummaryUpdateBodyDto {
  @IsString()
  content: string;
}
