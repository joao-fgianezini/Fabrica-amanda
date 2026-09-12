/*
  # Restore network views (revert security_invoker experiment)

  1. Context
     - The previous migration made `public_dealers` and `network_vehicles`
       security_invoker, but that broke the network browse feature: the underlying
       tables' SELECT policies only allow own rows, so the invoker views returned
       only the caller's own data, not other dealers' public listings.
     - RLS is row-level, not column-level, so there is no policy shape that says
       "all rows for public columns, own rows for private columns." The views must
       run with owner privileges to project cross-dealer public data.

  2. Fix
     - Recreate both views as plain SECURITY DEFINER (the Postgres default).
     - The views deliberately expose ONLY public columns (no purchase_price,
       min_price, profit_margin, plate, chassis, cnpj, email, address, user_id).
     - Column-level SELECT grants on the underlying tables are revoked so the
       table-wide grants from the original migration are restored; dealers read
       their own full rows through the table (RLS-scoped) and other dealers'
       public projections through the views.

  3. Advisor note
     - Supabase's linter flags any SECURITY DEFINER view in an exposed schema. That
       flag is a false positive here: the views are the intended public projection
       and expose no sensitive columns. The real protection is the column selection
       in the view definition, not RLS on the underlying tables.
*/

DROP VIEW IF EXISTS public_dealers;
DROP VIEW IF EXISTS network_vehicles;

-- Restore table-wide SELECT grants so own-vehicle full reads work.
GRANT SELECT ON dealers TO authenticated;
GRANT SELECT ON vehicles TO authenticated;

-- Public dealership directory (no cnpj, no email, no address, no user_id).
CREATE VIEW public_dealers AS
  SELECT
    d.id,
    d.name,
    d.city,
    d.state,
    d.logo_url,
    d.description,
    d.phone,
    d.whatsapp,
    d.created_at
  FROM dealers d;

-- Network stock listing (no purchase_price, min_price, profit_margin, plate, chassis).
CREATE VIEW network_vehicles AS
  SELECT
    v.id,
    v.dealer_id,
    v.brand,
    v.model,
    v.year_manufacture,
    v.year_model,
    v.color,
    v.mileage,
    v.fuel,
    v.transmission,
    v.engine,
    v.doors,
    v.description,
    v.asking_price,
    v.status,
    v.created_at,
    v.updated_at,
    d.name        AS dealer_name,
    d.city        AS dealer_city,
    d.state       AS dealer_state,
    d.logo_url    AS dealer_logo_url,
    d.phone       AS dealer_phone,
    d.whatsapp    AS dealer_whatsapp
  FROM vehicles v
  JOIN dealers d ON d.id = v.dealer_id
  WHERE v.status = 'available';

REVOKE ALL ON public_dealers FROM anon, authenticated;
REVOKE ALL ON network_vehicles FROM anon, authenticated;
GRANT SELECT ON public_dealers TO authenticated;
GRANT SELECT ON network_vehicles TO authenticated;
