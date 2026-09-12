/*
# Atendimento 360° — Enhancements

## Purpose
Upgrades the existing conversations/integration system to support:
- Lead temperature (HOT/WARM/COLD) on conversations
- Vehicle association on conversations
- Webhook event idempotency (deduplication)
- External listing tracking (OLX, Webmotors, Instagram, Facebook ads)

## New Tables
1. webhook_events — idempotency for incoming webhooks
2. external_listings — tracks vehicles published to external platforms

## Modified Tables
1. conversations — added ai_temperature, vehicle_id columns

## Security
- RLS enabled on both new tables with owner-scoped policies
*/

-- 1. Add columns to conversations
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='conversations' AND column_name='ai_temperature') THEN
    ALTER TABLE conversations ADD COLUMN ai_temperature text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='conversations' AND column_name='vehicle_id') THEN
    ALTER TABLE conversations ADD COLUMN vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 2. webhook_events table
CREATE TABLE IF NOT EXISTS webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid REFERENCES dealers(id) ON DELETE CASCADE,
  channel text NOT NULL,
  external_event_id text,
  payload_hash text,
  processed_at timestamptz DEFAULT now()
);
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_webhook_events" ON webhook_events;
CREATE POLICY "select_own_webhook_events" ON webhook_events FOR SELECT
  TO authenticated USING (auth.uid() IN (SELECT user_id FROM dealers WHERE id = dealer_id));

DROP POLICY IF EXISTS "insert_own_webhook_events" ON webhook_events;
CREATE POLICY "insert_own_webhook_events" ON webhook_events FOR INSERT
  TO authenticated WITH CHECK (auth.uid() IN (SELECT user_id FROM dealers WHERE id = dealer_id));

DROP POLICY IF EXISTS "delete_own_webhook_events" ON webhook_events;
CREATE POLICY "delete_own_webhook_events" ON webhook_events FOR DELETE
  TO authenticated USING (auth.uid() IN (SELECT user_id FROM dealers WHERE id = dealer_id));

CREATE UNIQUE INDEX IF NOT EXISTS webhook_events_dedup_idx
  ON webhook_events (channel, external_event_id)
  WHERE external_event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS webhook_events_payload_hash_idx ON webhook_events (payload_hash);

-- 3. external_listings table
CREATE TABLE IF NOT EXISTS external_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  integration_account_id uuid REFERENCES integration_accounts(id) ON DELETE SET NULL,
  platform text NOT NULL,
  external_listing_id text,
  external_url text,
  status text NOT NULL DEFAULT 'not_published',
  last_sync_at timestamptz,
  last_error text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE external_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_external_listings" ON external_listings;
CREATE POLICY "select_own_external_listings" ON external_listings FOR SELECT
  TO authenticated USING (auth.uid() IN (SELECT user_id FROM dealers WHERE id = dealer_id));

DROP POLICY IF EXISTS "insert_own_external_listings" ON external_listings;
CREATE POLICY "insert_own_external_listings" ON external_listings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() IN (SELECT user_id FROM dealers WHERE id = dealer_id));

DROP POLICY IF EXISTS "update_own_external_listings" ON external_listings;
CREATE POLICY "update_own_external_listings" ON external_listings FOR UPDATE
  TO authenticated USING (auth.uid() IN (SELECT user_id FROM dealers WHERE id = dealer_id))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM dealers WHERE id = dealer_id));

DROP POLICY IF EXISTS "delete_own_external_listings" ON external_listings;
CREATE POLICY "delete_own_external_listings" ON external_listings FOR DELETE
  TO authenticated USING (auth.uid() IN (SELECT user_id FROM dealers WHERE id = dealer_id));

CREATE INDEX IF NOT EXISTS external_listings_dealer_vehicle_idx ON external_listings (dealer_id, vehicle_id);
CREATE INDEX IF NOT EXISTS external_listings_platform_idx ON external_listings (platform);

-- 4. Realtime
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'external_listings') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE external_listings;
  END IF;
END $$;
