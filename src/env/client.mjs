import { createEnv } from '@t3-oss/env-nextjs';
import z from 'zod';

export const clientEnv = createEnv({
  client: {
    NEXT_PUBLIC_ENV: z.enum(['development', 'test', 'production']),
    NEXT_PUBLIC_WEB3AUTH_CLIENT_ID: z.string(),
    NEXT_PUBLIC_ALCHEMY_GAS_MANAGER_POLICY_ID: z.string(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_ENV: process.env.NODE_ENV ?? 'development',
    NEXT_PUBLIC_WEB3AUTH_CLIENT_ID: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID,
    NEXT_PUBLIC_ALCHEMY_GAS_MANAGER_POLICY_ID:
      process.env.NEXT_PUBLIC_ALCHEMY_GAS_MANAGER_POLICY_ID,
  },
});
