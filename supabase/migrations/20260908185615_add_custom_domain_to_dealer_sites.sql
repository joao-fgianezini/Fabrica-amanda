/*
# Add custom_domain column to dealer_sites

1. Modified Tables
- `dealer_sites` — add `custom_domain` (text, nullable) column.
  When set, this domain will be used to serve the dealer's site instead of the free `/site/:slug` URL.
  When null/empty, the site continues to be served at the free subdomain path.

2. Security
- No new policies needed. The column is covered by existing dealer_sites RLS policies.
- No data is lost — the column is nullable and defaults to NULL.
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dealer_sites' AND column_name = 'custom_domain'
  ) THEN
    ALTER TABLE dealer_sites ADD COLUMN custom_domain text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_dealer_sites_custom_domain ON dealer_sites(custom_domain) WHERE custom_domain IS NOT NULL;
