# KerbDrop — Roadmap

**Version:** 1.1
**Last Updated:** July 2026
**Changes from 1.0:** Phase 2 auth flow updated — Stripe Connect removed from AuthStack. Phone OTP is the complete auth flow. Phase 5 reframed from seller payment setup to optional user payment capability.

Phases are ordered by the compounding value each delivers to the overall product. Each phase builds on the previous and produces a testable, demonstrable state of the product. No phase begins until its predecessor's acceptance criteria are met.

---

## Phase 0 — Foundation (Infrastructure + Skeleton)

**Goal:** Every engineer can run the full stack locally. The monorepo builds cleanly. The database schema is deployed. The mobile app launches to a placeholder feed without errors.

**Duration estimate:** 3–5 days

### Deliverables

- Monorepo initialized with pnpm workspaces, Turborepo, shared TypeScript config
- `packages/shared` compiles: types, schemas, constants, utilities
- `apps/api` starts locally: Express app with all routes stubbed, env validation on startup, health check endpoint responding
- `apps/mobile` starts in Expo Go: navigation tree renders without errors, all screens show placeholder UI, no missing dependency errors
- Supabase project created, migration `001_initial_schema.sql` applied, RLS policies active
- Cloudflare R2 bucket created with correct prefix structure and CDN routing
- Meilisearch running on local Docker or DO droplet, `listings` index created with correct configuration
- Cloudflare tunnel configured and routing `api.kerbdrop.dev` to local Express

### Acceptance Criteria

- [ ] `pnpm install` from root completes without errors
- [ ] `pnpm dev:api` starts Express, logs `🚀 KerbDrop API running`, health check at `/health` returns `{status: "ok"}`
- [ ] `pnpm dev:mobile` starts Expo, app loads in simulator without red screen
- [ ] All navigation tabs are tappable, all screens render without crashing
- [ ] Supabase dashboard shows all tables with correct schema and RLS enabled
- [ ] R2 bucket accessible, test upload via presigned URL succeeds
- [ ] Meilisearch health check endpoint responds
- [ ] `apps/mobile/.npmrc` prevents hoisting; `node_modules` for RN packages exist inside `apps/mobile/node_modules` not root

### Validation Test Cases

```yaml
TC-0.1: Monorepo clean install
  steps:
    - Delete all node_modules
    - Run pnpm install from root
  expect: Install completes, no peer dependency errors, mobile node_modules isolated

TC-0.2: API startup validation
  steps:
    - Set all required env vars from .env.example
    - Run pnpm dev:api
  expect: Server starts, no Zod validation errors, /health returns 200

TC-0.3: Mobile cold start
  steps:
    - Run pnpm dev:mobile
    - Open in iOS simulator
  expect: Splash screen shows, LocationSetupScreen renders, no JS errors in console

TC-0.4: Navigation smoke test
  steps:
    - Grant location permission on LocationSetupScreen
    - Tap each bottom tab
    - Tap AuthStack trigger (Sell tab)
  expect: Each screen renders, no navigation errors, WelcomeScreen appears for Sell tab
```

---

## Phase 1 — Location + Browse (The Feed)

**Goal:** An unauthenticated user can open the app, grant location, and see a feed of listings sorted by distance and recency. The feed is the product's front door — it must feel real and trustworthy from first open.

**Duration estimate:** 5–7 days

### Deliverables

- Location permission request flow (GPS grant or manual city entry)
- Location stored in AsyncStorage, persisted across sessions
- Real feed API: `GET /listings` returns geo-sorted, distance-annotated listings from Postgres
- Meilisearch synced on listing creation/update/deletion
- `FeedScreen` renders real data: 2-column grid, ListingCard with photo thumbnail, price, title, distance, time ago
- Category filter pills (horizontal scroll, alphabetical, no algorithmic ordering)
- `ListingDetailScreen` renders full listing: photo carousel, price, title, seller badges, description, location label
- Sort label visible on every browse session: "Sorted by: Nearest first, newest first. Always."
- Location pulse (animated `◉`) in feed header next to city name
- Empty state: clear invitation to act when no listings exist in radius

