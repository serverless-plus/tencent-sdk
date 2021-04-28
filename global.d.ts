declare namespace NodeJS {
  interface ProcessEnv {
    TENCENT_APP_ID: string;
    TENCENT_SECRET_ID: string;
    TENCENT_SECRET_KEY: string;
    TENCENT_SECRET_TOKEN?: string;
  }
}
