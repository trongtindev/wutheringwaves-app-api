import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthData } from '../auth/auth.interface';
import { Md5 } from 'ts-md5';
import { Convene } from './convene.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProxyService } from '../proxy/proxy.service';

@Injectable()
export class ConveneService {
  private logger = new Logger(ConveneService.name);

  constructor(
    private eventEmitter: EventEmitter2,
    @InjectModel(Convene.name) private conveneModel: Model<Convene>,
    private proxyService: ProxyService
  ) {}

  /**
   *
   */
  async import(
    url: string,
    args: {
      userAgent: string;
      cardPoolType: number;
      auth?: AuthData;
    }
  ) {
    const uri = new URL(url.replaceAll('index.html#', 'index.html'));
    const lang = uri.searchParams.get('lang');
    const svr_id = uri.searchParams.get('svr_id');
    const player_id = uri.searchParams.get('player_id');
    const resources_id = uri.searchParams.get('resources_id');
    const record_id = uri.searchParams.get('record_id');

    if (!lang) throw new BadRequestException('lang not found');
    if (!svr_id) throw new BadRequestException('svr_id not found');
    if (!player_id) throw new BadRequestException('player_id not found');
    if (!resources_id) throw new BadRequestException('resources_id not found');
    if (!record_id) throw new BadRequestException('record_id not found');

    // send request
    const request = await this.proxyService.useWorker(
      'https://gmserver-api.aki-game2.net/gacha/record/query',
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://aki-gm-resources-oversea.aki-game.net',
          Priority: 'u=1, i',
          Referer: 'https://aki-gm-resources-oversea.aki-game.net/',
          'User-Agent': args.userAgent
        },
        body: {
          cardPoolId: resources_id,
          cardPoolType: args.cardPoolType,
          languageCode: lang,
          playerId: player_id,
          recordId: record_id,
          serverId: svr_id
        }
      }
    );

    // check response
    const response: {
      data?: {
        name: string;
        qualityLevel: number;
        resourceId: number;
        resourceType: string;
        time: string;
      }[];
      message?: string;
    } = JSON.parse(request.data.text);
    if (response.message !== 'success') {
      throw new BadRequestException('invalid response');
    } else if (!response.data) {
      throw new BadRequestException('invalid response data');
    }

    // check missing fields
    const isMissingFields = response.data.findIndex(
      (e) =>
        !e.name ||
        !e.qualityLevel ||
        !e.resourceId ||
        !e.resourceType ||
        !e.time
    );
    if (isMissingFields > 0) {
      throw new BadRequestException('some field missing');
    }

    const items = response.data
      .sort((a, b) => {
        return new Date(a.time).getTime() - new Date(b.time).getTime();
      })
      .map((e, i) => {
        const sign = Object.keys(e).map((key) => (e as any)[key]);
        const key = Md5.hashStr(
          i + sign.join('|') + player_id + args.cardPoolType
        );

        return {
          ...e,
          cardPoolType: args.cardPoolType,
          key
        };
      });

    // initialize models
    const writes = items.map((e) => {
      return {
        updateOne: {
          filter: { key: e.key },
          update: {
            name: e.name,
            qualityLevel: e.qualityLevel,
            resourceId: e.resourceId,
            resourceType: e.resourceType,
            createdAt: new Date(e.time),
            playerId: parseInt(player_id)
          },
          upsert: true
        }
      };
    });
    await this.conveneModel.bulkWrite(writes);

    return {
      total: items.length,
      items
    };
  }

  /**
   *
   */
  async globalStatsCalculate() {}
}
