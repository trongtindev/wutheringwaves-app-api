import { IFile } from '../file/file.interface';
import { IUser } from '../user/user.interface';
import { CommentDocument } from './comment.schema';

export interface IComment {
  id: string;
  user: IUser | string;
  content: string;
  likes: number;
  dislikes: number;
  updatedAt: Date;
  createdAt: Date;
  attachments: IFile[];
}

export interface IAfterCreateCommentEventArgs {
  document: CommentDocument;
}

export interface IAfterUpdateCommentEventArgs {
  oldDocument: CommentDocument;
  newDocument: CommentDocument;
}

export interface IAfterDeleteCommentEventArgs {
  oldDocument: CommentDocument;
}
