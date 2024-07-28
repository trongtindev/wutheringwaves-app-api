declare global {
  // eslint-disable-next-line no-unused-vars
  namespace NodeJS {
    // eslint-disable-next-line no-unused-vars
    interface ProcessEnv {
      readonly SYNC_S3_PATH: string;
      readonly SYNC_S3_ENDPOINT: string;
      readonly SYNC_S3_REGION: string;
      readonly SYNC_S3_BUCKET: string;
      readonly SYNC_S3_ACCESS_KEY_ID: string;
      readonly SYNC_S3_SECRET_ACCESS_KEY: string;
    }
  }
}
export {};
