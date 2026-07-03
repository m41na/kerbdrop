# Local Marketplace Platform — Product Design Document

**Version 1.0 — Working Document**
**Status: Concept Phase — Pre-Development**

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [The Problem We Are Solving](#2-the-problem-we-are-solving)
3. [Core Philosophy](#3-core-philosophy)
4. [The Competitive Landscape](#4-the-competitive-landscape)
5. [Product Vision](#5-product-vision)
6. [Must-Have Features](#6-must-have-features)
7. [Features We Will Not Build](#7-features-we-will-not-build)
8. [The Mobile Companion App](#8-the-mobile-companion-app)
9. [Identity, Trust, and Reputation](#9-identity-trust-and-reputation)
10. [Content Policy and Moderation](#10-content-policy-and-moderation)
11. [Payments Architecture](#11-payments-architecture)
12. [Business Model and Monetization](#12-business-model-and-monetization)
13. [Infrastructure and Technical Reality](#13-infrastructure-and-technical-reality)
14. [Go-to-Market Strategy](#14-go-to-market-strategy)
15. [Competitive Differentiation](#15-competitive-differentiation)
16. [Making Value Visible to Users](#16-making-value-visible-to-users)
17. [What This Project Is and Is Not](#17-what-this-project-is-and-is-not)
18. [Open Questions and Future Considerations](#18-open-questions-and-future-considerations)
19. [Decision Log](#19-decision-log)

---

## 1. Executive Summary

This document describes the complete product design concept for a local-first, privacy-respecting, transaction-focused marketplace platform. The goal is to occupy the unclaimed territory between Craigslist (too anonymous, no payments, outdated UX) and Facebook Marketplace (too identity-invasive, algorithmically manipulated, ad-driven).

The platform is not attempting to disrupt or replace either incumbent at scale. It is building a values-aligned alternative for a specific, underserved, and growing constituency of users who find both existing options inadequate for reasons of privacy, trust, or user experience.

The north star competitive target is **Craigslist** — not Facebook Marketplace. Matching Craigslist's utility and local liquidity, with integrated payments and a modern mobile-first UX, is the minimum viable win condition. Everything beyond that is measured growth.

The Facebook Marketplace feature set is not a competing target — it is a **UX reference**. The modern listing experience, structured categories, in-app messaging, and offer flow that Facebook Marketplace pioneered are grafted onto a Craigslist philosophy. That combination — Facebook's UX quality on top of Craigslist's operating principles — is the product's core superpower and its primary differentiation from every existing competitor.

---

## 2. The Problem We Are Solving

### The Craigslist Problem
Craigslist defined local online commerce and still commands approximately 140 million monthly visits worldwide as of 2025. Its endurance is proof that demand for simple, local, unencumbered classifieds is real and durable. But Craigslist has critical, unresolved failures:

- **No integrated payments.** Every transaction requires a cash meetup with a stranger, creating anxiety, friction, and safety concerns that suppress transaction completion.
- **Unstructured listings.** Free-text descriptions with inconsistent photo quality produce poor buyer experiences and slower sales.
- **No mobile-first experience.** The interface was designed for desktop browsers in the early 2000s and has not materially evolved.
- **Anonymity without accountability.** The complete anonymity model enables scams with no recourse mechanism.

### The Facebook Marketplace Problem
Facebook Marketplace solved some of Craigslist's problems but introduced a different set that are arguably worse:

- **Real identity requirement.** Transacting on Facebook Marketplace requires a Facebook account, meaning users surrender their social graph, browsing history, and behavioral data to Meta as a condition of buying or selling locally.
- **Algorithmic feed manipulation.** Listings are ranked by engagement signals, not by relevance to the buyer. This creates pay-to-play pressure and distorts discovery.
- **Surveillance capitalism business model.** The platform's revenue comes from advertising, which requires behavioral tracking, data harvesting, and engagement optimization — all of which are structurally at odds with user interests.
- **Social network entanglement.** Marketplace is embedded in a social network, meaning its trajectory is governed by social network incentives rather than marketplace utility incentives.

### The Gap
No current platform offers:
- Pseudonymous identity (not fully anonymous, not real-identity)
- Integrated, frictionless payments
- Local-first discovery without algorithmic manipulation
- Modern mobile UX for listing creation
- A business model that does not require advertising or data monetization

This gap is real. It has remained unfilled not because nobody identified it, but because filling it requires resisting monetization shortcuts that most platforms eventually accept under investor pressure. This project's primary commitment is to that resistance.

---

## 3. Core Philosophy

Three principles govern every product decision. When a proposed feature conflicts with any of these, the feature is rejected, not the principle.

### Principle 1: Utility Over Engagement
The platform is a tool, not a destination. Users should accomplish their goal — buying or selling something locally — and leave. Time-on-platform is not a success metric. Transactions completed is the only success metric that matters. Every feature is evaluated against whether it helps transactions complete, not whether it keeps users on the platform longer.

### Principle 2: Pseudonymity Over Identity
Users need enough identity to establish transactional trust. They do not need to surrender more than that. A verified phone number and a verified payment method are sufficient for trust. Real names, social graphs, profile photos, and browsing history are not required and will not be collected.

### Principle 3: Local Liquidity Over Algorithmic Reach
The magic of a local marketplace is the "I can go pick this up today" quality. This only works when listings are genuinely local and discovery is based on proximity and recency, not algorithmic scoring. Geographic constraint is a feature, not a limitation.

### The Business Model Corollary
The platform charges for utility, not attention. It monetizes the transaction, not the user. It never monetizes behavior, identity, or data. This is not a philosophical preference — it is a structural commitment that protects the three principles above. An ad-supported business model makes all three principles economically impossible to maintain.

---

## 4. The Competitive Landscape

### Craigslist
**Strengths:** Massive existing liquidity, universal brand recognition, genuine local focus, free listings, no identity requirements.
**Weaknesses:** No payments, no mobile app, unstructured listings, outdated UX, anonymity-enabled scams, no fraud recourse.
**Our relationship to it:** Primary competitive target. We are Craigslist with payments and a modern UX, operating under the same philosophy.

### Facebook Marketplace
**Strengths:** Enormous user base, integrated payments (in some markets), modern UX, structured listings, in-app messaging.
**Weaknesses:** Requires Meta account and social graph surrender, algorithmic feed, ad-driven business model, surveillance capitalism infrastructure, national drift away from local focus.
**Our relationship to it:** UX reference only. We borrow its interface innovations but reject its operating model entirely.

### OfferUp
**Strengths:** Modern mobile-first UX, local focus, in-app messaging, user rating system, OfferUp Pay integration.
**Weaknesses:** Has already compromised the vision it started with. Promoted listings exist. Algorithmic feed ranking exists. Acquired by private equity with incentives pointing toward further monetization compromise. Shipping drift is pulling it away from local-first.
**Our relationship to it:** The cautionary tale. OfferUp is the product this project is trying to be — and stopped being. Its trajectory is the failure mode we are explicitly designing against.

### Mercari
**Strengths:** Clean UX, strong payment integration, good buyer protections.
**Weaknesses:** Drifted to national/shipping-first, effectively abandoned local marketplace positioning.
**Our relationship to it:** Not a direct competitor. Different product category now.

### Nextdoor
**Strengths:** Genuinely local, community trust model.
**Weaknesses:** Social network with classifieds bolted on. Wrong priority ordering for our purposes.
**Our relationship to it:** Minimal overlap. Different product philosophy.

### The Honest Assessment
The incumbents collectively cover the functional needs for most users. Most people will sell their couch on Facebook Marketplace or Craigslist and find it tolerable enough. The target user for this platform is not the median user — it is the user who finds the existing tradeoffs genuinely unacceptable, not merely inconvenient. That user exists in meaningful and growing numbers, but they are a specific constituency, not the mass market. This platform should be built with that understanding, not with delusions about displacing Facebook.

---

## 5. Product Vision

A local-first, pseudonymous, transaction-focused marketplace where:

- Anyone can list items for sale in under 60 seconds from a phone
- Buyers discover listings by proximity and recency, with no algorithmic interference
- Payments happen inside the app, so physical meetups involve no cash and no exchange of personal contact information
- Neither buyers nor sellers need a social media account, a real name, or any identity beyond a verified phone number and payment method
- The platform makes money only when transactions succeed
- Photos are ephemeral, listings expire, and nothing accumulates into a permanent behavioral profile

The experience should feel like the best version of Craigslist that Craigslist never built — with the UX quality of Facebook Marketplace but none of its surveillance infrastructure.

---

## 6. Must-Have Features

### 6.1 Pseudonymous-but-Accountable Identity

Users have a persistent handle — not a real name, not a social profile, not a linked social account. The handle is tied to:

- A verified phone number (SMS verification at signup)
- A verified payment method (via Stripe)

This is the minimum identity floor required for transactional trust. Nothing more is collected or displayed. There is no profile page, no avatar requirement, no real name field.

**What this achieves:** Trust without surveillance. Accountability without identity exposure.

### 6.2 Structured Listings

Each listing contains exactly:

- Title (AI-generated from photo, user-editable)
- Price
- Category
- Up to 5 photos (see Section 8 for AI-assisted photo flow)
- Optional attributes (condition, size, color, etc., determined by category)
- Location radius (not exact address)
- Description (AI-generated from photo, user-editable)

Nothing else. No hashtags. No tags. No "story" field. No boost option. No featured flag.

**Photo limit rationale:** 5 photos per listing is sufficient for any honest representation of an item. More photos increase storage and moderation costs without proportional buyer benefit. Forced curation produces better listings.

### 6.3 Local-First Discovery

- Default search radius: 5–25 miles (user-configurable)
- Feed sort order: distance (nearest first) + recency (newest first)
- No algorithmic ranking variables of any kind
- Geographic expansion only when user explicitly widens the radius
- The sort order is **labeled visibly in the UI** ("Sorted by: Nearest first, newest first. Always.") — this is a trust feature, not just a UI label

### 6.4 In-App Payments via Stripe (Phase 1)

- Payment is the default transaction path, not an optional add-on
- Buyers pay inside the app before pickup
- Sellers receive funds upon transaction confirmation
- Neither party ever needs to exchange phone numbers, email addresses, or cash
- Stripe handles compliance, fraud tooling, chargeback handling, and licensing
- Platform never holds funds in a proprietary wallet

**The emotional value:** "Get paid before they show up." This single capability resolves the primary anxiety of local marketplace transactions and is the platform's most immediately felt differentiator.

**Phase 2 payment rail note:** Once the platform reaches meaningful transaction volume, payment rail options (FedNow, RTP, bank-to-bank) will be evaluated to improve margin. This is a destination, not a starting point. See Section 11.

### 6.5 Ephemeral Messaging

In-app messaging for buyer-seller communication with the following constraints:

- Messages auto-expire 7 days after listing closure or expiry
- No group chats
- No media sharing except listing photos already on the platform
- No profile browsing from within a message thread
- No "online now" or "last seen" indicators
- Message threads are scoped to a specific listing, not to a user relationship

**What this prevents:** The platform becoming a communication network. Messaging is a transaction-completion tool, not a social feature.

### 6.6 Listing Lifecycle

- Listings expire after 7 days
- Photos are deleted at listing expiry or sale confirmation, whichever comes first
- Sellers can relist expired listings (creates a new listing, not a bump)
- "Mark as sold" closes the listing and triggers photo deletion
- No indefinite parking of listings

**Rationale:** Ephemeral listings create urgency to transact honestly. They also bound storage costs, reduce moderation surface area, and prevent the platform from accumulating a behavioral archive of user activity.

### 6.7 Basic Safety Layer

Minimum viable fraud and safety infrastructure:

- Verified phone number at signup
- Verified payment method via Stripe (inherits Stripe's fraud detection)
- Device fingerprinting
- Rate limits on listing creation
- Automated content moderation at photo upload (see Section 10)

**What is explicitly excluded:** Social graph-based fraud scoring, behavioral tracking, ad-tech profiling, cross-platform data sharing. These are surveillance capitalism tools dressed as safety features. The Stripe-provided fraud layer is sufficient for Phase 1.

### 6.8 Seller Tools

The complete seller toolset for free-tier users:

- Create and manage listings
- View listing status (active, expired, sold)
- Mark as sold
- Relist expired listings
- Respond to messages within listing threads
- Edit listing details after posting

Nothing more. No storefront. No brand page. No analytics dashboard (free tier). No inventory management (free tier).

---

## 7. Features We Will Not Build

These are not deferred features. They are permanent exclusions. Each one has been evaluated and rejected for structural reasons, not resource reasons.

### 7.1 Social Graph
No friends, no followers, no mutual connections, no "people you may know." Adding a social graph transforms the platform into Facebook Marketplace Lite and compromises Principle 2 (pseudonymity) irreversibly.

### 7.2 Algorithmic Feed
No "recommended for you," no engagement ranking, no boosting, no personalization beyond location. Algorithmic feeds create spam, manipulation, pay-to-play dynamics, and addictive UX. They also require behavioral data collection to function, which violates the business model corollary.

### 7.3 Comments, Likes, or Reactions
These are social network primitives. They create moderation burdens, toxicity, and discourse where the platform needs transactions. A marketplace needs buyers and sellers to communicate with each other about specific items, not to perform for an audience.

### 7.4 Public Seller Profiles
Seller profiles are pseudonymous, minimal, and private. A browsable public profile page — even one scoped to current active listings — creates a de facto identity surface. Aggregated listing history reveals life stage, neighborhood, financial situation, and behavioral patterns even without a real name attached. The only listing visibility available is: within an active message thread, a buyer can see other current listings from the same seller. Not history. Not completed sales. Just live listings, in context.

### 7.5 Ads, Boosts, or Sponsored Listings
This is the single most important exclusion. Advertising forces engagement optimization, algorithmic feeds, surveillance infrastructure, and dark patterns. It makes the three core principles economically impossible to maintain. The platform will not carry ads in any form, and promoted or boosted listings will not exist. This is not a policy that can be reversed by a board decision — it needs to be architecturally absent from the feed ranking function.

### 7.6 Groups, Communities, or Forums
No niche communities, no local groups, no discussion forums. These metastasize into Reddit/Facebook clones and require moderation infrastructure that has nothing to do with local commerce.

### 7.7 Social Notifications
Notifications are scoped exclusively to transactional events:
- Message received
- Offer received
- Payment completed
- Listing expiring soon

No "X viewed your listing," no "Y is interested in your item," no activity feeds, no engagement notifications.

### 7.8 Reputation Scores or Transaction History Counts
A displayed transaction count or completion rate ("Sold 34 times, 97% completion rate") sounds trust-building but creates a persistent identity fingerprint that accumulates over time. A seller with 200 completed transactions is meaningfully identifiable without a name. It also disadvantages new sellers relative to established ones, distorting the market dynamics. 

**What we use instead:** Binary trust badges. Verified phone (✓) and verified payment method (✓). These confirm the person is real and can transact, without accumulating a behavioral profile.

### 7.9 Shipping
Local-first means local. Shipping pulls the product toward national marketplace positioning, which defeats the "I can pick this up today" quality that is the core value proposition. Shipping may be evaluated in later phases for specific high-value categories, but it is not a Phase 1 feature and is not a target.

---

## 8. The Mobile Companion App

The mobile app is not just a responsive version of the web product. It is the **primary listing creation channel** and a core product differentiator.

### 8.1 The Listing Creation Flow

The target listing creation experience:

1. User opens app and taps "Sell"
2. Camera opens directly
3. User photographs the item (up to 5 photos)
4. AI processes photos immediately:
   - Generates a title ("2019 Trek FX3 Fitness Bike, black, 54cm frame")
   - Generates a description (condition, notable features, visible wear)
   - Suggests a category
   - Suggests a price range based on comparable listings (optional, can be dismissed)
5. User reviews AI output, edits anything that is inaccurate
6. User confirms price, location radius, and posts
7. Listing is live

**Target time from tap to live listing: under 60 seconds.**

This is the flywheel ignition point. More listings mean more liquidity. More liquidity means more buyers. Lower friction on listing creation directly drives supply, which drives the whole marketplace.

### 8.2 AI Photo Processing

The AI layer serves two simultaneous functions:

**Function 1 — Listing generation:** A vision model examines the photos and generates a title, description, and category suggestion. The model needs to be reliable across the category mix of a local marketplace: furniture, electronics, clothing, bicycles, tools, baby gear, kitchen equipment, musical instruments.

**Function 2 — Content moderation:** The same image ingestion pipeline runs automated content safety classification before the listing is created. See Section 10.

**Implementation approach:** Vision model for generation (GPT-4V, Claude, or equivalent via API), plus commodity content safety classifier (AWS Rekognition, Google Cloud Vision, or Azure Content Moderator) for moderation. These are separate API calls with separate cost structures.

**Known limitation:** AI-generated descriptions will occasionally be confidently wrong — misidentifying a product, suggesting a condition inconsistent with the photos, or generating a plausible-sounding but inaccurate model number. The edit step must be prominent and feel like ownership, not rubber-stamping. Sellers must feel responsible for their listing content. A single bad AI-generated listing that causes a transaction dispute will damage trust in the feature faster than it was built.

### 8.3 Desktop Listing Creation

Desktop listing creation is supported. Users can upload photos, enter listing details manually, and post from any browser. The AI-assisted flow is available on desktop as well. Desktop is not the primary experience but it is fully functional.

### 8.4 Photo Constraints

- Maximum 5 photos per listing
- Photos are deleted at listing expiry or sale confirmation, whichever comes first (7-day maximum retention)
- No photo editing tools inside the app (use the phone's native camera app for that)
- Photos are served via CDN with standard compression and thumbnail generation

---

## 9. Identity, Trust, and Reputation

### 9.1 The Identity Model

**What we collect:**
- A user-chosen pseudonymous handle
- A verified phone number
- A verified payment method (via Stripe)
- Device fingerprint (for fraud rate-limiting, not for behavioral profiling)

**What we do not collect:**
- Real name
- Email address (phone verification only)
- Social media account linkage
- Location beyond listing-level radius
- Browsing or behavioral history
- Any data that can be sold to or shared with advertisers

### 9.2 Trust Signals Displayed to Other Users

Two binary badges, nothing more:

- **Phone verified** ✓ — the user completed SMS verification
- **Payment verified** ✓ — the user has a working payment method on file via Stripe

No transaction count. No completion rate. No review score. No star rating. No text reviews. These have been evaluated and rejected — see Section 7.8 and the decision log in Section 19.

### 9.3 Seller Visibility to Buyers

Within an active message thread on a specific listing, a buyer can see other **currently active** listings from the same seller. This is the only cross-listing seller visibility in the product. No listing history. No completed sales. No profile page. No browsable seller page.

This scoped visibility serves a legitimate utility need (the buyer of a couch might also want the seller's coffee table) without creating a persistent identity surface.

---

## 10. Content Policy and Moderation

### 10.1 Prohibited Content

- Sexual or explicit content of any kind
- Content involving minors in any unsafe context
- Weapons, firearms, or ammunition (may be revisited by jurisdiction in later phases)
- Illegal goods or services of any kind
- Stolen goods
- Hate speech or content targeting protected groups
- Personal information of third parties

### 10.2 Automated Moderation at Ingestion

Every photo is run through an automated content safety classifier at upload, before the listing is created. This is a blocking step — the photo does not proceed to listing creation if it fails classification.

The classifier checks for:
- Nudity and explicit sexual content
- Graphic violence
- Weapons
- Known CSAM hashes (via PhotoDNA or equivalent)

Implementation via commodity API (AWS Rekognition, Google Cloud Vision, or Azure Content Moderator). Cost is fractions of a cent per image at current pricing. At 5 photos per listing and 50,000 listings per month (a meaningful scale milestone), this is a manageable and predictable cost line.

### 10.3 Description Moderation

AI-generated descriptions are reviewed by a prompt-based check before they are presented to the user, catching attempts to list prohibited items through the description channel. User-edited descriptions are subject to keyword-based screening on submission.

### 10.4 Human Review Queue

Automated moderation handles the majority of cases. A human review queue handles:
- Items flagged by the classifier that require judgment
- User reports of active listings
- Appeal of rejected listings

At early scale, human review is manageable with a small trust and safety function. This is a staffing commitment that needs to be planned for, not an afterthought.

### 10.5 The 7-Day Photo Deletion Policy as a Moderation Advantage

Photos are deleted at listing expiry or sale confirmation. This bounds the moderation surface area to a rolling 7-day window rather than a permanent archive. Less retained content means less ongoing moderation exposure. This is simultaneously a cost decision, a privacy commitment, and a moderation simplification.

---

## 11. Payments Architecture

### 11.1 Phase 1: Stripe Integration

**Why Stripe:** Using Stripe as the payment processor means the platform is not a money transmitter. Stripe holds that regulatory status. The platform inherits:

- Money transmitter licensing (Stripe's, not ours)
- Fraud detection and scoring
- Chargeback handling
- Identity verification (Stripe Identity, available as an add-on)
- Instant payouts (Stripe feature, surfaces as a convenience option)
- Escrow-like fund holding (Stripe feature)

**What this means for development:** Payment integration is an API project, completable by a competent developer in weeks, not months. The regulatory complexity that would attend building on payment rails directly is entirely bypassed in Phase 1.

**Stripe's cost:** Approximately 2.9% + $0.30 per transaction. This is a cost, not a revenue line. It is absorbed into the platform transaction fee.

### 11.2 Transaction Fee Structure

| Sale Price | Platform Fee | Stripe Cost (approx.) | Platform Net |
|---|---|---|---|
| $5 | $1.00 (floor) | ~$0.45 | ~$0.55 |
| $10 | $1.00 (floor) | ~$0.59 | ~$0.41 |
| $20 | $1.00 (floor) | ~$0.88 | ~$0.12 |
| $50 | $2.50 (5%) | ~$1.75 | ~$0.75 |
| $100 | $5.00 (5%) | ~$3.20 | ~$1.80 |
| $200 | $10.00 (5%) | ~$6.10 | ~$3.90 |

**The $1.00 floor fee** exists because Stripe's base fee ($0.30) makes sub-$20 transactions economically marginal or negative without it. The floor is disclosed clearly. For very low-value items (under $10), cash at pickup is presented as an equally valid option — this is consistent with Craigslist DNA and costs the platform nothing.

**The minimum transaction** for processed payments should be considered at $10. Below $10, the economics do not support payment infrastructure and cash is a more sensible option for both parties.

### 11.3 Phase 2: Payment Rail Evaluation

Once the platform reaches meaningful transaction volume (suggested threshold: $1M+ in annual GMV), payment rail options should be evaluated:

- FedNow (instant bank-to-bank, $0.045 per transaction)
- RTP (Real-Time Payments network)
- ACH with same-day settlement
- Stripe custom pricing negotiation

At that volume, Stripe will also negotiate custom rates. The Phase 2 goal is margin improvement, not necessarily leaving Stripe. The decision should be driven by actual numbers at that time, not by architecture preference now.

**The payment rail complexity deferred in Phase 1 is complexity that may never need to be faced** if Stripe rates prove acceptable at the platform's natural transaction size distribution.

---

## 12. Business Model and Monetization

### 12.1 The Core Principle

Charge for utility, not attention. Monetize the transaction, not the user. Never monetize behavior, identity, or data.

### 12.2 Revenue Streams

**Stream 1 — Transaction fees (primary revenue, the backbone)**

A percentage fee on completed transactions with a floor, as detailed in Section 11.2. This is the only mandatory revenue mechanism. It aligns platform incentives with user outcomes: the platform makes money only when users succeed.

**Stream 2 — Optional convenience features (secondary, passive)**

Functional utilities that cost more than the base experience, without distorting discovery or creating pay-to-win dynamics:

- Instant payout: +$1.00 (Stripe Instant Payout, passed through with margin)
- Identity verification badge: one-time $2–5 (Stripe Identity, passed through with margin)

These are optional. Most users will never need them. They do not affect listing visibility, feed ranking, or any marketplace dynamic.

**Stream 3 — Paid seller tiers (tertiary, for power users)**

Two tiers above the free baseline, available for users who hit the listing cap and need more throughput:

| Feature | Free | Seller Plus ($4.99/mo) | Seller Pro ($14.99/mo) |
|---|---|---|---|
| Active listings | 10 | 25 | Unlimited |
| Bulk listing tools | ✗ | ✓ | ✓ |
| Auto-relist on expiry | ✗ | ✓ | ✓ |
| Listing analytics | ✗ | Basic | Full |
| CSV/inventory import | ✗ | ✗ | ✓ |
| Priority support | ✗ | ✗ | ✓ |
| Feed ranking effect | None | None | None |

**Critical:** Neither paid tier affects discovery, feed ranking, or listing visibility in any way. This is stated plainly on the pricing page: "Your listings appear in the same feed, sorted the same way, regardless of your tier." This sentence is a trust anchor and must be permanently visible.

Estimated 1–3% of users will use paid tiers. They fund a disproportionate share of infrastructure.

**Stream 4 — Local business listings (deferred to Phase 2)**

Local businesses already use Craigslist, OfferUp, and Facebook Marketplace as inventory listing channels. A clean, non-social, non-ad-driven business listing option at $20–50/month is a legitimate revenue opportunity — but it requires a sales and support motion that a Phase 1 team does not have bandwidth for. Businesses churn when results aren't immediate, require customer service, and have varying technical sophistication. This stream should emerge organically from observed behavior at scale, not be launched as a Phase 1 product line.

### 12.3 What the Platform Will Never Do

- Carry advertising of any kind
- Offer promoted or boosted listings
- Sell user data or behavioral profiles
- Charge subscription fees to normal (non-power) users
- Take a revenue share from third-party services
- Introduce any monetization mechanism that affects feed ranking or listing discovery

These are permanent exclusions, not deferred decisions.

### 12.4 The Early-Stage Bridge Problem

The honest gap in the business model: transaction fees and paid tiers require meaningful scale to generate operating revenue. In the first 12–18 months before scale is reached, the platform needs funding that does not create incentive distortions.

Options, in order of preference:
- Founder-funded bootstrapping with a lean team
- Angel investment from investors who understand and accept the philosophical constraints
- Pre-seed venture with explicit agreement that ad revenue and algorithmic promotion are permanently off the table

The single greatest existential risk to the vision is not competition — it is a VC board asking at Series B why promoted listings revenue is being left on the table. That conversation has ended the principles of every idealistic marketplace that reached growth stage. The capitalization strategy must account for this from the first check.

---

## 13. Infrastructure and Technical Reality

### 13.1 Core Infrastructure Components

| Component | Purpose | Tooling Options |
|---|---|---|
| Object storage | Photos, thumbnails | AWS S3, Cloudflare R2, Backblaze B2 |
| CDN | Fast image delivery globally | Cloudflare, CloudFront |
| Database | Listings, messages, user accounts | PostgreSQL (primary), Redis (cache) |
| Search index | Listing discovery by location + recency | Meilisearch, OpenSearch, Typesense |
| Messaging backend | In-app buyer-seller communication | Custom WebSocket or third-party (e.g. Stream) |
| API gateway + compute | Application serving | AWS, GCP, Railway, Render |
| Monitoring + logging | Operational visibility | Datadog, Grafana, or equivalent |
| Content moderation API | Photo safety classification | AWS Rekognition, Google Cloud Vision |
| AI vision API | Listing title/description generation | Anthropic API, OpenAI API |
| Payments | Transaction processing | Stripe |

### 13.2 Estimated Infrastructure Costs at Scale

At 100,000 monthly active users, 50,000 listings/month, 1M images (rolling 7-day window), 500,000 messages/month:

**Estimated monthly infrastructure cost: $3,000–$8,000**

This is a well-architected, lean stack. It is not cheap, but it is predictable and bounded. The 7-day photo deletion policy keeps the object storage footprint as a rolling cap rather than an ever-growing archive.

### 13.3 The 7-Day Photo Window — Storage Math

If 50,000 listings are created per month with 5 photos each, and average compressed image size is 500KB:

- Images per day: ~8,300 listings × 5 photos = 41,500 images
- Storage footprint: 41,500 × 500KB × 7 days = ~145GB rolling

At Cloudflare R2 pricing (~$0.015/GB/month), that is approximately $2.18/month in storage. CDN egress is the larger cost variable and depends on buyer browse behavior. This is manageable and predictable.

### 13.4 Technical Team Requirements (Phase 1)

Minimum viable team to build Phase 1:

- 1–2 full-stack engineers (web platform + API)
- 1 mobile engineer (iOS primary, Android secondary or cross-platform via React Native/Flutter)
- 1 designer (UX/UI, mobile-first)
- 1 founder/operator handling product, marketing, and trust & safety

This is a small team build. The technical complexity is real but not novel. No unsolved engineering problems exist in this stack.

---

## 14. Go-to-Market Strategy

### 14.1 The Only Variable That Matters

The cold start problem — needing sellers to attract buyers and buyers to attract sellers — is the only problem that actually kills otherwise sound local marketplace products. It is not solved by good architecture, clean philosophy, or AI photo features. It is solved by unglamorous, grinding local market activation.

A marketplace with 50 listings in a city feels dead. Users arrive, see sparse inventory, leave, and don't return. First impressions of emptiness are nearly impossible to recover from.

A marketplace with 500 listings in a city feels alive. Transactions happen, word spreads, the flywheel starts.

The distance between 50 and 500 listings is entirely marketing. Not product.

### 14.2 Phase 1: Win One City

**Do not launch nationally. Do not launch regionally. Launch in one city.**

Target criteria for the first city:
- Population 500,000–2,000,000 (large enough for liquidity, small enough to activate)
- Strong local identity (residents identify with the city, not just the metro)
- Existing Craigslist usage that signals unmet demand
- Active local subreddits and neighborhood communities for organic reach
- Not New York, not LA — too fragmented and expensive to crack early

Good candidate cities: Milwaukee, Columbus, Raleigh, Salt Lake City, Austin, Louisville, Richmond, Boise.

**The win condition for Phase 1:** Enough active listings in one city that a buyer searching within 10 miles finds at least 20–30 relevant results in any major category. That threshold makes the platform feel alive.

### 14.3 Phase 1 Activation Tactics

**Tactic 1 — Direct Craigslist seller outreach**

Identify the 50–100 most active Craigslist sellers in the target city. Reach them individually with a human message, not bulk email. Offer: no transaction fees for the first 6 months, a direct line to the founding team, and a concrete explanation of why this is better (payments, no cash meetups). These early power sellers are the supply foundation.

**Tactic 2 — Local subreddit presence**

Be genuinely present in r/[cityname] and relevant local subreddits. Not spammy or promotional — present with real answers to real frustrations. When someone posts "got scammed on Craigslist again," that is an activation moment. When someone posts "I hate that I have to have Facebook to use Marketplace," that is an activation moment. Show up with a real alternative.

**Tactic 3 — Neighborhood and community channels**

NextDoor (ironic but effective), local Facebook groups, university off-campus housing boards, church rummage sale organizers, local buy-nothing groups. Reach these communities as a participant, not an advertiser.

**Tactic 4 — The message that does the work**

The platform's values are marketing. "No account linking. No social graph. No ads. Just buy and sell locally." This message resonates immediately with the target user who has already been burned by the alternatives. They are pre-sold. They just need to know the alternative exists.

### 14.4 Phase 2: Adjacent City Expansion

Once the first city has real liquidity — sustained transaction volume, organic word of mouth, repeat users — expand to adjacent metros with the same playbook. The growth lever is **geographic, not feature-driven.**

Resist the temptation to add features to accelerate growth. Feature additions to solve liquidity problems is how vision drift begins. Every new city should launch with exactly the same product as the first city. Consistency is proof that the model scales.

### 14.5 The North Star Metric

**Transactions completed per active city, per month.**

Not users registered. Not listings posted. Not sessions. Transactions. Everything else is a leading indicator for this number.

---

## 15. Competitive Differentiation

### 15.1 Why Existing Competitors Cannot Follow

The platform's differentiation is not based on features they lack. It is based on **structural commitments they cannot make without dismantling their existing business models.**

- **OfferUp** cannot remove promoted listings without losing a revenue stream already baked into investor expectations.
- **Facebook Marketplace** cannot remove the social graph without dismantling its core product and surveillance infrastructure.
- **Mercari** cannot go local-first without abandoning the national shipping infrastructure it has spent years building.
- **Craigslist** cannot add modern UX and payments without organizational change it has shown no interest in making.

The platform is not competing on features. It is competing on **structural integrity** — and the competition structurally cannot follow without destroying what they have already built.

### 15.2 The Four Concrete Differentiators

**Differentiator 1 — Payment integration as a first-class feature**
No existing local marketplace has made in-app payment the default and expected path for local transactions. OfferUp Pay exists but is underused. Craigslist has nothing. Facebook Marketplace payments require Meta account. The anxiety of a cash meetup with a stranger is real and universal. Eliminating it is the most immediately felt product improvement in this space.

**Differentiator 2 — No promoted listings, structurally**
Not as a policy. As an architectural absence. The feed ranking function has no paid variable. This can be stated and demonstrated. No competitor can make this claim credibly.

**Differentiator 3 — Pseudonymous identity as a genuine commitment**
OfferUp nudges toward real identity. Facebook requires it. Craigslist's full anonymity enables scams. The pseudonymous middle path — verified but not identified — is not currently occupied by any serious player.

**Differentiator 4 — Local-first as a hard constraint**
Not a default that algorithms override. Not a preference that shipping bypasses. A hard product constraint that forces the platform to solve the harder, more valuable local problem. This constraint is the reason the product has the "I can go get this today" quality that makes local marketplaces magic.

### 15.3 The One-Sentence Positioning

**OfferUp became what it competed against. This is the product it stopped being — and the competition cannot follow back there without tearing themselves apart.**

---

## 16. Making Value Visible to Users

### 16.1 The Core Problem

Most of the platform's value is defined by what is *absent*. No ads. No algorithmic manipulation. No data harvesting. No social graph. Absence is nearly impossible to market because users cannot experience something that is not there.

### 16.2 The Hierarchy of Felt Value

In descending order of how immediately users will feel the platform's value:

**Level 1 — Payment safety (felt immediately, requires no explanation)**
"Get paid before they show up." This resolves a real, physical anxiety that every local marketplace user has experienced. No explanation required. No philosophy required. Just relief.

**Level 2 — No ads on screen (visible in the first session)**
A screen with no ads communicates itself, by contrast with every alternative. A single line of copy reinforces it: "No ads. Ever. We make money when you do."

**Level 3 — Feed transparency (noticed by a subset, deeply valued by them)**
The visible label on the browse screen — "Sorted by: Nearest first, newest first. Always." — communicates the anti-algorithm stance to anyone who has been burned by algorithmic manipulation. They will notice it and understand what it means.

**Level 4 — Pseudonymous identity (appreciated most in retrospect)**
The privacy commitment is the hardest to feel directly. It is most appreciated by users who already consciously care about it, and by everyone in retrospect when they realize they transacted successfully without surrendering their real name or social account.

### 16.3 Marketing the Absence

**Don't say:** "We protect your privacy with pseudonymous identity architecture."
**Do say:** "Sell your stuff. Keep your life private."

**Don't say:** "Our feed uses distance and recency ranking without algorithmic variables."
**Do say:** "No algorithm decides who sees your listing. Nearest buyers see it first. That's it."

**Don't say:** "We've implemented a values-aligned monetization model."
**Do say:** "We make money when you sell something. Not by watching what you click."

### 16.4 The Defector Story

The most credible voice for the platform's values is not the platform — it is a user who left Facebook Marketplace or got burned by Craigslist and found a better experience here. That story, told authentically in local communities, carries more weight than any positioning statement.

Early user experience must be good enough that people want to tell the story. This connects the marketing problem back to the activation problem: the goal of Phase 1 activation is not just listing density — it is creating enough successful transactions that organic word of mouth begins carrying the values message without the platform spending money to say it.

---

## 17. What This Project Is and Is Not

### What It Is

A **values-aligned utility** for a specific, underserved constituency of users who find the existing local marketplace options unacceptable for reasons of privacy, trust, or user experience.

The best comparison is a **credit union versus a big bank.** Credit unions do not disrupt banking. They do not replace Chase. But they serve a specific constituency that actively prefers the values-aligned alternative, they are financially sustainable, and they provide genuine utility to real people. Nobody calls credit unions vanity projects.

This platform should be built with that framing — realistic scale expectations, specific city focus, a specific user segment — rather than with the framing of "we are going to disrupt Craigslist and take on Facebook Marketplace."

### What It Is Not

- A moonshot
- A category creator
- A platform for everyone
- A social network with commerce features
- A get-rich-quick startup

### The Vanity Project Risk

Without a credible plan to solve the cold start problem in one specific city, this is a vanity project. The product can be philosophically pure, technically sound, and beautifully designed — and completely empty. An empty marketplace is not a marketplace.

The question that determines whether this is worth pursuing: **Is there a credible path to owning one city's local marketplace before running out of money or motivation?**

If yes: pursue it seriously.
If the honest answer is "we'll launch nationally and see what sticks": do not build this.

### The Honest Competitive Assessment

The platform brings three concrete innovations to a mature space:

1. Integrated payments on a privacy-respecting platform (does not exist today in serious form)
2. AI-assisted listing creation as a first-class mobile experience (execution gap, not technical gap)
3. Structural commitment to no algorithmic feed, provably and permanently (currently unoccupied territory)

These are real. They are not transformative category-defining innovations. They are an integrity gap in an existing market, filled by a product with the discipline to not compromise. That is enough to build a real business — at the right scale, with the right expectations.

---

## 18. Open Questions and Future Considerations

The following have been identified but not resolved. They should not be resolved prematurely.

**Q1: Minimum transaction floor**
Should the platform enforce a $10 minimum for processed payments, directing sub-$10 transactions to cash? Or absorb the thin economics on small transactions for the liquidity benefit? Recommendation: test both approaches in Phase 1 with the first city cohort.

**Q2: Listing cap for free tier**
10 active concurrent listings has been proposed. The exact number should be validated against observed behavior in the first city before being locked in. The principle (generous enough for casual sellers, constraining for power resellers) is more important than the specific number.

**Q3: Cash-at-pickup as a supported flow**
Does the platform support cash transactions at all, or is in-app payment required? Craigslist DNA suggests supporting cash; safety and business model alignment suggest payment-only. A hybrid — payment encouraged, cash acknowledged as an option — may thread the needle without creating friction.

**Q4: Category taxonomy**
What categories does the platform launch with? A narrow initial category set reduces moderation complexity and product scope. A broader set improves liquidity optics. Resolution needed before development begins.

**Q5: Android vs iOS priority**
The mobile companion app should launch on one platform first. iOS users index higher for early adopter behavior and marketplace transaction completion. Android priority would maximize reach in certain markets. This is a market-specific decision.

**Q6: Photo-only vs. text-also listings**
Should the platform allow text-only listings (no photos)? Photos are higher quality and the AI flow depends on them. Text-only listings increase the moderation burden and reduce average listing quality. Recommendation: require at least one photo for all listings.

**Q7: Offer/counteroffer flow**
Facebook Marketplace's offer flow (buyer submits an offer below asking price, seller accepts/declines/counters) is a valuable UX feature. It reduces friction in price negotiation and keeps the conversation inside the platform. This should be in Phase 1 scope.

**Q8: Geographic verification**
Should the platform verify that a seller is actually in the location they claim? IP geolocation is easily bypassed. GPS verification is more reliable but adds friction. Recommendation: soft verification via GPS on the mobile app, no verification on desktop. This is good enough for Phase 1.

---

## 19. Decision Log

A record of significant product decisions made during concept development, with rationale.

| Decision | Chosen Direction | Rejected Alternative | Rationale |
|---|---|---|---|
| Payment architecture Phase 1 | Stripe integration | Building on FedNow/RTP rails directly | Stripe eliminates regulatory complexity, reduces time to market by 12–36 months, inherits compliance and fraud tooling. Payment rail ownership is a Phase 2 destination. |
| Identity model | Pseudonymous handle + phone verification | Real name (Facebook model) or full anonymity (Craigslist model) | Real names violate Principle 2. Full anonymity enables scams with no recourse. Pseudonymous-but-verified is the correct middle path. |
| Reputation system | Binary verified badges only | Transaction count + completion rate display | Transaction counts create persistent identity fingerprints. They also disadvantage new sellers. Binary badges confirm transactability without accumulating a behavioral profile. |
| Seller profile pages | No public profiles; current listings visible in active message threads only | Browsable seller pages | Public seller pages accumulate into de facto identity profiles even without real names. Aggregated listing history reveals life stage, neighborhood, and behavioral patterns. |
| Feed ranking | Distance + recency only, labeled visibly | Algorithmic ranking | Algorithmic ranking requires behavioral data, creates pay-to-play pressure, and violates Principle 1. Distance + recency is the only ranking that aligns platform incentives with user outcomes. |
| Promoted listings | Permanently absent, architecturally | Optional "boost" feature for revenue | Promoted listings distort discovery, create two-tier trust dynamics, and require algorithmic infrastructure that compromises the feed. Revenue is better captured through transaction fees. |
| Photo retention | 7 days maximum, deleted at sale confirmation or expiry | Indefinite retention | Bounds storage costs, reduces moderation surface area, prevents behavioral archive accumulation, and is a marketable privacy commitment. |
| Photo limit | 5 per listing | Unlimited or higher cap | Sufficient for honest item representation. Reduces storage and moderation costs. Forces curation that produces better listings. |
| Listing cap (free tier) | 10 active concurrent listings | No cap / lower cap | Generous enough for genuine casual sellers. Constraining enough for power resellers who should be on paid tiers. Also functions as passive spam/fraud mitigation. |
| Shipping | Not in Phase 1 scope | Available at launch | Shipping abandons local-first positioning and requires fulfillment infrastructure. Solves the wrong problem for Phase 1. |
| Local business tier | Deferred to Phase 2 | Launch as Phase 1 revenue stream | Requires a sales and support motion Phase 1 team cannot sustain. Should emerge from observed organic behavior, not be launched speculatively. |
| Social features (comments, likes, groups) | Permanently absent | Include for engagement | Social features are social network primitives. They compromise all three core principles simultaneously and are not reversible once introduced. |
| Go-to-market approach | Single city, complete focus | National launch | Local marketplace liquidity requires city-level density. National launch spreads activation effort too thin to achieve density anywhere. |
| Ads | Permanently and architecturally absent | Ad-supported model for sustainability | Ads require behavioral tracking, engagement optimization, and algorithmic feeds — all of which make the three core principles economically impossible to maintain. |

---

*Document status: Living document, concept phase. To be updated as development decisions are made.*
*Last updated: Concept development session, June 2026.*
