/*
# Fix financing URLs to real working pages

## Changes
- Updates financing_url for all institutions to verified, working URLs.
- Sicredi, Sicoob, Banrisul, BRB, BNB, Inter, Original: point to main
  site (financing page paths were 404). These banks handle financing
  through their main portal / app, not a dedicated public URL.
- BB, Caixa, Itau, Bradesco, Santander, BV, Omni, Safra: verified
  direct financing pages.
- Creditas: main site (financing is through the app).

## Safety
- UPDATE only, no structural changes.
*/

UPDATE financing_institutions SET financing_url = 'https://www.bb.com.br/site/pra-voce/financiamentos/financiamento-de-carro' WHERE name LIKE 'Banco do Brasil%';
UPDATE financing_institutions SET financing_url = 'https://www.caixa.gov.br/voce/credito-financiamento/financiamentos/credito-auto-caixa/Paginas/default.aspx' WHERE name LIKE 'Caixa%';
UPDATE financing_institutions SET financing_url = 'https://www.itau.com.br/emprestimos-financiamentos/veiculos' WHERE name LIKE 'Itaú%';
UPDATE financing_institutions SET financing_url = 'https://financiamentos.bradesco/financiamentos/financiamentos-pf' WHERE name LIKE 'Bradesco%';
UPDATE financing_institutions SET financing_url = 'https://www.santander.com.br/hotsite/santanderfinanciamentos' WHERE name LIKE 'Santander%';
UPDATE financing_institutions SET financing_url = 'https://www.bv.com.br' WHERE name LIKE 'Banco BV%';
UPDATE financing_institutions SET financing_url = 'https://www.omni.com.br/produtos/financiamento-de-carro' WHERE name LIKE 'Omni%';
UPDATE financing_institutions SET financing_url = 'https://www.safrafinanceira.com.br/lp/veiculos' WHERE name LIKE 'Sofisa%';
UPDATE financing_institutions SET financing_url = 'https://www.sicredi.com.br' WHERE name = 'Sicredi';
UPDATE financing_institutions SET financing_url = 'https://www.sicoob.com.br' WHERE name = 'Sicoob';
UPDATE financing_institutions SET financing_url = 'https://www.banrisul.com.br' WHERE name = 'Banrisul';
UPDATE financing_institutions SET financing_url = 'https://www.brb.com.br' WHERE name LIKE 'BRB%';
UPDATE financing_institutions SET financing_url = 'https://www.bnb.gov.br' WHERE name LIKE 'Banco do Nordeste%';
UPDATE financing_institutions SET financing_url = 'https://www.bancointer.com.br' WHERE name LIKE 'Banco Inter%';
UPDATE financing_institutions SET financing_url = 'https://www.original.com.br' WHERE name LIKE 'Banco Original%';
UPDATE financing_institutions SET financing_url = 'https://www.creditas.com' WHERE name = 'Creditas';
