
/*
# Rede Auto Ribeirão - Schema Inicial

## Descrição
Plataforma fechada de estoque integrado para lojistas de veículos de Ribeirão Preto.
Apenas lojistas cadastrados têm acesso. Cada lojista gerencia seu próprio estoque
e pode pesquisar o estoque de toda a rede.

## Tabelas

### dealers
Perfil de cada lojista da rede, vinculado ao usuário autenticado.
- id: identificador único
- user_id: vínculo com auth.users (login)
- name: nome do lojista / nome da loja
- phone: telefone de contato
- email: e-mail de contato
- address: endereço da loja
- created_at: data de cadastro

### vehicles
Veículo cadastrado por um lojista, com todos os dados financeiros e de especificação.
- id: identificador único
- dealer_id: lojista dono do veículo
- brand: marca (ex: Toyota, Ford)
- model: modelo (ex: Corolla, Ka)
- year_manufacture: ano de fabricação
- year_model: ano do modelo
- color: cor
- mileage: quilometragem
- fuel: tipo de combustível
- transmission: câmbio (manual/automático)
- plate: placa
- chassis: chassi
- engine: motorização
- doors: número de portas
- description: observações e descrição do veículo
- purchase_price: valor que o lojista pagou pelo veículo (custo)
- asking_price: valor que está pedindo pelo veículo
- min_price: valor mínimo que aceita vender
- profit_margin: margem de lucro calculada em %
- status: disponível, reservado ou vendido
- created_at: data de cadastro
- updated_at: data da última atualização

### vehicle_photos
Fotos de cada veículo.
- id: identificador único
- vehicle_id: veículo ao qual a foto pertence
- url: URL da foto no storage
- is_cover: indica se é a foto de capa
- created_at: data de upload

### deals
Registro de negociações entre lojistas (divisão de lucro).
- id: identificador único
- vehicle_id: veículo negociado
- seller_dealer_id: lojista que tem o carro
- buyer_dealer_id: lojista que tem o cliente
- client_name: nome do cliente final
- client_phone: telefone do cliente
- sale_price: valor final de venda
- split_percentage: percentual do lucro para o lojista que trouxe o cliente
- seller_amount: valor que vai para o dono do carro
- buyer_amount: valor que vai para o lojista com o cliente
- status: em andamento, concluído, cancelado
- notes: observações
- created_at: data de criação

## Segurança
- RLS habilitado em todas as tabelas
- Lojistas autenticados podem ler todos os veículos da rede (para pesquisa)
- Lojistas só podem inserir/editar/excluir seus próprios veículos
- Negociações visíveis para os dois lojistas envolvidos
*/

-- DEALERS
CREATE TABLE IF NOT EXISTS dealers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  email text,
  address text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_dealers" ON dealers;
CREATE POLICY "select_dealers" ON dealers FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_dealer" ON dealers;
CREATE POLICY "insert_own_dealer" ON dealers FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_dealer" ON dealers;
CREATE POLICY "update_own_dealer" ON dealers FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_dealer" ON dealers;
CREATE POLICY "delete_own_dealer" ON dealers FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- VEHICLES
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  brand text NOT NULL,
  model text NOT NULL,
  year_manufacture integer,
  year_model integer,
  color text,
  mileage integer,
  fuel text,
  transmission text,
  plate text,
  chassis text,
  engine text,
  doors integer,
  description text,
  purchase_price numeric(12,2) NOT NULL,
  asking_price numeric(12,2) NOT NULL,
  min_price numeric(12,2),
  profit_margin numeric(6,2),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_dealer_id ON vehicles(dealer_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_brand_model ON vehicles(brand, model);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Todos lojistas autenticados podem VER todos os veículos (busca na rede)
DROP POLICY IF EXISTS "select_vehicles" ON vehicles;
CREATE POLICY "select_vehicles" ON vehicles FOR SELECT
  TO authenticated USING (true);

-- Lojistas só inserem veículos em suas próprias lojas
DROP POLICY IF EXISTS "insert_own_vehicles" ON vehicles;
CREATE POLICY "insert_own_vehicles" ON vehicles FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_vehicles" ON vehicles;
CREATE POLICY "update_own_vehicles" ON vehicles FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid()));

DROP POLICY IF EXISTS "delete_own_vehicles" ON vehicles;
CREATE POLICY "delete_own_vehicles" ON vehicles FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

-- VEHICLE PHOTOS
CREATE TABLE IF NOT EXISTS vehicle_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  url text NOT NULL,
  is_cover boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_photos_vehicle_id ON vehicle_photos(vehicle_id);

ALTER TABLE vehicle_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_vehicle_photos" ON vehicle_photos;
CREATE POLICY "select_vehicle_photos" ON vehicle_photos FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_vehicle_photos" ON vehicle_photos;
CREATE POLICY "insert_own_vehicle_photos" ON vehicle_photos FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM vehicles v
      JOIN dealers d ON d.id = v.dealer_id
      WHERE v.id = vehicle_id AND d.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_vehicle_photos" ON vehicle_photos;
CREATE POLICY "delete_own_vehicle_photos" ON vehicle_photos FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM vehicles v
      JOIN dealers d ON d.id = v.dealer_id
      WHERE v.id = vehicle_id AND d.user_id = auth.uid()
    )
  );

-- DEALS
CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  seller_dealer_id uuid NOT NULL REFERENCES dealers(id),
  buyer_dealer_id uuid NOT NULL REFERENCES dealers(id),
  client_name text,
  client_phone text,
  sale_price numeric(12,2),
  split_percentage numeric(5,2),
  seller_amount numeric(12,2),
  buyer_amount numeric(12,2),
  status text NOT NULL DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deals_seller ON deals(seller_dealer_id);
CREATE INDEX IF NOT EXISTS idx_deals_buyer ON deals(buyer_dealer_id);

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_deals" ON deals;
CREATE POLICY "select_own_deals" ON deals FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = seller_dealer_id AND dealers.user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = buyer_dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_deals" ON deals;
CREATE POLICY "insert_own_deals" ON deals FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = buyer_dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_deals" ON deals;
CREATE POLICY "update_own_deals" ON deals FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = seller_dealer_id AND dealers.user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = buyer_dealer_id AND dealers.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = seller_dealer_id AND dealers.user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = buyer_dealer_id AND dealers.user_id = auth.uid())
  );
