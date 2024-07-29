import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { IndexingEventType } from './indexing.types';
import { IndexingService } from './indexing.service';

@Injectable()
export class IndexingEvents {
  constructor(private indexingService: IndexingService) {}

  @OnEvent(IndexingEventType.urlsUpdated)
  async onUrlsUpdated() {
    this.indexingService.nowSubmitUrls();
    this.indexingService.googleSubmitUrls();
  }
}
