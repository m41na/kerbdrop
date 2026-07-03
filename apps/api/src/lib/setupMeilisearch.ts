import { MeiliSearch } from 'meilisearch'
import * as dotenv from 'dotenv'

dotenv.config()

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_URL ?? 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_API_KEY,
})

async function setup() {
  console.log('Setting up Meilisearch listings index...')

  const index = client.index('listings')

  await index.updateSettings({
    searchableAttributes: [
      'title',
      'description',
      'category',
      'location_label',
    ],
    filterableAttributes: [
      'status',
      'category',
      'condition',
      'price_cents',
      'seller_id',
      '_geo',
    ],
    sortableAttributes: [
      'created_at',
      'price_cents',
      '_geo',
    ],
    rankingRules: [
      'words',
      'typo',
      'proximity',
      'attribute',
      'sort',
      'exactness',
    ],
    displayedAttributes: [
      'id',
      'seller_id',
      'seller_handle',
      'seller_phone_verified',
      'seller_payment_verified',
      'title',
      'description',
      'price_cents',
      'category',
      'condition',
      'location_lat',
      'location_lng',
      'location_label',
      'location_radius_miles',
      'status',
      'photo_count',
      'thumb_url',
      'expires_at',
      'created_at',
      '_geo',
    ],
  })

  console.log('✅ Meilisearch listings index configured')

  // Verify
  const settings = await index.getSettings()
  console.log('Filterable attributes:', settings.filterableAttributes)
  console.log('Sortable attributes:', settings.sortableAttributes)
}

setup().catch((err) => {
  console.error('❌ Setup failed:', err)
  process.exit(1)
})