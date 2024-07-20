import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type IndexNowUrlDocument = HydratedDocument<IndexNowUrl>;

@Schema({ collection: 'indexNow_urls' })
export class IndexNowUrl extends Document<Types.ObjectId> {
  @Prop({ required: true, index: true })
  url: string;

  @Prop({ default: false })
  submitted: boolean;

  @Prop({ default: false })
  googleSubmitted: boolean;

  @Prop({ default: () => new Date(), index: true })
  createdAt: Date;

  @Prop({ default: () => new Date(), index: true })
  updatedAt: Date;
}

export const IndexNowUrlSchema = SchemaFactory.createForClass(IndexNowUrl);
