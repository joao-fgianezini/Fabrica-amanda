/*
# Add credential storage for real platform integrations
- api_credentials_encrypted: stores platform-specific credentials as encrypted JSON
- webhook_secret: per-account secret for verifying incoming webhooks
- phone_number_id: WhatsApp Business phone number ID
- waba_id: WhatsApp Business Account ID
*/

ALTER TABLE integration_accounts
  ADD COLUMN IF NOT EXISTS api_credentials_encrypted text,
  ADD COLUMN IF NOT EXISTS webhook_secret text DEFAULT encode(gen_random_bytes(16), 'hex'),
  ADD COLUMN IF NOT EXISTS phone_number_id text,
  ADD COLUMN IF NOT EXISTS waba_id text;