# KerbDrop — Milestones

**Version:** 1.1
**Last Updated:** July 2026
**Changes from 1.0:** Updated Phase 2 and Phase 5 checklists and discussion items to reflect phone-only auth and optional Stripe Connect. Removed rigid buyer/seller designation from discussion items throughout.
**Purpose:** Living status tracker. One entry per roadmap phase. Updated as work progresses.

Status values: `planned` · `started` · `blocked` · `deferred` · `cancelled` · `complete`

---

## Phase 0 — Foundation

**Status:** `planned`
**Target Start:** TBD
**Target Complete:** TBD
**Actual Complete:** —

### Progress Notes

_No work started._

### Checklist

- [ ] Monorepo initialized (pnpm, Turborepo, tsconfig.base.json)
- [ ] `packages/shared` builds cleanly
- [ ] `apps/api` starts, health check responds
- [ ] `apps/mobile` opens in Expo Go without errors
- [ ] Supabase project created, migration applied
- [ ] RLS policies verified active on all tables
- [ ] R2 bucket created, prefix structure in place
- [ ] Meilisearch running, `listings` index configured
- [ ] Cloudflare tunnel routing `api.kerbdrop.dev` to local Express
- [ ] Mobile `.npmrc` confirmed isolating RN packages from root hoist

### Discussion Items

- **[OPEN]** Confirm Expo EAS project ID before Phase 7. Obtain early to avoid delays at build time.
- **[OPEN]** Supabase project region selection. Choose the region closest to the launch city for lowest latency.
- **[OPEN]** Decide whether to use Supabase local dev (`supabase start`) or connect directly to hosted project during development. Local dev is faster for schema iteration but requires Docker.

---

## Phase 1 — Location + Browse

**Status:** `planned`
**Target Start:** TBD
**Target Complete:** TBD
**Actual Complete:** —

### Progress Notes

_No work started._

### Checklist

- [ ] `LocationProvider` fully functional (GPS + manual + AsyncStorage persistence)
- [ ] `LocationSetupScreen` handles both GPS grant and manual entry paths
- [ ] `GET /listings` API returns geo-sorted, distance-annotated results
- [ ] Meilisearch index sync on listing create/update/delete
- [ ] `FeedScreen` renders real data in 2-column grid
- [ ] `ListingCard` component complete (photo, price, title, distance, time ago, payment badge)
- [ ] Category filter pills working and correctly filtering results
- [ ] Sort label visible on FeedScreen ("Sorted by: Nearest first, newest first. Always.")
- [ ] Location pulse animates; respects `reduceMotion`
- [ ] `ListingDetailScreen` renders all fields with photo carousel
- [ ] Empty state implemented for zero-listing radius
- [ ] TC-1.1 through TC-1.5 pass

### Discussion Items

- **[OPEN]** Geocoding provider for manual location entry. Options: `expo-location` (reverse only, limited forward), Nominatim (free, rate-limited), Google Geocoding API (paid, reliable). Decision needed before Phase 1 implementation.
- **[OPEN]** Default radius for first-time users. BRS says 5–25 miles configurable. What is the default shown before any interaction? Recommend 10 miles but needs confirmation.
- **[OPEN]** Photo carousel implementation. Expo's built-in `ScrollView` horizontal vs. a dedicated carousel library (e.g., `react-native-reanimated-carousel`). Latter is heavier but smoother. Decide before ListingDetailScreen implementation.

---

## Phase 2 — Identity + Auth

**Status:** `planned`
**Target Start:** TBD
**Target Complete:** TBD
**Actual Complete:** —

### Progress Notes

_No work started._

### Checklist

- [ ] `POST /auth/phone/request` rate-limited, SMS dispatched via Supabase Auth
- [ ] `POST /auth/phone/verify` creates session, returns `isNewUser`
- [ ] `POST /auth/handle` validates uniqueness and format
- [ ] `AuthContext` provides session, user, isAuthenticated to all screens
- [ ] `AuthStack` pushes inline from Sell/Inbox/Account tabs with `returnTo`
- [ ] `WelcomeScreen` implemented
- [ ] `PhoneVerifyScreen` implemented (phone input + OTP input)
- [ ] `HandleSetupScreen` implemented with live uniqueness check
- [ ] Auth flow ends at `HandleSetupScreen` — no Stripe screen in AuthStack under any circumstances
- [ ] Return user session restored on app reopen without re-auth
- [ ] `AccountHomeScreen` shows handle and phone verification badge
- [ ] `AccountHomeScreen` shows non-blocking Stripe Connect nudge card (not a gate)
- [ ] Sign out clears session and push token
- [ ] Browse remains accessible without authentication
- [ ] TC-2.1 through TC-2.5 pass

