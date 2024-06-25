import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  Length
} from 'class-validator';
import striptags from 'striptags';
import config from './post.config';
import { PostTypeEnum } from './post.types';

export class PostCreateBodyDto {
  @IsEnum(PostTypeEnum)
  type: PostTypeEnum;

  @IsMongoId()
  category: string;

  @IsMongoId()
  thumbnail: string;

  @IsString()
  @Length(20, 100)
  title: string;

  @IsString()
  @Length(500, 20000)
  @Transform(({ value }: TransformFnParams) =>
    striptags(value, config.safeHTMLTags)
  )
  content: string;

  @IsMongoId({ each: true })
  @IsOptional()
  attachments: string[];
}
