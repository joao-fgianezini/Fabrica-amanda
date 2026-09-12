/*
  # Make the public directory views security_invoker

  1. Problem
     - `public_dealers` and `network_vehicles` were created as plain views, which on
       Supabase run as SECURITY DEFINER by default. The advisor flags this because a
       view that runs with owner privileges can return rows the caller cannot read
       directly, bypassing RLS.

  2. Fix
     - Recreate both views WITH (security_invoker = true) so they run with the
       caller's privileges and respect RLS on the underlying tables.
     - Grant column-level SELECT on the specific public columns of `vehicles` and
       `dealers` to `authenticated`, so the invoker can read the projected columns
       of other dealers' rows without gaining access to cost, margin, plate, chassis,
       cnpj, email, address or user_id.
     - Revoke table-wide SELECT on `vehicles` and `dealers` from `authenticated` so
       the column grant is the only path to cross-dealer data.

  3. Net effect
     - A dealer reads their own full row through the table (RLS allows it).
     - A dealer reads the public projection of every other dealer's vehicles and
       profile through the views (column grant + invoker RLS).
     - A dealer can no longer SELECT purchase_price, min_price, profit_margin, plate,
       chassis, cnpj, email, address or user_id for any dealer but themselves.
*/

DROP VIEW IF EXISTS public_dealers;
DROP VIEW IF EXISTS network_vehicles;

-- Column-level read access for the public projection.
-- These grants are checked before RLS, so they hold even where a policy allows the row.
REVOKE SELECT ON dealers FROM authenticated;
GRANT SELECT (
  id, name, city, state, logo_url, description, phone, whatsapp, created_at
) ON dealers TO authenticated;

REVOKE SELECT ON vehicles FROM authenticated;
GRANT SELECT (
  id, dealer_id, brand, model, year_manufacture, year_model, color, mileage,
  fuel, transmission, engine, doors, description, asking_price, status,
  created_at, updated_at
) ON vehicles TO authenticated;

-- Public dealership directory (no cnpj, no email, no address, no user_id).
CREATE VIEW public_dealers WITH (security_invoker = true) AS
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
CREATE VIEW network_vehicles WITH (security_invoker = true) AS
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
