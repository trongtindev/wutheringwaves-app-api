import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import fs from 'fs';
import { IMarker } from './map.interface';

@Injectable()
export class MapService {
  private logger = new Logger(MapService.name);

  constructor(private eventEmitter: EventEmitter2) {}

  async markers(): Promise<IMarker[]> {
    return JSON.parse(fs.readFileSync('./resources/markers.json', 'utf-8'));
  }
}
