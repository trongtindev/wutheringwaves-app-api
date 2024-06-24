import { QueryDto } from '@/app.dto';
import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ description: '...' })
  @IsUrl({
    host_whitelist: ['localhost:8080', 'wutheringwaves.app']
  })
  @ValidateIf(() => process.env.NODE_ENV === 'production')
  channel: string;
}

export class CommentParamDto {
  @ApiProperty({ description: '...' })
  @IsMongoId()
  id: string;
}

export class CreateCommentBodyDto {
  @ApiProperty({ description: '...' })
  @IsUrl({
    host_whitelist: ['localhost:8080', 'wutheringwaves.app']
  })
  @ValidateIf(() => process.env.NODE_ENV === 'production')
  channel: string;

  @ApiProperty({ description: '...' })
  @IsString()
  @Length(6, 500)
  @Transform(({ value }: TransformFnParams) => striptags(value, []).trim())
  content: string;

  @ApiProperty({ description: '...' })
  @IsMongoId()
  @IsOptional()
  parent?: string;

  @ApiProperty({ description: '...', required: false })
  @IsMongoId({ each: true })
  @IsOptional()
  attachments?: string[];
}

export class UpdateCommentBodyDto {
  @ApiProperty({ description: '...' })
  @IsString()
  @Length(6, 500)
  @Transform(({ value }: TransformFnParams) => striptags(value, []).trim())
  content: string;
}

export class ReportCommentBodyDto {
  @ApiProperty({ description: '...' })
  @IsString()
  @Length(10, 500)
  reason: string;
}