### Acceptance Criteria

- [ ] GPS permission granted → feed populates with real listings within radius in < 2s
- [ ] GPS permission denied → manual city entry flow presented, entry geocodes to lat/lng, feed populates
- [ ] Feed is sorted distance ascending, recency descending — verifiable by inspecting listing order against known coordinates
- [ ] Sort label "Sorted by: Nearest first, newest first. Always." is visible on FeedScreen without scrolling
- [ ] Location pulse animates and respects `reduceMotion` preference (stops animating when enabled)
- [ ] Category filter changes feed results correctly
- [ ] ListingDetailScreen shows all fields: photos (carousel), price, title, condition, location label, distance, seller verification badges
- [ ] Unauthenticated user can browse and view listing detail with no auth prompt
- [ ] No feed ranking variable other than distance + recency exists in the API or Meilisearch query

### Validation Test Cases

```yaml
TC-1.1: GPS location feed
  setup: Seed 10 listings at varying distances in test city
  steps:
    - Open app, grant GPS permission
    - Observe feed order
  expect: Listings ordered nearest first; listings beyond radius not shown

TC-1.2: Manual location entry
  steps:
    - Open app, deny GPS permission
    - Enter "Brooklyn, NY"
    - Observe feed
  expect: Feed shows listings near Brooklyn coordinates

TC-1.3: Listing detail completeness
  setup: Seed a listing with 3 photos, all fields populated
  steps:
    - Tap listing card
    - Verify all fields visible
  expect: Photos swipeable, price prominent, badges show correctly based on verification state

TC-1.4: Sort integrity
  setup: Seed listings at 1mi, 5mi, 2mi distances with varied timestamps
  steps:
    - Open feed
    - Record order of listings
  expect: 1mi listings appear before 5mi listings regardless of timestamp

TC-1.5: Empty state
  setup: No listings seeded within radius
  steps:
    - Open feed
  expect: Empty state message visible, no error state, invitation to post
```

---

## Phase 2 — Identity + Auth (Who You Are)

**Goal:** Users can create an account with phone verification and a pseudonymous handle. Authentication gates posting and messaging but never browsing. The auth flow is invisible until needed.

**Duration estimate:** 4–5 days

### Deliverables

- Phone OTP request and verification via Supabase Auth
- Handle selection screen for new users (uniqueness check live)
- Auth context provides session and user profile to all screens
- Auth gate inline on Sell tab, Inbox tab, Account tab, and listing action buttons
- `AuthStack` pushed with `returnTo` param; navigation returns on completion
- Account home screen: displays handle, verification badge status
- Sign out

### Acceptance Criteria

- [ ] Unauthenticated user taps Sell tab → AuthStack pushes without leaving the app
- [ ] Phone OTP flow: enter phone, receive SMS, enter 6 digits, session created
- [ ] New user is redirected to HandleSetupScreen before any other action
- [ ] After handle selection, auth is complete — user lands on returnTo screen with no further prompts
- [ ] Stripe Connect screen is never shown during auth flow under any circumstances
- [ ] Handle uniqueness is checked before submission; taken handles show inline error
- [ ] Handle follows character rules (3–30 chars, alphanumeric + _ -)
- [ ] Returning user (existing session) bypasses auth flow and lands directly on returnTo screen
- [ ] Sign out clears session, removes push token, returns to unauthenticated browse state
- [ ] Browse and ListingDetail remain fully accessible without authentication throughout
- [ ] AccountHomeScreen shows a non-blocking nudge card for Stripe Connect (not a gate)
- [ ] No user action other than explicitly visiting PaymentSetupScreen triggers the Stripe Connect flow

### Validation Test Cases

