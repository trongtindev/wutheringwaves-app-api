import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { IConveneHistory } from './convene.interface';

// convenes
export type ConveneDocument = HydratedDocument<Convene>;
@Schema({ collection: 'convenes' })
export class Convene extends Document<Types.ObjectId> {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ index: true })
  playerId: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  qualityLevel: number;

  @Prop({ required: true })
  resourceId: number;

  @Prop({ required: true })
  resourceType: string;

  @Prop({ required: true })
  cardPoolType: number;

  @Prop({ default: () => new Date(), index: true })
  createdAt: Date;

  @Prop({ default: () => new Date(), index: true })
  updatedAt: Date;
}
export const ConveneSchema = SchemaFactory.createForClass(Convene);

// convene_chunks
export type ConveneChunkDocument = HydratedDocument<ConveneChunk>;
@Schema({ collection: 'convene_chunks' })
export class ConveneChunk extends Document<Types.ObjectId> {
  @Prop({ index: true })
  playerId: number;

  @Prop({ required: true })
  items: IConveneHistory[];

  @Prop({ required: true })
  cardPoolType: number;

  @Prop({ default: () => new Date(), index: true })
  createdAt: Date;

  @Prop({ default: () => new Date(), index: true })
  updatedAt: Date;
}
export const ConveneChunkSchema = SchemaFactory.createForClass(ConveneChunk);
