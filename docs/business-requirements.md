# KerbDrop — Business Requirements Specification

**Version:** 1.1
**Status:** Approved
**Last Updated:** July 2026
**Changes from 1.0:** Removed rigid buyer/seller user designation. Established phone verification as the universal identity floor for all users. Repositioned Stripe Connect as an optional payment capability, not an authentication mechanism.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Target Users](#3-target-users)
4. [Business Objectives](#4-business-objectives)
5. [Success Metrics](#5-success-metrics)
6. [Business Rules](#6-business-rules)
7. [Revenue Model](#7-revenue-model)
8. [Constraints and Non-Negotiables](#8-constraints-and-non-negotiables)
9. [Assumptions and Dependencies](#9-assumptions-and-dependencies)
10. [Risks](#10-risks)
11. [Out of Scope](#11-out-of-scope)

---

## 1. Executive Summary

KerbDrop is a local-first, pseudonymous, transaction-focused mobile marketplace. It targets the unclaimed territory between Craigslist (no payments, outdated UX, scam-enabling anonymity) and Facebook Marketplace (surveillance-capitalism business model, real-identity requirement, algorithmic feed manipulation).

The platform embraces the downright simplicity of Craigslist's UI, while drawing inspiration from the UX of Facebook Marketplace — borrowing its modern listing experience and in-app messaging, but entirely rejecting its social network infrastructure.

KerbDrop is designed to be permanently free to use for buyers and all casual sellers. Revenue is generated exclusively through payment processing fees on completed transactions. No advertising. No promoted listings. No data monetization.

---

## 2. Problem Statement

### 2.1 The Craigslist Problem

Craigslist commands approximately 140 million monthly visits worldwide. Its endurance proves durable demand for simple, local, unencumbered classifieds. However it has four unresolved structural failures:

- **No integrated payments.** Every transaction requires a cash meetup, creating anxiety, friction, and real safety exposure that suppresses completion rates.
- **Unstructured listings.** Free-text descriptions with inconsistent photo quality produce poor buyer experiences and slower sales.
- **No mobile-first experience.** The interface was designed for early-2000s desktop browsers and has not materially evolved.
- **Anonymity without accountability.** Full anonymity enables scams with no recourse mechanism for victims.

### 2.2 The Facebook Marketplace Problem

Facebook Marketplace solved Craigslist's UX problems but introduced worse ones:

- **Real identity requirement.** Transacting requires a Facebook account, surrendering the user's social graph and behavioral history to Meta as a condition of buying or selling locally.
- **Algorithmic feed manipulation.** Listings are ranked by engagement signals, not relevance. This creates pay-to-play pressure and distorts discovery.
- **Surveillance capitalism.** The platform's revenue requires behavioral tracking, data harvesting, and engagement optimization — structurally opposed to user interests.

### 2.3 The Gap

No current platform offers all of:
- Pseudonymous identity (not fully anonymous, not real-identity)
- Integrated, frictionless payments on a privacy-respecting platform
- Local-first discovery without algorithmic manipulation
- Mobile-first listing creation
- A business model that does not require advertising or data monetization

---

## 3. Target Users

### 3.1 One User Type — Contextual Roles

KerbDrop does not designate users as buyers or sellers at the account level. These are contextual roles that apply within a specific transaction, not permanent identity attributes. The same person selling a bicycle today is buying a lamp tomorrow. Encoding buyer or seller as a rigid account type would introduce false categorization, unnecessary onboarding friction, and product complexity that solves no real problem.

Within any given transaction:
- The user who created the listing is functioning as the **seller** in that context
- The user who initiated contact about that listing is functioning as the **buyer** in that context

These labels exist on the transaction (the message thread), not on the user account.

### 3.2 User Characteristics

The platform is built for users who share these traits regardless of whether they are buying or selling in a given moment:

- Privacy-conscious: deleted or never had Facebook; unwilling to surrender a social graph as the price of local commerce
- Locally rooted: interested in transactions that can be completed nearby, not shipped nationally
- Pragmatic: values simplicity and low friction over feature richness
- Mobile-native: comfortable completing a transaction entirely on a smartphone

### 3.3 Usage Patterns

Three usage patterns will emerge organically. No product distinction is made between them:

**Occasional transactors** — decluttering, moving sales, one-off purchases. The majority of users. They should never encounter a friction point designed for power users.

**Repeat listers** — informal resellers, estate sale flippers, hobbyist equipment turnovers. Higher listing volume. The listing tier cap is the only product distinction that applies to them.

**Browse-only users** — people exploring local listings without immediate intent to transact. Fully supported with no auth requirement. They convert to transactors when something catches their attention.

### 3.4 Who KerbDrop Is Not For

- Users who primarily want shipping (national marketplace positioning)
- Users who need a storefront, brand presence, or inventory management
- Users who want social features tied to commerce
- Businesses requiring POS integration or formal merchant accounts

---

## 4. Business Objectives

### 4.1 Phase 1 Objective (Months 1–6)
Achieve meaningful listing density in one target city sufficient to make the feed feel alive to a first-time visitor. Target: 500+ active listings in the launch city at any given time.

### 4.2 Phase 2 Objective (Months 7–12)
Achieve first self-sustaining transaction volume — enough completed transactions that payment processing revenue covers infrastructure costs. Target: infrastructure cost-neutral.

### 4.3 Phase 3 Objective (Year 2)
Expand to three cities using the same activation playbook. Establish organic word-of-mouth as the primary acquisition channel. Begin evaluating payment rail alternatives to improve margin.

### 4.4 Long-Term Objective
Own local marketplace mindshare in 10+ cities as a values-aligned, trust-first alternative. Explore strategic partnership with a payment platform seeking a local commerce vertical.

---

## 5. Success Metrics

### 5.1 Primary Metric
**Transactions completed per active city per month.** This is the only metric that matters. All others are leading indicators for this number.

### 5.2 Leading Indicators

| Metric | Phase 1 Target | Phase 2 Target |
|---|---|---|
| Active listings in launch city | 500+ | 2,000+ |
| Monthly active users (launch city) | 1,000+ | 5,000+ |
| Listing-to-message rate | > 15% | > 20% |
| Message-to-transaction rate | > 25% | > 30% |
| Day-7 retention | > 20% | > 30% |
| Stripe Connect onboarded listers | > 30% of users who have posted a listing | > 50% |

### 5.3 Anti-Metrics (Things We Explicitly Do Not Optimize For)

- Time on platform
- Sessions per day
- Notification open rate
- Feed scroll depth
- Social connection count

Any product decision that optimizes for these at the expense of transaction completion rate is the wrong decision.

---

## 6. Business Rules

### 6.1 Identity Rules

- **BR-ID-01:** Every user must have a unique pseudonymous handle of 3–30 characters (letters, numbers, underscores, hyphens only).
- **BR-ID-02:** Real names are never required, collected, or displayed.
- **BR-ID-03:** Handle changes are permitted once per 90 days.
- **BR-ID-04:** Phone verification is the universal identity floor for all users regardless of how they use the platform. It is required for posting listings and initiating messages. Browsing requires no authentication.
- **BR-ID-05:** Stripe Connect OAuth is an optional payment capability any user may enable. It is not an authentication mechanism. Connecting Stripe grants the user a payment-verified badge on their listings and enables in-app payment receipt. It is not required for any other platform function.
- **BR-ID-06:** No user is designated a buyer or seller at the account level. These roles are contextual, applying within a specific transaction thread only.

### 6.2 Listing Rules

- **BR-LIST-01:** Free tier users may have a maximum of 10 active concurrent listings.
- **BR-LIST-02:** Plus tier users may have a maximum of 25 active concurrent listings.
- **BR-LIST-03:** Pro tier users have no listing cap.
- **BR-LIST-04:** All listings expire after exactly 7 days from creation.
- **BR-LIST-05:** Expired listings may be relisted, creating a new listing with a new expiry clock. Relisting is not a bump — it creates a distinct listing.
- **BR-LIST-06:** Listings require at least one photo. Text-only listings are not permitted.
- **BR-LIST-07:** A maximum of 5 photos are permitted per listing.
- **BR-LIST-08:** Feed sort order is distance (nearest first) then recency (newest first). No other sort variables are permitted. This rule is permanent.
- **BR-LIST-09:** No listing shall receive preferential feed placement for any reason, including payment, tier, or any other factor.

### 6.3 Photo Rules

- **BR-PHOTO-01:** All photos are run through automated content moderation before the listing becomes active.
- **BR-PHOTO-02:** Photos are physically deleted from storage at listing expiry or sale confirmation, whichever comes first.
- **BR-PHOTO-03:** Maximum photo size at upload is 10MB. Photos are compressed server-side.
- **BR-PHOTO-04:** A listing with any rejected photo is held from the feed until the seller replaces the rejected photo or removes the listing.

### 6.4 Transaction Rules

- **BR-TXN-01:** Payment is optional. Cash at pickup is a supported and valid transaction path.
- **BR-TXN-02:** The minimum processed payment amount is $10.00.
- **BR-TXN-03:** The platform fee on processed transactions is $1.00 flat for sales below $20.00, and 5% for sales of $20.00 and above.
- **BR-TXN-04:** The platform never holds user funds. Stripe Connect is the payment intermediary.
- **BR-TXN-05:** Sellers must complete Stripe Connect OAuth to display the payment-verified badge. Unverified sellers may still list and transact via cash.

### 6.5 Messaging Rules

- **BR-MSG-01:** Message threads are scoped to a single listing. Cross-listing messaging is not permitted.
- **BR-MSG-02:** Only the non-listing party may initiate a thread about a listing. The listing owner may not cold-message users who have not contacted them first.
- **BR-MSG-03:** One thread per buyer per listing (enforced by unique constraint).
- **BR-MSG-04:** Message threads expire 7 days after listing closure or expiry.
- **BR-MSG-05:** Messages are plain text only. No media attachments, no link previews, no emoji reactions.
- **BR-MSG-06:** No "online now," "last seen," or read receipt indicators are displayed.

### 6.6 Notification Rules

- **BR-NOTIF-01:** Notifications are transactional only. Permitted types: message received, offer received, offer accepted, offer declined, payment completed, listing expiring soon, listing expired.
- **BR-NOTIF-02:** No engagement notifications are permitted. No "X viewed your listing," no activity feeds.

### 6.7 Offer Rules

- **BR-OFFER-01:** Only the non-listing party (the contacting user) may submit offers on a listing.
- **BR-OFFER-02:** A contacting user may have only one active pending offer per listing.
- **BR-OFFER-03:** Offers expire after 24 hours if not responded to.
- **BR-OFFER-04:** The listing owner may accept or decline. The contacting user may withdraw before acceptance.

---

## 7. Revenue Model

### 7.1 Core Revenue: Transaction Processing Fee

The sole mandatory revenue mechanism. Applied to all transactions processed through the platform's payment integration.

| Sale Price | Platform Fee |
|---|---|
| Under $20.00 | $1.00 flat |
| $20.00 and above | 5% of sale price |

Stripe Connect fees (~2.9% + $0.30) are absorbed within the platform fee. Net margin improves with transaction size.

### 7.2 Optional: Listing Tier Subscriptions

Not a Phase 1 priority. The listing cap is enforced from day one; the subscription upgrade flow is built when power listers demonstrably hit the cap. Tiers apply to any user who posts listings — there is no seller-only account type.

| Tier | Price | Active Listing Cap |
|---|---|---|
| Free | $0 | 10 |
| Plus | $4.99/month | 25 |
| Pro | $14.99/month | Unlimited |

No tier affects feed ranking, search placement, or listing visibility. This constraint is permanent and must be architecturally enforced, not merely policy-stated.

### 7.3 What Will Never Be a Revenue Source

- Advertising of any kind
- Promoted or boosted listings
- Data sale or behavioral profiling
- Mandatory subscription for normal users
- Any mechanism that affects feed ranking

---

## 8. Constraints and Non-Negotiables

### 8.1 Permanent Product Constraints

These are architectural commitments, not policies. They cannot be reversed by a product decision, a board vote, or investor pressure without fundamentally changing what KerbDrop is.

| Constraint | Rationale |
|---|---|
| No algorithmic feed ranking | Algorithms require behavioral data and create pay-to-play dynamics |
| No advertising | Ads require engagement optimization which destroys all three core principles |
| No social graph | Social graph transforms the platform into Facebook Marketplace Lite |
| No public seller profiles with history | Accumulated listing history creates persistent identity fingerprints |
| No real name requirement | Pseudonymity is a core product value, not a feature |
| No proprietary payment wallet | Would make KerbDrop a money transmitter — a different regulated business |

### 8.2 Technical Constraints

- The platform must run on infrastructure costing under $100/month at zero meaningful scale
- Photo retention must not exceed 7 days under any circumstances
- All user data must be deletable on request (GDPR/CCPA compliance path)
- No third-party analytics SDKs that perform cross-site tracking

### 8.3 Launch Constraint

Phase 1 launches in a single city. National launch is not a Phase 1 goal and is not a measure of success.

---

## 9. Assumptions and Dependencies

### 9.1 Assumptions

- **A-01:** Stripe Connect Express is available and sufficient for the tap-to-pay payment model. Stripe's API and pricing remain materially stable.
- **A-02:** Expo SDK 52 with React Native 0.76 provides adequate mobile performance for the listing creation camera flow.
- **A-03:** Supabase Realtime is sufficient for messaging at MVP scale without a dedicated WebSocket server.
- **A-04:** AWS Rekognition content moderation is sufficient for MVP-scale photo screening. Human review queue is deferred.
- **A-05:** The launch city has a sufficient Craigslist user base to seed initial supply through direct outreach.
- **A-06:** Cottage food, informal services, and local gig listings will arrive organically and require no separate product investment.

### 9.2 External Dependencies

| Dependency | Risk if Unavailable |
|---|---|
| Stripe Connect | Payment layer collapses; core revenue model fails |
| Supabase | Database and auth layer; requires migration plan |
| Cloudflare R2 | Photo storage; replaceable with S3 but requires config change |
| AWS Rekognition | Content moderation; replaceable with Google Vision |
| Expo EAS | App Store / Play Store build pipeline |
| Apple App Store | iOS distribution; review policies can affect launch timeline |

---

## 10. Risks

### 10.1 Cold Start Risk (Critical)
**Description:** Insufficient listing density in the launch city makes the feed feel empty, causing first-time users to leave and not return.
**Mitigation:** Direct outreach to 50–100 active Craigslist sellers in the launch city before public launch. Seed the feed before opening to the public.
**Owner:** Founding team (marketing/activation).

### 10.2 Payment Friction Risk (Reduced — by design)
**Description:** Some users who post listings will not connect Stripe, reducing payment-verified listing density.
**Mitigation:** This is an accepted and expected state, not a failure condition. Cash at pickup is explicitly supported and never discouraged. The platform incentivizes Stripe connection via the payment-verified badge but never mandates it. Stripe Connect is entirely decoupled from the auth and listing creation flows — there is no gate to clear.
**Owner:** Product.

### 10.3 Moderation Risk (Medium)
**Description:** Automated moderation misses prohibited content; platform hosts harmful material.
**Mitigation:** AWS Rekognition at photo ingestion, user reporting, banning for repeat violators. Human review queue deferred to Phase 2 but must be planned.
**Owner:** Engineering + operations.

### 10.4 App Store Review Risk (Medium)
**Description:** Apple or Google rejects the app during review, delaying launch.
**Mitigation:** Strict adherence to App Store guidelines from day one. No gray-area features. Early TestFlight/internal testing track.
**Owner:** Engineering.

### 10.5 Vision Drift Risk (High — Long Term)
**Description:** Investor or growth pressure leads to introduction of promoted listings, algorithmic feed, or other compromising features.
**Mitigation:** Capitalization strategy must explicitly exclude investors whose thesis depends on ad revenue or aggressive monetization. The constraints in Section 8.1 must be documented and referenced in any term sheet discussion.
**Owner:** Founders.

---

## 11. Out of Scope

The following are explicitly out of scope and not planned for any phase:

- Shipping or national delivery
- In-app storefront or brand pages
- Social features (followers, likes, comments, reactions, groups)
- AI-generated listing titles/descriptions (deferred from MVP)
- Web application (marketing site only; app is mobile-native)
- Short-term rental or escrow-over-time transactions
- Background checks or professional credential verification
- Customer support chat or live help
- Subscription billing infrastructure (deferred until cap is demonstrably hit)
- International markets
- Vehicle sales (regulatory complexity deferred)
- Real estate listings (regulatory complexity deferred)
