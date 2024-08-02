declare global {
  // eslint-disable-next-line no-unused-vars
  namespace NodeJS {
    // eslint-disable-next-line no-unused-vars
    interface ProcessEnv {
      readonly DISCORD_TOKEN: string;
      readonly DISCORD_CLIENT_ID: string;
      readonly DISCORD_GUILD_ID: string;
    }
  }
}

export {};
