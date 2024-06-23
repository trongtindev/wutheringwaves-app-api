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

// convene_summary
export type ConveneSummaryDocument = HydratedDocument<ConveneSummary>;
@Schema({ collection: 'convene_summary' })
export class ConveneSummary extends Document<Types.ObjectId> {
  @Prop({ unique: true })
  banner: string;

  @Prop({ default: 0 })
  totalPull: number;

  @Prop({ default: 0 })
  totalUsers: number;

  @Prop({ default: [] })
  pullByDay: { time: string; total: number }[];

  @Prop({ default: [] })
  fiveStarList: { name: string; total: number }[];

  @Prop({ default: [] })
  fourStarList: { name: string; total: number }[];

  @Prop({ default: () => new Date(), index: true })
  createdAt: Date;

  @Prop({ default: () => new Date(), index: true })
  updatedAt: Date;
}
export const ConveneSummarySchema =
  SchemaFactory.createForClass(ConveneSummary);
