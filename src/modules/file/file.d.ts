declare global {
  // eslint-disable-next-line no-unused-vars
  namespace NodeJS {
    // eslint-disable-next-line no-unused-vars
    interface ProcessEnv {
      readonly FILE_S3_CDN?: string;
      readonly FILE_S3_ENDPOINT: string;
      readonly FILE_S3_PATH: string;
      readonly FILE_S3_REGION: string;
      readonly FILE_S3_BUCKET: string;
      readonly FILE_S3_ACCESS_KEY_ID: string;
      readonly FILE_S3_SECRET_ACCESS_KEY: string;
      readonly FILE_QUEUE_OPTIMIZE_CONCURRENCY: string;
    }
  }
}

export {};
