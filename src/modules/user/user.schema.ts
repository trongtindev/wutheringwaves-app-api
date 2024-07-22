import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'users' })
export class User extends Document<Types.ObjectId> {
  @Prop({})
  name: string;

  @Prop({ unique: true })
  email: string;

  @Prop({})
  photoUrl?: string;

  @Prop({ default: () => new Date(), index: true })
  createdAt: Date;

  @Prop({ default: () => new Date(), index: true })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
