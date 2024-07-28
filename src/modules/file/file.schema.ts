import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type FileDocument = HydratedDocument<File>;

@Schema({ collection: 'files' })
export class File extends Document<Types.ObjectId> {
  @Prop({ required: true, index: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true, index: true })
  type: string;

  @Prop({ required: true })
  path: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: () => new Date(), index: true })
  createdAt: Date;

  @Prop({ default: () => new Date(), index: true })
  updatedAt: Date;

  @Prop({
    default: () => {
      const expires = new Date();
      expires.setMinutes(expires.getMinutes() + 30);
      return expires;
    },
    index: true
  })
  expiresIn: Date;
}

export const FileSchema = SchemaFactory.createForClass(File);
