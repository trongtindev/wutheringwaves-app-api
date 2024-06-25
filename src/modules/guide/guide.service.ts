import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PostService } from '../post/post.service';

@Injectable()
export class GuideService {
  private logger = new Logger(GuideService.name);

  constructor(
    private eventEmitter: EventEmitter2,
    private postService: PostService
  ) {}
}
