import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthData } from '../auth/auth.interface';
import { ConveneStore } from './convene.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProxyService } from '../proxy/proxy.service';
import { ConveneEventType } from './convene.types';
import {
  IAfterImportConveneEventArgs,
  IConveneHistory
} from './convene.interface';
import Bottleneck from 'bottleneck';

@Injectable()
export class ConveneService {
  private logger = new Logger(ConveneService.name);

  constructor(
    private eventEmitter: EventEmitter2,
    @InjectModel(ConveneStore.name)
    private conveneStoreModel: Model<ConveneStore>,
    private proxyService: ProxyService
  ) {}

  /**
   *
   */
  async import(
    url: string,
    args: {
      userAgent: string;
      auth?: AuthData;
    }
  ) {
    this.logger.verbose(`import(${url})`);

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

    const worker = new Bottleneck({ maxConcurrent: 3 });
    const handle = async (cardPoolType: number) => {
      const response = await this.proxyService.useWorker(
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
            cardPoolType,
            languageCode: lang,
            playerId: player_id,
            recordId: record_id,
            serverId: svr_id
          }
        }
      );

      return JSON.parse(response.data.text).data.map((e) => {
        if (!e.time) throw new BadGatewayException('missing field time');
        if (!e.name) throw new BadGatewayException('missing field name');
        if (!e.qualityLevel)
          throw new BadGatewayException('missing field qualityLevel');
        if (!e.resourceType)
          throw new BadGatewayException('missing field resourceType');

        return {
          time: e.time,
          name: e.name,
          resourceType: e.resourceType,
          qualityLevel: e.qualityLevel
        };
      }) as IConveneHistory[];
    };
    const chunks = await Promise.all(
      Array.from(Array(7).keys()).map((cardPoolType) => {
        return worker.schedule(() => {
          return handle(cardPoolType + 1);
        });
      })
    );

    // store
    await this.conveneStoreModel.updateOne(
      { playerId: parseInt(player_id) },
      {
        $set: {
          updatedAt: new Date()
        }
      },
      {
        upsert: true
      }
    );
    const store = await this.conveneStoreModel.findOne({
      playerId: parseInt(player_id)
    });

    // merge
    const items: IConveneHistory[][] = Array.from(Array(7).keys()).map(
      () => []
    );
    for (let i = 0; i < 7; i += 1) {
      let mergeEnd = 0;

      for (let j = 0; j < chunks[i].length; j += 1) {
        if (store.items.length - 1 < i) {
          mergeEnd = chunks[i].length;
          break;
        } else {
          let skip = false;
          for (let k = 0; k < store.items[i].length; k += 1) {
            if (
              chunks[i][j].time === store.items[i][k].time &&
              chunks[i][j].name === store.items[i][k].name
            ) {
              skip = true;
              break;
            }
          }
          if (skip) break;
        }

        mergeEnd += 1;
      }

      items[i] = [
        ...chunks[i].slice(0, mergeEnd),
        ...(store.items.length - 1 >= i ? store.items[i] : [])
      ];
    }

    // update
    await this.conveneStoreModel.updateOne(
      { playerId: parseInt(player_id) },
      {
        $set: {
          items
        }
      }
    );

    // emit event
    const eventArgs: IAfterImportConveneEventArgs = {
      playerId: parseInt(player_id),
      items
    };
    await this.eventEmitter.emitAsync(
      ConveneEventType.afterImportAsync,
      eventArgs
    );
    this.eventEmitter.emit(ConveneEventType.afterImport, eventArgs);

    return {
      playerId: parseInt(player_id),
      items: Object.keys(items)
        .map((key) => {
          return items[key].map((e) => {
            return {
              ...e,
              cardPoolType: parseInt(key) + 1
            };
          });
        })
        .flatMap((e) => e),
      total: Object.keys(items).reduce((prev, e) => items[e].length + prev, 0)
    };
  }

  /**
   *
   */
  async globalStatsCalculate() {}
}
