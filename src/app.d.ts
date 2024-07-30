declare global {
  // eslint-disable-next-line no-unused-vars
  namespace NodeJS {
    // eslint-disable-next-line no-unused-vars
    interface ProcessEnv {
      readonly TYPE: 'primary' | 'secondary';
      readonly NODE_ENV: 'production' | 'development';
      readonly PORT: string;
      readonly SITE_URL: string;
      readonly MASTER_TOKEN: string;

      readonly REDIS_PORT: string;
      readonly REDIS_HOST: string;
      readonly REDIS_USER: string;
      readonly REDIS_PASS: string;

      readonly MONGO_PROTOCOL: string;
      readonly MONGO_HOST: string;
      readonly MONGO_NAME: string;
      readonly MONGO_USER: string;
      readonly MONGO_PASS: string;

      readonly GOOGLE_ACCOUNT_KEY: string;
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
