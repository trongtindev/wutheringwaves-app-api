import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

// posts
export type PostDocument = HydratedDocument<Post>;
@Schema({ collection: 'posts' })
export class Post extends Document<Types.ObjectId> {
  @Prop({ required: true, index: true })
  user: Types.ObjectId;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true, index: true })
  locale: string;

  @Prop({ index: true, default: [] })
  locales: string[];

  @Prop({ required: true })
  thumbnail: Types.ObjectId;

  @Prop({ required: true, unique: true })
  title: string;

  @Prop({ type: Object, default: {} })
  titleLocalized: { [key: string]: string };

  @Prop({ required: true })
  description: string;

  @Prop({ type: Object, default: {} })
  descriptionLocalized: { [key: string]: string };

  @Prop({ required: true })
  content: string;

  @Prop({ type: Object, default: {} })
  contentLocalized: { [key: string]: string };

  @Prop({ index: true, default: false })
  verified: boolean;

  @Prop({ default: [] })
  attachments: Types.ObjectId[];

  @Prop({ index: true, required: true })
  categories: Types.ObjectId[];

  @Prop({ default: 0 })
  views: number;

  @Prop({ required: true })
  keywords: string;

  @Prop({ default: () => new Date(), index: true })
  createdAt: Date;

  @Prop({ default: () => new Date(), index: true })
  updatedAt: Date;
}
export const PostSchema = SchemaFactory.createForClass(Post);

// post_revisions
export type PostRevisionDocument = HydratedDocument<PostCategory>;
@Schema({ collection: 'post_revisions' })
export class PostRevision extends Document<Types.ObjectId> {
  @Prop({ required: true, index: true })
  post: Types.ObjectId;

  @Prop({ required: true, index: true })
  user: Types.ObjectId;

  @Prop({ required: true, index: true })
  locale: string;

  @Prop({ required: true, index: true })
  title: string;

  @Prop({ type: Object, default: {} })
  titleLocalized: { [key: string]: string };

  @Prop({ required: true })
  content: string;

  @Prop({ type: Object, default: {} })
  contentLocalized: { [key: string]: string };

  @Prop({ default: () => new Date(), index: true })
  createdAt: Date;
}
export const PostRevisionSchema = SchemaFactory.createForClass(PostRevision);

// post_categories
export type PostCategoryDocument = HydratedDocument<PostCategory>;
@Schema({ collection: 'post_categories' })
export class PostCategory extends Document<Types.ObjectId> {
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true, index: true })
  name: string;

  @Prop({ index: true, default: {}, type: Object })
  nameLocalized: { [key: string]: string };

  @Prop({ default: () => new Date(), index: true })
  createdAt: Date;

  @Prop({ default: () => new Date(), index: true })
  updatedAt: Date;
}
export const PostCategorySchema = SchemaFactory.createForClass(PostCategory);
