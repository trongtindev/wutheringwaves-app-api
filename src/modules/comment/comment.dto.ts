import { QueryDto } from '@/app.dto';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsMongoId,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  ValidateIf
} from 'class-validator';
import striptags from 'striptags';

export class ListCommentQueryDto extends QueryDto {
  @IsUrl({
    host_whitelist: ['localhost:3000', 'wutheringwaves.app']
  })
  @ValidateIf(() => process.env.NODE_ENV === 'production')
  channel: string;
}

export class CommentParamDto {
  @IsMongoId()
  id: string;
}

export class CreateCommentBodyDto {
  @IsUrl({
    host_whitelist: ['localhost:3000', 'wutheringwaves.app']
  })
  @ValidateIf(() => process.env.NODE_ENV === 'production')
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
  attachments?: string[];
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
