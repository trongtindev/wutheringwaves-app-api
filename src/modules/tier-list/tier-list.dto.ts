import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsEnum,
  IsHexColor,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import striptags from 'striptags';
import { TierListType } from './tier-list.types';
import { QueryDto } from '@/app.dto';

export class TierListRowDto {
  @Transform(({ value }: TransformFnParams) => striptags(value, []))
  @IsString()
  @Length(1, 30)
  label: string;

  @IsHexColor()
  color: string;

  @IsString({ each: true })
  @ArrayMaxSize(10)
  items: string[];
}

export class CreateTierListBodyDto {
  @Transform(({ value }: TransformFnParams) => striptags(value, []))
  @IsString()
  @Length(6, 100)
  title: string;

  @IsEnum(TierListType)
  type: TierListType;

  @Type(() => TierListRowDto)
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  rows: TierListRowDto[];
}

export class GetListTierListQueryDto extends QueryDto {
  @IsOptional()
  @IsEnum(TierListType)
  type?: TierListType;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  search?: string;
}
