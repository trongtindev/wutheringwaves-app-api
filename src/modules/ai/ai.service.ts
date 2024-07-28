import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AIService {
  private logger = new Logger(AIService.name);

  constructor(private eventEmitter: EventEmitter2) {}
}
