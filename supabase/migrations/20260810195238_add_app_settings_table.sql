CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  encrypted boolean NOT NULL DEFAULT false,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_app_settings" ON app_settings;
CREATE POLICY "read_app_settings" ON app_settings FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_app_settings" ON app_settings;
CREATE POLICY "insert_app_settings" ON app_settings FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_app_settings" ON app_settings;
CREATE POLICY "update_app_settings" ON app_settings
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

INSERT INTO app_settings (key, value, description, encrypted) VALUES
  ('meta_app_id', '', 'Meta App ID for WhatsApp/Instagram/Facebook OAuth', false),
  ('meta_app_secret', '', 'Meta App Secret for OAuth token exchange', true),
  ('meta_verify_token', '', 'Webhook verify token for Meta webhooks', false),
  ('olx_client_id', '', 'OLX API Client ID', false),
  ('olx_client_secret', '', 'OLX API Client Secret', true),
  ('webmotors_api_key', '', 'Webmotors API Key', true),
  ('google_client_id', '', 'Google OAuth Client ID', false),
  ('google_client_secret', '', 'Google OAuth Client Secret', true)
ON CONFLICT (key) DO NOTHING;