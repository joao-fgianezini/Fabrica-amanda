/*
# Create dealer_sites table for website builder

1. New Tables
- `dealer_sites`
  - `id` (uuid, primary key)
  - `dealer_id` (uuid, foreign key to dealers.id, unique — one site per dealer)
  - `template` (text, not null) — which of the 5 templates: 'classic', 'modern', 'luxury', 'sport', 'minimal'
  - `slug` (text, not null, unique) — URL slug for the public site (e.g. "auto-ribeirao")
  - `is_published` (boolean, default false) — whether the site is live
  - `site_data` (jsonb) — all customizable content: hero title, subtitle, about text, hero image, about image, social links, colors, custom sections
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `dealer_sites`.
- Owner-scoped CRUD: each authenticated dealer can only access their own site.
- Public SELECT for published sites: anon + authenticated can read published sites (so visitors can view the site without logging in).
*/

CREATE TABLE IF NOT EXISTS dealer_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL UNIQUE REFERENCES dealers(id) ON DELETE CASCADE,
  template text NOT NULL DEFAULT 'classic',
  slug text NOT NULL UNIQUE,
  is_published boolean NOT NULL DEFAULT false,
  site_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE dealer_sites ENABLE ROW LEVEL SECURITY;

-- Owner can read their own site
DROP POLICY IF EXISTS "select_own_site" ON dealer_sites;
CREATE POLICY "select_own_site"
ON dealer_sites FOR SELECT
TO authenticated USING (auth.uid() = (SELECT user_id FROM dealers WHERE dealers.id = dealer_id));

-- Owner can insert their own site
DROP POLICY IF EXISTS "insert_own_site" ON dealer_sites;
CREATE POLICY "insert_own_site"
ON dealer_sites FOR INSERT
TO authenticated WITH CHECK (auth.uid() = (SELECT user_id FROM dealers WHERE dealers.id = dealer_id));

-- Owner can update their own site
DROP POLICY IF EXISTS "update_own_site" ON dealer_sites;
CREATE POLICY "update_own_site"
ON dealer_sites FOR UPDATE
TO authenticated USING (auth.uid() = (SELECT user_id FROM dealers WHERE dealers.id = dealer_id))
WITH CHECK (auth.uid() = (SELECT user_id FROM dealers WHERE dealers.id = dealer_id));

-- Owner can delete their own site
DROP POLICY IF EXISTS "delete_own_site" ON dealer_sites;
CREATE POLICY "delete_own_site"
ON dealer_sites FOR DELETE
TO authenticated USING (auth.uid() = (SELECT user_id FROM dealers WHERE dealers.id = dealer_id));

-- Public can read published sites (for visitors viewing the site without login)
DROP POLICY IF EXISTS "public_read_published_sites" ON dealer_sites;
CREATE POLICY "public_read_published_sites"
ON dealer_sites FOR SELECT
TO anon, authenticated USING (is_published = true);

-- Index for slug lookups
CREATE INDEX IF NOT EXISTS idx_dealer_sites_slug ON dealer_sites(slug);
CREATE INDEX IF NOT EXISTS idx_dealer_sites_dealer_id ON dealer_sites(dealer_id);
