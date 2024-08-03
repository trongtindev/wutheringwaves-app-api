import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import fs from 'fs';
import { IMapPinSummary, IMarker } from './map.interface';
import { MapPinSummary } from './map.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class MapService {
  private logger = new Logger(MapService.name);

  constructor(
    private eventEmitter: EventEmitter2,
    @InjectModel(MapPinSummary.name)
    private pinSummaryModel: Model<MapPinSummary>,
  ) {}

  async markers(): Promise<IMarker[]> {
    return JSON.parse(fs.readFileSync('./resources/markers.json', 'utf-8'));
  }

  async pinSummary(pin: number): Promise<IMapPinSummary> {
    const doc = await this.pinSummaryModel.findOne({ pin });
    return {
      content: doc ? doc.content : null,
    };
  }

  async pinSummaryUpdate(pin: number, args: Partial<IMapPinSummary>) {
    const result = await this.pinSummaryModel.updateOne(
      { pin },
      {
        $set: {
          content: args.content,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );
    return result.modifiedCount;
  }
}
