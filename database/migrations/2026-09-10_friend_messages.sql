CREATE TABLE IF NOT EXISTS friend_messages (
  id BIGSERIAL PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body VARCHAR(280) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  CHECK (sender_id <> recipient_id)
);

CREATE INDEX IF NOT EXISTS friend_messages_conversation_idx ON friend_messages (sender_id, recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS friend_messages_recipient_unread_idx ON friend_messages (recipient_id, read_at) WHERE read_at IS NULL;

CREATE TABLE IF NOT EXISTS user_blocks (
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

CREATE TABLE IF NOT EXISTS friend_message_reports (
  id BIGSERIAL PRIMARY KEY,
  message_id BIGINT NOT NULL REFERENCES friend_messages(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (message_id, reporter_id)
);
