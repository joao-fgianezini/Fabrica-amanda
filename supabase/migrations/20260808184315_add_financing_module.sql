/*
# Financiamento Inteligente - Novo Modulo

## Objetivo
Adiciona o modulo de Financiamento Inteligente à plataforma, permitindo
que lojistas selecionem cliente + veiculo + condicoes e consultem
financiamento junto a instituicoes financeiras.

## Novas Tabelas

### financing_institutions
- Catalogo de instituicoes financeiras (bancos, financeiras, hubs)
- id, name, type, logo_url, active, created_at

### financing_simulations
- Registro de cada simulacao de financiamento
- id, dealer_id, vehicle_id, client_id, vehicle_price, down_payment,
  financed_amount, term_months, max_installment, status, consent_given,
  created_at, updated_at
- Status: draft, submitted, processing, analysis, approved,
  approved_with_condition, rejected, expired, cancelled, converted

### financing_offers
- Ofertas retornadas pelas instituicoes para cada simulacao
- id, simulation_id, institution_id, status, down_payment, financed_amount,
  term_months, installment_amount, interest_rate, cet, conditions, notes,
  is_best, created_at

## Seguranca (RLS)
- RLS ativado em todas as novas tabelas
- Acesso scoped por dealer_id via dealers.user_id = auth.uid()
- Todas as politicas sao TO authenticated
- Segracao entre lojas garantida pelo dealer_id

## Notas
- Nao altera tabelas existentes
- Nao remove funcionalidades
- Integracao com clientes e vehicles existentes via foreign keys
*/

-- ============================================
-- 1. FINANCING INSTITUTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS financing_institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'bank',
  logo_url text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE financing_institutions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_financing_institutions" ON financing_institutions;
CREATE POLICY "select_financing_institutions"
ON financing_institutions FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_financing_institutions" ON financing_institutions;
CREATE POLICY "insert_financing_institutions"
ON financing_institutions FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_financing_institutions" ON financing_institutions;
CREATE POLICY "update_financing_institutions"
ON financing_institutions FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

-- Seed default institutions
INSERT INTO financing_institutions (name, type) VALUES
  ('Banco do Brasil', 'bank'),
  ('Caixa Econômica', 'bank'),
  ('Itaú Unibanco', 'bank'),
  ('Bradesco Financiamentos', 'bank'),
  ('Santander', 'bank'),
  ('Banco BV', 'bank'),
  ('Omni', 'financeira'),
  ('Sofisa', 'bank'),
  ('Porto Seguro Consórcio', 'consorcio'),
  ('Hub Financeiro', 'hub')
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. FINANCING SIMULATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS financing_simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  vehicle_price numeric(12,2) NOT NULL DEFAULT 0,
  down_payment numeric(12,2) NOT NULL DEFAULT 0,
  financed_amount numeric(12,2) NOT NULL DEFAULT 0,
  term_months integer NOT NULL DEFAULT 48,
  max_installment numeric(12,2),
  status text NOT NULL DEFAULT 'draft',
  consent_given boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE financing_simulations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_simulations" ON financing_simulations;
CREATE POLICY "select_own_simulations"
ON financing_simulations FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = financing_simulations.dealer_id AND dealers.user_id = auth.uid()));

DROP POLICY IF EXISTS "insert_own_simulations" ON financing_simulations;
CREATE POLICY "insert_own_simulations"
ON financing_simulations FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = financing_simulations.dealer_id AND dealers.user_id = auth.uid()));

DROP POLICY IF EXISTS "update_own_simulations" ON financing_simulations;
CREATE POLICY "update_own_simulations"
ON financing_simulations FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = financing_simulations.dealer_id AND dealers.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = financing_simulations.dealer_id AND dealers.user_id = auth.uid()));

DROP POLICY IF EXISTS "delete_own_simulations" ON financing_simulations;
CREATE POLICY "delete_own_simulations"
ON financing_simulations FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = financing_simulations.dealer_id AND dealers.user_id = auth.uid()));

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_simulations_dealer ON financing_simulations(dealer_id);
CREATE INDEX IF NOT EXISTS idx_simulations_client ON financing_simulations(client_id);
CREATE INDEX IF NOT EXISTS idx_simulations_vehicle ON financing_simulations(vehicle_id);

-- ============================================
-- 3. FINANCING OFFERS
-- ============================================
CREATE TABLE IF NOT EXISTS financing_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id uuid NOT NULL REFERENCES financing_simulations(id) ON DELETE CASCADE,
  institution_id uuid NOT NULL REFERENCES financing_institutions(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  down_payment numeric(12,2),
  financed_amount numeric(12,2),
  term_months integer,
  installment_amount numeric(12,2),
  interest_rate numeric(6,3),
  cet numeric(6,3),
  conditions text,
  notes text,
  is_best boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE financing_offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_offers" ON financing_offers;
CREATE POLICY "select_own_offers"
ON financing_offers FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM financing_simulations
  JOIN dealers ON dealers.id = financing_simulations.dealer_id
  WHERE financing_simulations.id = financing_offers.simulation_id
  AND dealers.user_id = auth.uid()
));

DROP POLICY IF EXISTS "insert_own_offers" ON financing_offers;
CREATE POLICY "insert_own_offers"
ON financing_offers FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM financing_simulations
  JOIN dealers ON dealers.id = financing_simulations.dealer_id
  WHERE financing_simulations.id = financing_offers.simulation_id
  AND dealers.user_id = auth.uid()
));

DROP POLICY IF EXISTS "update_own_offers" ON financing_offers;
CREATE POLICY "update_own_offers"
ON financing_offers FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM financing_simulations
  JOIN dealers ON dealers.id = financing_simulations.dealer_id
  WHERE financing_simulations.id = financing_offers.simulation_id
  AND dealers.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM financing_simulations
  JOIN dealers ON dealers.id = financing_simulations.dealer_id
  WHERE financing_simulations.id = financing_offers.simulation_id
  AND dealers.user_id = auth.uid()
));

DROP POLICY IF EXISTS "delete_own_offers" ON financing_offers;
CREATE POLICY "delete_own_offers"
ON financing_offers FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM financing_simulations
  JOIN dealers ON dealers.id = financing_simulations.dealer_id
  WHERE financing_simulations.id = financing_offers.simulation_id
  AND dealers.user_id = auth.uid()
));

CREATE INDEX IF NOT EXISTS idx_offers_simulation ON financing_offers(simulation_id);
