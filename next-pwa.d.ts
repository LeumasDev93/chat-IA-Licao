// types/next-pwa.d.ts
declare module 'next-pwa' {
  import { NextConfig } from 'next';

  type PWAOptions = {
    dest: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    scope?: string;
    sw?: string;
  };

  export default function withPWA(config: NextConfig & { pwa: PWAOptions }): NextConfig;
}
