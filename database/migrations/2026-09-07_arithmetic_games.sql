CREATE TABLE IF NOT EXISTS arithmetic_operations (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('addition','subtraction','division')),
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 7),
  operand_a INTEGER NOT NULL CHECK (operand_a >= 0),
  operand_b INTEGER NOT NULL CHECK (operand_b > 0),
  answer INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  points_awarded INTEGER NOT NULL DEFAULT 0 CHECK (points_awarded >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_arithmetic_operations_user_created
  ON arithmetic_operations (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_arithmetic_operations_type
  ON arithmetic_operations (operation_type);
