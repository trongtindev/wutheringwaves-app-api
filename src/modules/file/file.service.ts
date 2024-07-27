import {
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
  ServiceUnavailableException
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  PutObjectAclCommand,
  S3Client,
  ListBucketsCommand
} from '@aws-sdk/client-s3';
import * as fs from 'fs';
import assert from 'assert';
import { File, FileDocument } from './file.schema';
import { IFile, IFileUploadedEventArgs } from './file.interface';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from '../user/user.schema';
import { MemoryStoredFile } from 'nestjs-form-data';
import { createId } from '@paralleldrive/cuid2';
import { FileEventType } from './file.types';
import Bottleneck from 'bottleneck';

@Injectable()
export class FileService implements OnApplicationBootstrap {
  private logger = new Logger(FileService.name);
  private client: S3Client;

  constructor(
    private eventEmitter: EventEmitter2,
    @InjectModel(File.name) private model: Model<File>
  ) {}

  async onApplicationBootstrap() {
    const {
      FILE_S3_ENDPOINT,
      FILE_S3_PATH,
      FILE_S3_REGION,
      FILE_S3_BUCKET,
      FILE_S3_ACCESS_KEY_ID,
      FILE_S3_SECRET_ACCESS_KEY
    } = process.env;

    assert(FILE_S3_ENDPOINT);
    assert(FILE_S3_PATH);
    assert(FILE_S3_REGION);
    assert(FILE_S3_BUCKET);
    assert(FILE_S3_ACCESS_KEY_ID);
    assert(FILE_S3_SECRET_ACCESS_KEY);

    this.client = new S3Client({
      region: FILE_S3_REGION,
      credentials: {
        accessKeyId: FILE_S3_ACCESS_KEY_ID,
        secretAccessKey: FILE_S3_SECRET_ACCESS_KEY
      },
      endpoint: FILE_S3_ENDPOINT
    });

    if (process.env.NODE_ENV === 'development') {
      this.verify();
    } else {
      await this.verify();
    }
  }

  private async verify() {
    await this.client.send(new ListBucketsCommand());
  }

  private async putObject(
    key: string,
    body: Buffer | string,
    params?: {
      ACL?: 'private' | 'public-read';
      client?: S3Client;
      bucket?: string;
    }
  ) {
    params ??= {};
    params.ACL ??= 'public-read';
    params.bucket ??= process.env.FILE_S3_BUCKET;

    const client = params.client ?? this.client;
    return await client.send(
      new PutObjectCommand({
        Key: key,
        ACL: params.ACL,
        Body: typeof body === 'string' ? fs.createReadStream(body) : body,
        Bucket: params.bucket
      })
    );
  }

  private async deleteObject(key: string) {
    this.logger.verbose(`deleteObject(${key})`);
    return await this.client.send(
      new DeleteObjectCommand({
        Key: key,
        Bucket: process.env.FILE_S3_BUCKET
      })
    );
  }

  private async putObjectAclCommand(
    key: string,
    params?: {
      ACL?: 'private' | 'public-read';
      client?: S3Client;
      bucket?: string;
    }
  ) {
    const client = params.client ?? this.client;
    const command = new PutObjectAclCommand({
      Key: key,
      Bucket: params.bucket,
      ACL: params.ACL
    });
    return await client.send(command);
  }

  async resolve(file: FileDocument): Promise<IFile> {
    const { FILE_S3_CDN, FILE_S3_ENDPOINT } = process.env;

    return {
      id: file.id,
      url: `${FILE_S3_CDN || FILE_S3_ENDPOINT}/${file.path}/${file.name}?t=${file.updatedAt.getTime()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt
    };
  }

  async get(id: string | Types.ObjectId): Promise<FileDocument> {
    const document = await this.model.findById(id);
    if (!document) throw new NotFoundException();
    return document;
  }

  async findById(id: string | Types.ObjectId): Promise<FileDocument> {
    return await this.model.findById(id);
  }

  async upload(
    user: UserDocument,
    memoryStoredFile: MemoryStoredFile
  ): Promise<FileDocument> {
    this.logger.verbose(`upload(${memoryStoredFile.originalName})`);

    const date = new Date();
    const filePath = `${process.env.FILE_S3_PATH}/${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
    const fileName = `${createId()}.${memoryStoredFile.extension}`;
    const objectKey = `${filePath}/${fileName}`;

    // upload to cloud
    await this.putObject(objectKey, memoryStoredFile.buffer);

    // create new document
    const result = await this.model.create({
      user: user._id,
      path: filePath,
      name: fileName,
      size: memoryStoredFile.size,
      type: memoryStoredFile.mimetype
    });
    const document = await this.get(result.id);

    // emit event
    const eventArgs: IFileUploadedEventArgs = {
      file: memoryStoredFile.buffer,
      document
    };
    this.eventEmitter.emitAsync(FileEventType.afterUploadAsync, eventArgs);
    this.eventEmitter.emit(FileEventType.afterUpload, eventArgs);

    return document;
  }

  async update(
    file: Types.ObjectId,
    args: {
      file?: string | Buffer;
      type: string;
    }
  ): Promise<void> {
    const date = new Date();
    const split = args.type.split('/');
    const filePath = `${process.env.FILE_S3_PATH}/${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
    const fileName = `${createId()}.${split[split.length - 1]}`;
    const objectKey = `${filePath}/${fileName}`;
    const fileDocument = await this.get(file);

    // upload to cloud
    const buffer =
      typeof args.file === 'string'
        ? fs.readFileSync(args.file, 'binary')
        : args.file;

    // upload new file
    await this.putObject(objectKey, buffer);

    // update file document
    const stat =
      typeof args.file === 'string'
        ? fs.statSync(args.file)
        : { size: buffer.length };
    await this.model.updateOne(
      {
        _id: file
      },
      {
        $set: {
          name: fileName,
          size: stat.size,
          type: args.type,
          updatedAt: new Date()
        }
      }
    );

    // delete previous file
    await this.deleteObject(`${fileDocument.path}/${fileDocument.name}`);
  }

  async delete(file: Types.ObjectId) {
    const document = await this.get(file);
    await this.deleteObject(`${document.path}/${document.name}`);
    await this.model.deleteOne({ _id: file });
  }

  async download(
    file: Types.ObjectId,
    options?: {
      destination?: string;
    }
  ) {
    options ??= {};
  }

  async cleanup(): Promise<void> {
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() - 60);

    const items = await this.model
      .find({
        expiresIn: {
          $gte: 0,
          $lte: expires
        }
      })
      .limit(500)
      .sort({
        createdAt: 'asc'
      });
    const worker = new Bottleneck({ maxConcurrent: 10 });

    this.logger.verbose(`cleanup(${items.length})`);
    await Promise.all(
      items.map((e) => {
        return worker.schedule(() => this.delete(e._id));
      })
    );
  }

  async setExpire(id: Types.ObjectId, expiresIn?: Date | number) {
    this.logger.verbose(`setExpire(${id}) ${expiresIn}`);

    if (!expiresIn || expiresIn === 0) {
      const expires = new Date();
      expires.setMonth(expires.getMonth() * 12 * 100);
      expiresIn = expires;
    }

    const result = await this.model.updateOne(
      {
        _id: id
      },
      {
        $set: {
          expiresIn:
            typeof expiresIn === 'number' ? new Date(expiresIn) : expiresIn
        }
      }
    );
    if (result.modifiedCount === 0) {
      this.logger.verbose(`setExpire(${id}) ${expiresIn} modifiedCount===0`);
      throw new ServiceUnavailableException();
    }
  }
}
