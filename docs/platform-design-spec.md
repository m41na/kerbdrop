# KerbDrop — Platform Design Specification

**Version:** 1.1
**Status:** Approved
**Last Updated:** July 2026
**References:** business-requirements.md
**Changes from 1.0:** Decoupled authentication from Stripe Connect. Phone OTP is now the universal auth mechanism. Stripe Connect repositioned as optional payment capability accessible from Account settings. Removed buyer/seller rigid role distinction throughout. Updated navigation tree, auth flow, and listing creation gate accordingly.

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Monorepo Structure](#2-monorepo-structure)
3. [Technology Decisions](#3-technology-decisions)
4. [Database Design](#4-database-design)
5. [API Design](#5-api-design)
6. [Photo Pipeline](#6-photo-pipeline)
7. [Search Infrastructure](#7-search-infrastructure)
8. [Messaging System](#8-messaging-system)
9. [Notification System](#9-notification-system)
10. [Payment Architecture](#10-payment-architecture)
11. [Scheduled Jobs](#11-scheduled-jobs)
12. [Mobile App Architecture](#12-mobile-app-architecture)
13. [UI Design System](#13-ui-design-system)
14. [Authentication and Identity](#14-authentication-and-identity)
15. [Security](#15-security)
16. [Infrastructure and Deployment](#16-infrastructure-and-deployment)
17. [Environment Configuration](#17-environment-configuration)
18. [Non-Functional Requirements](#18-non-functional-requirements)

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        KerbDrop System                          │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │  Mobile App  │    │  Marketing   │    │   Third-Party    │  │
│  │  (Expo RN)   │    │  Site        │    │   Tap-to-Pay App │  │
│  │              │    │  (Cloudflare │    │   (Stripe        │  │
│  │  iOS/Android │    │   Pages)     │    │    Connect)      │  │
│  └──────┬───────┘    └──────────────┘    └────────┬─────────┘  │
│         │                                          │            │
│         ▼                                          │            │
│  ┌──────────────────────────────────────┐          │            │
│  │         Express.js API               │◄─────────┘            │
│  │         (DigitalOcean)               │  webhooks             │
│  │                                      │                       │
│  │  routes / middleware / services /    │                       │
│  │  jobs (cron)                         │                       │
│  └───┬──────────┬──────────┬────────────┘                       │
│      │          │          │                                     │
│      ▼          ▼          ▼                                     │
│  ┌───────┐ ┌────────┐ ┌──────────┐ ┌────────┐ ┌─────────────┐  │
│  │Supa-  │ │Cloud-  │ │Meili-    │ │Stripe  │ │AWS          │  │
│  │base   │ │flare   │ │search    │ │Connect │ │Rekognition  │  │
│  │(PG +  │ │R2 +    │ │(DO       │ │        │ │(moderation) │  │
│  │Auth + │ │CDN     │ │Droplet)  │ │        │ │             │  │
│  │RT)    │ │        │ │          │ │        │ │             │  │
│  └───────┘ └────────┘ └──────────┘ └────────┘ └─────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.1 Key Architectural Decisions

**No web application.** The product is mobile-native. A marketing site on Cloudflare Pages handles web presence and deep linking. The Expo web build is available as a fallback for users who land on a listing link from a desktop browser.

**No message queue (MVP).** BullMQ/Redis is deferred. Photo processing, moderation, and notifications are handled synchronously or via simple cron jobs. This is revisited when processing volume warrants it.

**Payments are out-of-band.** The API never touches payment funds. Stripe Connect OAuth onboarding is the only payment-related flow in the platform. Actual transactions happen in a third-party tap-to-pay app; completion is confirmed via Stripe webhook.

**Supabase Realtime for messaging.** Eliminates a separate WebSocket infrastructure. PostgreSQL-backed channels are sufficient for MVP messaging scale.

---

## 2. Monorepo Structure

```
kerbdrop/
├── apps/
│   ├── mobile/                     # Expo React Native — the product
│   └── api/                        # Express.js — backend
├── packages/
│   └── shared/                     # Types, schemas, constants, utils
├── infrastructure/
│   ├── supabase/
│   │   └── migrations/             # SQL migration files
│   ├── cloudflare/
│   │   └── tunnel.yml              # Dev tunnel config
│   └── do/
│       └── app.yaml                # DO App Platform spec
├── docs/                           # This directory
│   ├── business-requirements.md
│   ├── platform-design-spec.md
│   ├── roadmap.md
│   └── milestones.md
├── tsconfig.base.json
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

### 2.1 Dependency Isolation Strategy

React Native packages must not be hoisted to the root workspace. They depend on Metro bundler finding them physically in `apps/mobile/node_modules`, not symlinked from a root hoist.

**Enforcement:** `apps/mobile/.npmrc` sets `hoist=false` and `shamefully-hoist=false`. This ensures all mobile dependencies install locally within the mobile app's own `node_modules`, regardless of root workspace settings.

The root `.npmrc` sets `shamefully-hoist=false` for the broader workspace, with the mobile app's settings being the authoritative override for that package.

---

## 3. Technology Decisions

| Layer | Choice | Version | Rationale |
|---|---|---|---|
| Mobile | Expo + React Native | SDK 52, RN 0.76, React 18 | New Architecture default, managed workflow, Camera/Notifications/Location built-in |
| Navigation | React Navigation | v7 | Component-tree architecture, typed navigators, explicit route definitions. File-system routing (Expo Router) explicitly rejected. |
| State management | React Context | Built-in | Sufficient for this app's state complexity. Zustand rejected — adds a dependency without solving a problem that exists at this scale. |
| API client | tRPC | v11 | End-to-end type safety from Express to React Native via shared Zod schemas in packages/shared |
| Backend | Express.js | v4 | Specified. Lightweight, well-understood. |
| Database | Supabase (PostgreSQL) | Latest | Managed Postgres, RLS, Auth, Realtime in one service |
| Object storage | Cloudflare R2 | — | S3-compatible, zero egress fees, pairs with CF tunnel in dev |
| Search | Meilisearch | v1.x | Lightweight, self-hostable, typo-tolerant, native geo support |
| Payments | Stripe Connect Express | — | Handles all KYC/compliance; platform never touches funds |
| Content moderation | AWS Rekognition | — | Commodity API, fractions of a cent per image |
| E2E testing | Maestro | Latest | Lower cognitive overhead than Detox; YAML-based test scripts; sufficient for critical path coverage |
| Monorepo tooling | pnpm + Turborepo | pnpm 9, Turbo 2 | pnpm strict linking solves RN hoisting; Turborepo caches build artifacts |

### 3.1 Explicitly Rejected Choices

| Rejected | Reason |
|---|---|
| Expo Router (file-system routing) | User specified component-tree architecture |
| Zustand | React Context is sufficient; no problem to solve |
| Redux Toolkit | Excessive for this complexity |
| BullMQ + Redis | MVP complexity not warranted; deferred |
| Detox | Higher cognitive overhead than Maestro for MVP |
| Web app (Preact) | Mobile-first; marketing site covers web presence |
| Yarn Berry | Expo compatibility historically uneven |

---

## 4. Database Design

Full schema in `infrastructure/supabase/migrations/001_initial_schema.sql`.

### 4.1 Table Summary

| Table | Purpose |
|---|---|
| `users` | Pseudonymous identity, Stripe Connect ID, tier, verification status |
| `listings` | Item listings with geo coordinates, status lifecycle |
| `photos` | Photo metadata, R2 keys, moderation status, deletion schedule |
| `message_threads` | Buyer-seller conversation scoped to a listing |
| `messages` | Individual messages within threads |
| `offers` | Formal price offers with 24hr expiry |
| `notifications` | Transactional notification records |
| `push_tokens` | Expo push tokens per user per device |

### 4.2 Key Design Decisions

**Prices stored in cents (integer).** Never floating point. `price_cents INTEGER` throughout. Formatted at display layer.

**Location stored as lat/lng decimals with PostGIS earthdistance.** Geo index uses `ll_to_earth()` for efficient radius queries without a full PostGIS installation.

**`delete_at` on photos (not TTL).** Explicit deletion timestamp set at listing creation. The cron job finds rows where `delete_at <= NOW() AND deleted_at IS NULL`. This provides auditability and allows deletion to be accelerated (e.g., on early sale).

**`phone_hash` not phone number.** Raw phone numbers are never stored. bcrypt hash stored for duplicate detection. Actual SMS delivery handled by Supabase Auth (Twilio).

**RLS on all tables.** Row-level security policies enforce data access at the database layer, not just the application layer. API uses service role key for admin operations; user-scoped operations use the anon key with JWT.

### 4.3 Listing Geo Query Pattern

```sql
-- Distance-sorted feed within radius
SELECT
  l.*,
  earth_distance(
    ll_to_earth(l.location_lat, l.location_lng),
    ll_to_earth($1, $2)
  ) / 1609.344 AS distance_miles
FROM listings l
WHERE
  l.status = 'active'
  AND earth_box(ll_to_earth($1, $2), $3 * 1609.344)
      @> ll_to_earth(l.location_lat, l.location_lng)
ORDER BY
  distance_miles ASC,
  l.created_at DESC
LIMIT $4 OFFSET $5;
```

Meilisearch handles full-text search with geo filtering. Postgres handles the raw feed without a search query.

---

## 5. API Design

### 5.1 Base URL
- Production: `https://api.kerbdrop.com/api/v1`
- Development: `https://api.kerbdrop.dev/api/v1` (via Cloudflare tunnel)

### 5.2 Authentication
Bearer token (Supabase JWT) in `Authorization` header. Public routes accept unauthenticated requests. Auth-gated routes return `401` without a valid token.

### 5.3 Standard Response Envelope

```typescript
// Success
{ success: true, data: T }

// Paginated success
{ success: true, data: T[], pagination: { page, limit, total, has_more } }

// Error
{ success: false, error: { code: string, message: string, fields?: Record<string, string[]> } }
```

### 5.4 Route Map

#### Public (no auth)
```
GET  /listings              Browse feed (geo-sorted)
GET  /listings/:id          Listing detail
GET  /search                Full-text + geo search
POST /auth/phone/request    Request SMS OTP
POST /auth/phone/verify     Verify OTP → session
```

#### Authenticated
```
POST   /auth/handle                   Set handle (new users)
DELETE /auth/session                  Sign out

POST   /listings                      Create listing (phone_verified required, payment_verified NOT required)
PATCH  /listings/:id                  Update listing
DELETE /listings/:id                  Remove listing
POST   /listings/:id/sold             Mark as sold
POST   /listings/:id/relist           Relist expired
GET    /listings/mine                 My listings

POST   /photos/presign                Get R2 presigned upload URL
POST   /photos/:id/confirm            Confirm upload → trigger moderation
DELETE /photos/:id                    Delete photo
PATCH  /photos/reorder                Update sort order

GET    /messages/threads              My threads
GET    /messages/threads/:id          Thread + messages
POST   /messages/threads              Start thread (first message)
POST   /messages/threads/:id/messages Send message
GET    /messages/threads/:id/listings Seller's other active listings

POST   /offers                        Submit offer
POST   /offers/:id/accept             Accept offer
POST   /offers/:id/decline            Decline offer
POST   /offers/:id/withdraw           Withdraw offer

GET    /payments/connect/url          Get Stripe OAuth URL
GET    /payments/connect/callback     Handle OAuth callback
GET    /payments/connect/status       Connection status
DELETE /payments/connect              Disconnect

GET    /notifications                 My notifications
POST   /notifications/read            Mark as read
POST   /notifications/push-tokens     Register Expo token
DELETE /notifications/push-tokens/:t  Remove token
```

#### Webhooks (signature-verified)
```
POST /webhooks/stripe    Stripe event handler
```

### 5.5 Error Codes

| Code | HTTP Status | Meaning |
|---|---|---|
| `UNAUTHORIZED` | 401 | No valid session |
| `FORBIDDEN` | 403 | Valid session, insufficient permissions |
| `NOT_FOUND` | 404 | Resource does not exist |
| `VALIDATION_ERROR` | 400 | Zod schema validation failed |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `LISTING_CAP_REACHED` | 422 | User at maximum active listings for their tier |
| `HANDLE_TAKEN` | 409 | Handle already in use |
| `THREAD_EXISTS` | 409 | Thread already exists for this buyer/listing pair |
| `OTP_INVALID` | 400 | OTP code incorrect or expired |
| `SERVER_ERROR` | 500 | Unexpected server error |

---

## 6. Photo Pipeline

### 6.1 Upload Flow

```
1. Client: POST /photos/presign
   → API generates presigned R2 PUT URL (15 min expiry, max 10MB)
   → Returns { photoId, uploadUrl }

2. Client: PUT {uploadUrl} with image binary
   → Direct upload to R2, bypasses API server

3. Client: POST /photos/:id/confirm
   → API verifies object exists in R2
   → Synchronously: resize + compress via sharp
      - Full: max 1200px longest side, WEBP 85%
      - Thumb: 400×400 cover crop, WEBP 80%
   → Run AWS Rekognition DetectModerationLabels
   → On approval: update photos table, increment listing.photo_count
   → On rejection: notify seller, hold listing from feed
```

### 6.2 R2 Key Structure

```
kerbdrop-photos/
├── originals/{listing_id}/{photo_id}         (private, never served)
├── full/{listing_id}/{photo_id}.webp          (public via CDN)
└── thumbs/{listing_id}/{photo_id}_thumb.webp  (public via CDN)
```

### 6.3 Deletion Triggers

| Event | Action |
|---|---|
| Listing sold | `delete_at` set to `NOW()` immediately |
| Listing expired | `delete_at` was set to `expires_at` at listing creation |
| Listing removed | `delete_at` set to `NOW()` |
| Photo replaced | Old photo `delete_at` set to `NOW()` |

Physical R2 deletion executed by hourly cron job.

### 6.4 Content Moderation Labels (Rejection Thresholds)

| Rekognition Label | Confidence Threshold |
|---|---|
| Explicit Nudity | > 80% |
| Violence | > 80% |
| Visually Disturbing | > 80% |
| Weapons | > 70% |
| CSAM hash match | Any (hard block via PhotoDNA equivalent) |

---

## 7. Search Infrastructure

### 7.1 Meilisearch Configuration

**Index:** `listings`

```javascript
{
  primaryKey: 'id',
  searchableAttributes: ['title', 'description', 'category', 'location_label'],
  filterableAttributes: ['status', 'category', 'condition', 'price_cents', '_geo'],
  sortableAttributes: ['created_at', 'price_cents', '_geo'],
  rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness']
}
```

### 7.2 Geo Search Query

```javascript
index.search(q, {
  filter: [
    "status = 'active'",
    `_geoRadius(${lat}, ${lng}, ${radiusMiles * 1609})`
  ],
  sort: [`_geoPoint(${lat}, ${lng}):asc`, 'created_at:desc'],
  limit,
  offset: page * limit
})
```

**Critical invariant:** Sort is always `distance:asc, created_at:desc`. No relevance boosting. No paid sort variables. This is the anti-algorithm guarantee at the infrastructure level.

### 7.3 Index Sync

| Event | Action |
|---|---|
| Listing created (active) | Add document to index |
| Listing updated | Update document |
| Listing status changes to non-active | Delete document from index |
| Nightly cron | Full re-index (safety net) |

---

## 8. Messaging System

### 8.1 Realtime Architecture

Supabase Realtime provides PostgreSQL-backed broadcast channels. The mobile app subscribes to `thread:{threadId}` on entering a thread view. New message inserts trigger a Realtime broadcast via PostgreSQL `NOTIFY`.

```typescript
// Client subscription
const channel = supabase
  .channel(`thread:${threadId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `thread_id=eq.${threadId}`
  }, (payload) => {
    // Append new message to local state
  })
  .subscribe()
```

### 8.2 Thread Lifecycle

```
[Buyer taps Message on ListingDetail]
        │
        ├─ Not authenticated → trigger auth flow
        │
        └─ Authenticated → POST /messages/threads
                │
                └─ Thread created (or existing returned if already exists)
                   Status: active
                   expires_at: listing.expires_at + 7 days

[Listing expires or is sold]
        │
        └─ Thread expires_at is set
           7 days later: thread archived, messages read-only
```

### 8.3 In-Thread Seller Listings

The only cross-listing seller visibility in the product. Returned by `GET /messages/threads/:id/listings`. Query:

```sql
SELECT id, title, price_cents, thumb_url, location_label
FROM listings
WHERE seller_id = :seller_id
  AND status = 'active'
  AND id != :current_listing_id
ORDER BY created_at DESC
LIMIT 6;
```

No listing history. No sold items. Active inventory only, in context of an existing thread.

---

## 9. Notification System

### 9.1 Dispatch Flow

Notifications are dispatched synchronously from the API route handler that triggers the event. No queue in MVP.

```typescript
// Example: message received
async function sendMessageNotification(recipientId: string, threadId: string) {
  // 1. Insert notification record
  await supabase.from('notifications').insert({
    user_id: recipientId,
    type: 'message_received',
    payload: { thread_id: threadId }
  })

  // 2. Fetch push tokens for user
  const { data: tokens } = await supabase
    .from('push_tokens')
    .select('token')
    .eq('user_id', recipientId)

  // 3. Send via Expo Push
  if (tokens?.length) {
    await expoPushClient.sendPushNotificationsAsync(
      tokens.map(t => ({
        to: t.token,
        title: 'New message',
        body: 'Someone replied to your listing',
        data: { type: 'message_received', thread_id: threadId }
      }))
    )
  }
}
```

### 9.2 Permitted Notification Types

Only these are sent. No others are added without updating the BRS.

- `message_received`
- `offer_received`
- `offer_accepted`
- `offer_declined`
- `payment_completed`
- `listing_expiring_soon` (24h before expiry)
- `listing_expired`

---

## 10. Payment Architecture

### 10.1 Platform's Role

KerbDrop is **not** a payment processor. It does not hold, move, or settle funds.

The platform's payment responsibilities are:
1. Facilitate Stripe Connect Express OAuth onboarding for sellers
2. Store the resulting `stripe_account_id` on the user record
3. Set `payment_verified = true` after successful onboarding
4. Receive and verify Stripe webhooks confirming transaction completion
5. Mark listings as sold and dispatch notifications on webhook receipt

Everything else happens in the third-party tap-to-pay app.

### 10.2 Stripe Connect OAuth Flow

```
GET /payments/connect/url
  → Build Stripe OAuth URL with:
     - client_id: STRIPE_CONNECT_CLIENT_ID
     - response_type: 'code'
     - scope: 'read_write'
     - redirect_uri: API callback URL
     - state: signed JWT {userId, nonce, exp: +10min}
  → Return URL to mobile client

[User completes Stripe onboarding in browser/webview]

GET /payments/connect/callback?code=...&state=...
  → Verify state JWT (CSRF protection)
  → stripe.oauth.token({ grant_type: 'authorization_code', code })
  → Store stripe_user_id as users.stripe_account_id
  → Set users.payment_verified = true
  → Optionally store name/email from Stripe account for display
  → Redirect to app deep link: kerbdrop://payments/success
```

### 10.3 Fee Calculation

```typescript
function calculatePlatformFee(salePriceCents: number): number {
  if (salePriceCents < 2000) {  // below $20
    return 100                   // $1.00 flat
  }
  return Math.round(salePriceCents * 0.05)  // 5%
}
```

---

## 11. Scheduled Jobs

All cron jobs run in the same Express process via `node-cron`. No separate worker process in MVP.

| Job | Schedule | Action |
|---|---|---|
| Listing expiry | Every 15 min | Find `status='active' AND expires_at <= NOW()`, set `status='expired'`, remove from Meilisearch, send notification |
| Photo deletion | Every hour | Find `delete_at <= NOW() AND deleted_at IS NULL`, delete from R2, set `deleted_at` |
| Offer expiry | Every 30 min | Find `status='pending' AND expires_at <= NOW()`, set `status='expired'` |
| Expiry warnings | Every hour | Find listings expiring within 24h where warning not yet sent, send `listing_expiring_soon` |

---

## 12. Mobile App Architecture

### 12.1 Provider Tree (Root to Leaf)

```
GestureHandlerRootView     ← required for React Navigation + gestures
  SafeAreaProvider         ← provides safe area insets to all children
    ErrorBoundary          ← catches render errors, shows recovery UI
      NetworkProvider      ← NetInfo state: isConnected, isInternetReachable
        LocationProvider   ← GPS / manual location, radius preference
          AuthProvider     ← Supabase session, user profile, signOut
            StatusBar
            RootNavigator  ← NavigationContainer with deep link config
```

**SafeAreaView is applied at the screen level, not the root.** `SafeAreaProvider` goes at root to make insets available. Each screen applies `useSafeAreaInsets()` to its own outermost `View`. This gives each screen precise control over which edges to respect.

### 12.2 Navigation Tree

```
RootNavigator (NativeStack)
  │
  ├─ LocationSetupScreen         ← first launch only, blocks until location resolved
  │
  ├─ AppTabs (BottomTabs)        ← default landing after location resolved
  │   ├─ BrowseStack (NativeStack)
  │   │   ├─ FeedScreen
  │   │   └─ ListingDetailScreen
  │   │
  │   ├─ SellStack (NativeStack, modal presentation)
  │   │   ├─ CameraScreen
  │   │   ├─ ReviewDraftScreen
  │   │   ├─ PriceLocationScreen
  │   │   └─ ListingConfirmationScreen
  │   │
  │   ├─ InboxStack (NativeStack)
  │   │   ├─ ThreadListScreen
  │   │   └─ ThreadViewScreen
  │   │
  │   └─ AccountStack (NativeStack)
  │       ├─ AccountHomeScreen
  │       ├─ MyListingsScreen
  │       ├─ PaymentSetupScreen  ← Stripe Connect lives here, never in AuthStack
  │       └─ NotificationPrefsScreen
  │
  └─ AuthStack (NativeStack)     ← phone verification only, entered inline from any auth gate
      ├─ WelcomeScreen
      ├─ PhoneVerifyScreen
      └─ HandleSetupScreen       ← auth complete after this screen
                                    NO Stripe screen here under any circumstances
```

### 12.3 Auth Gate Behavior

Authentication (phone verification) is not required to browse or view listings. It is required to:
- Post a listing (Sell tab)
- Message a listing owner (ListingDetail → Message button)
- Submit an offer (ListingDetail → Make Offer button)
- View inbox (Inbox tab)
- Manage account (Account tab)

Auth gates trigger inline navigation to `AuthStack` with a `returnTo` param. On completion — after handle selection — navigation returns to the originating screen. Stripe Connect is **never** triggered as part of this flow.

Sell, Inbox, and Account tabs are **visible** to unauthenticated users. Tapping them triggers the auth flow. Hiding them would communicate a narrower product than exists.

**Stripe Connect gate:** The only place Stripe Connect is surfaced as a prompt is `AccountHomeScreen`, via a non-blocking nudge card: "Accept in-app payments — connect your bank account." It is never presented as a gate, never required to proceed with any action, and never appears in the auth flow.

### 12.4 Location Flow

**First launch (no location stored):**
1. `LocationSetupScreen` renders before any navigation
2. User chooses GPS permission grant or manual entry
3. On resolution, location stored in AsyncStorage
4. Splash screen hidden, `AppTabs` renders

**Subsequent launches:**
1. `LocationProvider` restores location from AsyncStorage immediately
2. If GPS permission still granted, silently refreshes in background
3. `LocationSetupScreen` never shown again unless location is cleared

**GPS denied:**
- Manual city/zip entry → geocoded to lat/lng via `expo-location` reverse geocode or external geocoding API
- Location stored as `source: 'manual'`
- "Change location" available in Account settings

### 12.5 Component Tree Architecture

Components are organized by feature domain, not by type. Each feature owns its screens, sub-components, and hooks.

```
src/
├── features/
│   ├── browse/
│   │   ├── FeedScreen.tsx
│   │   ├── ListingDetailScreen.tsx
│   │   ├── LocationSetupScreen.tsx
│   │   ├── components/
│   │   │   ├── ListingCard.tsx
│   │   │   ├── ListingGrid.tsx
│   │   │   ├── CategoryFilter.tsx
│   │   │   └── LocationHeader.tsx
│   │   └── hooks/
│   │       └── useListingFeed.ts
│   ├── sell/
│   │   ├── CameraScreen.tsx
│   │   ├── ReviewDraftScreen.tsx
│   │   ├── PriceLocationScreen.tsx
│   │   ├── ListingConfirmationScreen.tsx
│   │   └── hooks/
│   │       └── usePhotoUpload.ts
│   ├── inbox/
│   │   ├── ThreadListScreen.tsx
│   │   ├── ThreadViewScreen.tsx
│   │   └── components/
│   │       ├── ThreadPreview.tsx
│   │       ├── MessageBubble.tsx
│   │       └── OfferPanel.tsx
│   ├── account/
│   │   └── ...
│   └── auth/
│       └── ...
├── shared/
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── TextInput.tsx
│   │   ├── Badge.tsx
│   │   ├── OfflineBanner.tsx
│   │   └── LoadingSpinner.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   ├── LocationContext.tsx
│   │   └── NetworkContext.tsx
│   ├── hooks/
│   │   └── useApi.ts
│   └── theme/
│       └── tokens.ts
└── navigation/
    └── RootNavigator.tsx
```

### 12.6 Required Root-Level Setup (Non-Negotiable)

These must be present before any feature code or they produce subtle, hard-to-debug failures:

| Requirement | Implementation | Why |
|---|---|---|
| `GestureHandlerRootView` | Wraps entire app | React Navigation gesture recognition |
| `react-native-reanimated/plugin` in babel.config.js | Babel transform | Reanimated 3 worklets |
| Splash screen prevention | `SplashScreen.preventAutoHideAsync()` at module level | Prevents auth state flicker |
| Secure token storage | `expo-secure-store` for Supabase session | AsyncStorage is unencrypted |
| `KeyboardAvoidingView` in text-input screens | Per-screen, platform-aware | Message compose + listing forms |

---

## 13. UI Design System

All design tokens are defined in `apps/mobile/src/shared/theme/tokens.ts`.

### 13.1 Color Palette

| Token | Hex | Usage |
|---|---|---|
| `surface` | `#F7F5F0` | App background, screen backgrounds |
| `surfaceAlt` | `#EDEAE3` | Cards, input fields, secondary surfaces |
| `border` | `#D4D0C8` | Dividers, input borders, card outlines |
| `ink` | `#1A1916` | Primary text, headings |
| `inkMuted` | `#6B6760` | Secondary text, labels, metadata |
| `inkFaint` | `#A8A49C` | Placeholder text, disabled states, hints |
| `accent` | `#E85D26` | CTAs, active states, the location pulse |
| `accentLight` | `#FDF0EB` | Accent tint for backgrounds |
| `accentDark` | `#C44A1A` | Pressed states, hover |
| `success` | `#2D7D46` | Verification badges, payment confirmed |
| `error` | `#C0392B` | Errors, rejected content |

### 13.2 Typography

System fonts only in React Native MVP. No custom font loading.

| Role | Family | Weight | Size |
|---|---|---|---|
| Display (prices, titles) | Georgia (iOS) / serif (Android) | Bold | 24–30px |
| Body | System (SF Pro / Roboto) | Regular | 16px |
| Label | System | Medium | 14px |
| Caption | System | Regular | 12px |

### 13.3 Signature Element

The **location pulse** — a small filled circle (`#E85D26`) that pulses once every 4 seconds next to the city name in the feed header. It communicates "this is local, right now" without words. It is the only ambient animation in the product. Respects `reduceMotion` preference.

### 13.4 Feed Card Anatomy

```
┌──────────────────────────┐
│                          │
│       PHOTO (4:3)        │
│                          │
├──────────────────────────┤
│ $45                      │  ← price: Georgia bold, ink
│ Trek FX3 Fitness Bike    │  ← title: System medium, ink, 2 lines max
│ 2.3 mi · 4h ago      [✓]│  ← meta: System regular, inkFaint + badge
└──────────────────────────┘
```

The `[✓]` payment badge appears only when `seller.payment_verified = true`. It is never faked or shown for unverified sellers.

---

## 14. Authentication and Identity

### 14.1 Auth Flow

Authentication is phone verification only. Stripe Connect is not part of the auth flow under any circumstances.

```
[User opens app]
     │
     └─ Browse feed (no auth required, location only)
          │
          └─ [User taps Post listing / Message / Inbox / Account]
               │
               └─ AuthStack pushed (if not authenticated)
                    │
                    ├─ WelcomeScreen: "Set up your account"
                    │   Explains: pseudonymous handle + phone only
                    │
                    ├─ PhoneVerifyScreen: enter phone → enter 6-digit OTP
                    │
                    └─ HandleSetupScreen (new users only): choose handle
                         Rules: 3–30 chars, alphanumeric + _ -
                         Uniqueness checked live
                         Auth complete — user lands on returnTo screen

[User wants to accept in-app payments — entirely separate, optional flow]
     │
     └─ Account → Payment Setup → Stripe Connect OAuth
          This is never triggered automatically.
          It is never a gate on any other action.
          It is a voluntary enhancement surfaced in Account settings.
```

### 14.2 Identity Data Model

There is one user type. No buyer or seller designation exists at the account level. Role is contextual — determined by whether a user created a listing (listing owner) or initiated contact about one (contacting user) within a specific transaction.

**What is stored:**

| Field | Type | Notes |
|---|---|---|
| `handle` | TEXT | Public pseudonym |
| `phone_hash` | TEXT | bcrypt hash, never raw |
| `phone_verified` | BOOLEAN | True after OTP completion — the auth floor |
| `stripe_account_id` | TEXT | Optional, from Connect OAuth |
| `stripe_account_name` | TEXT | Optional, from Connect, display only |
| `stripe_account_email` | TEXT | Optional, from Connect, internal only |
| `payment_verified` | BOOLEAN | True only after Stripe Connect OAuth completes |
| `device_fingerprints` | JSONB | For rate limit and fraud detection |

**What is never stored:**
- Raw phone number
- Real name (unless provided by Stripe Connect, stored for internal use only, never displayed)
- Email address (Stripe-derived only, not collected by the platform directly)
- Exact location
- Browsing history
- Behavioral profile

**Trust badge display logic:**
- `phone_verified = true` → Phone verified ✓ badge (all users who completed signup)
- `payment_verified = true` → Payment verified ✓ badge (users who optionally connected Stripe)
- Both badges are independent and additive

---

## 15. Security

### 15.1 JWT Verification
Every authenticated request validates the Supabase JWT server-side. No client-side trust.

### 15.2 Stripe Webhook Verification
`stripe.webhooks.constructEvent()` with signing secret. Unverified events return 400.

### 15.3 Stripe Connect OAuth CSRF Protection
State parameter is a short-lived signed JWT containing `{userId, nonce}`. Verified on callback.

### 15.4 File Upload Security
- Clients upload directly to R2 via presigned URL — never through the API server
- Presigned URLs expire in 15 minutes
- MIME type validated server-side after upload (Content-Type header not trusted)
- Originals never publicly served

### 15.5 Rate Limiting
Applied at middleware level before business logic. Uses in-memory counters (MVP); upgrade to Redis when multiple API instances are needed.

### 15.6 SQL Safety
Supabase client uses parameterized queries. No string interpolation in queries.

---

## 16. Infrastructure and Deployment

### 16.1 Production Services

| Service | Provider | Purpose |
|---|---|---|
| API + cron | DO App Platform | Express.js application |
| Database | Supabase | PostgreSQL + Auth + Realtime |
| Object storage | Cloudflare R2 | Photo storage |
| CDN | Cloudflare | Photo delivery |
| Search | DO Droplet (Basic, $6/mo) | Meilisearch |
| Marketing site | Cloudflare Pages | Static marketing + deep links |

### 16.2 Estimated Monthly Cost (Zero Scale)

| Service | Cost |
|---|---|
| DO App Platform (Basic) | ~$12 |
| Supabase (Free tier) | $0 |
| Cloudflare R2 (Free tier: 10GB) | $0 |
| Meilisearch Droplet | $6 |
| AWS Rekognition (per call) | ~$0.001/photo |
| **Total** | **~$20–25/month** |

### 16.3 Development Setup

Cloudflare Tunnel exposes local services via `api.kerbdrop.dev` (API) for:
- Stripe webhook delivery to local server
- Mobile app development pointing to real API

### 16.4 CI/CD

Not specified for MVP. Manual deployment via `pnpm build` + DO App Platform git integration. EAS Build for mobile via `eas build`.

---

## 17. Environment Configuration

All environment variables documented in `apps/api/.env.example`. Validated at startup via Zod schema — missing required variables cause immediate process exit with a descriptive error.

Mobile app environment variables use the `EXPO_PUBLIC_` prefix for client-accessible values. Server-only secrets are never exposed to the Expo bundler.

---

## 18. Non-Functional Requirements

### 18.1 Performance
- API feed response: < 200ms p95
- Search response: < 100ms p95
- Photo upload feedback: < 1s after tap
- Time to live listing (mobile): < 60s end-to-end target

### 18.2 Reliability
- Photo pipeline failures do not block listing creation. Failed moderation is retried; timeout falls back to manual review flag.
- Meilisearch downtime degrades gracefully to Postgres geo query.

### 18.3 Privacy
- No third-party analytics SDKs
- No advertising pixels, ever
- Server logs contain no message content, no raw phone numbers, no PII
- Photos deleted on schedule; no retention beyond expiry

### 18.4 Accessibility
- Minimum 44×44pt touch targets on all interactive elements
- `accessibilityLabel` on all icon-only buttons
- Reduced motion preference respected (location pulse disabled)
- System font sizes respected (no fixed font sizes that ignore Dynamic Type)
