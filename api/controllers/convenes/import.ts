import axios from 'axios';
import {
  BadRequestException,
  InternalServerErrorException
} from '../../common/exception';
import { BaseResponse } from '../../common/response';
import { Md5 } from 'ts-md5';
import ConveneModel from '../../models/convene';
import mongodbInitialize from '../../middlewares/mongodb';

interface ILog {
  cardPoolType: number;
  name: string;
  qualityLevel: number;
  resourceId: number;
  resourceType: string;
  time: string;
}

export async function POST(request: Request) {
  try {
    const { url, cardPoolType, userAgent } = JSON.parse(await request.text());
    if (!url) throw new BadRequestException('url is required');
    if (!userAgent) throw new BadRequestException('userAgent is required');
    if (!cardPoolType)
      throw new BadRequestException('cardPoolType is required');

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

    const http = axios.create({
      baseURL: 'https://gmserver-api.aki-game2.net',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://aki-gm-resources-oversea.aki-game.net',
        Priority: 'u=1, i',
        Referer: 'https://aki-gm-resources-oversea.aki-game.net/',
        'User-Agent': userAgent
      }
    });

    // send request
    const response = await http.post<{
      data?: ILog[];
      message?: string;
    }>('gacha/record/query', {
      cardPoolId: resources_id,
      cardPoolType: parseInt(cardPoolType),
      languageCode: lang,
      playerId: player_id,
      recordId: record_id,
      serverId: svr_id
    });

    // check response
    if (!response.data.message || response.data.message !== 'success') {
      throw new BadRequestException('invalid response');
    } else if (!response.data.data) {
      throw new BadRequestException('invalid response data');
    }

    // check missing fields
    const isMissingFields = response.data.data.findIndex(
      (e) => !e.name || !e.qualityLevel || !e.resourceId || !e.resourceType
    );
    if (isMissingFields > 0) {
      throw new BadRequestException('some field missing');
    }

    const items = response.data.data.map((e, i) => {
      const sign = Object.keys(e).map((key) => (e as any)[key]);
      const key = Md5.hashStr(i + sign.join('|') + player_id);

      return {
        ...(e as ILog),
        cardPoolType,
        key
      };
    });

    // initialize models
    await mongodbInitialize();
    const bulks = items.map((e) => {
      return {
        updateOne: {
          filter: { key: e.key },
          update: {
            name: e.name,
            qualityLevel: e.qualityLevel,
            resourceId: e.resourceId,
            resourceType: e.resourceType,
            createdAt: new Date(e.time)
          },
          upsert: true
        }
      };
    });
    await ConveneModel.bulkWrite(bulks);

    return new BaseResponse(200, { items }).json();
  } catch (error: any) {
    if (error instanceof BaseResponse) {
      console.debug(error);
      return error.json();
    }

    return new InternalServerErrorException(error.message).json();
  }
}
