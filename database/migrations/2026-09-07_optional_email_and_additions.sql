ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

CREATE TABLE IF NOT EXISTS addition_operations (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level integer NOT NULL CHECK (level BETWEEN 1 AND 7),
  addend_a integer NOT NULL CHECK (addend_a >= 0),
  addend_b integer NOT NULL CHECK (addend_b >= 0),
  answer integer NOT NULL,
  is_correct boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addition_operations_user_created
  ON addition_operations(user_id, created_at DESC);
