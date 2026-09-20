/*
# Credere Financing Integration - Real API Integration

## Overview
Replaces the mock/simulated financing module with a real integration to the Credere API.
Creates new tables for Credere simulations, conditions, vehicle mapping, and per-dealer Credere configuration.
Also adds Credere-related fields to existing dealers and clients tables.

## New Tables

1. `credere_dealer_config` — Per-dealer Credere integration settings (store ID, token status)
2. `credere_simulations` — Real Credere simulation records (linked to financing_simulations)
3. `credere_conditions` — Individual bank conditions returned by Credere for a simulation
4. `credere_vehicle_mapping` — Maps CRM vehicles to Credere vehicle model IDs
5. `credere_bank_credentials` — Per-dealer bank credential status for Credere-integrated banks
6. `credere_token_cache` — Securely stores Credere OAuth tokens per dealer (service-role only)

## Modified Tables
- `dealers` — adds `credere_store_id` (text, nullable) for multistore support
- `clients` — adds `credere_lead_id` (text, nullable) and `credere_synced_at` (timestamptz, nullable)
- `financing_simulations` — adds `credere_simulation_uuid` (text, nullable), `provider` (text, default 'credere'), `raw_response` (jsonb, nullable), `licensing_uf` (text, nullable), `licensing_city` (text, nullable), `seller_cpf` (text, nullable)

## Security
- RLS enabled on all new tables, scoped to authenticated users via dealer ownership
- `credere_token_cache` is locked down: only service role can read/write; authenticated users can only see token expiry status
- All policies use `auth.uid()` ownership checks through the `dealers` table

## Notes
1. Existing `financing_institutions` table and `financing_offers` table are NOT dropped — they remain for backward compatibility of old simulations
2. New simulations will use `credere_simulations` + `credere_conditions` tables exclusively
3. Token secrets are NEVER exposed to the frontend — only expiry/refresh status
*/

-- ============================================================
-- 1. Add Credere fields to dealers
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealers' AND column_name = 'credere_store_id') THEN
    ALTER TABLE dealers ADD COLUMN credere_store_id text;
  END IF;
END $$;

-- ============================================================
-- 2. Add Credere fields to clients
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'credere_lead_id') THEN
    ALTER TABLE clients ADD COLUMN credere_lead_id text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'credere_synced_at') THEN
    ALTER TABLE clients ADD COLUMN credere_synced_at timestamptz;
  END IF;
END $$;

-- ============================================================
-- 3. Add Credere fields to financing_simulations
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financing_simulations' AND column_name = 'credere_simulation_uuid') THEN
    ALTER TABLE financing_simulations ADD COLUMN credere_simulation_uuid text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financing_simulations' AND column_name = 'provider') THEN
    ALTER TABLE financing_simulations ADD COLUMN provider text DEFAULT 'credere';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financing_simulations' AND column_name = 'raw_response') THEN
    ALTER TABLE financing_simulations ADD COLUMN raw_response jsonb;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financing_simulations' AND column_name = 'licensing_uf') THEN
    ALTER TABLE financing_simulations ADD COLUMN licensing_uf text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financing_simulations' AND column_name = 'licensing_city') THEN
    ALTER TABLE financing_simulations ADD COLUMN licensing_city text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financing_simulations' AND column_name = 'seller_cpf') THEN
    ALTER TABLE financing_simulations ADD COLUMN seller_cpf text;
  END IF;
END $$;

-- ============================================================
-- 4. credere_dealer_config — per-dealer Credere settings
-- ============================================================
CREATE TABLE IF NOT EXISTS credere_dealer_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  credere_store_id text,
  integration_status text NOT NULL DEFAULT 'not_configured',
  scopes text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(dealer_id)
);

ALTER TABLE credere_dealer_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_credere_config" ON credere_dealer_config;
CREATE POLICY "select_own_credere_config" ON credere_dealer_config
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = credere_dealer_config.dealer_id AND dealers.user_id = auth.uid()));

DROP POLICY IF EXISTS "insert_own_credere_config" ON credere_dealer_config;
CREATE POLICY "insert_own_credere_config" ON credere_dealer_config
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = credere_dealer_config.dealer_id AND dealers.user_id = auth.uid()));

DROP POLICY IF EXISTS "update_own_credere_config" ON credere_dealer_config;
CREATE POLICY "update_own_credere_config" ON credere_dealer_config
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = credere_dealer_config.dealer_id AND dealers.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = credere_dealer_config.dealer_id AND dealers.user_id = auth.uid()));

