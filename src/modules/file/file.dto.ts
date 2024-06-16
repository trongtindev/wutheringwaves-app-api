import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import {
  IsFile,
  MinFileSize,
  MaxFileSize,
  HasMimeType,
  MemoryStoredFile
} from 'nestjs-form-data';

export class UploadFileBodyDto {
  @ApiProperty({ description: '...' })
  @IsFile()
  @MinFileSize(1024)
  @MaxFileSize(1024 * 1024 * 10)
  @HasMimeType(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
  @ValidateIf((object, value) => typeof value !== 'undefined')
  file?: MemoryStoredFile;

  @ApiProperty({ description: '...' })
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsFile({ each: true })
  @MinFileSize(1024, { each: true })
  @MaxFileSize(1024 * 1024 * 10, { each: true })
  @HasMimeType(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'], {
    each: true
  })
  @ValidateIf((object, value) => typeof value !== 'undefined')
  files?: MemoryStoredFile[];
}
