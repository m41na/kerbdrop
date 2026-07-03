import { Router } from 'express'
import { requireAuth, optionalAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { rateLimits } from '../middleware/rateLimit'
import { CreateListingSchema, UpdateListingSchema, SearchQuerySchema } from '@kerbdrop/shared'
import { supabase, listingsIndex } from '../lib/clients'

export const listingsRouter = Router()

// ── Public routes ─────────────────────────────────────────────────────────

// Browse feed — public, geo-sorted, no auth needed
listingsRouter.get('/', optionalAuth, validate(SearchQuerySchema, 'query'), async (req, res) => {
  const { lat, lng, radiusMiles, category, condition, minPriceCents, maxPriceCents, page, limit } = req.query as any

  try {
    // Build Meilisearch filters
    const filters: string[] = ["status = 'active'"]

    if (category) filters.push(`category = '${category}'`)
    if (condition) filters.push(`condition = '${condition}'`)
    if (minPriceCents) filters.push(`price_cents >= ${minPriceCents}`)
    if (maxPriceCents) filters.push(`price_cents <= ${maxPriceCents}`)

    // Geo radius filter (meters)
    filters.push(`_geoRadius(${lat}, ${lng}, ${Math.round(radiusMiles * 1609)})`)

    const results = await listingsIndex.search('', {
      filter: filters.join(' AND '),
      sort: [
        `_geoPoint(${lat}, ${lng}):asc`,
        'created_at:desc',
      ],
      limit: Number(limit),
      offset: Number(page) * Number(limit),
      attributesToRetrieve: [
        'id', 'seller_id', 'seller_handle', 'seller_phone_verified',
        'seller_payment_verified', 'title', 'price_cents', 'category',
        'condition', 'location_label', 'location_lat', 'location_lng',
        'thumb_url', 'photo_count', 'created_at', 'expires_at', '_geo',
      ],
    })

    // Annotate with distance in miles
    const listings = results.hits.map((hit: any) => ({
      ...hit,
      distance_miles: hit._geoDistance
        ? Math.round((hit._geoDistance / 1609) * 10) / 10
        : null,
    }))

    return res.json({
      success: true,
      data: listings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: results.estimatedTotalHits,
        has_more: results.hits.length === Number(limit),
      },
    })
  } catch (err) {
    console.error('Feed error:', err)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to load listings.' },
    })
  }
})

// Listing detail — public
listingsRouter.get('/mine', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('seller_id', req.userId)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } })
  return res.json({ success: true, data })
})

listingsRouter.get('/:id', optionalAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      users!seller_id (
        handle,
        phone_verified,
        payment_verified
      )
    `)
    .eq('id', req.params['id'])
    .single()

  if (error || !data) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Listing not found.' } })
  }

  // Increment view count (fire and forget)
  supabase
    .from('listings')
    .update({ view_count: (data.view_count ?? 0) + 1 })
    .eq('id', req.params['id'])
    .then(() => {})

  return res.json({ success: true, data })
})

// ── Authenticated routes ──────────────────────────────────────────────────

listingsRouter.post('/', requireAuth, rateLimits.listingCreate, validate(CreateListingSchema), async (req, res) => {
  // TODO: implement in Phase 3
  res.status(201).json({ success: true, data: null })
})

listingsRouter.patch('/:id', requireAuth, validate(UpdateListingSchema), async (req, res) => {
  res.json({ success: true, data: null })
})

listingsRouter.post('/:id/sold', requireAuth, async (req, res) => {
  res.json({ success: true })
})

listingsRouter.post('/:id/relist', requireAuth, async (req, res) => {
  res.status(201).json({ success: true, data: null })
})

listingsRouter.delete('/:id', requireAuth, async (req, res) => {
  res.json({ success: true })
})