### Discussion Items

- **[OPEN]** OTP input UX. Auto-advance on 6-digit entry (better UX) vs. manual submit button (simpler implementation). Recommend auto-advance.
- **[OPEN]** Handle change grace period. BRS says once per 90 days. Needs a `handle_changed_at` column on `users` table. Not in current schema — add in a migration before Phase 2 starts.
- **[RESOLVED]** `AccountHomeScreen` shows a non-blocking nudge card for Stripe Connect: "Accept in-app payments — connect your bank account." This is informational, not a gate. The user can dismiss it or ignore it indefinitely. It does not reappear as a modal or block any action.

---

## Phase 3 — Listing Creation

**Status:** `planned`
**Target Start:** TBD
**Target Complete:** TBD
**Actual Complete:** —

### Progress Notes

_No work started._

### Checklist

- [ ] `CameraScreen` opens directly to camera (no intermediate screen)
- [ ] Up to 5 photos captured and reviewed before proceeding
- [ ] `POST /photos/presign` returns valid R2 presigned URL
- [ ] Direct-to-R2 upload implemented in mobile client
- [ ] `POST /photos/confirm` triggers server-side resize (sharp) and Rekognition moderation
- [ ] Approved photos have CDN URLs populated in `photos` table
- [ ] Rejected photos send in-app notification with plain-language reason
- [ ] `ReviewDraftScreen` allows editing title, description, category, condition (manual entry — no AI)
- [ ] `PriceLocationScreen` GPS auto-fills location, radius selector works
- [ ] `POST /listings` enforces tier cap, creates listing, syncs to Meilisearch
- [ ] `ListingConfirmationScreen` shows live listing link
- [ ] `MyListingsScreen` shows active/expired/sold tabs, mark-as-sold and relist actions
- [ ] Listing expiry cron running and verified working
- [ ] Photo deletion cron running and verified working
- [ ] TC-3.1 through TC-3.5 pass

### Discussion Items

- **[OPEN]** Camera library choice. `expo-camera` (SDK 52 New Architecture compatible) vs. `expo-image-picker`. Camera gives full-screen capture experience (preferred for the Sell flow); image picker is simpler but feels less intentional. Recommend `expo-camera` for primary capture, `expo-image-picker` as fallback for photo library selection.
- **[OPEN]** Photo upload progress UX. Direct R2 upload can use `XMLHttpRequest` with progress events, but `fetch` does not expose upload progress. Need to decide between `XMLHttpRequest` wrapper or a library (e.g., `axios`) for progress feedback. Progress feedback is important for the listing creation feel — a user uploading 5 photos needs to know something is happening.
- **[OPEN]** What happens if moderation rejects one of 5 photos but approves the other 4? Does the listing go live with 4 photos and a seller notification, or is the entire listing held? Recommend: listing held if the rejected photo is the first (cover) photo; listing goes live with remaining photos if a non-cover photo is rejected. Needs product confirmation.
- **[CLARIFICATION NEEDED]** The `ReviewDraftScreen` currently has no AI generation (deferred from MVP). The screen needs clear copy explaining the seller is entering their own description. The label "We filled in the details" from the design spec is wrong for MVP — it implies AI. Update copy to "Describe your item" or similar.

---

## Phase 4 — Messaging

**Status:** `planned`
**Target Start:** TBD
**Target Complete:** TBD
**Actual Complete:** —

### Progress Notes

_No work started._

### Checklist

- [ ] `POST /messages/threads` creates thread + first message, checks uniqueness
- [ ] `ThreadListScreen` shows threads sorted by last message, unread badges
- [ ] `ThreadViewScreen` shows listing mini-card, message history, compose area
- [ ] Supabase Realtime channel subscription working in `ThreadViewScreen`
- [ ] New messages appear without refresh
- [ ] `KeyboardAvoidingView` tested and working on iOS and Android
- [ ] Seller's other active listings shown at bottom (max 6)
- [ ] Push notification dispatched on new message
- [ ] `message_received` notification routes to correct thread on tap
- [ ] Thread becomes read-only after expiry
- [ ] No online indicators, no read receipts, no typing indicators exist in UI
- [ ] TC-4.1 through TC-4.5 pass

