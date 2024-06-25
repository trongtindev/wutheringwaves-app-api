import { PostDocument } from './post.schema';

export interface IPost {
  id: string;
}

export interface IPostCategory {
  id: string;
}

export interface IPostAfterCreateEventArgs {
  document: PostDocument;
}
