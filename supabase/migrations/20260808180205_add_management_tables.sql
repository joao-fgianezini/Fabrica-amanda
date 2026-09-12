
/*
# Rede Auto Ribeirão - Sistema de Gestão Interna

## Descrição
Expande a plataforma de estoque integrado com um sistema completo de gestão para cada lojista:
controle de despesas, custos, vendas diretas, clientes e relatórios financeiros.

## Novas Tabelas

### expense_categories
Categorias de despesas personalizáveis por lojista (ex: aluguel, salários, marketing, manutenção).
- id, dealer_id, name, color (para gráficos), is_default (categorias padrão do sistema)

### expenses
Lançamentos de despesas/custos da loja.
- id, dealer_id, category_id, description, amount, due_date, paid_date, status (pending/paid),
- recurrence (none/monthly/weekly/yearly), notes, created_at

### sales
Vendas diretas da loja (quando vende para cliente final, não via rede).
- id, dealer_id, vehicle_id (opcional), client_name, client_phone, sale_price,
- purchase_price (custo do carro), profit, payment_method, sale_date, notes, created_at

### clients
CRM básico - cadastro de clientes.
- id, dealer_id, name, phone, email, document (CPF/CNPJ), address, notes,
- status (active/inactive), created_at

## Segurança
- RLS habilitado em todas as novas tabelas
- Cada lojista só vê e gerencia seus próprios dados
- Policies com EXISTS check em dealers para ownership
*/

-- === EXPENSE CATEGORIES ===
CREATE TABLE IF NOT EXISTS expense_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text DEFAULT '#2a93e8',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expense_categories_dealer ON expense_categories(dealer_id);

ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_expense_categories" ON expense_categories;
CREATE POLICY "select_own_expense_categories" ON expense_categories FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_expense_categories" ON expense_categories;
CREATE POLICY "insert_own_expense_categories" ON expense_categories FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_expense_categories" ON expense_categories;
CREATE POLICY "update_own_expense_categories" ON expense_categories FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_expense_categories" ON expense_categories;
CREATE POLICY "delete_own_expense_categories" ON expense_categories FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

-- === EXPENSES ===
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  category_id uuid REFERENCES expense_categories(id) ON DELETE SET NULL,
  description text NOT NULL,
  amount numeric(12,2) NOT NULL,
  due_date date,
  paid_date date,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  recurrence text NOT NULL DEFAULT 'none' CHECK (recurrence IN ('none', 'weekly', 'monthly', 'yearly')),
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_dealer ON expenses(dealer_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_due_date ON expenses(due_date);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_expenses" ON expenses;
CREATE POLICY "select_own_expenses" ON expenses FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_expenses" ON expenses;
CREATE POLICY "insert_own_expenses" ON expenses FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_expenses" ON expenses;
CREATE POLICY "update_own_expenses" ON expenses FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_expenses" ON expenses;
CREATE POLICY "delete_own_expenses" ON expenses FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

-- === SALES ===
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  client_name text,
  client_phone text,
  sale_price numeric(12,2) NOT NULL,
  purchase_price numeric(12,2) DEFAULT 0,
  profit numeric(12,2),
  payment_method text,
  sale_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_dealer ON sales(dealer_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_sales" ON sales;
CREATE POLICY "select_own_sales" ON sales FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_sales" ON sales;
CREATE POLICY "insert_own_sales" ON sales FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_sales" ON sales;
CREATE POLICY "update_own_sales" ON sales FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_sales" ON sales;
CREATE POLICY "delete_own_sales" ON sales FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

-- === CLIENTS ===
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  email text,
  document text,
  address text,
  notes text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clients_dealer ON clients(dealer_id);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_clients" ON clients;
CREATE POLICY "select_own_clients" ON clients FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_clients" ON clients;
CREATE POLICY "insert_own_clients" ON clients FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_clients" ON clients;
CREATE POLICY "update_own_clients" ON clients FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_clients" ON clients;
CREATE POLICY "delete_own_clients" ON clients FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

-- === Insert default expense categories for existing dealers ===
INSERT INTO expense_categories (dealer_id, name, color, is_default)
SELECT d.id, cat.name, cat.color, true
FROM dealers d
CROSS JOIN (VALUES
  ('Aluguel / Condomínio', '#dc2626'),
  ('Salários e Pró-labore', '#f59e0b'),
  ('Marketing e Anúncios', '#2a93e8'),
  ('Manutenção de Veículos', '#16a34a'),
  ('Documentação e Taxas', '#8b5cf6'),
  ('Combustível', '#06b6d4'),
  ('Outros', '#64748b')
) AS cat(name, color)
WHERE NOT EXISTS (
  SELECT 1 FROM expense_categories ec
  WHERE ec.dealer_id = d.id AND ec.name = cat.name
);