```yaml
TC-2.1: New user auth flow
  steps:
    - Open app (unauthenticated)
    - Tap Sell tab
    - Complete phone verify + handle setup
  expect: Lands on CameraScreen after handle setup — NO Stripe prompt; handle visible in AccountHome

TC-2.5: Stripe Connect not in auth path
  steps:
    - Complete full new user auth flow (phone + handle)
    - Observe all screens presented during flow
  expect: StripeConnectScreen never appears; flow ends at HandleSetupScreen

TC-2.2: Return user session restore
  steps:
    - Complete auth flow
    - Close and reopen app
  expect: Session restored, no auth prompt, feed loads immediately

TC-2.3: Handle uniqueness
  steps:
    - Create account with handle "testuser"
    - Sign out, create new account, attempt handle "testuser"
  expect: Live error "That handle is already taken" before submission

TC-2.4: Browse not gated
  steps:
    - Open app without authenticating
    - Browse feed, open listing detail
  expect: No auth prompt at any point during browse
```

---

## Phase 3 — Listing Creation (The Core Loop)

**Goal:** An authenticated seller can create a listing by photographing an item on their phone. The listing appears in the feed within seconds. This is the single most important feature in the product — if listing creation is fast and easy, supply grows; supply attracts buyers; buyers complete the flywheel.

**Duration estimate:** 7–10 days

### Deliverables

- `CameraScreen`: full-screen camera, capture up to 5 photos, review before proceeding
- Photo upload: presigned R2 URL, direct upload, server-side resize + compression via sharp
- Content moderation: AWS Rekognition at photo confirmation; rejected photos held with seller notification
- `ReviewDraftScreen`: seller manually enters title, description, selects category and condition
- `PriceLocationScreen`: price input (numeric keyboard), location confirmed (GPS auto-filled), radius selector
- `ListingConfirmationScreen`: listing live confirmation with share link
- Listing cap enforcement: free tier (10 active listings); `LISTING_CAP_REACHED` error with clear message
- `MyListingsScreen`: active, expired, and sold listings; mark as sold, relist actions
- 7-day expiry cron running; listings expire and are removed from feed

### Acceptance Criteria

- [ ] Camera opens immediately on Sell tab tap (after auth)
- [ ] Up to 5 photos capturable; fewer than 1 blocked at confirmation
- [ ] Photos upload to R2 and appear in listing within 30 seconds of capture
- [ ] Content moderation runs at confirm; explicit content rejected before listing goes live
- [ ] Listing appears in feed within 60 seconds of posting, sorted correctly by distance
- [ ] Listing detail shows seller's phone_verified and payment_verified badges correctly
- [ ] Free tier user attempting 11th active listing receives `LISTING_CAP_REACHED` error with clear message
- [ ] Listing expiry cron marks active listings expired after 7 days and removes from feed
- [ ] Photo deletion cron removes photos from R2 within 1 hour of expiry
- [ ] Seller can mark listing as sold from MyListingsScreen; listing disappears from feed immediately
- [ ] Seller can relist an expired listing; new listing gets new 7-day clock

### Validation Test Cases

```yaml
TC-3.1: End-to-end listing creation
  steps:
    - Open Sell tab
    - Capture 2 photos
    - Fill in title, description, category, condition
    - Enter price, confirm location
    - Tap Post
  expect: ListingConfirmationScreen shown; listing appears in feed within 60s

TC-3.2: Photo moderation
  setup: Prepare test image that triggers Rekognition rejection
  steps:
    - Attempt to create listing with rejected photo
  expect: Listing held from feed; seller receives notification with plain explanation

TC-3.3: Listing cap enforcement
  setup: User has 10 active listings (free tier)
  steps:
    - Attempt to create 11th listing
  expect: Error message "You've reached your listing limit" before creation

TC-3.4: Listing expiry
  setup: Set a listing's expires_at to 1 minute in the future
  steps:
    - Wait for cron to run
  expect: Listing status = 'expired', removed from feed, photo delete_at set

TC-3.5: Photo deletion
  setup: Trigger listing expiry (TC-3.4)
  steps:
    - Wait for hourly photo deletion cron
  expect: R2 objects deleted, photos.deleted_at populated
```

---

## Phase 4 — Messaging (Buyer-Seller Communication)

**Goal:** Buyers can contact sellers about specific listings. Conversations are contained, ephemeral, and text-only. The messaging system must feel immediate enough to support real transaction negotiation without becoming a communication network.

**Duration estimate:** 5–7 days

