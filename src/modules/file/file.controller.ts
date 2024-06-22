import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Logger,
  NotFoundException,
  Param,
  Post,
  UseGuards
} from '@nestjs/common';
import { FormDataRequest } from 'nestjs-form-data';
import { AuthGuard } from '../auth/auth.guard';
import { FileIdParam, UploadFileBodyDto } from './file.dto';
import { FileService } from './file.service';
import { UserDecorator } from '../user/user.decorator';
import { UserDocument } from '../user/user.schema';
import { IFile } from './file.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Types } from 'mongoose';

@ApiTags('files')
@ApiBearerAuth()
@Controller('files')
export class FileController {
  private logger = new Logger(FileController.name);
  constructor(private fileService: FileService) {}

  @Throttle({
    default: {
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

  @UseGuards(AuthGuard)
  @Delete(':id')
  async delete(
    @Param() param: FileIdParam,
    @UserDecorator() user: UserDocument
  ) {
    const id = new Types.ObjectId(param.id);
    const file = await this.fileService.get(id);

    if (file.user.equals(user._id) === false) {
      this.logger.verbose(`delete(${param.id}) ${file.user} != ${user._id}`);
      throw new NotFoundException();
    } else if (file.expiresIn.getTime() === 0) {
      throw new BadRequestException();
    }

    await this.fileService.delete(id);
  }
}
