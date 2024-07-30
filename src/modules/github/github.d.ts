declare global {
  // eslint-disable-next-line no-unused-vars
  namespace NodeJS {
    // eslint-disable-next-line no-unused-vars
    interface ProcessEnv {
      readonly GITHUB_API_VERSION: string;
      readonly GITHUB_TOKEN: string;
      readonly GITHUB_OWNER: string;
      readonly GITHUB_REPO: string;
      readonly GITHUB_BRANCH: string;
    }
  }
}

export {};