### Deliverables

- `Message Seller` button on ListingDetailScreen (auth-gated)
- `ThreadListScreen`: list of buyer's and seller's threads, sorted by last message, unread badge
- `ThreadViewScreen`: real-time message delivery via Supabase Realtime, listing mini-card at top
- Message compose: text input, send button, `KeyboardAvoidingView` per platform
- One thread per buyer per listing (enforced server-side)
- Seller's other active listings shown at bottom of ThreadViewScreen (max 6, current listing excluded)
- Thread expiry: read-only 7 days after listing closure, archived after that
- Push notifications: `message_received` notification dispatched to recipient

### Acceptance Criteria

- [ ] Buyer taps "Message Seller" on listing detail → thread created (or existing opened), keyboard raises
- [ ] Seller receives push notification with message preview within 10 seconds
- [ ] New messages appear in real-time without refresh (Supabase Realtime)
- [ ] Thread list shows unread count badge on Inbox tab and per-thread
- [ ] Seller's other active listings appear at bottom of thread (max 6, not current listing)
- [ ] Second tap of "Message Seller" on same listing opens existing thread, does not create duplicate
- [ ] Thread becomes read-only after listing expires + 7 days
- [ ] No "online now," "last seen," or typing indicators exist anywhere in the UI
- [ ] No media can be attached; image attachment UI is absent (not hidden, absent)

### Validation Test Cases

```yaml
TC-4.1: Thread creation and realtime delivery
  setup: Two devices — buyer (A) and seller (B)
  steps:
    - A taps Message Seller on B's listing
    - A types and sends message
  expect: B receives push notification; message appears on B's thread view in < 5s without refresh

TC-4.2: Thread deduplication
  steps:
    - Buyer messages seller on same listing twice (tap Message Seller twice)
  expect: Single thread exists; second tap opens existing thread

TC-4.3: Seller's other listings
  setup: Seller has 3 active listings
  steps:
    - Buyer opens thread on one listing
    - Scroll to bottom
  expect: Seller's other 2 active listings shown (not the current one)

TC-4.4: Thread expiry
  setup: Set listing expires_at to now, thread expires_at to now + 7 days
  steps:
    - Wait for thread expiry
    - Attempt to send message
  expect: Thread is read-only, compose area absent

TC-4.5: No social indicators
  steps:
    - Open thread view
    - Inspect UI
  expect: No online indicator, no last seen, no read receipts, no typing indicator
```

---

## Phase 5 — Payments (Optional Payment Capability)

**Goal:** Any user can optionally connect their Stripe account via OAuth from Account settings. Connected sellers display the payment-verified badge. Completed transactions confirmed via webhook mark listings as sold and notify both parties. This phase activates the revenue model.

**Duration estimate:** 5–7 days

### Deliverables

- `PaymentSetupScreen`: explains optional payment connection, triggers Stripe Connect OAuth from Account settings only
- OAuth flow: signed state JWT, browser/webview handoff, callback handler, account ID storage
- `payment_verified` badge appears on listings and in thread views for connected sellers
- Stripe webhook handler: `account.updated`, `payment_intent.succeeded` → mark listing sold, notify parties
- `GET /payments/connect/status` for status display in AccountHomeScreen
- Disconnect flow: clears `stripe_account_id`, clears `payment_verified`
- Fee display: platform fee shown to seller before connection ("We take $1 or 5% per sale, whichever is higher")

### Acceptance Criteria

- [ ] User taps "Set up payments" in AccountHome nudge or PaymentSetupScreen → Stripe Connect onboarding opens in browser; no Stripe UI inside the app
- [ ] On OAuth completion, user returns to app, `payment_verified = true`, badge appears on all their active listings within 30 seconds
- [ ] Stripe webhook `charge.succeeded` received and verified → listing marked sold, `payment_completed` notification sent to buyer and seller
- [ ] Payment badge displays correctly for verified sellers; absent for unverified sellers
- [ ] Unverified sellers' listings remain fully visible and functional; badge simply absent
- [ ] Disconnect clears account; badge disappears from seller's listings
- [ ] Platform fee is disclosed clearly before OAuth initiation

