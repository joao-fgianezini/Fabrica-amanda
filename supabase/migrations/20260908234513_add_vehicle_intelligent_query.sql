/*
# Consulta Inteligente Veicular - Database Schema

## Overview
Creates the database structure for the "Consulta Inteligente" feature, which allows dealers to query a vehicle by its license plate and receive a comprehensive analysis including vehicle data, FIPE pricing, market analysis, and a sales potential classification.

## New Tables

### 1. vehicle_queries
Stores each query made by a dealer.
- `id` (uuid, PK)
- `dealer_id` (uuid, FK to dealers)
- `plate` (text, normalized uppercase, no hyphens/spaces)
- `status` (text: pending, completed, partial, failed)
- `query_data` (jsonb: full consolidated result from all sources)
- `sources_used` (jsonb: list of which sources responded)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### 2. vehicle_query_cache
Caches external API responses (BrasilAPI, FIPE) to avoid repeated calls for the same plate.
- `id` (uuid, PK)
- `plate` (text, unique)
- `vehicle_data` (jsonb: data from BrasilAPI or other vehicle identification source)
- `fipe_data` (jsonb: FIPE reference data)
- `fipe_consulted_at` (timestamptz)
- `vehicle_data_consulted_at` (timestamptz)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### 3. consulta_inteligente_config
Stores admin-configurable weights and thresholds for the sales classification engine.
- `id` (uuid, PK)
- `dealer_id` (uuid, FK to dealers - each dealer has their own config)
- `weight_price` (numeric, default 25)
- `weight_market` (numeric, default 20)
- `weight_demand` (numeric, default 20)
- `weight_sales_velocity` (numeric, default 15)
- `weight_offer_quantity` (numeric, default 10)
- `weight_sales_rate` (numeric, default 10)
- `threshold_good` (numeric, default 70)
- `threshold_medium` (numeric, default 40)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

## Security
- RLS enabled on all tables.
- Owner-scoped CRUD policies for authenticated dealers.
- vehicle_query_cache is readable by all authenticated users (shared cache data).
*/

-- ============ vehicle_queries ============
CREATE TABLE IF NOT EXISTS vehicle_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  plate text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  query_data jsonb DEFAULT '{}',
  sources_used jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE vehicle_queries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_vehicle_queries" ON vehicle_queries;
CREATE POLICY "select_own_vehicle_queries" ON vehicle_queries FOR SELECT
  TO authenticated USING (auth.uid() = (SELECT user_id FROM dealers WHERE dealers.id = vehicle_queries.dealer_id));

DROP POLICY IF EXISTS "insert_own_vehicle_queries" ON vehicle_queries;
CREATE POLICY "insert_own_vehicle_queries" ON vehicle_queries FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = (SELECT user_id FROM dealers WHERE dealers.id = vehicle_queries.dealer_id));

DROP POLICY IF EXISTS "update_own_vehicle_queries" ON vehicle_queries;
CREATE POLICY "update_own_vehicle_queries" ON vehicle_queries FOR UPDATE
  TO authenticated USING (auth.uid() = (SELECT user_id FROM dealers WHERE dealers.id = vehicle_queries.dealer_id))
  WITH CHECK (auth.uid() = (SELECT user_id FROM dealers WHERE dealers.id = vehicle_queries.dealer_id));

DROP POLICY IF EXISTS "delete_own_vehicle_queries" ON vehicle_queries;
CREATE POLICY "delete_own_vehicle_queries" ON vehicle_queries FOR DELETE
  TO authenticated USING (auth.uid() = (SELECT user_id FROM dealers WHERE dealers.id = vehicle_queries.dealer_id));

CREATE INDEX IF NOT EXISTS idx_vehicle_queries_dealer ON vehicle_queries(dealer_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_queries_plate ON vehicle_queries(plate);

-- ============ vehicle_query_cache ============
CREATE TABLE IF NOT EXISTS vehicle_query_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plate text UNIQUE NOT NULL,
  vehicle_data jsonb DEFAULT '{}',
  fipe_data jsonb DEFAULT '{}',
  fipe_consulted_at timestamptz,
  vehicle_data_consulted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE vehicle_query_cache ENABLE ROW LEVEL SECURITY;

-- Cache is shared read for all authenticated users, but only the edge function (service role) writes
DROP POLICY IF EXISTS "read_vehicle_query_cache" ON vehicle_query_cache;
CREATE POLICY "read_vehicle_query_cache" ON vehicle_query_cache FOR SELECT
  TO authenticated USING (true);

-- ============ consulta_inteligente_config ============
CREATE TABLE IF NOT EXISTS consulta_inteligente_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  weight_price numeric NOT NULL DEFAULT 25,
  weight_market numeric NOT NULL DEFAULT 20,
  weight_demand numeric NOT NULL DEFAULT 20,
  weight_sales_velocity numeric NOT NULL DEFAULT 15,
  weight_offer_quantity numeric NOT NULL DEFAULT 10,
  weight_sales_rate numeric NOT NULL DEFAULT 10,
  threshold_good numeric NOT NULL DEFAULT 70,
  threshold_medium numeric NOT NULL DEFAULT 40,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(dealer_id)
);

ALTER TABLE consulta_inteligente_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_consulta_config" ON consulta_inteligente_config;
CREATE POLICY "select_own_consulta_config" ON consulta_inteligente_config FOR SELECT
  TO authenticated USING (auth.uid() = (SELECT user_id FROM dealers WHERE dealers.id = consulta_inteligente_config.dealer_id));

DROP POLICY IF EXISTS "insert_own_consulta_config" ON consulta_inteligente_config;
CREATE POLICY "insert_own_consulta_config" ON consulta_inteligente_config FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = (SELECT user_id FROM dealers WHERE dealers.id = consulta_inteligente_config.dealer_id));

DROP POLICY IF EXISTS "update_own_consulta_config" ON consulta_inteligente_config;
CREATE POLICY "update_own_consulta_config" ON consulta_inteligente_config FOR UPDATE
  TO authenticated USING (auth.uid() = (SELECT user_id FROM dealers WHERE dealers.id = consulta_inteligente_config.dealer_id))
  WITH CHECK (auth.uid() = (SELECT user_id FROM dealers WHERE dealers.id = consulta_inteligente_config.dealer_id));

DROP POLICY IF EXISTS "delete_own_consulta_config" ON consulta_inteligente_config;
CREATE POLICY "delete_own_consulta_config" ON consulta_inteligente_config FOR DELETE
  TO authenticated USING (auth.uid() = (SELECT user_id FROM dealers WHERE dealers.id = consulta_inteligente_config.dealer_id));