### Discussion Items

- **[OPEN]** Supabase Realtime connection management. The subscription should be created on `ThreadViewScreen` mount and cleaned up on unmount. Need to handle the case where the app is backgrounded mid-conversation and messages arrive while offline — these should appear when the app is foregrounded. Test this explicitly before marking complete.
- **[OPEN]** Thread list ordering. Currently specified as "sorted by last message." Should threads with unread messages be surfaced above read threads regardless of timestamp? Standard inbox behavior would suggest yes. Recommend: unread threads first, then last-message sort within each group. Needs product confirmation before implementation.
- **[CLARIFICATION NEEDED]** What does the Inbox tab look like for a user who has never sent or received a message? The empty state needs copy. Recommend: "No conversations yet. Find something you like and tap Message Seller."

---

## Phase 5 — Payments

**Status:** `planned`
**Target Start:** TBD
**Target Complete:** TBD
**Actual Complete:** —

### Progress Notes

_No work started._

### Checklist

- [ ] `GET /payments/connect/url` generates signed state JWT, returns Stripe OAuth URL
- [ ] Stripe OAuth flow opens in device browser (not in-app webview — App Store guideline)
- [ ] `GET /payments/connect/callback` verifies state, exchanges code, stores account ID
- [ ] Deep link `kerbdrop://payments/success` or `kerbdrop://payments/error` returns user to app
- [ ] `payment_verified = true` reflected in user profile and listing badges within 30s
- [ ] Stripe webhook handler verifies signature, handles `charge.succeeded`
- [ ] Payment confirmation marks listing sold, dispatches notifications to buyer and seller
- [ ] `PaymentSetupScreen` shows current status (connected / not connected)
- [ ] Disconnect flow implemented
- [ ] Fee disclosure shown before OAuth initiation
- [ ] TC-5.1 through TC-5.4 pass

### Discussion Items

- **[RESOLVED]** Stripe Connect mode: Express. Confirmed correct choice — KerbDrop controls onboarding UX, cleaner experience, appropriate for this use case.
- **[OPEN]** App Store guideline compliance for OAuth flow. Apple requires that OAuth and authentication flows use `ASWebAuthenticationSession` (via `expo-web-browser`) rather than an in-app `WebView`. Verify `expo-web-browser` is compatible with Stripe Connect's redirect flow before Phase 5 starts.
- **[OPEN]** What Stripe event type confirms a completed transaction in the tap-to-pay context? `charge.succeeded`? `payment_intent.succeeded`? `transfer.created`? The exact event depends on how the tap-to-pay app is configured. This needs to be confirmed with the tap-to-pay app operator before the webhook handler is built.

---

## Phase 6 — Offers

**Status:** `planned`
**Target Start:** TBD
**Target Complete:** TBD
**Actual Complete:** —

### Progress Notes

_No work started._

### Checklist

- [ ] `Make an Offer` button visible only on payment-verified seller listings
- [ ] Offer amount validation (> $1.00, < asking price)
- [ ] `POST /offers` creates offer record, system message in thread, notifies seller
- [ ] `OfferPanel` component in ThreadViewScreen with accept/decline/withdraw actions
- [ ] Accept → buyer notified, payment flow initiated
- [ ] Decline → buyer notified, can resubmit
- [ ] Withdraw → offer cancelled, seller not notified
- [ ] One active offer per buyer per listing enforced
- [ ] Offer expiry cron marks expired offers, notifies buyer
- [ ] TC-6.1 through TC-6.4 pass

### Discussion Items

- **[OPEN]** How is the payment flow initiated after offer acceptance? The tap-to-pay app needs to know the agreed amount differs from the listing price. This likely requires a deep link from KerbDrop to the tap-to-pay app with the offer amount as a parameter. Coordinate with tap-to-pay app before Phase 6 starts.
- **[OPEN]** Counter-offer flow. The current spec has accept/decline only. Counter-offer (seller proposes different amount) is a natural next step but adds complexity. Deferred — confirm it stays out of Phase 6 scope.

