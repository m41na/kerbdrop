-- KerbDrop initial schema
-- Run via: supabase db push

-- ── Extensions ────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "earthdistance" CASCADE;  -- requires cube
CREATE EXTENSION IF NOT EXISTS "cube";

-- ── Users ─────────────────────────────────────────────────────────────────

CREATE TABLE users (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle              TEXT UNIQUE NOT NULL,
  phone_hash          TEXT UNIQUE NOT NULL,
  phone_verified      BOOLEAN NOT NULL DEFAULT FALSE,
  payment_verified    BOOLEAN NOT NULL DEFAULT FALSE,
  stripe_account_id   TEXT,
  stripe_account_name TEXT,           -- from Stripe Connect, display only
  stripe_account_email TEXT,          -- from Stripe Connect, display only
  device_fingerprints JSONB NOT NULL DEFAULT '[]',
  listing_count       INTEGER NOT NULL DEFAULT 0,
  tier                TEXT NOT NULL DEFAULT 'free'
    CHECK (tier IN ('free', 'plus', 'pro')),
  tier_expires_at     TIMESTAMPTZ,
  is_banned           BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX users_handle ON users(handle);
CREATE INDEX users_stripe ON users(stripe_account_id) WHERE stripe_account_id IS NOT NULL;

-- ── Listings ──────────────────────────────────────────────────────────────

CREATE TABLE listings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title                 TEXT NOT NULL,
  description           TEXT,
  price_cents           INTEGER NOT NULL CHECK (price_cents >= 0),
  category              TEXT NOT NULL,
  condition             TEXT CHECK (condition IN ('new','like_new','good','fair','parts')),
  attributes            JSONB NOT NULL DEFAULT '{}',
  location_lat          DECIMAL(9,6) NOT NULL,
  location_lng          DECIMAL(9,6) NOT NULL,
  location_radius_miles INTEGER NOT NULL DEFAULT 10,
  location_label        TEXT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft','active','sold','expired','removed')),
  photo_count           INTEGER NOT NULL DEFAULT 0,
  ai_generated          BOOLEAN NOT NULL DEFAULT FALSE,
  view_count            INTEGER NOT NULL DEFAULT 0,
  expires_at            TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  sold_at               TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX listings_seller ON listings(seller_id);
CREATE INDEX listings_status_expires ON listings(status, expires_at);
CREATE INDEX listings_created ON listings(created_at DESC);
CREATE INDEX listings_geo ON listings USING GIST (ll_to_earth(location_lat, location_lng));

-- ── Photos ────────────────────────────────────────────────────────────────

CREATE TABLE photos (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id          UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  seller_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  r2_key              TEXT NOT NULL UNIQUE,
  r2_thumb_key        TEXT NOT NULL,
  cdn_url             TEXT NOT NULL,
  thumb_url           TEXT NOT NULL,
  width               INTEGER,
  height              INTEGER,
  size_bytes          INTEGER,
  moderation_status   TEXT NOT NULL DEFAULT 'pending'
    CHECK (moderation_status IN ('pending','approved','rejected')),
  moderation_reason   TEXT,
  sort_order          INTEGER NOT NULL DEFAULT 0,
  delete_at           TIMESTAMPTZ NOT NULL,
  deleted_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX photos_listing ON photos(listing_id, sort_order);
CREATE INDEX photos_pending_deletion ON photos(delete_at) WHERE deleted_at IS NULL;

-- ── Message threads ───────────────────────────────────────────────────────

CREATE TABLE message_threads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id      UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','archived','blocked')),
  last_message_at TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(listing_id, buyer_id)
);

CREATE INDEX threads_buyer ON message_threads(buyer_id, last_message_at DESC);
CREATE INDEX threads_seller ON message_threads(seller_id, last_message_at DESC);

-- ── Messages ──────────────────────────────────────────────────────────────

CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id   UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body        TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'text'
    CHECK (type IN ('text','offer','offer_accepted','offer_declined','system')),
  offer_cents INTEGER,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX messages_thread ON messages(thread_id, created_at ASC);

-- ── Offers ────────────────────────────────────────────────────────────────

CREATE TABLE offers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id   UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  thread_id    UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  buyer_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 100),
  status       TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','declined','expired','withdrawn')),
  expires_at   TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

CREATE INDEX offers_listing ON offers(listing_id);
CREATE INDEX offers_buyer ON offers(buyer_id);

-- ── Notifications ─────────────────────────────────────────────────────────

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN (
    'message_received','offer_received','offer_accepted','offer_declined',
    'payment_completed','listing_expiring_soon','listing_expired'
  )),
  payload     JSONB NOT NULL DEFAULT '{}',
  read_at     TIMESTAMPTZ,
  push_sent_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX notifications_unread ON notifications(user_id) WHERE read_at IS NULL;

-- ── Push tokens ───────────────────────────────────────────────────────────

CREATE TABLE push_tokens (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token        TEXT NOT NULL UNIQUE,
  platform     TEXT NOT NULL CHECK (platform IN ('ios','android')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

CREATE INDEX push_tokens_user ON push_tokens(user_id);

-- ── Updated_at triggers ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Users: read own, update own
CREATE POLICY users_read_own ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_update_own ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY users_read_handle ON users FOR SELECT USING (true); -- handles are public

-- Listings: public read when active, write own
CREATE POLICY listings_public_read ON listings FOR SELECT USING (status = 'active');
CREATE POLICY listings_own_read ON listings FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY listings_own_write ON listings FOR ALL USING (auth.uid() = seller_id);

-- Photos: public read when listing is active
CREATE POLICY photos_public_read ON photos FOR SELECT
  USING (EXISTS (SELECT 1 FROM listings l WHERE l.id = listing_id AND l.status = 'active'));
CREATE POLICY photos_own_write ON photos FOR ALL USING (auth.uid() = seller_id);

-- Threads: participants only
CREATE POLICY threads_participants ON message_threads FOR ALL
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Messages: thread participants only
CREATE POLICY messages_participants ON messages FOR ALL
  USING (EXISTS (
    SELECT 1 FROM message_threads t WHERE t.id = thread_id
    AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
  ));

-- Offers: participants only
CREATE POLICY offers_participants ON offers FOR ALL
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Notifications: own only
CREATE POLICY notifications_own ON notifications FOR ALL USING (auth.uid() = user_id);

-- Push tokens: own only
CREATE POLICY push_tokens_own ON push_tokens FOR ALL USING (auth.uid() = user_id);
