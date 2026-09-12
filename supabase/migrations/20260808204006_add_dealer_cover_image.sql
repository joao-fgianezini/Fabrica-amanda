-- Add cover image support to dealer profiles.
-- The banner currently uses a static gradient; this lets a dealer upload a
-- background image that appears behind the logo on the public profile.

ALTER TABLE dealers ADD COLUMN IF NOT EXISTS cover_url text;

-- Recreate the public directory view to include cover_url.
DROP VIEW IF EXISTS public_dealers;

CREATE VIEW public_dealers AS
  SELECT
    d.id,
    d.name,
    d.city,
    d.state,
    d.logo_url,
    d.cover_url,
    d.description,
    d.phone,
    d.whatsapp,
    d.created_at
  FROM dealers d;

REVOKE ALL ON public_dealers FROM anon, authenticated;
GRANT SELECT ON public_dealers TO authenticated;