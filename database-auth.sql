-- Ejecuta este SQL DESPUÉS de la tabla users que ya has creado.
-- No modifica el rol de tu usuario administrador existente.

CREATE TABLE auth_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX idx_auth_sessions_expires_at ON auth_sessions(expires_at);

CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

CREATE TABLE user_progress (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
    level INTEGER NOT NULL DEFAULT 0 CHECK (level >= 0),
    rank INTEGER NOT NULL DEFAULT 0 CHECK (rank >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE practice_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    table_number SMALLINT NOT NULL CHECK (table_number BETWEEN 1 AND 12),
    points_awarded INTEGER NOT NULL DEFAULT 0 CHECK (points_awarded >= 0),
    correct_count INTEGER NOT NULL DEFAULT 0 CHECK (correct_count >= 0),
    wrong_count INTEGER NOT NULL DEFAULT 0 CHECK (wrong_count >= 0),
    average_time_seconds NUMERIC(10,2),
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP
);
CREATE INDEX idx_practice_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX idx_practice_sessions_user_completed ON practice_sessions(user_id, completed_at);

CREATE TABLE practice_operations (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
    table_number SMALLINT NOT NULL CHECK (table_number BETWEEN 1 AND 12),
    multiplier SMALLINT NOT NULL CHECK (multiplier BETWEEN 1 AND 10),
    is_correct BOOLEAN NOT NULL,
    response_time_seconds NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (response_time_seconds >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_practice_operations_user_id ON practice_operations(user_id);
CREATE INDEX idx_practice_operations_session_id ON practice_operations(session_id);
CREATE INDEX idx_practice_operations_user_created ON practice_operations(user_id, created_at);

CREATE TABLE user_achievements (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL,
    unlocked_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, achievement_id)
);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);

-- Crea el registro de progreso para usuarios que ya existieran antes de esta migración.
INSERT INTO user_progress (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;
