import { Types } from 'mongoose';
import { PostDocument } from './post.schema';
import { IFile } from '../file/file.interface';
import { IUser } from '../user/user.interface';

export interface IPost {
  id: string;
  user: IUser;
  slug: string;
  locale: string;
  locales: string[];
  title: string;
  titleLocalized: { [key: string]: string };
  description: string;
  descriptionLocalized: { [key: string]: string };
  content: string;
  contentLocalized: { [key: string]: string };
  thumbnail: IFile;
  attachments?: IFile[];
  views: number;
  updatedAt: string;
  createdAt: string;
  categories: IPostCategory[];
  keywords: string;
  deleted: boolean;
}

export interface IPostCategory {
  id: string;
  slug: string;
  name: string;
  nameLocalized: { [key: string]: string };
}

export interface IPostAfterCreateEventArgs {
  document: PostDocument;
}

export interface IPostCreateArgs {
  locale: string;
  locales?: string[];

  title: string;
  titleLocalized?: { [key: string]: string };

  description: string;
  descriptionLocalized?: { [key: string]: string };

  content: string;
  contentLocalized?: { [key: string]: string };

  thumbnail: Types.ObjectId;
  categories: Types.ObjectId[];

  attachments?: Types.ObjectId[];
  keywords: string;
  schedule?: Date;
}
