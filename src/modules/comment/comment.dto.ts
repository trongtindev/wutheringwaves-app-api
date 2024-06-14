import { QueryDto } from '@/app.dto';
import {
  IsMongoId,
  IsOptional,
  IsString,
  IsUrl,
  Length
} from 'class-validator';

export class ListCommentQueryDto extends QueryDto {
  @IsUrl()
  channel: string;
}

export class CommentParamDto {
  @IsMongoId()
  id: string;
}

export class CreateCommentBodyDto {
  @IsUrl()
  @Length(1, 100)
  channel: string;

  @IsString()
  @Length(8, 500)
  content: string;

  @IsMongoId()
  @IsOptional()
  parent?: string;
}

export class UpdateCommentBodyDto {
  @IsString()
  @Length(8, 500)
  content: string;
}

export class ReportCommentBodyDto {
  @IsString()
  @Length(8, 500)
  reason: string;
}
