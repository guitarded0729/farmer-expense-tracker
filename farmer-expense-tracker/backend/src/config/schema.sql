-- ============================================
-- Farmer Expense Tracker — Database Schema
-- ============================================
-- Run this file against your PostgreSQL database to create all tables.
-- Usage: psql -U postgres -d farmer_expense_tracker -f schema.sql

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- FARMERS
-- ============================================
CREATE TABLE IF NOT EXISTS farmers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  farm_name     VARCHAR(255) NOT NULL,
  role          VARCHAR(100) NOT NULL DEFAULT 'Primary Operator',
  category      VARCHAR(255) DEFAULT 'General Agriculture',
  region        VARCHAR(255) DEFAULT 'Unspecified Region',
  scale         VARCHAR(255) DEFAULT 'Standard Farm',
  phone         VARCHAR(50)  DEFAULT '',
  email         VARCHAR(255) DEFAULT '',
  equity_share  NUMERIC(5,2) DEFAULT 100,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_farmers_name ON farmers (name);

-- ============================================
-- SEASONS
-- ============================================
CREATE TABLE IF NOT EXISTS seasons (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  sort_order    INTEGER      NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seasons_order ON seasons (sort_order);

-- ============================================
-- FIELDS
-- ============================================
CREATE TABLE IF NOT EXISTS fields (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id     UUID         NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  name          VARCHAR(255) NOT NULL,
  crop          VARCHAR(255) DEFAULT '',
  area          NUMERIC(10,2) DEFAULT NULL,
  area_unit     VARCHAR(50)  DEFAULT 'acres',
  location      VARCHAR(255) DEFAULT '',
  season_id     UUID         REFERENCES seasons(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fields_farmer ON fields (farmer_id);
CREATE INDEX IF NOT EXISTS idx_fields_season ON fields (season_id);

-- ============================================
-- TRANSACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id           UUID         NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  farmer_id           UUID         NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  type                VARCHAR(20)  NOT NULL CHECK (type IN ('expense', 'income')),
  category            VARCHAR(50)  NOT NULL,
  amount              NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  note                TEXT         DEFAULT '',
  date                DATE         NOT NULL DEFAULT CURRENT_DATE,
  unusual             BOOLEAN      DEFAULT FALSE,
  split_total         NUMERIC(14,2) DEFAULT NULL,
  split_people_count  INTEGER       DEFAULT NULL,
  split_names         VARCHAR(500)  DEFAULT NULL,
  crop                VARCHAR(255)  DEFAULT NULL,
  field_id            UUID          REFERENCES fields(id) ON DELETE SET NULL,
  receipt             TEXT          DEFAULT NULL,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================
-- Safe Migrations for Existing Databases (Transactions)
-- ============================================
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS crop VARCHAR(255) DEFAULT NULL;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS field_id UUID REFERENCES fields(id) ON DELETE SET NULL;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS receipt TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_farmer  ON transactions (farmer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_season  ON transactions (season_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type    ON transactions (type);
CREATE INDEX IF NOT EXISTS idx_transactions_date    ON transactions (date);
CREATE INDEX IF NOT EXISTS idx_transactions_field   ON transactions (field_id);

-- ============================================
-- BUDGETS
-- ============================================
CREATE TABLE IF NOT EXISTS budgets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id     UUID         NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  season_id     UUID         REFERENCES seasons(id) ON DELETE CASCADE,
  category      VARCHAR(50)  NOT NULL,
  amount        NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE(farmer_id, season_id, category)
);

-- ============================================
-- Safe Migrations for Existing Databases (Budgets)
-- ============================================
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS season_id UUID REFERENCES seasons(id) ON DELETE CASCADE;
ALTER TABLE budgets DROP CONSTRAINT IF EXISTS budgets_farmer_id_category_key;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'budgets_farmer_id_season_id_category_key'
  ) THEN
    ALTER TABLE budgets ADD CONSTRAINT budgets_farmer_id_season_id_category_key UNIQUE (farmer_id, season_id, category);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_budgets_farmer ON budgets (farmer_id);
CREATE INDEX IF NOT EXISTS idx_budgets_season ON budgets (season_id);

-- ============================================
-- Auto-update updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['farmers', 'seasons', 'fields', 'transactions', 'budgets'])
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON %I; CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      tbl, tbl
    );
  END LOOP;
END;
$$;

