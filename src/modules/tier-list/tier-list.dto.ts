import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsEnum,
  IsHexColor,
  IsOptional,
  IsString,
  Length,
  ValidateNested
} from 'class-validator';
import striptags from 'striptags';
import { TierListType } from './tier-list.types';
import { QueryDto } from '@/app.dto';
import { ApiProperty } from '@nestjs/swagger';

export class TierListRowDto {
  @ApiProperty({ description: '' })
  @Transform(({ value }: TransformFnParams) => striptags(value, []))
  @IsString()
  @Length(1, 30)
  label: string;

  @ApiProperty({ description: '' })
  @IsHexColor()
  color: string;

  @ApiProperty({ description: '' })
  @IsString({ each: true })
  @ArrayMaxSize(10)
  items: string[];
}

export class CreateTierListBodyDto {
  @ApiProperty({ description: '' })
  @Transform(({ value }: TransformFnParams) => striptags(value, []))
  @IsString()
  @Length(6, 100)
  title: string;

  @ApiProperty({ enum: TierListType, examples: ['character'], description: '' })
  @IsEnum(TierListType)
  type: TierListType;

  @Type(() => TierListRowDto)
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  rows: TierListRowDto[];
}

export class GetListTierListQueryDto extends QueryDto {
  @ApiProperty({ description: '', required: false })
  @IsOptional()
  @IsEnum(TierListType)
  type?: TierListType;

  @ApiProperty({ description: '', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  search?: string;
}
