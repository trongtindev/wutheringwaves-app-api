import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  OnApplicationBootstrap
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthData } from '../auth/auth.interface';
import { ConveneStore, ConveneSummary } from './convene.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProxyService } from '../proxy/proxy.service';
import { ConveneEventType } from './convene.types';
import {
  IAfterImportConveneEventArgs,
  IConveneHistory
} from './convene.interface';
import Bottleneck from 'bottleneck';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import dayjs from 'dayjs';

@Injectable()
export class ConveneService implements OnApplicationBootstrap {
  private logger = new Logger(ConveneService.name);
  private weapons: {
    id: number;
    name: string;
  }[];
  private characters: {
    id: number;
    name: string;
  }[];
  private timeOffset: {
    timeOffset: { [key: string]: number };
    timeOffsetIds: { [key: string]: number };
  };

  constructor(
    private eventEmitter: EventEmitter2,
    @InjectModel(ConveneStore.name)
    private conveneStoreModel: Model<ConveneStore>,
    @InjectModel(ConveneSummary.name)
    private conveneSummaryModel: Model<ConveneSummary>,
    private proxyService: ProxyService
  ) {}

  async onApplicationBootstrap() {
    const api = axios.create({
      baseURL: process.env.SITE_URL
    });
    axiosRetry(api);

    // load weapons
    const weapons = await api.get('/api/getWeapons');
    this.weapons = weapons.data;

    // load characters
    const characters = await api.get('/api/getCharacters');
    this.characters = characters.data;

    // load timeOffset
    const timeOffset = await api.get('/api/getTimeOffset');
    this.timeOffset = timeOffset.data;

    // start global calculate
    if (process.env.NODE_ENV === 'development') {
      this.globalStatsCalculate();
    }
  }

  /**
   *
   */
  async import(
    url: string,
    args: {
      userAgent: string;
      auth?: AuthData;
      skipMerge?: boolean;
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

      const data: IConveneHistory[] = JSON.parse(response.data.text).data;
      return data.map((convene) => {
        if (!convene.time) throw new BadGatewayException('missing field time');
        if (!convene.name) throw new BadGatewayException('missing field name');
        if (!convene.qualityLevel) {
          throw new BadGatewayException('missing field qualityLevel');
        }
        if (!convene.resourceId) {
          throw new BadGatewayException('missing field resourceId');
        }
        if (!convene.resourceType) {
          throw new BadGatewayException('missing field resourceType');
        }

        const [name, resourceType] = (() => {
          const character = this.characters.find(
            (e) => e.id === convene.resourceId
          );
          if (character) {
            return [character.name, 'Resonator'];
          }

          const weapon = this.weapons.find((e) => e.id === convene.resourceId);
          if (weapon) {
            return [weapon.name, 'Weapon'];
          }

          return [null, null];
        })();

        if (!name || !resourceType) {
          this.logger.warn(
            `import() not found ${convene.resourceId} in ${convene.resourceType}`
          );
        }

        return {
          name: name || convene.name,
          time: convene.time,
          resourceId: convene.resourceId,
          resourceType: resourceType || convene.resourceType,
          qualityLevel: convene.qualityLevel
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
              chunks[i][j].resourceId === store.items[i][k].resourceId
            ) {
              skip = true;
              break;
            }
          }
          if (skip) break;
        }

        mergeEnd += 1;
      }

      if (args.skipMerge) {
        items[i] = chunks[i];
      } else {
        items[i] = [
          ...chunks[i].slice(0, mergeEnd),
          ...(store.items.length - 1 >= i ? store.items[i] : [])
        ];
      }
    }

    // update
    await this.conveneStoreModel.updateOne(
      { playerId: parseInt(player_id) },
      {
        $set: {
          serverId: svr_id,
          items
        }
      }
    );

    // emit event
    const eventArgs: IAfterImportConveneEventArgs = {
      playerId: parseInt(player_id),
      serverId: svr_id,
      items
    };
    await this.eventEmitter.emitAsync(
      ConveneEventType.afterImportAsync,
      eventArgs
    );
    this.eventEmitter.emit(ConveneEventType.afterImport, eventArgs);

