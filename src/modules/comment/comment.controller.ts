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
import { ApiTags } from '@nestjs/swagger';

@ApiTags('comments')
@Controller('comments')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get()
  async listComment(
    @UserDecorator() user: UserDocument,
    @Query() query: ListCommentQueryDto
  ) {
    const result = await this.commentService.listComment(query.channel, {
      limit: query.limit,
      offset: query.offset
    });
    return {
      total: result.total,
      items: await Promise.all(
        result.items.map(async (e) => {
          return await this.commentService.resolve(e);
        })
      )
    };
  }

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
