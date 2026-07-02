import { z } from 'zod'

// ── Listing ────────────────────────────────────────────────────────────────

export const ListingCategorySchema = z.enum([
  'furniture',
  'electronics',
  'clothing_and_accessories',
  'bicycles',
  'tools_and_hardware',
  'appliances',
  'sporting_goods',
  'baby_and_kids',
  'books_and_media',
  'musical_instruments',
  'art_and_collectibles',
  'garden_and_outdoor',
  'pet_supplies',
  'services',
  'other',
])

export const ListingConditionSchema = z.enum([
  'new',
  'like_new',
  'good',
  'fair',
  'parts',
])

export const CreateListingSchema = z.object({
  title: z.string().min(3).max(80),
  description: z.string().max(500).optional(),
  priceCents: z.number().int().min(100), // minimum $1.00
  category: ListingCategorySchema,
  condition: ListingConditionSchema.optional(),
  locationLat: z.number().min(-90).max(90),
  locationLng: z.number().min(-180).max(180),
  locationLabel: z.string().min(2).max(100),
  locationRadiusMiles: z.number().int().min(1).max(50).default(10),
  photoIds: z.array(z.string().uuid()).min(1).max(5),
})

export const UpdateListingSchema = CreateListingSchema.partial().omit({
  photoIds: true,
})

// ── Auth ──────────────────────────────────────────────────────────────────

export const HandleSchema = z
  .string()
  .min(3)
  .max(30)
  .regex(/^[a-zA-Z0-9_-]+$/, 'Handle can only contain letters, numbers, underscores, and hyphens')

export const PhoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{1,14}$/, 'Phone number must be in E.164 format')

// ── Messaging ─────────────────────────────────────────────────────────────

export const SendMessageSchema = z.object({
  body: z.string().min(1).max(1000),
})

export const CreateThreadSchema = z.object({
  listingId: z.string().uuid(),
  body: z.string().min(1).max(1000),
})

// ── Offers ────────────────────────────────────────────────────────────────

export const CreateOfferSchema = z.object({
  listingId: z.string().uuid(),
  threadId: z.string().uuid(),
  amountCents: z.number().int().min(100),
})

// ── Search ────────────────────────────────────────────────────────────────

export const SearchQuerySchema = z.object({
  q: z.string().optional(),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusMiles: z.coerce.number().int().min(1).max(100).default(10),
  category: ListingCategorySchema.optional(),
  condition: ListingConditionSchema.optional(),
  minPriceCents: z.coerce.number().int().min(0).optional(),
  maxPriceCents: z.coerce.number().int().min(0).optional(),
  page: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})
