import { createClient } from '@supabase/supabase-js'
import { S3Client } from '@aws-sdk/client-s3'
import Stripe from 'stripe'
import { MeiliSearch } from 'meilisearch'
import { env } from './env'

// ── Supabase admin client (bypasses RLS for server operations) ────────────
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Cloudflare R2 (S3-compatible) ────────────────────────────────────────
export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
})

// ── Stripe ────────────────────────────────────────────────────────────────
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
})

// ── Meilisearch ───────────────────────────────────────────────────────────
export const meili = new MeiliSearch({
  host: env.MEILISEARCH_URL,
  apiKey: env.MEILISEARCH_API_KEY,
})

export const listingsIndex = meili.index('listings')
