-- LodgeKonnect — Supabase / PostgreSQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query → Paste & Run

-- ── Users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id                      BIGSERIAL PRIMARY KEY,
    full_name               VARCHAR(120)  NOT NULL,
    email                   VARCHAR(180)  NOT NULL UNIQUE,
    phone                   VARCHAR(15)   NOT NULL UNIQUE,
    gender                  VARCHAR(10)   NOT NULL CHECK (gender IN ('male','female')),
    department              VARCHAR(120)  DEFAULT NULL,
    level                   VARCHAR(10)   DEFAULT NULL,
    password                VARCHAR(255)  NOT NULL,
    user_type               VARCHAR(20)   NOT NULL CHECK (user_type IN ('student','caretaker')),
    profile_image           VARCHAR(255)  DEFAULT NULL,
    bio                     TEXT          DEFAULT NULL,
    preferences             JSONB         DEFAULT NULL,
    budget                  DECIMAL(10,2) DEFAULT NULL,
    available_for_matching  VARCHAR(3)    DEFAULT 'no' CHECK (available_for_matching IN ('yes','no')),
    matching_bio            TEXT          DEFAULT NULL,
    session_token           VARCHAR(64)   DEFAULT NULL,
    token_expiry            TIMESTAMPTZ   DEFAULT NULL,
    created_at              TIMESTAMPTZ   DEFAULT NOW(),
    updated_at              TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_token    ON users (session_token);
CREATE INDEX IF NOT EXISTS idx_users_email    ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_phone    ON users (phone);
CREATE INDEX IF NOT EXISTS idx_users_matching ON users (available_for_matching, gender);

-- ── Lodges ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lodges (
    id                BIGSERIAL PRIMARY KEY,
    caretaker_id      BIGINT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lodge_name        VARCHAR(120)  NOT NULL,
    location          VARCHAR(20)   NOT NULL CHECK (location IN ('eziobodo','umuchima')),
    price             DECIMAL(10,2) NOT NULL,
    description       TEXT          DEFAULT NULL,
    room_number       INT           DEFAULT NULL,
    gender_preference VARCHAR(10)   DEFAULT 'any' CHECK (gender_preference IN ('male','female','any')),
    amenities         TEXT          DEFAULT NULL,
    status            VARCHAR(20)   DEFAULT 'active' CHECK (status IN ('active','occupied','unavailable')),
    created_at        TIMESTAMPTZ   DEFAULT NOW(),
    updated_at        TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lodges_location ON lodges (location);
CREATE INDEX IF NOT EXISTS idx_lodges_status   ON lodges (status);
CREATE INDEX IF NOT EXISTS idx_lodges_price    ON lodges (price);

-- ── Lodge Photos ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lodge_photos (
    id         BIGSERIAL PRIMARY KEY,
    lodge_id   BIGINT NOT NULL REFERENCES lodges(id) ON DELETE CASCADE,
    photo_url  VARCHAR(512) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Favorites ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lodge_id   BIGINT NOT NULL REFERENCES lodges(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, lodge_id)
);

-- ── Notifications ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       VARCHAR(40)  NOT NULL,
    title      VARCHAR(120) NOT NULL,
    message    TEXT         NOT NULL,
    is_read    BOOLEAN      DEFAULT FALSE,
    created_at TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, is_read);

-- ── Auto-update updated_at ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at  BEFORE UPDATE ON users  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER lodges_updated_at BEFORE UPDATE ON lodges FOR EACH ROW EXECUTE FUNCTION update_updated_at();
