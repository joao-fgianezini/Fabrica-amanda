/*
# Add Unipile API settings for social platform integrations

1. Purpose
   Unipile is a hosted API gateway that connects Instagram, Facebook/Messenger, and WhatsApp
   using just login+password (Instagram/Facebook) or QR code (WhatsApp).
   This eliminates the need for Meta App configuration, OAuth flows, or developer setup.
   The lojista just enters their Instagram/Facebook login and password, and the system
   connects automatically through Unipile.

2. New settings
   - unipile_dsn: The Unipile Data Source Name (base URL, e.g. https://api.unipile.com/api/v1)
   - unipile_api_key: The Unipile API access token
*/
INSERT INTO app_settings (key, value, description, encrypted) VALUES
  ('unipile_dsn', '', 'Unipile API DSN (base URL)', false),
  ('unipile_api_key', '', 'Unipile API access token', true)
ON CONFLICT (key) DO NOTHING;
