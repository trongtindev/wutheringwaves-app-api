declare global {
  // eslint-disable-next-line no-unused-vars
  namespace NodeJS {
    // eslint-disable-next-line no-unused-vars
    interface ProcessEnv {
      NODE_ENV: 'production' | 'development';

      readonly PORT: string;

      readonly REDIS_PORT: string;
      readonly REDIS_HOST: string;
      readonly REDIS_USER: string;
      readonly REDIS_PASS: string;

      readonly MONGODB_HOST: string;
      readonly MONGODB_NAME: string;
      readonly MONGODB_USER: string;
      readonly MONGODB_PASS: string;
    }
  }
}

declare module 'http' {
  interface IncomingHttpHeaders {
    'cf-ipcountry'?: string | undefined;
    'cf-ipcity'?: string | undefined;
    'cf-iplatitude'?: string | undefined;
    'cf-iplongitude'?: string | undefined;
    'cf-connecting-ip'?: string | undefined;
    'cf-ipcontinent'?: string | undefined;
    'cf-region'?: string | undefined;
    'cf-region-code'?: string | undefined;
    'cf-pseudo-ipv4'?: string | undefined;
  }
}

export {};