DROP POLICY IF EXISTS "delete_own_credere_config" ON credere_dealer_config;
CREATE POLICY "delete_own_credere_config" ON credere_dealer_config
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = credere_dealer_config.dealer_id AND dealers.user_id = auth.uid()));

-- ============================================================
-- 5. credere_token_cache — OAuth token storage (service-role only)
-- ============================================================
CREATE TABLE IF NOT EXISTS credere_token_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  access_token text NOT NULL,
  refresh_token text,
  token_type text DEFAULT 'Bearer',
  expires_at timestamptz NOT NULL,
  refresh_expires_at timestamptz,
  scope text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(dealer_id)
);

ALTER TABLE credere_token_cache ENABLE ROW LEVEL SECURITY;

-- Only service role can access tokens — authenticated users get NOTHING
DROP POLICY IF EXISTS "select_own_credere_tokens" ON credere_token_cache;
CREATE POLICY "select_own_credere_tokens" ON credere_token_cache
  FOR SELECT TO authenticated
  USING (false);

DROP POLICY IF EXISTS "insert_own_credere_tokens" ON credere_token_cache;
CREATE POLICY "insert_own_credere_tokens" ON credere_token_cache
  FOR INSERT TO authenticated
  WITH CHECK (false);

DROP POLICY IF EXISTS "update_own_credere_tokens" ON credere_token_cache;
CREATE POLICY "update_own_credere_tokens" ON credere_token_cache
  FOR UPDATE TO authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "delete_own_credere_tokens" ON credere_token_cache;
CREATE POLICY "delete_own_credere_tokens" ON credere_token_cache
  FOR DELETE TO authenticated
  USING (false);

-- ============================================================
-- 6. credere_simulations — real Credere simulation records
-- ============================================================
CREATE TABLE IF NOT EXISTS credere_simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  financing_simulation_id uuid REFERENCES financing_simulations(id) ON DELETE CASCADE,
  credere_uuid text,
  provider text NOT NULL DEFAULT 'credere',
  store_id text,
  customer_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  seller_cpf text,
  vehicle_value_cents bigint,
  status text NOT NULL DEFAULT 'created',
  raw_response jsonb,
  webhook_received_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE credere_simulations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_credere_simulations" ON credere_simulations;
CREATE POLICY "select_own_credere_simulations" ON credere_simulations
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = credere_simulations.dealer_id AND dealers.user_id = auth.uid()));

DROP POLICY IF EXISTS "insert_own_credere_simulations" ON credere_simulations;
CREATE POLICY "insert_own_credere_simulations" ON credere_simulations
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = credere_simulations.dealer_id AND dealers.user_id = auth.uid()));

DROP POLICY IF EXISTS "update_own_credere_simulations" ON credere_simulations;
CREATE POLICY "update_own_credere_simulations" ON credere_simulations
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = credere_simulations.dealer_id AND dealers.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = credere_simulations.dealer_id AND dealers.user_id = auth.uid()));

DROP POLICY IF EXISTS "delete_own_credere_simulations" ON credere_simulations;
CREATE POLICY "delete_own_credere_simulations" ON credere_simulations
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = credere_simulations.dealer_id AND dealers.user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_credere_simulations_dealer ON credere_simulations(dealer_id);
CREATE INDEX IF NOT EXISTS idx_credere_simulations_financing ON credere_simulations(financing_simulation_id);
CREATE INDEX IF NOT EXISTS idx_credere_simulations_uuid ON credere_simulations(credere_uuid);

-- ============================================================
-- 7. credere_conditions — bank conditions from Credere results
-- ============================================================
CREATE TABLE IF NOT EXISTS credere_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id uuid NOT NULL REFERENCES credere_simulations(id) ON DELETE CASCADE,
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'credere',
  bank_id text,
  bank_name text,
  bank_nickname text,
  bank_febraban_code text,
  provider_condition_id text,
  installments integer,
  down_payment_cents bigint,
  financed_amount_cents bigint,
  amount_paid_in_financing_cents bigint,
  bank_down_payment_suggestion_cents bigint,
  expenses jsonb,
  reason text,
  run_pre_approval boolean DEFAULT false,
  pre_approval_status text,
  process_condition_payload jsonb,
  raw_response jsonb,
  is_selected boolean DEFAULT false,
  selected_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE credere_conditions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_credere_conditions" ON credere_conditions;
CREATE POLICY "select_own_credere_conditions" ON credere_conditions
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = credere_conditions.dealer_id AND dealers.user_id = auth.uid()));

