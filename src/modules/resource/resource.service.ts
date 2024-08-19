import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import {
  IBanner,
  ICharacter,
  IEcho,
  IItem,
  IMapPin,
  ITrophy,
  IWeapon,
} from './resource.interface';
import fs from 'fs';
import { ResourceEventTypes } from './resource.types';

@Injectable()
export class ResourceService implements OnApplicationBootstrap {
  private logger = new Logger(ResourceService.name);
  private request: AxiosInstance;
  public characters: ICharacter[] = [];
  public echoes: IEcho[] = [];
  public items: IItem[] = [];
  public trophies: ITrophy[] = [];
  public weapons: IWeapon[] = [];
  public mapPins: IMapPin[] = [];
  public banners: IBanner[] = [];

  constructor(private eventEmitter: EventEmitter2) {
    this.request = axios.create({
      baseURL: process.env.SITE_URL,
    });
    axiosRetry(this.request, {
      retries: 99,
      onRetry: (retryCount, error, config) => {
        this.logger.warn(`onRetry(${retryCount}) ${error} ${config.url}`);
      },
      retryCondition: () => true,
      retryDelay: (count) => count * 1000,
    });
  }

  onApplicationBootstrap() {
    this.initialize().catch(this.logger.error);
  }

  async initialize() {
    this.logger.verbose(`initialize()`);

    const loadCharacters = async () => {
      this.logger.log(`loadCharacters()`);
      const characters = await this.request.get<ICharacter[]>(
        '/api/resources/characters',
      );
      this.characters = characters.data;
      this.logger.log(`loadCharacters() ${this.characters.length}`);
    };

    const loadEchoes = async () => {
      this.logger.log(`loadEchoes()`);
      const echoes = await this.request.get<IEcho[]>('/api/resources/echoes');
      this.echoes = echoes.data;
      this.logger.log(`loadEchoes() ${this.echoes.length}`);
    };

    const loadItems = async () => {
      this.logger.log(`loadItems()`);
      const items = await this.request.get<IItem[]>('/api/resources/items');
      this.items = items.data;
      this.logger.log(`loadItems() ${this.items.length}`);
    };

    const loadTrophies = async () => {
      this.logger.log(`loadTrophies()`);
      const trophies = await this.request.get<{ items: ITrophy[] }>(
        '/api/resources/trophies',
      );
      this.trophies = trophies.data.items;
      this.logger.log(`loadTrophies() ${this.trophies.length}`);
    };

    const loadWeapons = async () => {
      this.logger.log(`loadWeapons()`);
      const weapons = await this.request.get<IWeapon[]>(
        '/api/resources/weapons',
      );
      this.weapons = weapons.data;
      this.logger.log(`loadWeapons() ${this.weapons.length}`);
    };

    const loadMapPins = async () => {
      const pins: any[][] = JSON.parse(
        fs.readFileSync('./resources/markers.json', 'utf-8'),
      );
      this.mapPins = pins.map((e) => {
        return {
          id: e[0],
          type: e[1],
          lat: e[2],
          lng: e[3],
        };
      });
    };

    const loadBanners = async () => {
      this.logger.log(`loadBanners()`);
      const banners = await this.request.get<IBanner[]>(
        '/api/resources/banners',
      );
      this.banners = banners.data;
      this.logger.log(`loadBanners() ${this.banners.length}`);
    };

    await Promise.all([
      loadCharacters(),
      loadEchoes(),
      loadItems(),
      loadTrophies(),
      loadWeapons(),
      loadMapPins(),
      loadBanners(),
    ]);
    this.eventEmitter.emit(ResourceEventTypes.initialized);
  }
}
