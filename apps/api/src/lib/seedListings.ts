import { createClient } from '@supabase/supabase-js'
import { MeiliSearch } from 'meilisearch'
import * as dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const meili = new MeiliSearch({
  host: process.env.MEILISEARCH_URL ?? 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_API_KEY,
})

// ── Update these coordinates to your location for realistic distance testing ──
const BASE_LAT = 37.7749
const BASE_LNG = -122.4194

const SEED_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  handle: 'seeduser',
  phone_hash: 'seed-phone-hash',
  phone_verified: true,
  payment_verified: false,
  tier: 'free',
}

const SEED_LISTINGS = [
  {
    title: 'IKEA KALLAX Shelf Unit, white, 4x4',
    description: 'Good condition, minor scuffs on the bottom. Comes with 4 door inserts. You pick up.',
    price_cents: 8500,
    category: 'furniture',
    condition: 'good',
    location_lat: BASE_LAT + 0.01,
    location_lng: BASE_LNG + 0.01,
    location_label: 'Mission District',
    location_radius_miles: 10,
  },
  {
    title: 'Trek FX3 Fitness Bike, black, 54cm',
    description: 'Adult commuter bike, rides great. Selling because I moved closer to work. Minor handlebar scuff.',
    price_cents: 32000,
    category: 'bicycles',
    condition: 'good',
    location_lat: BASE_LAT + 0.02,
    location_lng: BASE_LNG - 0.01,
    location_label: 'Castro',
    location_radius_miles: 10,
  },
  {
    title: 'Sony WH-1000XM4 Headphones',
    description: 'Excellent noise cancellation. Includes original case and cables. Battery life still great.',
    price_cents: 18000,
    category: 'electronics',
    condition: 'like_new',
    location_lat: BASE_LAT - 0.01,
    location_lng: BASE_LNG + 0.02,
    location_label: 'SOMA',
    location_radius_miles: 10,
  },
  {
    title: 'Dining table + 4 chairs, solid oak',
    description: 'Moving sale. Table is 6ft, seats 6 comfortably. Chairs show light wear. Must go this weekend.',
    price_cents: 45000,
    category: 'furniture',
    condition: 'good',
    location_lat: BASE_LAT + 0.03,
    location_lng: BASE_LNG + 0.03,
    location_label: 'Noe Valley',
    location_radius_miles: 10,
  },
  {
    title: 'Vitamix 5200 Blender',
    description: 'Works perfectly. Includes tamper and two containers. Upgrading to a newer model.',
    price_cents: 22000,
    category: 'appliances',
    condition: 'good',
    location_lat: BASE_LAT - 0.02,
    location_lng: BASE_LNG - 0.02,
    location_label: 'Sunset District',
    location_radius_miles: 10,
  },
]

async function seed() {
  console.log('Seeding test data...')

  // Upsert seed user
  const { error: userError } = await supabase
    .from('users')
    .upsert(SEED_USER, { onConflict: 'id' })

  if (userError) {
    console.error('Failed to create seed user:', userError)
    process.exit(1)
  }
  console.log('✅ Seed user created:', SEED_USER.handle)

  const now = new Date()
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const listings = SEED_LISTINGS.map((l, i) => ({
    id: `00000000-0000-0000-0000-00000000000${i + 1}`,
    seller_id: SEED_USER.id,
    ...l,
    status: 'active',
    photo_count: 0,
    ai_generated: false,
    view_count: 0,
    expires_at: expiresAt.toISOString(),
    created_at: new Date(now.getTime() - i * 60 * 1000).toISOString(),
  }))

  const { error: listingError } = await supabase
    .from('listings')
    .upsert(listings, { onConflict: 'id' })

  if (listingError) {
    console.error('Failed to create listings:', listingError)
    process.exit(1)
  }
  console.log(`✅ ${listings.length} listings created in Supabase`)

  // Sync to Meilisearch — wait for task to complete
  const meiliDocs = listings.map((l) => ({
    ...l,
    seller_handle: SEED_USER.handle,
    seller_phone_verified: SEED_USER.phone_verified,
    seller_payment_verified: SEED_USER.payment_verified,
    thumb_url: null,
    _geo: {
      lat: l.location_lat,
      lng: l.location_lng,
    },
  }))

  const task = await meili.index('listings').addDocuments(meiliDocs, { primaryKey: 'id' })
  console.log('Meilisearch task enqueued:', task.taskUid)
  await meili.waitForTask(task.taskUid)
  console.log('✅ Listings synced to Meilisearch')
  console.log('\nDone. Base coordinates:', BASE_LAT, BASE_LNG)
  console.log('Update BASE_LAT and BASE_LNG to coordinates near your location.')
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
