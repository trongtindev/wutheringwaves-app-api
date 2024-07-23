import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsLocale,
  IsMongoId,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
  ArrayMinSize,
  ArrayMaxSize,
  IsArray
} from 'class-validator';
import striptags from 'striptags';
import config from './post.config';
import urlSlug from 'url-slug';
import { QueryDto } from '@/app.dto';

export class PostListQueryDto extends QueryDto {
  @IsOptional()
  @IsMongoId({ each: true })
  @IsArray()
  categories?: string[];
}

export class PostCreateBodyDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }: TransformFnParams) => urlSlug(value))
  @MinLength(5)
  @MaxLength(255)
  slug: string;

  @IsLocale()
  @MinLength(2)
  @MaxLength(2)
  locale: string;

  @IsMongoId({ each: true })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  categories: string[];

  @IsMongoId()
  thumbnail: string;

  @IsString()
  @Length(20, 180)
  title: string;

  @IsString()
  @Length(20, 300)
  description: string;

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

export class PostIdParamDto {
  @IsMongoId()
  id: string;
}

export class PostSlugParamDto {
  @IsString()
  @MaxLength(255)
  slug: string;
}
