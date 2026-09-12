ALTER TABLE dealers ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
