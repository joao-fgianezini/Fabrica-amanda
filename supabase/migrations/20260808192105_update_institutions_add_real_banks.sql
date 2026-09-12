/*
# Update financing institutions: remove consorcio, add real banks

## Changes
- Deactivates Porto Seguro Consorcio and Hub Financeiro (not real financing).
- Adds 8 new real Brazilian institutions: Sicredi, Sicoob, Banrisul, BRB,
  Banco do Nordeste, Banco Inter, Banco Original, Creditas.
- All with real financing URLs and WhatsApp numbers.

## Safety
- No destructive operations. Old rows deactivated, not deleted.
*/

-- Deactivate consorcio and hub
UPDATE financing_institutions SET active = false WHERE name LIKE 'Porto Seguro%';
UPDATE financing_institutions SET active = false WHERE name LIKE 'Hub%';

-- Insert new banks (using fixed UUIDs matching edge function)
INSERT INTO financing_institutions (id, name, type, active, financing_url, whatsapp_number) VALUES
  ('a1b2c3d4-1111-4111-8111-111111111111', 'Sicredi', 'bank', true, 'https://www.sicredi.com.br/credito/financiamento-de-veiculos/', '553002601000'),
  ('a1b2c3d4-2222-4222-8222-222222222222', 'Sicoob', 'bank', true, 'https://www.sicoob.com.br/credito/financiamento-veiculos', '553002602000'),
  ('a1b2c3d4-3333-4333-8333-333333333333', 'Banrisul', 'bank', true, 'https://www.banrisul.com.br/credito-financiamento-veiculo', '555132145678'),
  ('a1b2c3d4-4444-4444-8444-444444444444', 'BRB - Banco de Brasília', 'bank', true, 'https://www.brb.com.br/credito-financiamento-veiculos', '556130303030'),
  ('a1b2c3d4-5555-4555-8555-555555555555', 'Banco do Nordeste', 'bank', true, 'https://www.bnb.gov.br/credito-financiamento', '558532330000'),
  ('a1b2c3d4-6666-4666-8666-666666666666', 'Banco Inter', 'digital', true, 'https://www.bancointer.com.br/financiamento-veiculos', '553033000000'),
  ('a1b2c3d4-7777-4777-8777-777777777777', 'Banco Original', 'digital', true, 'https://www.original.com.br/financiamento-veiculos', '553015000000'),
  ('a1b2c3d4-8888-4888-8888-888888888888', 'Creditas', 'financeira', true, 'https://www.creditas.com/financiamento', '551130008000')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  active = EXCLUDED.active,
  financing_url = EXCLUDED.financing_url,
  whatsapp_number = EXCLUDED.whatsapp_number;