---

## Phase 7 — Polish and Launch Readiness

**Status:** `planned`
**Target Start:** TBD
**Target Complete:** TBD
**Actual Complete:** —

### Progress Notes

_No work started._

### Checklist

- [ ] Splash screen hide logic tied to auth + location resolution
- [ ] No visible flicker on cold start (verified on physical device)
- [ ] Offline banner implemented and tested
- [ ] All empty states implemented across all screens
- [ ] All API error states handled gracefully (no raw error objects in UI)
- [ ] `KeyboardAvoidingView` verified on physical iOS and Android devices
- [ ] Deep linking end-to-end tested (listing, inbox, payments callback)
- [ ] Push notification tap routing verified for all notification types
- [ ] Listing share (copy deep link) implemented
- [ ] App icon and splash screen assets created and configured in `app.json`
- [ ] App Store privacy manifest completed
- [ ] EAS Build produces working IPA and APK
- [ ] Maestro E2E test suite complete and passing
- [ ] 30-minute exploratory test session on physical devices with no crashes
- [ ] TC-7.1 through TC-7.5 pass

### Discussion Items

- **[OPEN]** App icon and splash screen design. These are not yet designed. Need assets before EAS Build can produce a submission-ready build. Unblock early.
- **[OPEN]** Privacy manifest (Apple requirement since iOS 17.4). Must declare all "required reason APIs" used. `expo-location`, `expo-secure-store`, and `expo-notifications` all require entries. Expo's managed workflow generates this automatically from SDK 52 — verify this is working correctly before submission.
- **[OPEN]** Maestro test environment. Maestro tests need a seeded test environment with known listings, users, and threads. Design the seed data strategy before writing tests — shared seed SQL in `infrastructure/supabase/seed.sql`.

---

## Phase 8 — Launch City Activation

**Status:** `planned`
**Target Start:** TBD
**Target Complete:** TBD
**Actual Complete:** —

### Progress Notes

_No work started._

### Checklist

- [ ] Launch city selected (criteria: 500k–2M population, active Craigslist, strong local subreddit)
- [ ] 50–100 active Craigslist sellers identified in launch city
- [ ] Direct outreach to top sellers completed (individual messages, not bulk)
- [ ] 6-month fee waiver offer communicated to early sellers
- [ ] Local subreddit presence established
- [ ] App Store and Play Store listings live
- [ ] 500+ active listings in launch city (30 days post-launch)
- [ ] First completed transaction via platform payment
- [ ] 10+ unique buyers have messaged sellers
- [ ] Day-7 retention > 15%

### Discussion Items

- **[OPEN]** Launch city selection. This decision has not been made. It should be made before Phase 7 completes so activation outreach can begin in parallel with final polish. Candidate cities: Columbus OH, Raleigh NC, Salt Lake City UT, Milwaukee WI, Louisville KY.
- **[OPEN]** Early seller incentive structure. "6-month fee waiver" is the current proposal. This requires the platform to track which accounts are on the waiver and skip the fee deduction. Needs an implementation plan before the waiver is communicated to sellers.
- **[OPEN]** App Store review timeline. Apple's review typically takes 1–3 days for first submission but can be longer. Submit for review at least 2 weeks before the intended public launch date. Plan accordingly in Phase 7.

---

## Deferred Items Log

Items removed from active phases and the reason they were deferred.

| Item | Originally Planned For | Deferred Reason | Revisit Condition |
|---|---|---|---|
| AI listing generation | Phase 3 | MVP complexity; seller can write their own | Listing creation drop-off data from Phase 3 |
| Listing tier subscriptions | Phase 3 | No users hitting cap yet; Stripe Billing is a second integration | ≥5 users hitting 10-listing cap |
| Web application | Phase 1 | Mobile-first; marketing site covers web | Desktop traffic > 20% of sessions |
| Human moderation queue | Phase 3 | Auto-moderation sufficient for early scale | False positive/negative pattern emerges |
| Shipping support | — | Against product philosophy | Never in current vision |
| Counter-offer flow | Phase 6 | Adds complexity before basic offer flow is validated | After Phase 6 ships and offer usage data exists |
| Second city | Phase 8+ | Single city focus is the strategy | Phase 8 acceptance criteria met |
