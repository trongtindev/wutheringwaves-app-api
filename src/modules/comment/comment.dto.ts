import { QueryDto } from '@/app.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsMongoId,
  IsOptional,
  IsString,
  IsUrl,
  Length
} from 'class-validator';

export class ListCommentQueryDto extends QueryDto {
  @ApiProperty({ description: '...' })
  @IsUrl()
  channel: string;
}

export class CommentParamDto {
  @ApiProperty({ description: '...' })
  @IsMongoId()
  id: string;
}

export class CreateCommentBodyDto {
  @ApiProperty({ description: '...' })
  @IsUrl()
  @Length(1, 100)
  channel: string;

  @ApiProperty({ description: '...' })
  @IsString()
  @Length(8, 500)
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
  @Length(8, 500)
  content: string;
}

export class ReportCommentBodyDto {
  @ApiProperty({ description: '...' })
  @IsString()
  @Length(8, 500)
  reason: string;
}