DROP POLICY IF EXISTS "insert_own_credere_conditions" ON credere_conditions;
CREATE POLICY "insert_own_credere_conditions" ON credere_conditions
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = credere_conditions.dealer_id AND dealers.user_id = auth.uid()));

DROP POLICY IF EXISTS "update_own_credere_conditions" ON credere_conditions;
CREATE POLICY "update_own_credere_conditions" ON credere_conditions
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = credere_conditions.dealer_id AND dealers.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = credere_conditions.dealer_id AND dealers.user_id = auth.uid()));

DROP POLICY IF EXISTS "delete_own_credere_conditions" ON credere_conditions;
CREATE POLICY "delete_own_credere_conditions" ON credere_conditions
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = credere_conditions.dealer_id AND dealers.user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_credere_conditions_simulation ON credere_conditions(simulation_id);
CREATE INDEX IF NOT EXISTS idx_credere_conditions_dealer ON credere_conditions(dealer_id);

-- ============================================================
-- 8. credere_vehicle_mapping — maps CRM vehicles to Credere model IDs
-- ============================================================
CREATE TABLE IF NOT EXISTS credere_vehicle_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE,
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  credere_vehicle_model_id text NOT NULL,
  brand text,
  model text,
  version text,
  fipe_code text,
  raw_response jsonb,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(vehicle_id)
);

ALTER TABLE credere_vehicle_mapping ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_credere_vehicle_mapping" ON credere_vehicle_mapping;
CREATE POLICY "select_own_credere_vehicle_mapping" ON credere_vehicle_mapping
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = credere_vehicle_mapping.dealer_id AND dealers.user_id = auth.uid()));

DROP POLICY IF EXISTS "insert_own_credere_vehicle_mapping" ON credere_vehicle_mapping;
CREATE POLICY "insert_own_credere_vehicle_mapping" ON credere_vehicle_mapping
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = credere_vehicle_mapping.dealer_id AND dealers.user_id = auth.uid()));

DROP POLICY IF EXISTS "update_own_credere_vehicle_mapping" ON credere_vehicle_mapping;
CREATE POLICY "update_own_credere_vehicle_mapping" ON credere_vehicle_mapping
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = credere_vehicle_mapping.dealer_id AND dealers.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = credere_vehicle_mapping.dealer_id AND dealers.user_id = auth.uid()));

DROP POLICY IF EXISTS "delete_own_credere_vehicle_mapping" ON credere_vehicle_mapping;
CREATE POLICY "delete_own_credere_vehicle_mapping" ON credere_vehicle_mapping
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = credere_vehicle_mapping.dealer_id AND dealers.user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_credere_vehicle_mapping_vehicle ON credere_vehicle_mapping(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_credere_vehicle_mapping_dealer ON credere_vehicle_mapping(dealer_id);

-- ============================================================
-- 9. credere_bank_credentials — per-dealer bank credential status
-- ============================================================
CREATE TABLE IF NOT EXISTS credere_bank_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  bank_febraban_code text NOT NULL,
  bank_name text,
  bank_nickname text,
  status text NOT NULL DEFAULT 'not_analyzed',
  credential_type text DEFAULT 'full',
  raw_response jsonb,
  last_checked_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(dealer_id, bank_febraban_code)
);

ALTER TABLE credere_bank_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_credere_bank_credentials" ON credere_bank_credentials;
CREATE POLICY "select_own_credere_bank_credentials" ON credere_bank_credentials
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = credere_bank_credentials.dealer_id AND dealers.user_id = auth.uid()));

DROP POLICY IF EXISTS "insert_own_credere_bank_credentials" ON credere_bank_credentials;
CREATE POLICY "insert_own_credere_bank_credentials" ON credere_bank_credentials
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = credere_bank_credentials.dealer_id AND dealers.user_id = auth.uid()));

DROP POLICY IF EXISTS "update_own_credere_bank_credentials" ON credere_bank_credentials;
CREATE POLICY "update_own_credere_bank_credentials" ON credere_bank_credentials
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = credere_bank_credentials.dealer_id AND dealers.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = credere_bank_credentials.dealer_id AND dealers.user_id = auth.uid()));

DROP POLICY IF EXISTS "delete_own_credere_bank_credentials" ON credere_bank_credentials;
CREATE POLICY "delete_own_credere_bank_credentials" ON credere_bank_credentials
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = credere_bank_credentials.dealer_id AND dealers.user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_credere_bank_credentials_dealer ON credere_bank_credentials(dealer_id);
