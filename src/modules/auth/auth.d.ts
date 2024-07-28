declare global {
  // eslint-disable-next-line no-unused-vars
  namespace NodeJS {
    // eslint-disable-next-line no-unused-vars
    interface ProcessEnv {
      readonly AUTH_SECRET: string;
      readonly AUTH_ACCESS_TOKEN_EXPIRES_IN: string;
      readonly AUTH_REFRESH_TOKEN_EXPIRES_IN: string;

      readonly GOOGLE_CLIENT_ID: string;
      readonly GOOGLE_CLIENT_SECRET: string;
    }
  }
}

export {};
