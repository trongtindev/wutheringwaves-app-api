import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type MapPinSummaryDocument = HydratedDocument<MapPinSummary>;

@Schema({ collection: 'map_pin_summary' })
export class MapPinSummary extends Document<Types.ObjectId> {
  @Prop({ required: true, index: true })
  pin: number;

  @Prop()
  content: string;

  @Prop({ default: () => new Date(), index: true })
  createdAt: Date;

  @Prop({ default: () => new Date(), index: true })
  updatedAt: Date;
}

export const MapPinSummarySchema = SchemaFactory.createForClass(MapPinSummary);
