/*
# CRM Integrations, Conversations, Messages, and AI Lead Qualification

1. New Tables

### integrations
Catalog of available channel integrations (pre-seeded).
- id (uuid, pk)
- platform (text, unique) — whatsapp, instagram, facebook, olx, webmotors, mercado_livre, google, site
- display_name (text)
- icon (text) — icon identifier
- color (text) — brand color hex
- description (text)
- auth_type (text) — oauth, api_key, webhook, manual
- docs_url (text)
- is_active (boolean) — whether the integration is available
- sort_order (int)

### integration_accounts
Each dealer's connected account for a platform.
- id (uuid, pk)
- dealer_id (uuid, fk dealers, cascade)
- integration_id (uuid, fk integrations, cascade)
- status (text) — connected, disconnected, error, pending
- account_name (text) — display name of connected account
- account_identifier (text) — phone number, handle, email, etc.
- access_token_encrypted (text) — encrypted token (never exposed to frontend)
- refresh_token_encrypted (text)
- token_expires_at (timestamptz)
- webhook_url (text) — registered webhook URL for this account
- webhook_verified (boolean)
- last_sync_at (timestamptz)
- last_error (text)
- metadata (jsonb) — platform-specific data
- connected_at (timestamptz)
- disconnected_at (timestamptz)
- created_at, updated_at
- UNIQUE(dealer_id, integration_id) — one account per platform per dealer

### conversations
Unified inbox conversations across all channels.
- id (uuid, pk)
- dealer_id (uuid, fk dealers, cascade)
- integration_account_id (uuid, fk integration_accounts, cascade)
- lead_id (uuid, fk leads, set null) — linked lead
- client_id (uuid, fk clients, set null) — linked customer
- external_id (text) — platform's conversation/chat ID
- contact_name (text)
- contact_phone (text)
- contact_handle (text) — instagram handle, etc.
- channel (text) — whatsapp, instagram, facebook, olx, site, etc.
- status (text) — open, pending, resolved, archived
- last_message_at (timestamptz)
- last_message_preview (text)
- unread_count (int, default 0)
- ai_summary (text) — AI-generated summary of conversation
- ai_sentiment (text) — positive, neutral, negative
- ai_intent (text) — what the customer wants
- ai_qualified (boolean) — whether AI has qualified this lead
- created_at, updated_at

### messages
Individual messages within conversations.
- id (uuid, pk)
- conversation_id (uuid, fk conversations, cascade)
- dealer_id (uuid, fk dealers, cascade)
- direction (text) — inbound, outbound
- content (text)
- content_type (text) — text, image, audio, template
- external_id (text) — platform message ID
- ai_extracted_data (jsonb) — data extracted by AI (budget, vehicle, etc.)
- ai_analysis (jsonb) — full AI analysis
- created_at

### lead_tracking_events
Tracks lead source attribution and journey.
- id (uuid, pk)
- dealer_id (uuid, fk dealers, cascade)
- lead_id (uuid, fk leads, set null)
- event_type (text) — lead_created, message_received, vehicle_viewed, proposal_sent, etc.
- channel (text)
- vehicle_id (uuid, fk vehicles, set null)
- metadata (jsonb)
- created_at

2. Security
- RLS on all tables with standard owner-scoped pattern
- integrations table: readable by all authenticated users (catalog), writes disabled (managed by migrations)
- integration_accounts: owner-scoped CRUD; access_token_encrypted and refresh_token_encrypted are NOT selected by frontend (column-level exclusion via views or explicit select)

3. Indexes
- conversations: dealer_id, status, lead_id, unread_count
- messages: conversation_id, dealer_id, created_at
- integration_accounts: dealer_id, integration_id
- lead_tracking_events: dealer_id, lead_id

4. Pre-seed integrations catalog
*/

-- === INTEGRATIONS CATALOG ===
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL UNIQUE,
  display_name text NOT NULL,
  icon text NOT NULL DEFAULT 'message',
  color text NOT NULL DEFAULT '#2a93e8',
  description text,
  auth_type text NOT NULL DEFAULT 'oauth' CHECK (auth_type IN ('oauth','api_key','webhook','manual')),
  docs_url text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_integrations" ON integrations;
CREATE POLICY "select_integrations" ON integrations FOR SELECT
  TO authenticated USING (true);

-- Pre-seed the catalog
INSERT INTO integrations (platform, display_name, icon, color, description, auth_type, is_active, sort_order) VALUES
  ('whatsapp', 'WhatsApp Business', 'whatsapp', '#25D366', 'Conecte seu número do WhatsApp Business para receber e enviar mensagens automaticamente', 'oauth', true, 1),
  ('instagram', 'Instagram', 'instagram', '#E4405F', 'Conecte sua conta do Instagram para receber DMs e comentários', 'oauth', true, 2),
  ('facebook', 'Facebook', 'facebook', '#1877F2', 'Conecte sua página do Facebook para receber mensagens e gerenciar anúncios', 'oauth', true, 3),
  ('olx', 'OLX', 'olx', '#7E22CE', 'Sincronize seus anúncios e receba leads da OLX', 'api_key', true, 4),
  ('webmotors', 'Webmotors', 'webmotors', '#E30613', 'Sincronize seu estoque e receba leads da Webmotors', 'api_key', true, 5),
  ('mercado_livre', 'Mercado Livre', 'mercado_livre', '#FFE600', 'Publique veículos e receba perguntas e leads', 'oauth', true, 6),
  ('google', 'Google', 'google', '#4285F4', 'Conecte Google Business para receber mensagens e gerenciar anúncios', 'oauth', true, 7),
  ('site', 'Site Próprio', 'site', '#2a93e8', 'Adicione um chat widget ao seu site para captar leads', 'manual', true, 8)
