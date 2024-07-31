import { Transform, TransformFnParams, Type } from 'class-transformer';
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
  IsArray,
  IsObject,
  IsDateString,
  IsDate,
} from 'class-validator';
import striptags from 'striptags';
import config, {
  POST_CONTENT_LENGTH,
  POST_DESCRIPTION_LENGTH,
  POST_TITLE_LENGTH,
} from './post.config';
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

  @IsLocale({ each: true })
  @ArrayMaxSize(10)
  @IsOptional()
  locales: string[];

  @IsMongoId({ each: true })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  categories: string[];

  @IsMongoId()
  thumbnail: string;

  @IsString()
  @Length(POST_TITLE_LENGTH[0], POST_TITLE_LENGTH[1])
  title: string;

  @IsObject()
  titleLocalized: { [key: string]: string };

  @IsString()
  @Length(POST_DESCRIPTION_LENGTH[0], POST_DESCRIPTION_LENGTH[1])
  description: string;

  @IsObject()
  descriptionLocalized: { [key: string]: string };

  @IsString()
  @Length(POST_CONTENT_LENGTH[0], POST_CONTENT_LENGTH[1])
  @Transform(({ value }: TransformFnParams) =>
    striptags(value, config.safeHTMLTags),
  )
  content: string;

  @IsObject()
  contentLocalized: { [key: string]: string };

  @IsString()
  @Length(5, 500)
  keywords: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  schedule: string;
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
