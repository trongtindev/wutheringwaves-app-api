import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import axios, { AxiosError, AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { google } from 'googleapis';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import Bottleneck from 'bottleneck';
import { assert } from 'console';
import { XMLParser } from 'fast-xml-parser';
import { IndexingUrl, IndexingUrlDocument } from './indexing.schema';
import { IndexingEventType } from './indexing.types';
import { Credentials } from 'google-auth-library';

@Injectable()
export class IndexingService implements OnApplicationBootstrap {
  private logger = new Logger(IndexingService.name);
  private testMode = process.env.NODE_ENV === 'development';
  private indexNow: AxiosInstance;
  private googleapis: AxiosInstance;
  private googleJwtToken: Credentials | undefined;
  private googleSubmitNextTime: Date;
  private googleCheckSubmittedNextTime: Date | undefined;

  constructor(
    private eventEmitter: EventEmitter2,
    @InjectModel(IndexingUrl.name)
    private urlModel: Model<IndexingUrl>,
  ) {}

  onApplicationBootstrap() {
    if (process.env.NODE_ENV === 'development') {
      if (process.env.INDEXING_TEST !== 'true') {
        this.logger.warn(`onApplicationBootstrap() skip indexing.`);
        return;
      }
    }

    const { GOOGLE_ACCOUNT_KEY } = process.env;
    assert(GOOGLE_ACCOUNT_KEY);

    const key = JSON.parse(GOOGLE_ACCOUNT_KEY);
    const jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      ['https://www.googleapis.com/auth/indexing'],
      null,
    );

    this.indexNow = axios.create({
      baseURL: 'https://api.indexnow.org',
    });
    this.googleapis = axios.create({
      baseURL: 'https://indexing.googleapis.com/v3',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.googleapis.interceptors.request.use(async (config) => {
      this.googleJwtToken ??= await jwtClient.authorize();
      config.headers.Authorization = `Bearer ${this.googleJwtToken.access_token}`;
      return config;
    });
    this.googleapis.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        if (error instanceof AxiosError && error.response) {
          if (error.response.status === 401) {
            this.logger.log(`googleapi reauthorize`);
            this.googleJwtToken = await jwtClient.authorize();
            return this.googleapis(error.config);
          }
        }

        throw error;
      },
    );

    this.updateUrls();
  }

  async updateUrls() {
    const exclude = ['trophies'];
    const request = axios.create({
      baseURL: process.env.SITE_URL,
    });
    axiosRetry(request, {
      retries: 99,
      retryCondition: () => true,
    });

    try {
      this.logger.log(`updateUrls()...`);

      const parser = new XMLParser();
      const worker = new Bottleneck({
        maxConcurrent: process.env.NODE_ENV !== 'development' ? 3 : 1,
      });
      const sitemap = await request.get('sitemap.xml');
      const sitemapParse = parser.parse(sitemap.data);
      const sitemapUrls: string[] = sitemapParse.sitemapindex.sitemap.map(
        (e: any) => {
          return e.loc;
        },
      );
      const urls: {
        loc: string;
        lastmod: string;
      }[] = [];
      await Promise.all(
        sitemapUrls.map(async (sitemap) => {
          return worker.schedule(async () => {
            this.logger.log(`updateUrls() ${sitemap}...`);
            const result = await request.get(sitemap);
            const parse: { urlset: { url: any[] } } = parser.parse(result.data);
            parse.urlset.url
              .filter((e) => {
                return e.loc && e.lastmod;
              })
              .forEach((e) => {
                urls.push({
                  loc: e.loc,
                  lastmod: e.lastmod,
                });
              });
          });
        }),
      );

      await this.urlModel.bulkWrite(
        urls
          .filter((url) => {
            return (
              exclude.findIndex((regex) => {
                return url.loc.includes(`/${regex}`);
              }) < 0
            );
          })
          .map((url) => {
            return {
              updateOne: {
                filter: { url: url.loc },
                update: {
                  $set: {
                    updatedAt: new Date(),
                    lastModified: url.lastmod,
                  },
                  $setOnInsert: { url: url.loc },
                },
                upsert: true,
              },
            };
          }),
      );

      this.logger.log(`fetchUrls()... done (${urls.length})`);
      this.eventEmitter.emit(IndexingEventType.urlsUpdated);
    } catch (error) {
      this.logger.error(error);
    }
  }

  async nowSubmitUrls() {
    const { INDEXNOW_HOST, INDEXNOW_KEY, INDEXNOW_KEY_LOCATION } = process.env;
    assert(INDEXNOW_HOST);
    assert(INDEXNOW_KEY);
    assert(INDEXNOW_KEY_LOCATION);

    const docs = await this.urlModel
      .find({
        $expr: {
          $gte: ['$lastModified', '$nowSubmittedAt'],
        },
      })
      .limit(this.testMode ? 1 : 1000);
    if (docs.length === 0) return;

    this.logger.log(`nowSubmitUrls() ${docs.length}`);
    const result = await this.indexNow.post('/IndexNow', {
      host: INDEXNOW_HOST,
      key: INDEXNOW_KEY,
      keyLocation: INDEXNOW_KEY_LOCATION,
      urlList: docs.map((e) => e.url),
    });
    this.logger.log(`nowSubmitUrls() ${docs.length} => ${result.status}`);

    if (result.status >= 200 && result.status <= 299) {
      const writes = await this.urlModel.bulkWrite(
        docs.map((doc) => {
          return {
            updateOne: {
              filter: { _id: doc._id },
              update: {
                $set: {
                  nowSubmittedAt: new Date(),
                },
              },
            },
          };
        }),
      );
      this.logger.log(`nowSubmitUrls() writes: ${writes.modifiedCount}`);
    }
  }

  async googleSubmitUrl(
    doc: IndexingUrlDocument,
    onDone?: () => Promise<void> | void,
  ) {
    if (this.googleSubmitNextTime > new Date()) {
      return;
    }

    const result = await this.googleapis.post(
      '/urlNotifications:publish',
      {
        url: doc.url,
        type: 'URL_UPDATED',
      },
      {
        validateStatus: () => {
          return true;
        },
      },
    );

    this.logger.log(`submitGoogle() ${doc.url} => ${result.status}`);
    if (result.status >= 200 && result.status <= 299) {
      await this.urlModel.updateOne(
        {
          url: doc.url,
        },
        {
          $set: {
            googleSubmitted: true,
          },
        },
      );
      if (onDone) await onDone();
    } else if (result.status === 429) {
      const nextTime = new Date();
      nextTime.setHours(nextTime.getHours() + 24);
      this.googleSubmitNextTime = nextTime;
    }
  }

  async googleSubmitUrls() {
    if (this.googleSubmitNextTime > new Date()) {
      this.logger.warn(`googleSubmitUrls()... skip 429`);
      return;
    }
    this.logger.log(`googleSubmitUrls()...`);

    const docs = await this.urlModel
      .find({
        $expr: {
          $gte: ['$lastModified', '$googleSubmittedAt'],
        },
      })
      .limit(this.testMode ? 1 : 100)
      .sort({
        lastModified: 'desc',
      });
    const worker = new Bottleneck({ maxConcurrent: 3 });

    await Promise.all(
      docs.map((doc) => {
        return worker.schedule(() => {
          return this.googleSubmitUrl(doc, () => {
            this.urlModel.updateOne(
              {
                _id: doc._id,
              },
              {
                $set: {
                  googleSubmittedAt: new Date(),
                },
              },
            );
          });
        });
      }),
    );

    this.logger.log(`googleSubmitUrls() done (${docs.length})`);
  }
}
