import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { IConveneHistory } from './convene.interface';

// convene_stores
export type ConveneStoreDocument = HydratedDocument<ConveneStore>;
@Schema({ collection: 'convene_stores' })
export class ConveneStore extends Document<Types.ObjectId> {
  @Prop({ index: true })
  playerId: number;

  @Prop({ required: true })
  items: IConveneHistory[][];

  @Prop({ default: '86d52186155b148b5c138ceb41be9650' })
  serverId: string;

  @Prop({ default: () => new Date(), index: true })
  createdAt: Date;

  @Prop({ default: () => new Date(), index: true })
  updatedAt: Date;
}
export const ConveneStoreSchema = SchemaFactory.createForClass(ConveneStore);

// convene_summary
export type ConveneSummaryDocument = HydratedDocument<ConveneSummary>;
@Schema({ collection: 'convene_summary' })
export class ConveneSummary extends Document<Types.ObjectId> {
  @Prop({ required: true, unique: true })
  banner: string;

  @Prop({ required: true })
  cardPoolType: number;

  @Prop({ default: 0 })
  totalPull: number;

  @Prop({ default: 0 })
  totalUsers: number;

  @Prop()
  avgPity: {
    chance: number;
    totalPull: number;
  }[];

  @Prop()
  avgRc: {
    item: number;
    stacks: number[];
  }[];

  @Prop({ default: [] })
  pullByDay: { time: string; total: number }[];

  @Prop()
  winRateOff: number[][];

  @Prop({ default: [] })
  fiveStarList: { item: string; total: number; percentage: number }[];

  @Prop()
  fiveStarWinRate: number[][];

  @Prop({ default: [] })
  fourStarList: { item: string; total: number; percentage: number }[];

  @Prop()
  fourStarWinRate: number[][];

  @Prop({ default: () => new Date(), index: true })
  createdAt: Date;

  @Prop({ default: () => new Date(), index: true })
  updatedAt: Date;
}
export const ConveneSummarySchema =
  SchemaFactory.createForClass(ConveneSummary);
