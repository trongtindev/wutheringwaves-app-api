import { QueryDto } from '@/app.dto';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsMongoId,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import striptags from 'striptags';

export class ListCommentQueryDto extends QueryDto {
  @IsString()
  @Length(1, 255)
  channel: string;
}

export class CommentParamDto {
  @IsMongoId()
  id: string;
}

export class CreateCommentBodyDto {
  @IsString()
  @Length(1, 255)
  channel: string;

  @IsString()
  @Length(6, 500)
  @Transform(({ value }: TransformFnParams) => striptags(value, []).trim())
  content: string;

  @IsMongoId()
  @IsOptional()
  parent?: string;

  @IsMongoId({ each: true })
  @IsOptional()
  @IsArray()
  attachments?: string[];

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  schedule: string;
}

export class UpdateCommentBodyDto {
  @IsString()
  @Length(6, 500)
  @Transform(({ value }: TransformFnParams) => striptags(value, []).trim())
  content: string;
}

export class ReportCommentBodyDto {
  @IsString()
  @Length(10, 500)
  reason: string;
}
