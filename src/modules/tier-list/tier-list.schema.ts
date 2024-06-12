import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type TierListDocument = HydratedDocument<TierList>;

@Schema({ collection: 'tier-list' })
export class TierList extends Document<Types.ObjectId> {
  @Prop({ required: true, index: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  type: string;

  @Prop({ index: true })
  title: string;

  @Prop({ index: true, default: 0 })
  likes: number;

  @Prop({ required: true })
  content: string;

  @Prop({ index: true, default: 0 })
  dislikes: number;

  @Prop({ default: () => new Date(), index: true })
  createdAt: Date;

  @Prop({ default: () => new Date(), index: true })
  updatedAt: Date;
}

export const TierListSchema = SchemaFactory.createForClass(TierList);
