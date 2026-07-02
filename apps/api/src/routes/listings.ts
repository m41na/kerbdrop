import { Router } from 'express'
import { requireAuth, optionalAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { rateLimits } from '../middleware/rateLimit'
import { CreateListingSchema, UpdateListingSchema, SearchQuerySchema } from '@kerbdrop/shared'

export const listingsRouter = Router()

// ── Public routes ─────────────────────────────────────────────────────────

// Browse feed — public, location required, no auth needed
listingsRouter.get('/', optionalAuth, validate(SearchQuerySchema, 'query'), async (req, res) => {
  // TODO: query Meilisearch with geo filter, distance + recency sort
  // Sort: _geoPoint(lat, lng):asc, created_at:desc — no other sort variables
  res.json({ success: true, data: [], pagination: { page: 0, limit: 20, total: 0, has_more: false } })
})

// Listing detail — public
listingsRouter.get('/:id', optionalAuth, async (req, res) => {
  // TODO: fetch listing by ID, increment view_count
  res.json({ success: true, data: null })
})

// ── Authenticated routes ──────────────────────────────────────────────────

// My listings — all statuses for the authenticated user
listingsRouter.get('/mine', requireAuth, async (req, res) => {
  // TODO: fetch listings where seller_id = req.userId, all statuses
  res.json({ success: true, data: [] })
})

// Create listing
// Auth gate: phone_verified only (enforced by requireAuth — Supabase session = phone verified).
// payment_verified is explicitly NOT checked here.
// Stripe Connect is optional and does not gate listing creation.
// Any phone-verified user can post a listing regardless of payment setup.
listingsRouter.post('/', requireAuth, rateLimits.listingCreate, validate(CreateListingSchema), async (req, res) => {
  // TODO: fetch user to check tier and listing_count against cap
  // TODO: if listing_count >= tier cap → return 422 LISTING_CAP_REACHED
  // TODO: insert listing, expires_at = NOW() + 7 days
  // TODO: sync document to Meilisearch
  // TODO: increment users.listing_count
  res.status(201).json({ success: true, data: null })
})

// Update listing
listingsRouter.patch('/:id', requireAuth, validate(UpdateListingSchema), async (req, res) => {
  // TODO: verify seller_id = req.userId (ownership check)
  // TODO: update listing fields, sync to Meilisearch
  res.json({ success: true, data: null })
})

// Mark as sold
listingsRouter.post('/:id/sold', requireAuth, async (req, res) => {
  // TODO: verify ownership
  // TODO: set status = 'sold', sold_at = NOW()
  // TODO: set photos.delete_at = NOW() for all listing photos
  // TODO: remove from Meilisearch
  // TODO: decrement users.listing_count
  res.json({ success: true })
})

// Relist expired listing
listingsRouter.post('/:id/relist', requireAuth, async (req, res) => {
  // TODO: verify ownership and status = 'expired'
  // TODO: check listing cap before creating new listing
  // TODO: create new listing from old (new ID, new expires_at, status = 'active')
  // TODO: old listing remains expired — relisting creates a distinct new listing
  res.status(201).json({ success: true, data: null })
})

// Remove listing
listingsRouter.delete('/:id', requireAuth, async (req, res) => {
  // TODO: verify ownership
  // TODO: set status = 'removed'
  // TODO: set photos.delete_at = NOW()
  // TODO: remove from Meilisearch
  // TODO: decrement users.listing_count
  res.json({ success: true })
})
