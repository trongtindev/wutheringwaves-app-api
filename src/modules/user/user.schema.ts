import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'users' })
export class User extends Document<Types.ObjectId> {
  @Prop({ required: true, unique: true })
  uid: string;

  @Prop({})
  name: string;

  @Prop({ index: true })
  email?: string;

  @Prop({ index: true })
  disabled?: boolean;

  @Prop({})
  photoUrl?: string;

  @Prop({ default: () => new Date(), index: true })
  createdAt: Date;

  @Prop({ default: () => new Date(), index: true })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
