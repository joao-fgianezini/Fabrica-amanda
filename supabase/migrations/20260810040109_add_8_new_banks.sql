INSERT INTO financing_institutions (id, name, type, active, financing_url, whatsapp_number)
VALUES
  ('a1b2c3d4-9999-4999-8999-999999999999', 'Banco PAN', 'bank', true, 'https://www.bancopan.com.br/auto', '558002801500'),
  ('a1b2c3d4-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'C6 Bank', 'digital', true, 'https://www.c6bank.com.br/financiamento', '553002600600'),
  ('a1b2c3d4-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Rodobens', 'financeira', true, 'https://www.rodobens.com.br/financiamento', '551130001000'),
  ('a1b2c3d4-cccc-4ccc-8ccc-cccccccccccc', 'Sinosserra', 'financeira', true, 'https://www.sinosserra.com.br', '551130002000'),
  ('a1b2c3d4-dddd-4ddd-8ddd-dddddddddddd', 'Financeira Alfa', 'financeira', true, 'https://www.alfa.com.br/financiamento', '551130003000'),
  ('a1b2c3d4-eeee-4eee-8eee-eeeeeeeeeeee', 'Banco Toyota', 'bank', true, 'https://www.bancotoyota.com.br', '551130004000'),
  ('a1b2c3d4-ffff-4fff-8fff-ffffffffffff', 'Banco Honda', 'bank', true, 'https://www.bancohonda.com.br', '551130005000'),
  ('b1b2c3d4-1111-4111-8111-111111111111', 'Banco Volkswagen', 'bank', true, 'https://www.bancovolkswagen.com.br', '551130006000')
ON CONFLICT (id) DO NOTHING;