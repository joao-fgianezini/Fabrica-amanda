/*
# Enhance dealers table with profile fields

## Changes
- Adds city, state, logo_url, description, cnpj, whatsapp to the dealers table.
- These fields allow each dealer to have an OLX-style public profile page.
- All new columns are nullable so existing rows are unaffected.

## New Columns
- city (text) — dealer's city for display on profile and network search
- state (text) — dealer's state (UF)
- logo_url (text) — optional logo/avatar URL
- description (text) — about the dealership
- cnpj (text) — CNPJ for professional credibility
- whatsapp (text) — WhatsApp number for direct contact from network

## Security
- No RLS changes needed; dealers table already allows SELECT for all
  authenticated users and UPDATE for own row only.
*/

ALTER TABLE dealers ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS cnpj text;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS whatsapp text;
