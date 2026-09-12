/*
  # Restrict cross-dealer reads on vehicles and dealers

  1. Problem
     - `select_vehicles` used `USING (true)`, exposing purchase_price, min_price,
       profit_margin, plate and chassis of every dealer to every signed-in account.
     - `select_dealers` used `USING (true)`, exposing cnpj, email, address and user_id.

  2. Changes
     - Both SELECT policies are narrowed to the owning dealer.
     - Two read-only projections are published for the network browse feature,
       carrying only the columns that feature needs.

  3. Security
     - The views deliberately run with owner rights so the network directory keeps
       working; they expose no cost, identification or registration columns and are
       limited to vehicles the owner has published as available.
*/

-- Vehicles: own rows only through the table
DROP POLICY IF EXISTS "select_vehicles" ON vehicles;

CREATE POLICY "select_own_vehicles" ON vehicles FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = vehicles.dealer_id AND dealers.user_id = auth.uid()));

-- Dealers: own row only through the table
DROP POLICY IF EXISTS "select_dealers" ON dealers;

CREATE POLICY "select_own_dealer" ON dealers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Public directory of dealerships (no cnpj, no email, no address, no user_id)
CREATE OR REPLACE VIEW public_dealers AS
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

-- Network stock listing (no purchase_price, min_price, profit_margin, plate, chassis)
CREATE OR REPLACE VIEW network_vehicles AS
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
