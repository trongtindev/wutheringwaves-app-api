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
      baseURL: process.env.PROXY_WORKER_URL,
      timeout: 10000,
    });
    axiosRetry(this.worker, {
      onRetry: (retryCount, error) => {
        this.logger.warn(`worker ${retryCount} ${error} `);
      },
    });
  }

  async useWorker(
    url: string,
    args: { method?: 'get' | 'post'; body?: any; headers: any },
  ) {
    if (process.env.NODE_ENV === 'development') {
      const http = axios.create();
      const response = await http(url, {
        method: args.method || 'get',
        data: args.body,
        headers: args.headers,
        responseType: 'text',
      });
      return {
        data: {
          text: response.data,
          status: response.status,
        },
      };
    }
    return await this.worker.post<{
      text: string;
      status: number;
    }>('/', {
      key: process.env.PROXY_WORKER_KEY,
      url,
      method: args.method ?? 'get',
      headers: args.headers,
      body: args.body,
    });
  }
}
