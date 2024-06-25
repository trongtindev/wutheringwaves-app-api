import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { PostTypeEnum } from './post.types';

// posts
export type PostDocument = HydratedDocument<Post>;
@Schema({ collection: 'posts' })
export class Post extends Document<Types.ObjectId> {
  @Prop({ type: String, required: true, index: true })
  type: PostTypeEnum;

  @Prop({ required: true, index: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  thumbnail: Types.ObjectId;

  @Prop({ required: true, index: true })
  title: string;

  @Prop({ type: Object, default: {} })
  titleLocalized: { [key: string]: string };

  @Prop({ required: true })
  content: string;

  @Prop({ type: Object, default: {} })
  contentLocalized: { [key: string]: string };

  @Prop({ index: true, default: false })
  verified: boolean;

  @Prop({ default: [] })
  attachments: Types.ObjectId[];

  @Prop({ default: () => new Date(), index: true })
  createdAt: Date;

  @Prop({ default: () => new Date(), index: true })
  updatedAt: Date;
}
export const PostSchema = SchemaFactory.createForClass(Post);

// post_categories
export type PostCategoryDocument = HydratedDocument<PostCategory>;
@Schema({ collection: 'post_categories' })
export class PostCategory extends Document<Types.ObjectId> {
  @Prop({ type: String, required: true, index: true })
  type: PostTypeEnum;

  @Prop({ required: true, index: true })
  name: string;

  @Prop({ default: () => new Date(), index: true })
  createdAt: Date;

  @Prop({ default: () => new Date(), index: true })
  updatedAt: Date;
}
export const PostCategorySchema = SchemaFactory.createForClass(PostCategory);
