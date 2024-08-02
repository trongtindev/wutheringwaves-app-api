declare global {
  // eslint-disable-next-line no-unused-vars
  namespace NodeJS {
    // eslint-disable-next-line no-unused-vars
    interface ProcessEnv {
      readonly PROXY_WORKER_URL: string;
      readonly PROXY_WORKER_KEY: string;
    }
  }
}

export {};