### Validation Test Cases

```yaml
TC-5.1: Stripe Connect OAuth from Account settings
  steps:
    - Complete phone auth (no Stripe prompt during auth)
    - Navigate to Account → Payment Setup
    - Tap Set up payments
    - Complete Stripe Express onboarding (test mode)
    - Return to app
  expect: payment_verified = true in database; badge appears on user's active listings

TC-5.5: Stripe never shown during auth
  steps:
    - Sign out
    - Tap Post listing
    - Complete auth flow
  expect: CameraScreen opens directly after HandleSetup; no Stripe screen in flow

TC-5.2: Webhook payment confirmation
  setup: Configure Stripe CLI for local webhook forwarding
  steps:
    - Trigger test payment_intent.succeeded event
  expect: Listing status = 'sold'; seller and buyer receive payment_completed notification

TC-5.3: Badge display integrity
  setup: Seller A verified, Seller B not verified
  steps:
    - Browse listings from both sellers
  expect: Seller A listings show ✓ badge; Seller B listings show no badge

TC-5.4: Disconnect
  steps:
    - Connected seller taps Disconnect in PaymentSetup
    - Confirm
  expect: stripe_account_id cleared, payment_verified = false, badge absent from listings
```

---

## Phase 6 — Offers (Price Negotiation)

**Goal:** Buyers can submit a formal offer below asking price. Sellers can accept or decline. Accepted offers trigger the payment flow. This closes the negotiation loop that currently requires a back-and-forth in the message thread.

**Duration estimate:** 3–4 days

### Deliverables

- `Make an Offer` button on ListingDetailScreen (payment-verified listings only, auth-gated)
- Offer submission: amount input, 24hr expiry, creates `offers` record and system message in thread
- `OfferPanel` component in ThreadViewScreen: shows active offer with accept/decline/withdraw actions
- Seller: accept → triggers payment flow in tap-to-pay app; decline → buyer notified
- Buyer: withdraw → offer cancelled
- Offer expiry cron: pending offers marked expired after 24hr
- One active offer per buyer per listing enforced server-side

### Acceptance Criteria

- [ ] Make an Offer button visible only on listings from payment-verified sellers
- [ ] Offer amount must be between $1.00 and listing price (exclusive)
- [ ] Offer appears as system message in thread and as OfferPanel above compose area
- [ ] Seller receives `offer_received` push notification within 10 seconds
- [ ] Accepted offer: buyer receives `offer_accepted` notification; payment flow initiated
- [ ] Declined offer: buyer receives `offer_declined` notification; can submit new offer
- [ ] Withdrawn offer: removed from thread UI; seller not notified
- [ ] Second offer from same buyer on same listing blocked until first is resolved
- [ ] Offer expired after 24hr: buyer notified; can resubmit

### Validation Test Cases

```yaml
TC-6.1: Offer submission and notification
  steps:
    - Buyer taps Make an Offer on payment-verified listing
    - Enters $35 on a $45 listing
    - Submits
  expect: Offer record created; system message in thread; seller receives push notification

TC-6.2: Seller accepts
  steps:
    - Seller views OfferPanel in thread
    - Taps Accept
  expect: Offer status = 'accepted'; buyer notified; payment flow initiated

TC-6.3: Offer amount validation
  steps:
    - Attempt to submit offer for $45 on a $45 listing
    - Attempt to submit offer for $0
  expect: Both rejected with validation error before submission

TC-6.4: Offer expiry
  setup: Set offer expires_at to 1 minute from now
  steps:
    - Wait for cron
  expect: Offer status = 'expired'; buyer notified; OfferPanel removed from thread
```

---

## Phase 7 — Polish, Performance, and Launch Readiness

**Goal:** The product is ready for TestFlight/internal testing in the launch city. All critical paths work end-to-end. The first-run experience is smooth. Error states are handled gracefully. The app passes App Store review.

**Duration estimate:** 7–10 days

### Deliverables