ON CONFLICT (platform) DO NOTHING;

-- === INTEGRATION ACCOUNTS ===
CREATE TABLE IF NOT EXISTS integration_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  integration_id uuid NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('connected','disconnected','error','pending')),
  account_name text,
  account_identifier text,
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  webhook_url text,
  webhook_verified boolean NOT NULL DEFAULT false,
  last_sync_at timestamptz,
  last_error text,
  metadata jsonb NOT NULL DEFAULT '{}',
  connected_at timestamptz,
  disconnected_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(dealer_id, integration_id)
);

CREATE INDEX IF NOT EXISTS idx_integration_accounts_dealer ON integration_accounts(dealer_id);

ALTER TABLE integration_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_accounts" ON integration_accounts;
CREATE POLICY "select_own_accounts" ON integration_accounts FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = integration_accounts.dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_accounts" ON integration_accounts;
CREATE POLICY "insert_own_accounts" ON integration_accounts FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = integration_accounts.dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_accounts" ON integration_accounts;
CREATE POLICY "update_own_accounts" ON integration_accounts FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = integration_accounts.dealer_id AND dealers.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = integration_accounts.dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_accounts" ON integration_accounts;
CREATE POLICY "delete_own_accounts" ON integration_accounts FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = integration_accounts.dealer_id AND dealers.user_id = auth.uid())
  );

-- === CONVERSATIONS ===
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  integration_account_id uuid REFERENCES integration_accounts(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  external_id text,
  contact_name text,
  contact_phone text,
  contact_handle text,
  channel text NOT NULL DEFAULT 'whatsapp',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','pending','resolved','archived')),
  last_message_at timestamptz,
  last_message_preview text,
  unread_count integer NOT NULL DEFAULT 0,
  ai_summary text,
  ai_sentiment text CHECK (ai_sentiment IN ('positive','neutral','negative') OR ai_sentiment IS NULL),
  ai_intent text,
  ai_qualified boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_dealer ON conversations(dealer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_lead ON conversations(lead_id);
CREATE INDEX IF NOT EXISTS idx_conversations_unread ON conversations(unread_count);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_conversations" ON conversations;
CREATE POLICY "select_own_conversations" ON conversations FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = conversations.dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_conversations" ON conversations;
CREATE POLICY "insert_own_conversations" ON conversations FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = conversations.dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_conversations" ON conversations;
CREATE POLICY "update_own_conversations" ON conversations FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = conversations.dealer_id AND dealers.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = conversations.dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_conversations" ON conversations;
CREATE POLICY "delete_own_conversations" ON conversations FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = conversations.dealer_id AND dealers.user_id = auth.uid())
  );

-- === MESSAGES ===
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  direction text NOT NULL CHECK (direction IN ('inbound','outbound')),
  content text NOT NULL DEFAULT '',
  content_type text NOT NULL DEFAULT 'text' CHECK (content_type IN ('text','image','audio','template','system')),
  external_id text,
  ai_extracted_data jsonb NOT NULL DEFAULT '{}',
  ai_analysis jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_dealer ON messages(dealer_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_messages" ON messages;
CREATE POLICY "select_own_messages" ON messages FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = messages.dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_messages" ON messages;
CREATE POLICY "insert_own_messages" ON messages FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = messages.dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_messages" ON messages;
CREATE POLICY "update_own_messages" ON messages FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = messages.dealer_id AND dealers.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = messages.dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_messages" ON messages;
CREATE POLICY "delete_own_messages" ON messages FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = messages.dealer_id AND dealers.user_id = auth.uid())
  );

-- === LEAD TRACKING EVENTS ===
CREATE TABLE IF NOT EXISTS lead_tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  channel text,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tracking_events_dealer ON lead_tracking_events(dealer_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_lead ON lead_tracking_events(lead_id);

ALTER TABLE lead_tracking_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_tracking" ON lead_tracking_events;
CREATE POLICY "select_own_tracking" ON lead_tracking_events FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = lead_tracking_events.dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_tracking" ON lead_tracking_events;
CREATE POLICY "insert_own_tracking" ON lead_tracking_events FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = lead_tracking_events.dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_tracking" ON lead_tracking_events;
CREATE POLICY "delete_own_tracking" ON lead_tracking_events FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = lead_tracking_events.dealer_id AND dealers.user_id = auth.uid())
  );