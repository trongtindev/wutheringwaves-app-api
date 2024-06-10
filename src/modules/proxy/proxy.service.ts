import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';

@Injectable()
export class ProxyService {
  private logger = new Logger(ProxyService.name);
  private worker: AxiosInstance;

  constructor(private eventEmitter: EventEmitter2) {
    this.worker = axios.create({
      baseURL: process.env.PROXY_WORKER_URL
    });
    axiosRetry(this.worker);
  }

  async useWorker(
    url: string,
    args: { method?: 'get' | 'post'; body?: any; headers: any }
  ) {
    return await this.worker.post<{
      text: string;
      status: number;
    }>('/', {
      key: process.env.PROXY_WORKER_KEY,
      url,
      method: args.method ?? 'get',
      headers: args.headers,
      body: args.body
    });
  }
}
