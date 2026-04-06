-- ============================================================
-- Enhanced Messenger Bot Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- First, drop existing tables to allow for fresh start with different primary keys
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.user_states CASCADE;

-- ── user_states: tracks per-user conversation progress ──────
CREATE TABLE IF NOT EXISTS public.user_states (
  id                  BIGSERIAL PRIMARY KEY,
  psid                TEXT UNIQUE NOT NULL,
  current_step        TEXT NOT NULL DEFAULT 'greeting',
  metadata            JSONB NOT NULL DEFAULT '{}',
  conversation_history JSONB NOT NULL DEFAULT '[]',  -- stores last 20 messages for GROQ context
  is_human_managed    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── leads: completed lead submissions ───────────────────────
CREATE TABLE IF NOT EXISTS public.leads (
  id                  BIGSERIAL PRIMARY KEY,
  psid                TEXT NOT NULL,
  service_type        TEXT,            -- web_development | photography | ai_photography
  full_name           TEXT,
  email               TEXT,
  phone               TEXT,
  -- Web Development fields
  project_type        TEXT,            -- e.g. e-commerce, portfolio, landing page
  page_count          TEXT,            -- e.g. 1-5, 6-10, 10+
  -- Photography fields
  shoot_type          TEXT,            -- e.g. corporate, event, product
  shoot_date          TEXT,
  location            TEXT,
  -- AI Photography fields
  campaign_type       TEXT,            -- e.g. product launch, brand identity
  product_description TEXT,
  -- Shared fields
  timeline            TEXT,
  budget              TEXT,
  extra_notes         TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_states_psid ON public.user_states(psid);
CREATE INDEX IF NOT EXISTS idx_leads_psid ON public.leads(psid);
CREATE INDEX IF NOT EXISTS idx_leads_service_type ON public.leads(service_type);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE public.user_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (used by the Edge Function)
CREATE POLICY "service_role_all_user_states"
  ON public.user_states FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_leads"
  ON public.leads FOR ALL
  USING (auth.role() = 'service_role');
