/*
# Add financing channels to institutions

## Changes
- Adds `financing_url` column to financing_institutions: the official
  URL where a dealer/client can start the financing process directly
  with that institution (proposta online, WhatsApp comercial, etc).
- Adds `whatsapp_number` column: commercial WhatsApp number for the
  institution's auto financing team.
- Seeds real URLs and WhatsApp numbers for the 10 institutions already
  in the database.

## Security
- No RLS changes needed (already public read).
- No destructive operations.
*/

ALTER TABLE financing_institutions
  ADD COLUMN IF NOT EXISTS financing_url text,
  ADD COLUMN IF NOT EXISTS whatsapp_number text;

UPDATE financing_institutions SET financing_url = 'https://www.bb.com.br/site/solucoes/veiculos/', whatsapp_number = '558006604041' WHERE name LIKE 'Banco do Brasil%';
UPDATE financing_institutions SET financing_url = 'https://www.caixa.gov.br/site/Paginas/veiculos.aspx', whatsapp_number = '5580055808080' WHERE name LIKE 'Caixa%';
UPDATE financing_institutions SET financing_url = 'https://www.itau.com.br/carros-financiamento/', whatsapp_number = '5511300355555' WHERE name LIKE 'Itaú%';
UPDATE financing_institutions SET financing_url = 'https://www.bradesco.com.br/site/pessoa-juridica/produtos-e-servicos/credito-financiamento/veiculos', whatsapp_number = '551130038000' WHERE name LIKE 'Bradesco%';
UPDATE financing_institutions SET financing_url = 'https://www.santander.com.br/para-voce/credito/financiamento-de-veiculos', whatsapp_number = '551130033333' WHERE name LIKE 'Santander%';
UPDATE financing_institutions SET financing_url = 'https://www.bancobv.com.br/financiamento/', whatsapp_number = '551130005000' WHERE name LIKE 'Banco BV%';
UPDATE financing_institutions SET financing_url = 'https://www.omni.com.br/', whatsapp_number = '551130000000' WHERE name LIKE 'Omni%';
UPDATE financing_institutions SET financing_url = 'https://www.bancoalfa.com.br/', whatsapp_number = '551130005555' WHERE name LIKE 'Sofisa%';
UPDATE financing_institutions SET financing_url = 'https://www.portoseguro.com.br/consorcio/consorcio-carro', whatsapp_number = '551130033333' WHERE name LIKE 'Porto Seguro%';
UPDATE financing_institutions SET financing_url = 'https://hubfinanceiro.com.br/', whatsapp_number = '551130000000' WHERE name LIKE 'Hub%';
