// ── Listing limits ────────────────────────────────────────────────────────

export const LISTING_LIMITS = {
  free: 10,
  plus: 25,
  pro: Infinity,
} as const

export const LISTING_EXPIRY_DAYS = 7
export const LISTING_MAX_PHOTOS = 5
export const LISTING_PHOTO_MAX_BYTES = 10 * 1024 * 1024 // 10MB

// ── Fees ──────────────────────────────────────────────────────────────────

export const PLATFORM_FEE_FLAT_CENTS = 100        // $1.00 floor
export const PLATFORM_FEE_PERCENTAGE = 0.05       // 5%
export const PLATFORM_FEE_THRESHOLD_CENTS = 2000  // $20.00 — below this, flat fee applies
export const MIN_TRANSACTION_CENTS = 1000         // $10.00 minimum for processed payments

// ── Messaging ─────────────────────────────────────────────────────────────

export const MESSAGE_THREAD_EXPIRY_DAYS = 7       // after listing closure
export const MESSAGE_MAX_LENGTH = 1000

// ── Offers ────────────────────────────────────────────────────────────────

export const OFFER_EXPIRY_HOURS = 24

// ── Location ──────────────────────────────────────────────────────────────

export const DEFAULT_RADIUS_MILES = 10
export const MAX_RADIUS_MILES = 50
export const RADIUS_OPTIONS_MILES = [5, 10, 25, 50] as const

// ── Tiers ─────────────────────────────────────────────────────────────────

export const TIER_PRICES = {
  plus: 499,   // $4.99/month in cents
  pro: 1499,   // $14.99/month in cents
} as const

// ── Rate limits ───────────────────────────────────────────────────────────

export const RATE_LIMITS = {
  phoneRequest: { max: 3, windowSeconds: 3600 },
  listingCreate: { max: 5, windowSeconds: 3600 },
  threadCreate: { max: 10, windowSeconds: 3600 },
  messageSend: { max: 30, windowSeconds: 3600 },
  offerCreate: { max: 5, windowSeconds: 3600 },
  photoUpload: { max: 20, windowSeconds: 3600 },
} as const

// ── Categories (display labels) ───────────────────────────────────────────

export const CATEGORY_LABELS: Record<string, string> = {
  furniture: 'Furniture',
  electronics: 'Electronics',
  clothing_and_accessories: 'Clothing',
  bicycles: 'Bicycles',
  tools_and_hardware: 'Tools',
  appliances: 'Appliances',
  sporting_goods: 'Sporting Goods',
  baby_and_kids: 'Baby & Kids',
  books_and_media: 'Books & Media',
  musical_instruments: 'Instruments',
  art_and_collectibles: 'Art & Collectibles',
  garden_and_outdoor: 'Garden & Outdoor',
  pet_supplies: 'Pet Supplies',
  services: 'Services',
  other: 'Other',
}

// ── Condition labels ──────────────────────────────────────────────────────

export const CONDITION_LABELS: Record<string, string> = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  parts: 'Parts Only',
}
