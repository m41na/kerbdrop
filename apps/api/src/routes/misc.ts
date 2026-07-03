import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { rateLimits } from '../middleware/rateLimit'
import { validate } from '../middleware/validate'
import { CreateThreadSchema, SendMessageSchema, CreateOfferSchema } from '@kerbdrop/shared'

// ── Photos ────────────────────────────────────────────────────────────────

export const photosRouter = Router()

// Get presigned R2 upload URL
photosRouter.post('/presign', requireAuth, rateLimits.photoUpload, async (req, res) => {
  // TODO: generate presigned PUT URL for R2, return photoId + uploadUrl
  res.json({ success: true, data: { photoId: null, uploadUrl: null, expiresIn: 900 } })
})

// Confirm upload complete — triggers moderation pipeline
photosRouter.post('/:id/confirm', requireAuth, async (req, res) => {
  // TODO: verify object exists in R2, run Rekognition, update moderation_status
  res.json({ success: true })
})

// Delete a photo from a listing
photosRouter.delete('/:id', requireAuth, async (req, res) => {
  // TODO: verify ownership, delete from R2, remove from photos table
  res.json({ success: true })
})

// Reorder photos
photosRouter.patch('/reorder', requireAuth, async (req, res) => {
  // TODO: accept [{id, sortOrder}], update sort_order for each
  res.json({ success: true })
})

// ── Messages ──────────────────────────────────────────────────────────────

export const messagesRouter = Router()

// List threads
messagesRouter.get('/threads', requireAuth, async (req, res) => {
  // TODO: fetch threads where buyer_id or seller_id = req.userId
  res.json({ success: true, data: [] })
})

// Get thread + messages
messagesRouter.get('/threads/:id', requireAuth, async (req, res) => {
  // TODO: verify participant, fetch thread + messages
  res.json({ success: true, data: null })
})

// Start a thread (first message from buyer)
messagesRouter.post('/threads', requireAuth, rateLimits.threadCreate, validate(CreateThreadSchema), async (req, res) => {
  // TODO: create thread + first message, notify seller
  res.status(201).json({ success: true, data: null })
})

// Send a message
messagesRouter.post('/threads/:id/messages', requireAuth, rateLimits.messageSend, validate(SendMessageSchema), async (req, res) => {
  // TODO: verify participant + thread active, insert message, notify recipient
  res.status(201).json({ success: true, data: null })
})

// Seller's other active listings (visible within thread context only)
messagesRouter.get('/threads/:id/listings', requireAuth, async (req, res) => {
  // TODO: get thread, return seller's other active listings (max 6)
  res.json({ success: true, data: [] })
})

// ── Offers ────────────────────────────────────────────────────────────────

export const offersRouter = Router()

offersRouter.post('/', requireAuth, rateLimits.offerCreate, validate(CreateOfferSchema), async (req, res) => {
  // TODO: validate no existing active offer, create offer, notify seller
  res.status(201).json({ success: true, data: null })
})

offersRouter.post('/:id/accept', requireAuth, async (req, res) => {
  // TODO: verify seller ownership, set status=accepted, notify buyer
  res.json({ success: true })
})

offersRouter.post('/:id/decline', requireAuth, async (req, res) => {
  // TODO: verify seller ownership, set status=declined, notify buyer
  res.json({ success: true })
})

offersRouter.post('/:id/withdraw', requireAuth, async (req, res) => {
  // TODO: verify buyer ownership, set status=withdrawn
  res.json({ success: true })
})

// ── Payments ──────────────────────────────────────────────────────────────

export const paymentsRouter = Router()

// Get Stripe Connect OAuth URL for seller onboarding
paymentsRouter.get('/connect/url', requireAuth, async (req, res) => {
  // TODO: generate signed state JWT, build Stripe OAuth URL
  res.json({ success: true, data: { url: null } })
})

// OAuth callback — exchange code for stripe_account_id
paymentsRouter.get('/connect/callback', requireAuth, async (req, res) => {
  // TODO: verify state JWT, exchange code, store stripe_account_id, set payment_verified=true
  res.redirect(`${process.env.WEB_URL}/account/payments?status=success`)
})

// Check payment connection status
paymentsRouter.get('/connect/status', requireAuth, async (req, res) => {
  // TODO: return payment_verified status for req.userId
  res.json({ success: true, data: { connected: false } })
})

// Disconnect Stripe account
paymentsRouter.delete('/connect', requireAuth, async (req, res) => {
  // TODO: clear stripe_account_id, set payment_verified=false
  res.json({ success: true })
})

// ── Notifications ─────────────────────────────────────────────────────────

export const notificationsRouter = Router()

notificationsRouter.get('/', requireAuth, async (req, res) => {
  // TODO: fetch notifications for req.userId, most recent first
  res.json({ success: true, data: [] })
})

notificationsRouter.post('/read', requireAuth, async (req, res) => {
  // TODO: mark notification IDs as read (or all if no IDs provided)
  res.json({ success: true })
})

notificationsRouter.post('/push-tokens', requireAuth, async (req, res) => {
  // TODO: upsert Expo push token for req.userId
  res.json({ success: true })
})

notificationsRouter.delete('/push-tokens/:token', requireAuth, async (req, res) => {
  // TODO: remove push token
  res.json({ success: true })
})

// ── Webhooks ──────────────────────────────────────────────────────────────

export const webhooksRouter = Router()

// Stripe webhook — payment confirmation, account updates
webhooksRouter.post('/stripe', async (req, res) => {
  // TODO: verify Stripe signature, handle charge.succeeded → mark listing sold
  res.json({ received: true })
})
