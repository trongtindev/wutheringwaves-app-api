import {
  ValidateIf,
  ArrayMinSize,
  ArrayMaxSize,
  IsMongoId,
} from 'class-validator';
import {
  IsFile,
  MinFileSize,
  MaxFileSize,
  HasMimeType,
  MemoryStoredFile,
} from 'nestjs-form-data';

export class UploadFileBodyDto {
  @IsFile()
  @MinFileSize(1024)
  @MaxFileSize(1024 * 1024 * 10)
  @HasMimeType(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
  @ValidateIf((object, value) => typeof value !== 'undefined')
  file?: MemoryStoredFile;

  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsFile({ each: true })
  @MinFileSize(1024, { each: true })
  @MaxFileSize(1024 * 1024 * 10, { each: true })
  @HasMimeType(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'], {
    each: true,
  })
  @ValidateIf((object, value) => typeof value !== 'undefined')
  files?: MemoryStoredFile[];
}

export class FileIdParam {
  @IsMongoId()
  id: string;
}
