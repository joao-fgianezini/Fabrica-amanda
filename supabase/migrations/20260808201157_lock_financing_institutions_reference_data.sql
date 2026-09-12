/*
  # Make the financing institution list read-only for clients

  1. Problem
     - `insert_financing_institutions` and `update_financing_institutions` both had
       `WITH CHECK (true)` for every authenticated account, so any dealer could
       rewrite the financing URL or WhatsApp number shown to every other dealer.

  2. Changes
     - Both write policies are dropped and write privileges revoked.
     - Read access is unchanged, so the financing screens keep working.
     - The list stays maintainable through migrations / the service role.
*/

DROP POLICY IF EXISTS "insert_financing_institutions" ON financing_institutions;
DROP POLICY IF EXISTS "update_financing_institutions" ON financing_institutions;

REVOKE INSERT, UPDATE, DELETE ON financing_institutions FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON financing_institutions FROM anon;
