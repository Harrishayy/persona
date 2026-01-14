import { config } from 'dotenv';
import type { Config } from 'drizzle-kit';

// Load .env.local first (takes precedence), then .env as fallback
config({ path: '.env.local' });
config({ path: '.env' });

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
