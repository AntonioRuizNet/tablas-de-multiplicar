-- Nuevo soporte para recompensas persistentes de contrarreloj, pruebas, diploma,
-- práctica de errores y juego de memoria.
CREATE TABLE IF NOT EXISTS activity_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type varchar(32) NOT NULL,
  correct_count integer NOT NULL DEFAULT 0,
  wrong_count integer NOT NULL DEFAULT 0,
  total_count integer NOT NULL DEFAULT 0,
  score_percent integer NOT NULL DEFAULT 0,
  moves integer NOT NULL DEFAULT 0,
  points_awarded integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_operations (
  id bigserial PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES activity_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  table_number integer NOT NULL CHECK (table_number BETWEEN 1 AND 12),
  multiplier integer NOT NULL CHECK (multiplier BETWEEN 1 AND 12),
  is_correct boolean NOT NULL,
  response_time_seconds numeric(8,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_sessions_user_created ON activity_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_sessions_user_type_created ON activity_sessions(user_id, activity_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_operations_user_created ON activity_operations(user_id, created_at ASC);