    return {
      playerId: parseInt(player_id),
      serverId: svr_id,
      items: Object.keys(items)
        .map((key) => {
          return items[key].map((convene: IConveneHistory) => {
            return {
              ...convene,
              cardPoolType: parseInt(key) + 1
            };
          });
        })
        .flatMap((e) => e),
      total: Object.keys(items).reduce((prev, e) => items[e].length + prev, 0)
    };
  }

  async globalStatsCalculate(storeIds?: Types.ObjectId[]) {
    this.logger.verbose('globalStatsCalculate get stores');
    const stores = await this.conveneStoreModel.find();

    this.logger.verbose('globalStatsCalculate get banners');
    const banners = await axios.get<
      {
        type: number;
        name: string;
        time?: {
          start: string;
          end: string;
        };
        featuredRare?: string;
        featured?: string[];
      }[]
    >('/api/getBanners', {
      baseURL: process.env.SITE_URL
    });
    const summaryData: {
      [key: string]: {
        avgRc: {
          [key: string]: number[];
        };
        avgPity: {
          chance: number;
          totalPull: number;
        }[];
        totalPull: number;
        totalUsers: number[];
        pullByDay: { [key: string]: number };
        fiveStarList: {
          [key: string]: {
            total: number;
            resourceType: string;
          };
        };
        fourStarList: {
          [key: string]: {
            total: number;
            resourceType: string;
          };
        };
      };
    } = {};

    this.logger.verbose('globalStatsCalculate start summary');
    for (const element of stores) {
      const rcData: { [key: string]: number } = {};
      const timeOffset = this.timeOffset.timeOffsetIds[element.serverId];

      for (let i = 0; i < element.items.length; i += 1) {
        const cardPoolType = i + 1;
        for (const convene of element.items[i]) {
          const matchBanners = banners.data.filter((banner) => {
            if (banner.time) {
              const conveneTime = dayjs(convene.time).utcOffset(timeOffset);
              const timeStart = dayjs(banner.time.start)
                .utcOffset(8)
                .add(timeOffset - 8, 'hours');
              const timeEnd = dayjs(banner.time.end)
                .utcOffset(8)
                .add(timeOffset - 8, 'hours');

              const condition =
                conveneTime >= timeStart &&
                conveneTime <= timeEnd &&
                banner.type === cardPoolType;

              return condition;
            }
            return banner.type === cardPoolType;
          });

          if (matchBanners.length === 0) {
            this.logger.verbose(
              `globalStatsCalculate not found banner for ${convene.name} ${convene.time}`
            );
            continue;
          }
          const matchBanner = matchBanners[matchBanners.length - 1];

          summaryData[matchBanner.name] ??= {
            totalPull: 0,
            totalUsers: [],
            avgRc: {},
            avgPity: Array.from(Array(90).keys()).map(() => {
              return {
                chance: 0,
                totalPull: 0
              };
            }),
            pullByDay: {},
            fiveStarList: {},
            fourStarList: {}
          };

          // totalPull
          summaryData[matchBanner.name].totalPull += 1;

          // pullByDay
          const date = convene.time.split(' ')[0];
          summaryData[matchBanner.name].pullByDay[date] ??= 0;
          summaryData[matchBanner.name].pullByDay[date] += 1;

          // totalUsers
          if (
            !summaryData[matchBanner.name].totalUsers.includes(element.playerId)
          ) {
            summaryData[matchBanner.name].totalUsers.push(element.playerId);
          }

          // avgRc
          if (convene.qualityLevel >= 4) {
            summaryData[matchBanner.name].avgRc[convene.name] ??= Array.from(
              Array(8).keys()
            ).map(() => {
              return 0;
            });

            const rcKey = `${matchBanner.name}.${convene.name}`;

            if (typeof rcData[rcKey] === 'undefined') {
              rcData[rcKey] = 0;
            } else {
              rcData[rcKey] += 1;

              if (
                rcData[rcKey] >=
                summaryData[matchBanner.name].avgRc[convene.name].length
              ) {
                rcData[rcKey] =
                  summaryData[matchBanner.name].avgRc[convene.name].length - 1;
              }
            }

            const rcIndex = rcData[rcKey];
            summaryData[matchBanner.name].avgRc[convene.name][rcIndex] += 1;
          }

          // avgPity
          if (convene.qualityLevel === 5) {
            let pity = 1;
            for (let j = i + 1; j < element.items[i].length; j += 1) {
              if (element.items[i][j].qualityLevel >= 5) {
                break;
              } else {
                pity += 1;
              }
            }
            summaryData[matchBanner.name].avgPity[pity].totalPull += 1;

            // fiveStarList
            summaryData[matchBanner.name].fiveStarList[convene.name] ??= {
              total: 0,
              resourceType: convene.resourceType
            };
            summaryData[matchBanner.name].fiveStarList[convene.name].total += 1;
          } else if (convene.qualityLevel === 4) {
            // fourStarList
            summaryData[matchBanner.name].fourStarList[convene.name] ??= {
              total: 0,
              resourceType: convene.resourceType
            };
            summaryData[matchBanner.name].fourStarList[convene.name].total += 1;
          }
        }
      }
    }

    await Promise.all(
      Object.keys(summaryData).map(async (banner) => {
        const summary = summaryData[banner];
        const totalFiveStar = Object.keys(summary.fiveStarList).reduce(
          (previous, e) => {
            return summary.fiveStarList[e].total + previous;
          },
          0
        );
        const totalFourStar = Object.keys(summary.fourStarList).reduce(
          (previous, e) => {
            return summary.fourStarList[e].total + previous;
          },
          0
        );

        await this.conveneSummaryModel.updateOne(
          {
            banner
          },
          {
            totalPull: summary.totalPull,
            totalUsers: summary.totalUsers.length,
            avgPity: summary.avgPity.map((e) => {
              return {
                chance:
                  e.totalPull /
                  (summary.avgPity.reduce(
                    (prev, value) => value.totalPull + prev,
                    0
                  ) /
                    summary.avgPity.length),
                totalPull: e.totalPull
              };
            }),
            avgRc: Object.keys(summary.avgRc)
              .map((key) => {
                return {
                  item: key,
                  stacks: summary.avgRc[key]
                };
              })
              .sort((a, b) => {
                const totalA = a.stacks.reduce(
                  (prev, value) => value + prev,
                  0
                );
                const totalB = b.stacks.reduce(
                  (prev, value) => value + prev,
                  0
                );
                return totalB - totalA;
              }),
            fiveStarList: Object.keys(summary.fiveStarList)
              .map((key) => {
                const percentage =
                  (summary.fiveStarList[key].total / totalFiveStar) * 100;
                return {
                  item: key,
                  total: summary.fiveStarList[key].total,
                  resourceType: summary.fiveStarList[key].resourceType,
                  percentage: parseFloat(percentage.toFixed(2))
                };
              })
              .sort((a, b) => {
                return b.total - a.total;
              }),
            fourStarList: Object.keys(summary.fourStarList)
              .map((key) => {
                const percentage =
                  (summary.fourStarList[key].total / totalFourStar) * 100;
                return {
                  item: key,
                  total: summary.fourStarList[key].total,
                  percentage: parseFloat(percentage.toFixed(2)),
                  resourceType: summary.fourStarList[key].resourceType
                };
              })
              .sort((a, b) => {
                return b.total - a.total;
              }),
            pullByDay: Object.keys(summary.pullByDay)
              .map((e) => {
                return {
                  time: e,
                  total: summary.pullByDay[e]
                };
              })
              .sort((a, b) => {
                return b.total - a.total;
              }),
            updatedAt: new Date()
          },
          {
            upsert: true
          }
        );
      })
    );
  }

  async summary() {
    const items = await this.conveneSummaryModel.find();
    return { items };
  }
}
