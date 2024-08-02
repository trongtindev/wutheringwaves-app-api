import { Types } from 'mongoose';
import { FileDocument } from './file.schema';

export interface IFileMetadata {
  width?: number;
  height?: number;
}

export interface IFile {
  id: string;
  url: string;
  name: string;
  type: string;
  size: number;
  metadata?: IFileMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFileUploadedEventArgs {
  file: Buffer;
  document: FileDocument;
}

export interface IFileQueueOptimizeJob {
  _id: Types.ObjectId;
  file: string;
}
