import { IUser } from '../user/user.interface';
import { CommentDocument } from './comment.schema';

export class IComment {
  id: string;
  user: IUser;
  content: string;
  createdAt: Date;
  updatedAt: Date;
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
