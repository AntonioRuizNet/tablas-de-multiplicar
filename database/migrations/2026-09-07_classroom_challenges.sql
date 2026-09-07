CREATE TABLE IF NOT EXISTS classroom_challenges (
  id BIGSERIAL PRIMARY KEY,
  classroom_id BIGINT NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(140) NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE,
  tables SMALLINT[] NOT NULL,
  question_count SMALLINT NOT NULL CHECK (question_count BETWEEN 5 AND 100),
  due_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (cardinality(tables) BETWEEN 1 AND 12)
);

CREATE INDEX IF NOT EXISTS idx_classroom_challenges_classroom
  ON classroom_challenges(classroom_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_classroom_challenges_code
  ON classroom_challenges(code);

CREATE TABLE IF NOT EXISTS challenge_attempts (
  id BIGSERIAL PRIMARY KEY,
  challenge_id BIGINT NOT NULL REFERENCES classroom_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  correct_count INTEGER NOT NULL DEFAULT 0 CHECK (correct_count >= 0),
  wrong_count INTEGER NOT NULL DEFAULT 0 CHECK (wrong_count >= 0),
  duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
  UNIQUE (challenge_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_attempts_user
  ON challenge_attempts(user_id, started_at DESC);

CREATE TABLE IF NOT EXISTS challenge_attempt_questions (
  id BIGSERIAL PRIMARY KEY,
  attempt_id BIGINT NOT NULL REFERENCES challenge_attempts(id) ON DELETE CASCADE,
  position SMALLINT NOT NULL CHECK (position > 0),
  table_number SMALLINT NOT NULL CHECK (table_number BETWEEN 1 AND 12),
  multiplier SMALLINT NOT NULL CHECK (multiplier BETWEEN 1 AND 12),
  expected_answer INTEGER NOT NULL,
  user_answer INTEGER,
  is_correct BOOLEAN,
  response_time_seconds NUMERIC(8,2),
  points_awarded INTEGER NOT NULL DEFAULT 0 CHECK (points_awarded >= 0),
  answered_at TIMESTAMPTZ,
  UNIQUE (attempt_id, position)
);

CREATE INDEX IF NOT EXISTS idx_challenge_questions_attempt
  ON challenge_attempt_questions(attempt_id, position);
