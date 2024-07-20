import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import axios, { AxiosInstance } from 'axios';
import { google } from 'googleapis';
import Sitemapper from 'sitemapper';
import { IndexNowUrl } from './indexNow.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import Bottleneck from 'bottleneck';

@Injectable()
export class IndexNowService implements OnApplicationBootstrap {
  private logger = new Logger(IndexNowService.name);
  private indexNow: AxiosInstance;
  private googleapis: AxiosInstance;
  private googleIndexNextTime: Date;

  constructor(
    private eventEmitter: EventEmitter2,
    @InjectModel(IndexNowUrl.name)
    private urlModel: Model<IndexNowUrl>
  ) {
    this.indexNow = axios.create({
      baseURL: 'https://api.indexnow.org'
    });
    this.googleapis = axios.create({
      baseURL: 'https://indexing.googleapis.com/v3'
    });
  }

  onApplicationBootstrap() {
    this.fetchUrls();
  }

  async fetchUrls() {
    this.logger.verbose(`fetchUrls()...`);

    const sitemapper = new Sitemapper({
      url: `${process.env.SITE_URL}/sitemap.xml`,
      retries: 3,
      timeout: 30000
    });
    const exclude = ['ja', 'jp', 'ko', 'th', 'vi'];

    try {
      const { sites } = await sitemapper.fetch();
      this.logger.verbose(`fetchUrls()... ${sites.length}`);

      await this.urlModel.bulkWrite(
        sites
          .filter((url) => {
            return (
              exclude.findIndex((regex) => {
                return url.includes(`/${regex}`);
              }) < 0
            );
          })
          .map((url) => {
            return {
              updateOne: {
                filter: { url },
                update: {
                  $set: {
                    updatedAt: new Date()
                  },
                  $setOnInsert: { url }
                },
                upsert: true
              }
            };
          })
      );
    } catch (error) {
      this.logger.error(error);
    }

    this.logger.verbose(`fetchUrls()... done`);
    if (process.env.NODE_ENV !== 'development') {
      this.submit();
      this.submitGoogle();
    }
  }

  async submit() {
    const docs = await this.urlModel
      .find({
        submitted: false
      })
      .limit(1000);

    this.logger.verbose(`submit(${docs.length})`);
    const result = await this.indexNow.post('/IndexNow', {
      host: process.env.INDEXNOW_HOST,
      key: process.env.INDEXNOW_KEY,
      keyLocation: process.env.INDEXNOW_KEY_LOCATION,
      urlList: docs.map((e) => e.url)
    });
    this.logger.verbose(`submit(${docs.length}) result: ${result.status}`);

    if (result.status >= 200 && result.status <= 299) {
      const writes = await this.urlModel.bulkWrite(
        docs.map((doc) => {
          return {
            updateOne: {
              filter: { url: doc.url },
              update: {
                $set: {
                  indexNow: true
                }
              }
            }
          };
        })
      );
      this.logger.log(`submit(${docs.length}) writes: ${writes.modifiedCount}`);
    }
  }

  async submitGoogle() {
    if (this.googleIndexNextTime > new Date()) {
      return;
    }

    const docs = await this.urlModel
      .find({
        googleSubmitted: false
      })
      .limit(process.env.NODE_ENV === 'development' ? 1 : 200);
    const worker = new Bottleneck({ maxConcurrent: 3 });

    const key = JSON.parse(process.env.FIREBASE_ACCOUNT_KEY);
    const jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      ['https://www.googleapis.com/auth/indexing'],
      null
    );

    this.logger.verbose(`submitGoogle(${docs.length}) jwtClient.authorize()`);
    const jwtTokens = await jwtClient.authorize();

    await Promise.all(
      docs.map((doc) => {
        return worker.schedule(async () => {
          if (this.googleIndexNextTime > new Date()) {
            return;
          }

          const result = await this.googleapis.post(
            '/urlNotifications:publish',
            {
              url: doc.url,
              type: 'URL_UPDATED'
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwtTokens.access_token}`
              },
              validateStatus: () => {
                return true;
              }
            }
          );

          this.logger.log(
            `submitGoogle(${docs.length}) result: ${result.status}`
          );
          if (result.status >= 200 && result.status <= 299) {
            await this.urlModel.updateOne(
              {
                url: doc.url
              },
              {
                $set: {
                  googleSubmitted: true
                }
              }
            );
          } else if (result.status === 429) {
            const nextTime = new Date();
            nextTime.setHours(nextTime.getHours() + 24);
            this.googleIndexNextTime = nextTime;
          }
        });
      })
    );

    this.logger.verbose(`submitGoogle(${docs.length}) done`);
  }
}
