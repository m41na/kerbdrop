# KerbDrop — Full Design Specification

**Version 1.0 — Working Specification**
**Status: Pre-Development**
**Project Type: Monorepo**

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Monorepo Structure](#2-monorepo-structure)
3. [Technology Stack](#3-technology-stack)
4. [Database Design (Supabase / PostgreSQL)](#4-database-design)
5. [Backend API (Express.js)](#5-backend-api)
6. [Photo Pipeline](#6-photo-pipeline)
7. [AI Processing Service](#7-ai-processing-service)
8. [Search Infrastructure](#8-search-infrastructure)
9. [Messaging System](#9-messaging-system)
10. [Notification System](#10-notification-system)
11. [Payment Architecture (Stripe Connect via OAuth)](#11-payment-architecture)
12. [Scheduled Jobs and Lifecycle Management](#12-scheduled-jobs-and-lifecycle-management)
13. [Authentication and Identity](#13-authentication-and-identity)
14. [Rate Limiting and Fraud Prevention](#14-rate-limiting-and-fraud-prevention)
15. [Web App (Preact)](#15-web-app-preact)
16. [UI Design System](#16-ui-design-system)
17. [Mobile Companion App](#17-mobile-companion-app)
18. [Infrastructure and Deployment](#18-infrastructure-and-deployment)
19. [Environment Configuration](#19-environment-configuration)
20. [Non-Functional Requirements](#20-non-functional-requirements)
21. [Business Logic Reference](#21-business-logic-reference)
22. [Security Considerations](#22-security-considerations)
23. [Open Implementation Questions](#23-open-implementation-questions)

---

## 1. Project Overview

### 1.1 What KerbDrop Is

KerbDrop is a local-first, pseudonymous, transaction-focused marketplace platform. It occupies the unclaimed territory between Craigslist (no payments, outdated UX, anonymous-enabling scams) and Facebook Marketplace (real-identity requirement, algorithmic feed, surveillance-capitalism business model).

The product marries Craigslist's operating philosophy — local, simple, utility-first — with Facebook Marketplace's UX quality: structured listings, mobile-first photo creation, in-app messaging, and offer/counteroffer flow. None of the social network infrastructure is included.

### 1.2 North Star

Compete with and eventually displace Craigslist in specific cities. Facebook Marketplace is a UX reference, not a competitive target.

### 1.3 Core Principles (Non-Negotiable)

These govern every technical and product decision. Any proposed feature that conflicts with one of these is rejected, not the principle.

- **Utility over engagement** — The platform is a tool. Time-on-platform is not a success metric. Transactions completed is.
- **Pseudonymity over identity** — Verified phone + verified payment is the identity floor. Nothing more is collected or required.
- **Local liquidity over algorithmic reach** — Distance + recency is the only feed ranking. No algorithmic variables. Ever.

### 1.4 What KerbDrop Is Not

- A social network
- An ad platform
- A national shipping marketplace
- A storefront builder
- A communication network

### 1.5 Project Name

**KerbDrop** — evoking the kerbside/curbside transaction, the moment something moves from one person's life to another. Local, physical, immediate.

---

## 2. Monorepo Structure

```
kerbdrop/
├── apps/
│   ├── web/                        # Preact web application
│   │   ├── src/
│   │   │   ├── components/         # UI components
│   │   │   ├── pages/              # Route-level page components
│   │   │   ├── hooks/              # Custom Preact hooks
│   │   │   ├── stores/             # State management (Zustand or Preact signals)
│   │   │   ├── lib/                # API client, utilities
│   │   │   └── styles/             # Global styles, design tokens
│   │   ├── public/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   ├── mobile/                     # React Native companion app (primary photo channel)
│   │   ├── src/
│   │   │   ├── screens/
│   │   │   ├── components/
│   │   │   ├── navigation/
│   │   │   ├── services/           # Camera, AI upload, API
│   │   │   └── stores/
│   │   ├── ios/
│   │   ├── android/
│   │   └── package.json
│   │
│   └── api/                        # Express.js backend
│       ├── src/
│       │   ├── routes/             # Route handlers
│       │   ├── middleware/         # Auth, rate limiting, validation
│       │   ├── services/           # Business logic services
│       │   ├── jobs/               # Background job definitions
│       │   ├── lib/                # Supabase client, R2 client, etc.
│       │   └── index.ts            # Entry point
│       ├── .env.example
│       └── package.json
│
├── packages/
│   ├── shared/                     # Shared across all apps
│   │   ├── src/
│   │   │   ├── types/              # TypeScript interfaces and types
│   │   │   ├── schemas/            # Zod validation schemas
│   │   │   ├── constants/          # Shared constants (categories, limits, etc.)
│   │   │   └── utils/              # Pure utility functions
│   │   └── package.json
│   │
│   └── config/                     # Shared tooling config
│       ├── tsconfig.base.json
│       ├── eslint.base.js
│       └── package.json
│
├── infrastructure/
│   ├── cloudflare/
│   │   ├── tunnel.yml              # Cloudflare tunnel config (dev)
│   │   └── r2-lifecycle.json       # R2 bucket lifecycle rules
│   ├── do/
│   │   ├── app.yaml                # DigitalOcean App Platform spec
│   │   └── deploy.sh               # Deployment script
│   ├── jobs/
│   │   └── cron.yml                # Cron job definitions
│   └── supabase/
│       ├── migrations/             # Database migration files
│       └── seed.sql                # Development seed data
│
├── .env.example                    # Root environment variable template
├── turbo.json                      # Turborepo pipeline config
├── package.json                    # Root package.json (workspaces)
└── README.md
```

### 2.1 Monorepo Tooling

- **Package manager:** pnpm (workspaces)
- **Build orchestration:** Turborepo
- **Language:** TypeScript throughout (strict mode)
- **Linting:** ESLint with shared config from `packages/config`
- **Formatting:** Prettier
- **Git hooks:** Husky + lint-staged

---

## 3. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| Web frontend | Preact + Vite | React-compatible API, ~3KB runtime vs 45KB, no meaningful tradeoff for this use case |
| Mobile app | React Native (Expo) | Shared knowledge with web, access to native camera APIs, cross-platform |
| Backend | Express.js (Node.js/TypeScript) | Specified. Lightweight, well-understood, sufficient for this architecture |
| Database | Supabase (PostgreSQL) | Managed Postgres, row-level security, realtime subscriptions for messaging |
| Object storage | Cloudflare R2 | S3-compatible, zero egress fees, natural fit with Cloudflare tunnel dev setup |
| CDN | Cloudflare | Integrated with R2, global edge delivery |
| Search | Meilisearch | Fast, lightweight, self-hostable on DO, typo-tolerant, geosearch support |
| Background jobs | BullMQ + Redis | Reliable queue for photo processing, expiry jobs, notification dispatch |
| Payments | Stripe Connect (Express) | Phase 1 payments via third-party tap-to-pay app; platform handles OAuth onboarding only |
| AI vision | Anthropic API / OpenAI GPT-4V | Photo-to-listing generation |
| Content moderation | AWS Rekognition or Google Cloud Vision | Commodity safety classification at photo ingestion |
| Hosting (prod) | DigitalOcean App Platform | Specified |
| Dev tunnel | Cloudflare Tunnel | Specified. Exposes local Express server for webhook testing and mobile dev |
| Realtime messaging | Supabase Realtime | PostgreSQL-backed, eliminates separate WebSocket infrastructure |
| Notifications | Expo Push (mobile) + in-app (web) | Transactional only |

---

## 4. Database Design

All tables live in Supabase (PostgreSQL). Row-Level Security (RLS) is enabled on all tables. Supabase Auth is used for session management.

### 4.1 Users

```sql
CREATE TABLE users (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle           TEXT UNIQUE NOT NULL,           -- pseudonymous username, user-chosen
  phone_hash       TEXT UNIQUE NOT NULL,           -- bcrypt hash of verified phone number
  phone_verified   BOOLEAN NOT NULL DEFAULT FALSE,
  payment_verified BOOLEAN NOT NULL DEFAULT FALSE, -- TRUE after Stripe Connect OAuth completes
  stripe_account_id TEXT,                          -- Stripe Connect Express account ID
  device_fingerprints JSONB DEFAULT '[]',          -- array of known device fingerprints
  listing_count    INTEGER NOT NULL DEFAULT 0,     -- active listing count (cached)
  tier             TEXT NOT NULL DEFAULT 'free'    -- 'free' | 'plus' | 'pro'
    CHECK (tier IN ('free', 'plus', 'pro')),
  tier_expires_at  TIMESTAMPTZ,
  is_banned        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- No email. No real name. No social links. That's intentional.
```

### 4.2 Listings

```sql
CREATE TABLE listings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT,
  price_cents      INTEGER NOT NULL,               -- stored in cents, never floats
  category         TEXT NOT NULL,
  condition        TEXT CHECK (condition IN ('new','like_new','good','fair','parts')),
  attributes       JSONB DEFAULT '{}',             -- category-specific: size, color, brand, etc.
  location_lat     DECIMAL(9,6) NOT NULL,          -- centroid of seller's radius, not exact address
  location_lng     DECIMAL(9,6) NOT NULL,
  location_radius_miles INTEGER NOT NULL DEFAULT 10,
  location_label   TEXT NOT NULL,                  -- human-readable: "Brooklyn, NY" — never exact address
  status           TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','sold','expired','removed')),
  photo_count      INTEGER NOT NULL DEFAULT 0,
  ai_generated     BOOLEAN NOT NULL DEFAULT FALSE, -- TRUE if title/desc were AI-generated
  view_count       INTEGER NOT NULL DEFAULT 0,
  expires_at       TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  sold_at          TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX listings_location ON listings USING GIST (
  ll_to_earth(location_lat, location_lng)
);
CREATE INDEX listings_status_expires ON listings(status, expires_at);
CREATE INDEX listings_seller ON listings(seller_id);
CREATE INDEX listings_created ON listings(created_at DESC);
```

### 4.3 Photos

```sql
CREATE TABLE photos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id       UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  seller_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  r2_key           TEXT NOT NULL UNIQUE,           -- Cloudflare R2 object key
  r2_thumb_key     TEXT NOT NULL,                  -- thumbnail key
  cdn_url          TEXT NOT NULL,                  -- public CDN URL
  thumb_url        TEXT NOT NULL,
  width            INTEGER,
  height           INTEGER,
  size_bytes       INTEGER,
  moderation_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (moderation_status IN ('pending','approved','rejected')),
  moderation_reason TEXT,                          -- populated on rejection
  sort_order       INTEGER NOT NULL DEFAULT 0,
  delete_at        TIMESTAMPTZ NOT NULL,           -- set to listing.expires_at at upload
  deleted_at       TIMESTAMPTZ,                    -- set when physically deleted from R2
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX photos_listing ON photos(listing_id, sort_order);
CREATE INDEX photos_delete_at ON photos(delete_at) WHERE deleted_at IS NULL;
```

### 4.4 Messages

```sql
CREATE TABLE message_threads (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id       UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status           TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','archived','blocked')),
  last_message_at  TIMESTAMPTZ,
  expires_at       TIMESTAMPTZ NOT NULL,           -- 7 days after listing closure/expiry
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(listing_id, buyer_id)                     -- one thread per buyer per listing
);

CREATE TABLE messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id        UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  sender_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body             TEXT NOT NULL,
  type             TEXT NOT NULL DEFAULT 'text'
    CHECK (type IN ('text','offer','offer_accepted','offer_declined','system')),
  offer_cents      INTEGER,                        -- populated when type = 'offer'
  read_at          TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX messages_thread ON messages(thread_id, created_at ASC);
CREATE INDEX threads_buyer ON message_threads(buyer_id);
CREATE INDEX threads_seller ON message_threads(seller_id);
```

### 4.5 Offers

```sql
CREATE TABLE offers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id       UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  thread_id        UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  buyer_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_cents     INTEGER NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','declined','expired','withdrawn')),
  expires_at       TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at     TIMESTAMPTZ
);
```

### 4.6 Notifications

```sql
CREATE TABLE notifications (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type             TEXT NOT NULL
    CHECK (type IN (
      'message_received',
      'offer_received',
      'offer_accepted',
      'offer_declined',
      'payment_completed',
      'listing_expiring_soon',
      'listing_expired'
    )),
  payload          JSONB NOT NULL DEFAULT '{}',    -- relevant IDs and display data
  read_at          TIMESTAMPTZ,
  push_sent_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX notifications_user ON notifications(user_id, created_at DESC);
```

### 4.7 Push Tokens

```sql
CREATE TABLE push_tokens (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token            TEXT NOT NULL UNIQUE,           -- Expo push token
  platform         TEXT NOT NULL CHECK (platform IN ('ios','android')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at     TIMESTAMPTZ
);
```

### 4.8 Rate Limit Buckets

```sql
CREATE TABLE rate_limit_buckets (
  key              TEXT PRIMARY KEY,               -- e.g. "listing:user:uuid" or "msg:ip:x.x.x.x"
  count            INTEGER NOT NULL DEFAULT 0,
  window_start     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at       TIMESTAMPTZ NOT NULL
);
```

### 4.9 Row-Level Security Policies

```sql
-- Users can only read/update their own record
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_own ON users
  USING (auth.uid() = id);

-- Listings are publicly readable when active, writable only by seller
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY listings_read ON listings FOR SELECT
  USING (status = 'active');
CREATE POLICY listings_write ON listings FOR ALL
  USING (auth.uid() = seller_id);

-- Messages readable only by thread participants
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY messages_participants ON messages
  USING (
    EXISTS (
      SELECT 1 FROM message_threads t
      WHERE t.id = thread_id
      AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
    )
  );

-- Notifications readable only by owner
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_own ON notifications
  USING (auth.uid() = user_id);
```

### 4.10 Categories (Enum Reference)

Stored as TEXT with application-level validation via shared Zod schema.

```
furniture
electronics
clothing_and_accessories
vehicles
bicycles
tools_and_hardware
appliances
sporting_goods
baby_and_kids
books_and_media
musical_instruments
art_and_collectibles
garden_and_outdoor
pet_supplies
other
```

---

## 5. Backend API

### 5.1 Structure

```
apps/api/src/
├── routes/
│   ├── auth.ts           # Phone verification, session management
│   ├── listings.ts       # CRUD for listings
│   ├── photos.ts         # Upload presigned URLs, moderation webhooks
│   ├── search.ts         # Meilisearch proxy with location
│   ├── messages.ts       # Thread and message management
│   ├── offers.ts         # Offer flow
│   ├── notifications.ts  # Read/list notifications
│   ├── payments.ts       # Stripe Connect OAuth flow
│   └── webhooks.ts       # Stripe webhooks, moderation callbacks
├── middleware/
│   ├── auth.ts           # Supabase JWT verification
│   ├── rateLimit.ts      # Per-route rate limiting
│   ├── validate.ts       # Zod request validation
│   └── fingerprint.ts    # Device fingerprint extraction
├── services/
│   ├── listings.ts       # Listing business logic
│   ├── photos.ts         # R2 operations, thumbnail generation
│   ├── ai.ts             # Vision API calls
│   ├── moderation.ts     # Content safety classification
│   ├── search.ts         # Meilisearch indexing
│   ├── messages.ts       # Thread and message logic
│   ├── notifications.ts  # Notification dispatch
│   ├── payments.ts       # Stripe Connect logic
│   └── jobs.ts           # BullMQ queue producers
├── jobs/
│   ├── photoProcessor.ts # Consume photo upload events
│   ├── listingExpiry.ts  # Mark expired listings, trigger photo deletion
│   ├── photoDeleter.ts   # Physical R2 deletion
│   └── offerExpiry.ts    # Expire stale offers
└── lib/
    ├── supabase.ts       # Supabase admin client
    ├── r2.ts             # Cloudflare R2 S3-compatible client
    ├── meilisearch.ts    # Meilisearch client
    ├── stripe.ts         # Stripe client
    ├── redis.ts          # Redis client (BullMQ + rate limiting)
    └── logger.ts         # Structured logging
```

### 5.2 API Routes

All routes are prefixed `/api/v1`.

#### Auth

| Method | Path | Description | Auth Required |
|---|---|---|---|
| POST | `/auth/phone/request` | Send SMS verification code | No |
| POST | `/auth/phone/verify` | Verify code, create/login user | No |
| POST | `/auth/session/refresh` | Refresh Supabase session | Yes |
| DELETE | `/auth/session` | Sign out | Yes |

#### Listings

| Method | Path | Description | Auth Required |
|---|---|---|---|
| GET | `/listings` | Browse listings (location + filters) | No |
| GET | `/listings/:id` | Get single listing | No |
| POST | `/listings` | Create listing | Yes |
| PATCH | `/listings/:id` | Update listing | Yes (owner) |
| DELETE | `/listings/:id` | Remove listing | Yes (owner) |
| POST | `/listings/:id/sold` | Mark as sold | Yes (owner) |
| POST | `/listings/:id/relist` | Relist expired listing | Yes (owner) |
| GET | `/listings/mine` | Seller's own listings | Yes |

#### Photos

| Method | Path | Description | Auth Required |
|---|---|---|---|
| POST | `/photos/presign` | Get R2 presigned upload URL | Yes |
| POST | `/photos/:id/confirm` | Confirm upload, trigger AI pipeline | Yes |
| DELETE | `/photos/:id` | Delete a photo from listing | Yes (owner) |
| PATCH | `/photos/reorder` | Update sort_order for listing photos | Yes (owner) |

#### Search

| Method | Path | Description | Auth Required |
|---|---|---|---|
| GET | `/search` | Full-text + geo search | No |

Query params: `q`, `lat`, `lng`, `radius_miles`, `category`, `min_price`, `max_price`, `condition`, `page`, `limit`

#### Messages

| Method | Path | Description | Auth Required |
|---|---|---|---|
| GET | `/threads` | List user's message threads | Yes |
| GET | `/threads/:id` | Get thread with messages | Yes |
| POST | `/threads` | Start a thread (first message) | Yes |
| POST | `/threads/:id/messages` | Send a message | Yes |
| GET | `/threads/:id/listings` | Seller's other active listings (in-thread only) | Yes |

#### Offers

| Method | Path | Description | Auth Required |
|---|---|---|---|
| POST | `/offers` | Submit an offer | Yes |
| POST | `/offers/:id/accept` | Accept offer | Yes (seller) |
| POST | `/offers/:id/decline` | Decline offer | Yes (seller) |
| POST | `/offers/:id/withdraw` | Withdraw offer | Yes (buyer) |

#### Payments

| Method | Path | Description | Auth Required |
|---|---|---|---|
| GET | `/payments/connect/url` | Get Stripe Connect OAuth URL | Yes |
| GET | `/payments/connect/callback` | Handle Stripe OAuth callback | Yes |
| GET | `/payments/connect/status` | Check connection status | Yes |
| DELETE | `/payments/connect` | Disconnect Stripe account | Yes |

#### Notifications

| Method | Path | Description | Auth Required |
|---|---|---|---|
| GET | `/notifications` | List notifications | Yes |
| POST | `/notifications/read` | Mark notifications as read | Yes |
| POST | `/push-tokens` | Register Expo push token | Yes |
| DELETE | `/push-tokens/:token` | Remove push token | Yes |

#### Webhooks

| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/webhooks/stripe` | Stripe event handler | Stripe signature |
| POST | `/webhooks/moderation` | Content moderation callback | Shared secret |

### 5.3 Standard Response Shape

```typescript
// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "error": {
    "code": "LISTING_NOT_FOUND",
    "message": "This listing does not exist or has been removed."
  }
}

// Paginated
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 143,
    "has_more": true
  }
}
```

---

## 6. Photo Pipeline

### 6.1 Flow Overview

```
Mobile/Web Client
      │
      ▼
POST /photos/presign  ──► API generates presigned R2 URL
      │                    (15 min expiry, max 10MB, image/* only)
      │
      ▼
Client uploads directly to R2 (bypasses API server)
      │
      ▼
POST /photos/confirm  ──► API validates upload exists in R2
      │                    Enqueues photo-processing job
      │
      ▼
BullMQ: photo-processing job
      ├── Resize + compress (sharp)
      │   ├── Full: max 1200px, 85% quality WEBP
      │   └── Thumb: 400x400 cover crop WEBP
      ├── Store thumbnail to R2
      ├── Run content moderation (AWS Rekognition)
      │   ├── APPROVED → update photo.moderation_status = 'approved'
      │   └── REJECTED → update status = 'rejected', notify seller, soft-block listing
      ├── If this is the first photo on a new listing:
      │   └── Enqueue AI generation job (see Section 7)
      └── Update photos table with cdn_url, thumb_url, dimensions
```

### 6.2 R2 Bucket Structure

```
kerbdrop-photos/
├── originals/          # Never served directly (private)
│   └── {listing_id}/{photo_id}.webp
├── full/               # Served via CDN
│   └── {listing_id}/{photo_id}.webp
└── thumbs/             # Served via CDN
    └── {listing_id}/{photo_id}_thumb.webp
```

### 6.3 Photo Constraints

- Maximum **5 photos per listing**
- Maximum **10MB per upload** (pre-compression)
- Accepted MIME types: `image/jpeg`, `image/png`, `image/heic`, `image/webp`
- HEIC converted to WEBP server-side (sharp supports this)
- Originals stored but never publicly served
- All public URLs served via Cloudflare CDN with cache headers

### 6.4 Deletion

Photos are deleted from R2 in two scenarios:

1. **Listing sold:** `delete_at` updated to `NOW()` immediately on `POST /listings/:id/sold`
2. **Listing expired:** `delete_at` set to listing `expires_at` at creation

The `photo-deleter` cron job runs every hour, finds all photos where `delete_at <= NOW()` and `deleted_at IS NULL`, deletes from R2, and sets `deleted_at`.

### 6.5 Moderation Integration

AWS Rekognition `DetectModerationLabels` is called on the full-size image after compression. Labels checked:

- `Explicit Nudity` (confidence > 80)
- `Violence` (confidence > 80)
- `Visually Disturbing` (confidence > 80)
- `Weapons` (confidence > 70)

PhotoDNA (or equivalent) hash check for known CSAM material is a hard block regardless of confidence threshold.

Rejected photos: listing is flagged, seller receives an in-app notification with a plain-language explanation, listing is held from the feed until a replacement photo is submitted or the listing is removed.

---

## 7. AI Processing Service

### 7.1 Purpose

When a seller uploads photos, the AI service generates a draft title and description. The seller reviews and edits before publishing. The seller always owns and is responsible for the final content.

### 7.2 Flow

```
Photo confirmed + approved by moderation
      │
      ▼
BullMQ: ai-generation job
      │
      ├── Fetch full image from R2 (presigned URL, private)
      ├── Send to vision API with structured prompt
      │   ├── Generate: title (max 80 chars)
      │   ├── Generate: description (max 500 chars)
      │   ├── Suggest: category (from fixed enum)
      │   └── Suggest: condition ('new'|'like_new'|'good'|'fair'|'parts')
      │
      ├── Store AI output to listing as draft (status: 'draft')
      │   (listing is NOT live until seller confirms)
      │
      └── Notify seller: "Your listing draft is ready to review"
```

### 7.3 Prompt Design

```
You are helping a seller list an item for sale on a local marketplace.
Examine the photo(s) and generate:

1. A concise, accurate title (max 80 characters). Include brand, model, 
   key specs if visible. Do not invent details not visible in the photo.

2. A short description (max 500 characters). Describe condition, notable 
   features, and any visible wear or defects honestly.

3. The most appropriate category from this list: [category enum]

4. Condition: new | like_new | good | fair | parts

Return ONLY valid JSON in this exact shape:
{
  "title": "...",
  "description": "...",
  "category": "...",
  "condition": "..."
}

Do not invent model numbers, serial numbers, or specifications not 
clearly visible in the photo. When uncertain, be conservative.
```

### 7.4 Failure Handling

If the AI generation fails or times out:
- Listing is created with empty title/description fields
- Seller is prompted to fill them in manually
- No blocking — the seller can always write their own

### 7.5 Cost Management

AI generation is only triggered on the **first photo** of a new listing, not on every photo. Additional photos are processed by moderation only. Estimated cost per listing: ~$0.002–0.01 depending on provider and image size.

---

## 8. Search Infrastructure

### 8.1 Meilisearch Index: `listings`

```javascript
// Index configuration
{
  primaryKey: 'id',
  searchableAttributes: [
    'title',
    'description',
    'category',
    'location_label'
  ],
  filterableAttributes: [
    'status',
    'category',
    'condition',
    'price_cents',
    'location_lat',
    'location_lng',
    'seller_id'
  ],
  sortableAttributes: [
    'created_at',
    'price_cents',
    '_geoPoint(location_lat, location_lng)'
  ],
  rankingRules: [
    'words',
    'typo',
    'proximity',
    'attribute',
    'sort',
    'exactness'
  ]
}
```

### 8.2 Geo Search Query

```javascript
// GET /search?q=bike&lat=40.71&lng=-74.00&radius_miles=10
index.search(q, {
  filter: [
    `status = 'active'`,
    `_geoRadius(${lat}, ${lng}, ${radius_miles * 1609})` // convert miles to meters
  ],
  sort: [`_geoPoint(${lat}, ${lng}):asc`, 'created_at:desc'],
  limit: 20,
  offset: page * 20
})
```

**Critical:** Sort is distance first, recency second. No relevance-based ranking that could be gamed. No engagement signals. This is the anti-algorithm guarantee, implemented at the infrastructure level.

### 8.3 Index Sync

Meilisearch is synced from PostgreSQL via the API:
- On listing create → add to index
- On listing update → update in index
- On listing status change → update or delete from index
- Nightly full re-index job as a safety net

---

## 9. Messaging System

### 9.1 Architecture

Supabase Realtime is used for live message delivery, eliminating the need for a separate WebSocket server. Clients subscribe to their message threads via Supabase's Realtime channels.

```
Buyer sends message
      │
      ▼
POST /threads/:id/messages
      │
      ├── Insert into messages table
      ├── Update message_threads.last_message_at
      ├── Supabase Realtime broadcasts to channel: thread:{id}
      ├── Enqueue notification job
      └── Return message to sender
```

### 9.2 Thread Rules

- One thread per buyer per listing (enforced by unique constraint)
- Thread is created on first message from buyer
- Seller cannot initiate a thread
- Thread expires 7 days after listing closure or expiry
- Messages within expired threads are read-only, then archived
- No media attachments (text only)
- No group threads
- No "online now" or "last seen" indicators

### 9.3 In-Thread Seller Listings

When a buyer views a message thread, the API returns the seller's other **currently active** listings alongside the thread. This is the only cross-listing seller visibility in the product. Implemented as:

```
GET /threads/:id/listings
→ SELECT * FROM listings
  WHERE seller_id = :seller_id
  AND status = 'active'
  AND id != :current_listing_id
  LIMIT 6
```

No listing history. No sold items. No profile. Just live inventory, in context.

---

## 10. Notification System

### 10.1 Notification Types

Only transactional notifications are sent. No social or engagement notifications.

| Type | Trigger | Channel |
|---|---|---|
| `message_received` | New message in thread | Push + in-app |
| `offer_received` | Buyer submits offer | Push + in-app |
| `offer_accepted` | Seller accepts offer | Push + in-app |
| `offer_declined` | Seller declines offer | Push + in-app |
| `payment_completed` | Transaction confirmed via webhook | Push + in-app |
| `listing_expiring_soon` | 24 hours before expiry | Push + in-app |
| `listing_expired` | Listing expires | In-app only |

### 10.2 Push Notification Dispatch

Expo Push Notification Service (EPNS) is used for mobile push, via the `expo-server-sdk` npm package.

```typescript
// Notification payload shape
{
  to: expoToken,
  title: "New message",
  body: "Someone is interested in your bicycle",
  data: {
    type: "message_received",
    thread_id: "...",
    listing_id: "..."
  }
}
```

### 10.3 Notification Preferences

Users can disable individual notification types via settings. Push token management (register on app open, deregister on sign-out) is handled by the mobile app.

---

## 11. Payment Architecture

### 11.1 Philosophy

KerbDrop does not process payments directly. The platform's payment role is limited to:

1. Facilitating seller onboarding to Stripe Connect via OAuth
2. Storing the seller's Stripe Connect account ID
3. Receiving webhook confirmation when a transaction completes via the third-party tap-to-pay app

The third-party tap-to-pay app handles all actual money movement. KerbDrop is never in the flow of funds and is not a money transmitter.

### 11.2 Stripe Connect Express OAuth Flow

```
Seller taps "Set up payments" in KerbDrop
      │
      ▼
GET /payments/connect/url
      │
      ├── Generate Stripe Connect OAuth URL
      │   stripe.oauth.authorizeUrl({
      │     response_type: 'code',
      │     client_id: STRIPE_CONNECT_CLIENT_ID,
      │     scope: 'read_write',
      │     redirect_uri: STRIPE_OAUTH_REDIRECT_URI,
      │     state: signed_jwt_with_user_id  // CSRF protection
      │   })
      │
      └── Return URL to client → client opens in browser/webview

Seller completes Stripe onboarding (KYC, bank details — Stripe's UX)
      │
      ▼
Stripe redirects to GET /payments/connect/callback?code=...&state=...
      │
      ├── Verify state JWT (CSRF check)
      ├── Exchange code for access_token + stripe_user_id
      │   stripe.oauth.token({ grant_type: 'authorization_code', code })
      ├── Store stripe_account_id on users table
      ├── Set payment_verified = TRUE
      └── Redirect seller back to KerbDrop with success state
```

### 11.3 Payment Verification Badge

Once `payment_verified = TRUE`, the seller's listings display the payment verified badge (✓). This tells buyers this seller can receive in-app payment via the tap-to-pay app.

### 11.4 Transaction Confirmation Webhook

When a transaction completes in the tap-to-pay app, it sends a webhook to `POST /webhooks/stripe`. The handler:

- Verifies the Stripe webhook signature
- Identifies the listing and buyer/seller
- Marks the listing as sold
- Sends `payment_completed` notifications to both parties
- Triggers immediate photo deletion

### 11.5 Fee Structure (Business Logic, Not Technical)

Fees are collected by the tap-to-pay app at transaction time. KerbDrop's take is:

| Sale Price | Platform Fee |
|---|---|
| Under $20 | $1.00 flat |
| $20 and above | 5% of sale price |

Stripe Connect fees (~2.9% + $0.30) are absorbed within the platform fee. Net margin improves with transaction size. Very low-value transactions (under $10) are suggested to be cash-at-pickup; the platform does not block them but does not optimize for them.

---

## 12. Scheduled Jobs and Lifecycle Management

### 12.1 Job Queue (BullMQ + Redis)

All background work is managed via BullMQ queues. Each queue has a dedicated worker.

| Queue | Worker | Trigger |
|---|---|---|
| `photo-processing` | Resize, compress, thumbnail | Photo confirm endpoint |
| `ai-generation` | Vision API call, draft listing | After first photo approved |
| `content-moderation` | Rekognition classification | After photo compression |
| `notifications` | Push + in-app dispatch | Various events |
| `search-index` | Meilisearch sync | Listing create/update/delete |
| `listing-expiry` | Mark expired, trigger deletion | Cron |
| `photo-deletion` | R2 physical delete | Cron |
| `offer-expiry` | Mark stale offers expired | Cron |

### 12.2 Cron Jobs

```yaml
# infrastructure/jobs/cron.yml

jobs:
  listing-expiry:
    schedule: "*/15 * * * *"      # Every 15 minutes
    description: >
      Find listings where expires_at <= NOW() and status = 'active'.
      Set status = 'expired'. Enqueue photo-deletion for each.
      Update Meilisearch index.

  photo-deletion:
    schedule: "0 * * * *"         # Every hour
    description: >
      Find photos where delete_at <= NOW() and deleted_at IS NULL.
      Delete from R2 (both full and thumb keys).
      Set deleted_at = NOW().

  offer-expiry:
    schedule: "*/30 * * * *"      # Every 30 minutes
    description: >
      Find offers where expires_at <= NOW() and status = 'pending'.
      Set status = 'expired'.
      Notify buyer that offer expired.

  listing-expiry-warnings:
    schedule: "0 * * * *"         # Every hour
    description: >
      Find listings expiring within 24 hours where seller
      has not been warned yet. Send listing_expiring_soon notification.
```

### 12.3 Listing Lifecycle State Machine

```
draft ──► active ──► sold
                └──► expired
                └──► removed (manual by seller or moderation)

active listings can be:
  - edited (title, description, price, attributes)
  - marked sold
  - removed by seller
  - expired by cron
  - removed by moderation

expired listings can be:
  - relisted (creates a NEW listing, does not bump the old one)
```

---

## 13. Authentication and Identity

### 13.1 Phone-Only Authentication

KerbDrop uses phone number verification as the sole authentication mechanism. No email. No password. No social OAuth.

```
User enters phone number
      │
      ▼
POST /auth/phone/request
      │
      ├── Validate E.164 format
      ├── Rate limit: max 3 requests per phone per hour
      ├── Send SMS via Supabase Auth (Twilio under the hood)
      └── Return: { expires_in: 600 }  // 10 minute code window

User enters 6-digit code
      │
      ▼
POST /auth/phone/verify
      │
      ├── Verify OTP via Supabase Auth
      ├── If new user: create users record, prompt handle selection
      ├── If existing user: return session
      └── Return: { session, user, is_new_user }
```

### 13.2 Handle Selection

New users are prompted to choose a pseudonymous handle immediately after phone verification.

Rules:
- 3–30 characters
- Letters, numbers, underscores, hyphens only
- No real name suggestions, no "use your Facebook name" prompts
- Must be unique
- Cannot be changed after 30 days (prevents identity switching abuse)

### 13.3 Session Management

Supabase Auth issues JWTs. The API middleware validates the JWT on every authenticated request. Sessions expire after 7 days; clients silently refresh via Supabase client SDK.

### 13.4 What Is Never Collected

- Real name
- Email address
- Social media accounts
- Exact home address
- Browsing or behavioral history
- Cross-session tracking beyond fraud prevention
- Any data that could be sold or shared with advertisers

---

## 14. Rate Limiting and Fraud Prevention

### 14.1 Rate Limits by Route

| Route | Limit | Window |
|---|---|---|
| `POST /auth/phone/request` | 3 requests | Per phone, per hour |
| `POST /listings` | 5 listings | Per user, per hour |
| `POST /threads` (new thread) | 10 threads | Per user, per hour |
| `POST /threads/:id/messages` | 30 messages | Per thread, per hour |
| `POST /offers` | 5 offers | Per user, per hour |
| `POST /photos/presign` | 20 uploads | Per user, per hour |

### 14.2 Device Fingerprinting

On first authenticated request from a device, a fingerprint is generated from:
- User-Agent
- Accept-Language
- IP address (hashed, not stored raw)
- Screen resolution (mobile app only)

Fingerprint is stored in `users.device_fingerprints` (JSONB array). Accounts with suspicious fingerprint patterns (many accounts from one device) are flagged for manual review.

### 14.3 Listing Cap by Tier

| Tier | Active Concurrent Listings |
|---|---|
| Free | 10 |
| Plus ($4.99/mo) | 25 |
| Pro ($14.99/mo) | Unlimited |

The listing cap is enforced at `POST /listings` time by checking `users.listing_count` against the tier limit. Listing count is decremented on sold/expired/removed.

**Critical:** No tier affects feed ranking, search visibility, or listing discovery. This is enforced at the Meilisearch query level — no tier field is available as a sort or filter variable.

---

## 15. Web App (Preact)

### 15.1 Routing Structure

```
/                         Home / Browse feed (location-aware)
/search                   Search results
/listing/:id              Listing detail page
/listing/new              Create listing (photo upload + AI flow)
/listing/:id/edit         Edit listing
/inbox                    Message threads list
/inbox/:thread_id         Message thread view
/account                  Account settings
/account/listings         Manage my listings
/account/payments         Stripe Connect setup
/account/notifications    Notification preferences
/auth                     Phone verification
/auth/handle              Handle selection (new users)
```

### 15.2 State Management

**Preact Signals** for global state (auth, user, notifications badge count). Signals are lighter than Zustand and native to Preact.

Local component state for forms, UI toggles.

SWR (or equivalent) for data fetching with cache and revalidation.

### 15.3 Key Component Hierarchy

```
App
├── AuthGuard              # Redirects unauthenticated users
├── Layout
│   ├── Header
│   │   ├── Logo
│   │   ├── LocationSelector
│   │   ├── SearchBar
│   │   └── NavIcons (Inbox, Account, Post)
│   └── BottomNav (mobile only)
│
├── Pages
│   ├── Browse
│   │   ├── FilterBar (category, price, radius, condition)
│   │   ├── ListingGrid
│   │   │   └── ListingCard (photo, title, price, distance, time ago)
│   │   └── LoadMore
│   │
│   ├── ListingDetail
│   │   ├── PhotoCarousel
│   │   ├── ListingInfo (title, price, condition, location label, time ago)
│   │   ├── SellerBadges (phone verified ✓, payment verified ✓)
│   │   ├── ActionBar (Make Offer / Message Seller)
│   │   ├── Description
│   │   └── OtherSellerListings (max 6, active only)
│   │
│   ├── CreateListing
│   │   ├── PhotoUploader (drag-drop + file picker)
│   │   ├── AIReviewPanel (generated title/desc, editable)
│   │   ├── PriceInput
│   │   ├── CategorySelector
│   │   ├── ConditionSelector
│   │   ├── AttributeFields (dynamic, per category)
│   │   ├── LocationRadiusPicker
│   │   └── PublishButton
│   │
│   ├── Inbox
│   │   ├── ThreadList
│   │   │   └── ThreadPreview (listing thumb, last message, unread badge)
│   │   └── ThreadView
│   │       ├── ListingMiniCard
│   │       ├── MessageList
│   │       ├── OfferPanel (if active offer)
│   │       ├── MessageInput
│   │       └── MakeOfferButton
│   │
│   └── Account
│       ├── HandleDisplay
│       ├── VerificationBadges
│       ├── ListingManager
│       ├── PaymentSetup (Stripe Connect OAuth trigger)
│       └── NotificationPreferences
```

---

## 16. UI Design System

### 16.1 Design Direction

KerbDrop's visual identity is built around one idea: **the moment before the exchange**. The aesthetic evokes concrete, chalk, and street-level physicality — the kerbside, the garage, the handshake. Not a tech product. Not a social network. A utility with character.

The signature element: a persistent **location pulse indicator** in the header — a subtle animated dot that shows "you're browsing [City Name]," reinforcing the local-first premise on every screen. It is the one decorative element permitted. Everything else is disciplined and purposeful.

### 16.2 Color Tokens

```css
:root {
  /* Core palette */
  --color-surface:      #F7F5F0;   /* warm off-white, not clinical white */
  --color-surface-alt:  #EDEAE3;   /* card backgrounds, input fields */
  --color-border:       #D4D0C8;   /* subtle, warm grey */
  --color-ink:          #1A1916;   /* near-black, warm undertone */
  --color-ink-muted:    #6B6760;   /* secondary text, labels */
  --color-ink-faint:    #A8A49C;   /* placeholder text, disabled states */

  /* Accent — the one moment of energy */
  --color-accent:       #E85D26;   /* burnt orange — kerbside, warmth, action */
  --color-accent-light: #FDF0EB;   /* accent tint for badges, highlights */
  --color-accent-dark:  #C44A1A;   /* hover states, pressed buttons */

  /* Semantic */
  --color-success:      #2D7D46;
  --color-success-light:#EBF5EF;
  --color-warning:      #B45309;
  --color-warning-light:#FEF3C7;
  --color-error:        #C0392B;
  --color-error-light:  #FDECEA;
}
```

### 16.3 Typography

```css
/* Display face — used sparingly, for hero moments and listing titles only */
/* Fraunces: a variable serif with warmth and character, not a tech font */
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;1,300&display=swap');

/* Body face — workhorse, legible at all sizes */
/* Inter: neutral but not sterile, well-hinted */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

:root {
  --font-display:  'Fraunces', Georgia, serif;
  --font-body:     'Inter', system-ui, sans-serif;

  /* Type scale */
  --text-xs:    0.75rem;    /* 12px — labels, badges */
  --text-sm:    0.875rem;   /* 14px — secondary text, captions */
  --text-base:  1rem;       /* 16px — body text */
  --text-lg:    1.125rem;   /* 18px — listing card titles */
  --text-xl:    1.25rem;    /* 20px — section headers */
  --text-2xl:   1.5rem;     /* 24px — page titles */
  --text-3xl:   1.875rem;   /* 30px — listing detail title (Fraunces) */
  --text-4xl:   2.25rem;    /* 36px — hero moments (Fraunces) */

  /* Line heights */
  --leading-tight:  1.25;
  --leading-normal: 1.5;
  --leading-relaxed:1.65;
}
```

### 16.4 Spacing and Layout

```css
:root {
  /* 8pt grid */
  --space-1:  0.25rem;   /* 4px */
  --space-2:  0.5rem;    /* 8px */
  --space-3:  0.75rem;   /* 12px */
  --space-4:  1rem;      /* 16px */
  --space-5:  1.25rem;   /* 20px */
  --space-6:  1.5rem;    /* 24px */
  --space-8:  2rem;      /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */

  /* Border radius — minimal, not bubbly */
  --radius-sm:   4px;
  --radius-base: 6px;
  --radius-lg:   10px;
  --radius-full: 9999px;  /* pills only — badges, tags */

  /* Shadows — subtle, warm */
  --shadow-sm:  0 1px 2px rgba(26, 25, 22, 0.06);
  --shadow-base:0 2px 8px rgba(26, 25, 22, 0.08);
  --shadow-lg:  0 8px 24px rgba(26, 25, 22, 0.10);

  /* Layout */
  --max-width:       1200px;
  --content-width:   720px;   /* single-column content */
  --grid-gap:        var(--space-4);
  --header-height:   56px;
}
```

### 16.5 Listing Card Component

```
┌─────────────────────────────┐
│                             │
│         PHOTO               │  ← 4:3 ratio, cover crop
│         (thumb)             │
│                             │
├─────────────────────────────┤
│ $45                         │  ← price: Fraunces 600, --text-xl, --color-ink
│ Trek FX3 Fitness Bike       │  ← title: Inter 500, --text-sm, --color-ink
│ 2.3 miles · 4 hours ago     │  ← meta: Inter 400, --text-xs, --color-ink-muted
│                         [✓] │  ← payment badge: only if payment_verified
└─────────────────────────────┘
```

Grid: 2 columns mobile, 3 columns tablet, 4 columns desktop. No sidebar. No promoted cards. Every card is identical in size and weight — no visual hierarchy that could be monetized.

### 16.6 Feed Header

```
┌──────────────────────────────────────────────────────┐
│  ◉ Brooklyn, NY          [Search...]    [🔔] [≡]     │
│  ─────────────────────────────────────────────────── │
│  [All] [Furniture] [Electronics] [Bikes] [Clothes]   │
└──────────────────────────────────────────────────────┘
```

The `◉` is the **location pulse** — the signature element. A soft animated ring pulses once every 4 seconds. It is the only animation on the browse screen. It communicates "this is local, right now" without words.

Below it: category pills, horizontally scrollable. No algorithmic "featured" categories. Alphabetical order, always.

Feed sort label sits below the category filter:
```
Sorted by: Nearest first, newest first. Always.
```
Plain text, --text-xs, --color-ink-muted. Not hidden. Not in a tooltip. Visible on every browse session. This is a trust statement, not a UI label.

### 16.7 Listing Detail Layout

```
┌────────────────────────────────────────┐
│  ← Back                         Share  │
├────────────────────────────────────────┤
│                                        │
│         PHOTO CAROUSEL                 │  ← full-width, swipeable
│         ○ ○ ● ○ ○                     │  ← dot indicators only
│                                        │
├────────────────────────────────────────┤
│ $45                                    │  ← Fraunces, large
│ Trek FX3 Fitness Bike, Black 54cm      │  ← Fraunces light, --text-3xl
│                                        │
│ ✓ Phone verified  ✓ Payment verified   │  ← binary badges, --color-success
│ Good condition · 2.3 miles away        │
│ Listed 4 hours ago in Brooklyn, NY     │
├────────────────────────────────────────┤
│                                        │
│  [    Make an Offer    ] [  Message  ] │  ← primary / secondary CTA
│                                        │
├────────────────────────────────────────┤
│ Description                            │
│ Adult-size commuter bike in good       │
│ shape. Minor scuff on left chainstay,  │
│ otherwise rides great. Selling as I    │
│ upgraded to a road bike.               │
├────────────────────────────────────────┤
│ More from this seller                  │  ← only if they have other active listings
│ [card] [card] [card]                   │  ← max 3 shown, horizontal scroll
└────────────────────────────────────────┘
```

### 16.8 Create Listing Flow (Web)

```
Step 1: Photos
┌────────────────────────────────────────┐
│  Add photos (up to 5)                  │
│                                        │
│  ┌──────┐ ┌──────┐ ┌──────┐           │
│  │  +   │ │      │ │      │           │  ← drag-drop or click to upload
│  └──────┘ └──────┘ └──────┘           │
│                                        │
│  First photo becomes your cover.       │
│                          [Continue →]  │
└────────────────────────────────────────┘

Step 2: Review AI draft (shown after photos processed)
┌────────────────────────────────────────┐
│  ✨ We filled in the details — check   │
│     them over and fix anything wrong.  │
│                                        │
│  Title                                 │
│  [Trek FX3 Fitness Bike, Black 54cm  ] │  ← editable
│                                        │
│  Description                           │
│  [Adult-size commuter bike in good   ] │  ← editable textarea
│  [shape. Minor scuff on left chain.. ] │
│                                        │
│  Category                              │
│  [Bicycles                          ▾] │
│                                        │
│  Condition                             │
│  [ ] New  [ ] Like new  [●] Good  [ ] Fair  [ ] Parts only
│                                        │
│                          [Continue →]  │
└────────────────────────────────────────┘

Step 3: Price and location
┌────────────────────────────────────────┐
│  Price                                 │
│  $ [45                               ] │
│                                        │
│  Your location                         │
│  [Brooklyn, NY                       ] │  ← city/neighborhood only, not exact
│                                        │
│  Show listings within                  │
│  [●] 5 mi  [ ] 10 mi  [ ] 25 mi       │
│                                        │
│                          [Post listing]│
└────────────────────────────────────────┘
```

### 16.9 Message Thread View

```
┌────────────────────────────────────────┐
│  ← Inbox                               │
├────────────────────────────────────────┤
│  ┌──────────────────────────────────┐  │
│  │ [thumb] Trek FX3 Bike · $45      │  │  ← listing mini-card
│  └──────────────────────────────────┘  │
├────────────────────────────────────────┤
│                                        │
│  Hi, is this still available?          │  ← buyer message (left-aligned)
│  2:14 PM                               │
│                                        │
│                    Yes it is! When     │  ← seller message (right-aligned)
│                    can you pick up? →  │
│                              2:17 PM   │
│                                        │
├────────────────────────────────────────┤
│  [Type a message...        ] [Send]    │
│  [Make an offer]                       │
└────────────────────────────────────────┘
```

No avatars. No read receipts. No typing indicators. No "online now." Text and timestamps only.

---

## 17. Mobile Companion App

### 17.1 Purpose

The mobile app is the **primary listing creation channel**. Its core job is to make listing an item as fast as snapping a photo. Everything else (browsing, messaging) is available but secondary to the creation flow.

### 17.2 Stack

- **React Native** with **Expo** (managed workflow)
- Expo Camera for photo capture
- Expo Notifications for push notifications
- Expo SecureStore for token storage
- Shared types from `packages/shared`

### 17.3 Screen Structure

```
Tab Navigation:
├── Browse (same feed as web, location-aware)
├── Sell (camera-first listing creation — the primary action)
├── Inbox (message threads)
└── Account
```

The **Sell tab** opens directly to the camera. Not a form. Not a menu. The camera. The intent is: open the app, point at the thing, tap the button, done.

### 17.4 Mobile Listing Creation Flow

```
[Sell Tab]
      │
      ▼
Camera opens full-screen
      │
User captures 1–5 photos
      │
      ▼
Photos upload to R2 (with progress indicator)
      │
      ▼
"Generating your listing..." (15–30 second wait)
Animated: subtle pulse on the first photo thumbnail
      │
      ▼
Review screen: AI-generated title, description, category, condition
All fields editable inline
      │
      ▼
Price input (numeric keyboard opens immediately)
      │
      ▼
Location confirm (auto-detected via GPS, user can adjust radius)
      │
      ▼
[Post] → listing goes live → confirmation screen
      │
"Your listing is live. Share it?" (optional — deep link copy only, no social share)
```

### 17.5 Mobile Browse

Identical data to web. Infinite scroll. Location defaults to GPS position with permission, falls back to manual entry. Category filter available as horizontal pills.

### 17.6 Push Notification Handling

On notification tap:
- `message_received` → opens thread view
- `offer_received` → opens thread with offer panel
- `offer_accepted/declined` → opens thread
- `payment_completed` → opens listing with sold confirmation
- `listing_expiring_soon` → opens listing manager

---

## 18. Infrastructure and Deployment

### 18.1 Production (DigitalOcean)

```yaml
# infrastructure/do/app.yaml

name: kerbdrop

services:
  - name: api
    source_dir: apps/api
    build_command: pnpm build
    run_command: node dist/index.js
    instance_count: 1          # scale up as needed
    instance_size_slug: basic-xxs
    envs:
      - key: NODE_ENV
        value: production
    health_check:
      http_path: /health

  - name: worker
    source_dir: apps/api
    build_command: pnpm build
    run_command: node dist/worker.js    # BullMQ worker process
    instance_count: 1
    instance_size_slug: basic-xxs

  - name: web
    source_dir: apps/web
    build_command: pnpm build
    environment_slug: node-js
    routes:
      - path: /

databases:
  - name: redis
    engine: REDIS
    version: "7"
```

### 18.2 Development (Cloudflare Tunnel)

```yaml
# infrastructure/cloudflare/tunnel.yml

tunnel: kerbdrop-dev
credentials-file: ~/.cloudflared/kerbdrop-dev.json

ingress:
  - hostname: api.kerbdrop.dev
    service: http://localhost:3001
  - hostname: kerbdrop.dev
    service: http://localhost:5173
  - service: http_status:404
```

The Cloudflare tunnel exposes the local Express server for:
- Stripe webhook testing (Stripe can reach the local endpoint)
- Mobile app API calls during development (app points to `api.kerbdrop.dev`)
- Supabase Auth callbacks

### 18.3 Meilisearch

Self-hosted on a DigitalOcean Droplet (separate from App Platform). Minimum: 1GB RAM Basic Droplet ($6/mo). Configured with a master key, API key rotation, and daily snapshots.

### 18.4 Redis

Managed Redis via DigitalOcean (included in App Platform). Used for BullMQ job queues and rate limit counters.

### 18.5 Cloudflare R2

One production bucket: `kerbdrop-photos`. Public access enabled for `full/` and `thumbs/` prefixes only. `originals/` is private. Cloudflare CDN sits in front of the public paths automatically.

R2 lifecycle rules:
```json
{
  "rules": [
    {
      "id": "delete-originals-after-7-days",
      "filter": { "prefix": "originals/" },
      "expiration": { "days": 7 }
    }
  ]
}
```
Application-level deletion handles `full/` and `thumbs/` explicitly via the photo-deleter job.

---

## 19. Environment Configuration

### 19.1 Root `.env.example`

```bash
# ── Supabase ──────────────────────────────────────────
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# ── Cloudflare R2 ─────────────────────────────────────
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=kerbdrop-photos
R2_PUBLIC_URL=https://photos.kerbdrop.com

# ── Meilisearch ───────────────────────────────────────
MEILISEARCH_URL=
MEILISEARCH_MASTER_KEY=
MEILISEARCH_API_KEY=

# ── Redis ─────────────────────────────────────────────
REDIS_URL=

# ── Stripe ────────────────────────────────────────────
STRIPE_SECRET_KEY=
STRIPE_CONNECT_CLIENT_ID=
STRIPE_WEBHOOK_SECRET=
STRIPE_OAUTH_REDIRECT_URI=

# ── AI Vision ─────────────────────────────────────────
ANTHROPIC_API_KEY=
# or
OPENAI_API_KEY=

# ── Content Moderation ────────────────────────────────
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1

# ── SMS / Auth ────────────────────────────────────────
# Managed by Supabase Auth (Twilio config in Supabase dashboard)

# ── App ───────────────────────────────────────────────
NODE_ENV=development
PORT=3001
API_URL=https://api.kerbdrop.dev
WEB_URL=https://kerbdrop.dev
JWT_SECRET=                          # for state param signing in OAuth flows

# ── Cloudflare Tunnel (dev only) ──────────────────────
CLOUDFLARE_TUNNEL_TOKEN=
```

### 19.2 Per-App Env

Each app has its own `.env.local` that extends the root, containing only the variables that app needs. The `packages/config` package provides a typed env loader with Zod validation that throws on startup if required variables are missing.

---

## 20. Non-Functional Requirements

### 20.1 Performance

- Listing browse feed: < 200ms API response (p95)
- Search results: < 100ms (Meilisearch p95)
- Photo upload: progress feedback within 1 second of tap
- AI draft generation: user sees result within 30 seconds of last photo upload
- Time to live listing (mobile): target < 60 seconds total from first photo tap

### 20.2 Availability

- API: 99.5% uptime target (single DO region, Phase 1)
- Photo pipeline: failures are queued and retried, do not block listing creation
- Meilisearch: degraded gracefully — if search is down, feed falls back to database query

### 20.3 Scalability

The architecture is designed to scale horizontally at the API layer. BullMQ workers can be added as queue depth grows. Meilisearch scales vertically then horizontally. Supabase scales managed. R2 has no practical storage ceiling.

No premature optimization in Phase 1. The architecture does not need to handle millions of users on day one.

### 20.4 Privacy

- No analytics SDK (no Segment, no Mixpanel, no GA) in Phase 1
- No third-party advertising pixels, ever
- Server-side logging of API errors and performance only
- Logs do not contain message content or personally identifying information
- Photos are deleted on schedule, never retained beyond expiry

### 20.5 Accessibility

- WCAG 2.1 AA compliance target for web
- Minimum touch target size: 44x44px (mobile)
- Keyboard navigable on web
- Screen reader labels on all interactive elements
- Reduced motion preference respected (the location pulse animation is disabled)

---

## 21. Business Logic Reference

### 21.1 Listing Rules

- Free tier: max 10 active concurrent listings
- Plus tier: max 25 active concurrent listings
- Pro tier: unlimited active concurrent listings
- All listings expire after exactly 7 days
- Expired listings can be relisted (new listing, new expiry clock)
- A listing can be edited any number of times while active
- Price changes are not surfaced as a notification to interested parties (no social features)
- Photos can be added/removed/reordered while listing is active, up to the 5-photo cap

### 21.2 Offer Rules

- Only buyers can initiate offers
- Offer must be below asking price (above-asking offers are not a feature — full price is just the payment flow)
- One active offer per buyer per listing
- Offers expire after 24 hours if not responded to
- Seller can accept or decline
- Buyer can withdraw before acceptance
- Accepted offer triggers payment flow in tap-to-pay app
- Declined/expired offers allow buyer to submit a new offer

### 21.3 Message Rules

- Messages are plain text only
- No media attachments beyond listing photos already on platform
- No cross-listing messages (each thread is scoped to one listing)
- Thread expires 7 days after listing closure or expiry
- Expired threads are read-only for 24 hours, then archived (not deleted immediately — gives users time to note any transaction details)
- Blocked threads: either party can block, thread becomes read-only for both

### 21.4 Payment / Transaction Rules

- Payment is optional — cash at pickup is a valid and supported transaction path
- Sellers must complete Stripe Connect OAuth to receive in-app payments
- The `payment_verified` badge is only displayed after OAuth completes
- Listings from unverified sellers are still visible and fully functional — they just don't show the payment badge
- Platform fee is deducted at transaction time by the tap-to-pay app
- Minimum platform fee: $1.00
- Percentage fee: 5% of sale price (applied above $20; flat $1.00 applies below)
- Stripe Connect fees are absorbed within the platform fee

### 21.5 Tier Rules

- Free tier is permanent — no expiry, no credit card required
- Plus and Pro tiers are monthly subscriptions (Stripe Billing)
- Downgrading from Plus/Pro to Free: existing active listings are preserved until they expire; new listing cap applies to new listings
- Tier status is stored on `users.tier` and `users.tier_expires_at`
- Feed ranking is identical across all tiers — no tier variable in sort logic

### 21.6 Content and Moderation Rules

- All photos are screened before listing goes live
- A listing with any rejected photo is held from the feed until resolved
- Sellers are notified of rejected photos with a plain-language explanation
- Sellers can replace a rejected photo
- Repeat violations result in account flag for manual review
- Banned accounts cannot post listings or send messages; existing active listings are removed

---

## 22. Security Considerations

### 22.1 Authentication

- All API routes (except browse and public listing detail) require a valid Supabase JWT
- JWTs are verified server-side on every request — no client-side trust
- Phone OTPs expire in 10 minutes
- OTP brute force: max 5 attempts per code before requiring a new code

### 22.2 File Upload Security

- Clients never upload directly to the API server — all uploads go directly to R2 via presigned URL
- Presigned URLs expire in 15 minutes
- MIME type is validated server-side after upload (do not trust Content-Type header)
- Maximum file size enforced both client-side (UX) and by R2 presigned URL conditions
- Originals are never publicly served

### 22.3 Stripe Webhook Security

All Stripe webhook events are verified using `stripe.webhooks.constructEvent()` with the signing secret. Unverified events are rejected with 400.

### 22.4 OAuth State Parameter

The Stripe Connect OAuth `state` parameter is a short-lived signed JWT containing the user ID and a nonce. Verified on callback to prevent CSRF.

### 22.5 SQL Injection

Supabase client uses parameterized queries throughout. No raw SQL string interpolation in application code.

### 22.6 Rate Limiting

Rate limits are enforced at the API middleware level using Redis counters, before business logic executes. IP-level limits apply to unauthenticated routes. User-level limits apply to authenticated routes.

### 22.7 Data the Platform Never Stores

- Raw phone numbers (only bcrypt hash)
- Raw IP addresses (only hashed, for fingerprinting)
- Message content in logs
- Payment card details (Stripe handles all PCI scope)
- Exact user location (only city/neighborhood label and listing radius centroid)

---

## 23. Open Implementation Questions

These are unresolved decisions that need answers before or during development. They are listed here so they are not forgotten and not decided prematurely.

| # | Question | Options | Recommendation |
|---|---|---|---|
| 1 | Cash-at-pickup UX | (a) Show cash option prominently alongside payment (b) Payment-first, cash mentioned in FAQ | Test both in Phase 1 city. Don't force payment. |
| 2 | Minimum processed transaction | (a) No minimum — all transactions go through Stripe (b) $10 minimum — below that, cash suggested | $10 minimum. Economics do not support smaller. |
| 3 | iOS vs Android first for mobile | (a) iOS first (b) Android first (c) Both simultaneously via Expo | iOS first — higher early adopter index, easier TestFlight distribution. |
| 4 | Photo-only listings required? | (a) At least 1 photo required (b) Text-only listings allowed | Require at least 1 photo. AI flow depends on it. Quality of text-only listings is universally poor. |
| 5 | Offer flow on web vs mobile | (a) Offer flow only on mobile (b) Available on both web and mobile | Both. Don't fragment the transaction flow by platform. |
| 6 | Category taxonomy launch set | (a) Full list as specified (b) Reduced set for Phase 1 | Reduced set: furniture, electronics, clothing, bikes, tools, baby/kids, other. Add more post-launch. |
| 7 | Handle change policy | (a) Never changeable (b) Once per 30 days (c) Once per 90 days | Once per 90 days. Prevents identity switching abuse while not trapping users forever. |
| 8 | Supabase Realtime vs WebSockets for messaging | (a) Supabase Realtime (b) Custom WebSocket (Socket.io) | Supabase Realtime. Eliminates separate infrastructure. Sufficient for Phase 1 scale. |
| 9 | AI provider | (a) Anthropic (b) OpenAI (c) Both with fallback | Both with fallback. Resilience matters more than vendor loyalty. |
| 10 | Analytics approach | (a) No analytics (privacy-pure) (b) Self-hosted (Plausible, Umami) (c) Third-party | Self-hosted Plausible — privacy-respecting, no cross-site tracking, gives operational visibility without surveillance. |

---

*Document status: Living specification, pre-development.*
*Last updated: June 2026.*
*Owner: KerbDrop founding team.*
