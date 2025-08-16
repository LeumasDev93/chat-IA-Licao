declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VERCEL?: string;
      VERCEL_URL?: string;
      CRON_SECRET?: string;
    }
  }
}

export {};
