# KerbDrop

A local-first, pseudonymous, transaction-focused mobile marketplace.

> No ads. No social graph. No algorithmic feed. Just buy and sell locally.

---

## What This Is

KerbDrop marries Craigslist's operating philosophy with Facebook Marketplace's UX quality. It is not a social network. It is a utility for local commerce.

- **Browse without an account.** Location permission is the only prerequisite.
- **Sell with your phone.** Photograph an item, describe it, set a price, post.
- **Pay before you meet.** Stripe Connect lets buyers pay before pickup. No cash anxiety.
- **Privacy by design.** No real name. No social graph. Listings expire in 7 days. Photos deleted automatically.

---

## Monorepo Structure

```
kerbdrop/
├── apps/
│   ├── mobile/          # Expo React Native app (iOS + Android)
│   └── api/             # Express.js backend API
├── packages/
│   └── shared/          # Shared types, schemas, constants, utilities
├── infrastructure/
│   ├── supabase/        # Database migrations
│   ├── cloudflare/      # Tunnel config (dev)
│   └── do/              # DigitalOcean deployment spec
└── docs/
    ├── business-requirements.md
    ├── platform-design-spec.md
    ├── roadmap.md
    └── milestones.md
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | Expo SDK 52, React Native 0.76, React 18 |
| Navigation | React Navigation v7 (component-tree, not file-system) |
| Backend | Express.js + TypeScript |
| Database | Supabase (PostgreSQL + Auth + Realtime) |
| Storage | Cloudflare R2 + CDN |
| Search | Meilisearch |
| Payments | Stripe Connect Express |
| Moderation | AWS Rekognition |
| Monorepo | pnpm workspaces + Turborepo |

---

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 9 (`npm install -g pnpm@9`)
- Expo CLI (`npx expo --version`)
- Docker (optional, for local Supabase)

### Install

```bash
git clone https://github.com/your-org/kerbdrop.git
cd kerbdrop
pnpm install
```

### Environment Setup

```bash
cp apps/api/.env.example apps/api/.env
# Fill in all required values — the API will not start with missing env vars
```

### Run

```bash
# Start API
pnpm dev:api

# Start mobile app (in a separate terminal)
pnpm dev:mobile
```

### Database

```bash
# Apply migrations to your Supabase project
supabase db push --db-url postgresql://...
```

---

## Documentation

| Document | Purpose |
|---|---|
| [Business Requirements](./docs/business-requirements.md) | The why and what — business context, rules, revenue model |
| [Platform Design Spec](./docs/platform-design-spec.md) | The how — architecture, data models, API, UI system |
| [Roadmap](./docs/roadmap.md) | Phased execution plan with acceptance criteria |
| [Milestones](./docs/milestones.md) | Living status tracker for each roadmap phase |

---

## Core Principles

These govern every product and engineering decision. They are not negotiable.

1. **Utility over engagement** — transactions completed is the only success metric
2. **Pseudonymity over identity** — verified phone + Stripe Connect is the identity floor
3. **Local liquidity over algorithmic reach** — distance + recency, always, with no exceptions

---

## License

Private. All rights reserved.
