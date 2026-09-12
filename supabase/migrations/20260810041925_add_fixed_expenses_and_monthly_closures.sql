/*
# Add fixed expenses + monthly closures

1. Changes to existing tables
- `expenses`: add `is_fixed` boolean (default false) — fixed expenses survive month closure

2. New Tables
- `monthly_closures`
  - id (uuid, pk)
  - dealer_id (uuid, fk dealers)
  - period_month (int, 1-12)
  - period_year (int)
  - closed_at (timestamptz)
  - report_data (jsonb) — full snapshot: expenses, sales, sold vehicles, profit summary
  - summary_totals (jsonb) — quick-access totals

3. Security
- RLS enabled on monthly_closures
- Owner-scoped CRUD via dealers ownership check
*/

ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_fixed boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS monthly_closures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  period_month integer NOT NULL CHECK (period_month >= 1 AND period_month <= 12),
  period_year integer NOT NULL,
  closed_at timestamptz NOT NULL DEFAULT now(),
  report_data jsonb NOT NULL DEFAULT '{}',
  summary_totals jsonb NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_monthly_closures_dealer ON monthly_closures(dealer_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_monthly_closures_period ON monthly_closures(dealer_id, period_month, period_year);

ALTER TABLE monthly_closures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_closures" ON monthly_closures;
CREATE POLICY "select_own_closures" ON monthly_closures FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_closures" ON monthly_closures;
CREATE POLICY "insert_own_closures" ON monthly_closures FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_closures" ON monthly_closures;
CREATE POLICY "delete_own_closures" ON monthly_closures FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );