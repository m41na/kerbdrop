import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  API_URL: z.string().url(),
  WEB_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),

  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET_NAME: z.string().min(1),
  R2_PUBLIC_URL: z.string().url(),

  MEILISEARCH_URL: z.string().url(),
  MEILISEARCH_API_KEY: z.string().min(1),

  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_CONNECT_CLIENT_ID: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  STRIPE_OAUTH_REDIRECT_URI: z.string().url(),

  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_REGION: z.string().default('us-east-1'),

  ANTHROPIC_API_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().optional(),

  ALLOWED_ORIGINS: z.string().default('http://localhost:8081'),
})

const parsed = EnvSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
export type Env = typeof env
