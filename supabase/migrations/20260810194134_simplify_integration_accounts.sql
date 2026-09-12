/*
# Simplify integration accounts — store login + password instead of complex API credentials
*/
ALTER TABLE integration_accounts
  ADD COLUMN IF NOT EXISTS account_email text,
  ADD COLUMN IF NOT EXISTS account_password_encrypted text;