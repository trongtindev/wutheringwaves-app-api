import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type IndexingUrlDocument = HydratedDocument<IndexingUrl>;

@Schema({ collection: 'indexing_urls' })
export class IndexingUrl extends Document<Types.ObjectId> {
  @Prop({ required: true, index: true })
  url: string;

  @Prop({ default: () => new Date(0), index: true })
  nowSubmittedAt: Date;

  @Prop({ default: false, index: true })
  googleSubmitted: boolean;

  @Prop({ default: () => new Date(0), index: true })
  googleSubmittedAt: Date;

  @Prop({ default: () => new Date(0), index: true })
  googleResubmittedAt: Date;

  @Prop({ default: () => new Date(0), index: true, required: true })
  lastModified: Date;

  @Prop({ default: () => new Date(), index: true })
  createdAt: Date;

  @Prop({ default: () => new Date(), index: true })
  updatedAt: Date;
}

export const IndexingUrlSchema = SchemaFactory.createForClass(IndexingUrl);
