/*
# Create ATPV-e (Autorização para Transferência de Propriedade de Veículo) table

1. New Tables
- `atpv_e_records` — stores ATPV-e document preparation records linked to vehicles and buyers.
  - `id` (uuid, primary key)
  - `dealer_id` (uuid, FK to dealers, owner scope)
  - `vehicle_id` (uuid, FK to vehicles, nullable)
  - `sale_id` (uuid, FK to sales, nullable)
  - `buyer_name` (text, buyer's full name)
  - `buyer_cpf_cnpj` (text, buyer's CPF or CNPJ)
  - `buyer_phone` (text, nullable)
  - `buyer_address` (text, nullable)
  - `buyer_city` (text, nullable)
  - `buyer_state` (text, nullable)
  - `sale_price` (numeric, nullable)
  - `sale_date` (date, nullable)
  - `vehicle_plate` (text, nullable — cached from vehicle for the document)
  - `vehicle_chassis` (text, nullable — cached from vehicle)
  - `vehicle_renavam` (text, nullable — entered by dealer)
  - `status` (text: 'draft', 'ready', 'submitted', 'completed', 'cancelled')
  - `detran_protocol` (text, nullable — protocol number returned by Detran portal)
  - `notes` (text, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

2. Security
- Enable RLS on `atpv_e_records`.
- Owner-scoped CRUD: each authenticated dealer can only access their own ATPV-e records.
- 4 separate policies (SELECT, INSERT, UPDATE, DELETE) scoped to `dealer_id = auth.uid()`.
- Note: `dealers.id` is the dealer's UUID which maps to `auth.uid()` via `user_id` column.
  Since this table uses `dealer_id` (not `user_id`), ownership is verified through
  a subquery checking `dealers.user_id = auth.uid()`.
*/

CREATE TABLE IF NOT EXISTS atpv_e_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  sale_id uuid REFERENCES sales(id) ON DELETE SET NULL,
  buyer_name text NOT NULL DEFAULT '',
  buyer_cpf_cnpj text,
  buyer_phone text,
  buyer_address text,
  buyer_city text,
  buyer_state text,
  sale_price numeric,
  sale_date date,
  vehicle_plate text,
  vehicle_chassis text,
  vehicle_renavam text,
  status text NOT NULL DEFAULT 'draft',
  detran_protocol text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE atpv_e_records ENABLE ROW LEVEL SECURITY;

-- Helper: dealer ownership check
-- A row belongs to the authenticated user if its dealer_id maps to a dealer whose user_id = auth.uid()

DROP POLICY IF EXISTS "select_own_atpv_e" ON atpv_e_records;
CREATE POLICY "select_own_atpv_e" ON atpv_e_records FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers d WHERE d.id = atpv_e_records.dealer_id AND d.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_atpv_e" ON atpv_e_records;
CREATE POLICY "insert_own_atpv_e" ON atpv_e_records FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM dealers d WHERE d.id = atpv_e_records.dealer_id AND d.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_atpv_e" ON atpv_e_records;
CREATE POLICY "update_own_atpv_e" ON atpv_e_records FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers d WHERE d.id = atpv_e_records.dealer_id AND d.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM dealers d WHERE d.id = atpv_e_records.dealer_id AND d.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_atpv_e" ON atpv_e_records;
CREATE POLICY "delete_own_atpv_e" ON atpv_e_records FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers d WHERE d.id = atpv_e_records.dealer_id AND d.user_id = auth.uid())
  );

-- Index for dealer-scoped queries
CREATE INDEX IF NOT EXISTS idx_atpv_e_dealer_id ON atpv_e_records(dealer_id);
CREATE INDEX IF NOT EXISTS idx_atpv_e_status ON atpv_e_records(status);
