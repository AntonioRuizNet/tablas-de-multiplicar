CREATE TABLE IF NOT EXISTS friendships (
  id BIGSERIAL PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (requester_id <> recipient_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS friendships_unique_pair ON friendships (LEAST(requester_id, recipient_id), GREATEST(requester_id, recipient_id));
CREATE INDEX IF NOT EXISTS friendships_recipient_pending_idx ON friendships (recipient_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS friendships_requester_idx ON friendships (requester_id, status, updated_at DESC);
