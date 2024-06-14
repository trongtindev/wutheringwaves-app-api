import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { AuthGuard } from '../auth/auth.guard';
import { UserDecorator } from '../user/user.decorator';
import { UserDocument } from '../user/user.schema';
import {
  CommentParamDto,
  CreateCommentBodyDto,
  ListCommentQueryDto,
  ReportCommentBodyDto,
  UpdateCommentBodyDto
} from './comment.dto';

@Controller('comments')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @UseGuards(AuthGuard)
  @Get()
  async listComments(
    @UserDecorator() user: UserDocument,
    @Query() query: ListCommentQueryDto
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  async createComment(
    @UserDecorator() user: UserDocument,
    @Body() body: CreateCommentBodyDto
  ) {}

  @UseGuards(AuthGuard)
  @Patch('comments/:id')
  async updateComment(
    @UserDecorator() user: UserDocument,
    @Body() body: UpdateCommentBodyDto,
    @Param() param: CommentParamDto
  ) {}

  @UseGuards(AuthGuard)
  @Delete('comments/:id')
  async deleteComment(
    @UserDecorator() user: UserDocument,
    @Param() param: CommentParamDto
  ) {}

  @UseGuards(AuthGuard)
  @Post('comments/:id/report')
  async reportComment(
    @UserDecorator() user: UserDocument,
    @Param() param: CommentParamDto,
    @Body() body: ReportCommentBodyDto
  ) {}
}