- Splash screen hide tied to auth + location resolution (no flicker)
- Offline banner via NetworkProvider when internet unreachable
- All empty states implemented with clear calls to action
- All error states handled: network errors, API errors, moderation rejections
- `KeyboardAvoidingView` verified on iOS and Android for all text-input screens
- Deep linking: `kerbdrop://listing/:id` and `kerbdrop://inbox/:threadId` resolve correctly
- Push notification tap routing: each notification type opens the correct screen
- Listing share: copy deep link button on ListingConfirmation and ListingDetail
- App icon, splash screen, and basic App Store metadata prepared
- `app.json` configured: bundle ID, permissions copy, scheme for deep links
- EAS Build configured and producing a working IPA/APK
- Maestro E2E test suite covering all Phase critical paths

### Acceptance Criteria

- [ ] App launches to correct screen (location setup / feed) with no visible flicker
- [ ] Offline banner appears within 2 seconds of network loss; disappears on reconnection
- [ ] All screens have appropriate empty states (no blank screens, no raw error objects)
- [ ] Tapping a push notification opens the correct screen in the correct state
- [ ] Deep link `kerbdrop://listing/[valid-id]` opens ListingDetailScreen with correct data
- [ ] Deep link `kerbdrop://listing/[invalid-id]` shows listing not found state gracefully
- [ ] App Store privacy manifest completed; no disallowed APIs used
- [ ] Maestro suite runs end-to-end: browse → create listing → message → offer → payment confirmation
- [ ] App builds successfully via EAS and installs on physical iOS and Android devices
- [ ] No crashes on 30-minute exploratory test session

### Validation Test Cases

```yaml
TC-7.1: Splash screen no-flicker
  steps:
    - Cold start app (force-quit and reopen)
    - Observe transition from splash to first screen
  expect: No white flash, no wrong screen briefly visible, smooth transition

TC-7.2: Offline handling
  steps:
    - Open app
    - Disable wifi and mobile data
    - Attempt to browse
  expect: Offline banner visible; last loaded feed visible; no crash

TC-7.3: Deep link resolution
  steps:
    - Tap share link from a listing
    - Open link on device with app installed
  expect: App opens directly to ListingDetailScreen for that listing

TC-7.4: Push routing
  setup: Trigger each notification type
  steps:
    - Tap each notification
  expect:
    - message_received → ThreadViewScreen
    - offer_received → ThreadViewScreen with OfferPanel
    - payment_completed → ListingDetailScreen (sold state)
    - listing_expiring_soon → MyListingsScreen

TC-7.5: Maestro E2E suite
  steps:
    - Run maestro test suite
  expect: All flows pass without intervention
```

---

## Phase 8 — Launch City Activation (Not a Technical Phase)

**Goal:** Achieve 500+ active listings in the launch city within 30 days of public launch.

This phase is entirely a marketing and activation problem, not an engineering one. It is listed here because it is the most important phase in the roadmap and because the product exists only if it achieves this milestone.

### Deliverables

- Direct outreach to 50–100 most active Craigslist sellers in launch city
- Presence established in local subreddit and neighborhood communities
- Launch announcement post in relevant local communities
- Onboarding DMs to early sellers with hands-on support from founding team

### Acceptance Criteria

- [ ] 500+ active listings in launch city at any given time, 30 days post-launch
- [ ] At least 1 completed transaction via platform payment (revenue milestone 1)
- [ ] At least 10 unique buyers have messaged sellers
- [ ] Day-7 retention > 15% for users who viewed at least one listing

---

## Deferred (No Phase Assignment)

The following are acknowledged as valuable but not assigned to a phase. They are revisited after Phase 8 based on actual usage data.

| Feature | Condition for Revisiting |
|---|---|
| AI listing generation (photo → title/description) | When listing creation friction is demonstrably causing drop-off |
| Seller tier subscriptions (Plus/Pro) | When ≥5 users demonstrably hit the 10-listing free tier cap |
| Web app | When a meaningful percentage of traffic arrives from desktop |
| Second city expansion | After Phase 8 acceptance criteria met in launch city |
| Human moderation review queue | When automated moderation produces visible false positive/negative pattern |
| Shipping support | Never in current product vision |
