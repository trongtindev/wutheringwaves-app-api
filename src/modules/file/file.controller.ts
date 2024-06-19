import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards
} from '@nestjs/common';
import { FormDataRequest } from 'nestjs-form-data';
import { AuthGuard } from '../auth/auth.guard';
import { UploadFileBodyDto } from './file.dto';
import { FileService } from './file.service';
import { UserDecorator } from '../user/user.decorator';
import { UserDocument } from '../user/user.schema';
import { IFile } from './file.interface';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@ApiTags('files')
@ApiBearerAuth()
@Controller('files')
export class FileController {
  constructor(private fileService: FileService) {}

  @ApiResponse({})
  @Throttle({
    upload: {
      ttl: 60000,
      limit: 5
    }
  })
  @UseGuards(AuthGuard)
  @FormDataRequest()
  @Post()
  async upload(
    @Body() body: UploadFileBodyDto,
    @UserDecorator() user: UserDocument
  ): Promise<IFile | IFile[]> {
    if (body.file) {
      // single file
      const result = await this.fileService.upload(user, body.file);
      return await this.fileService.resolve(result);
    } else if (body.files) {
      // multiple file
      const results = await Promise.all(
        body.files.map(async (element) => {
          return await this.fileService.upload(user, element);
        })
      );
      return await Promise.all(
        results.map(async (element) => {
          return await this.fileService.resolve(element);
        })
      );
    }
    throw new BadRequestException();
  }
}
