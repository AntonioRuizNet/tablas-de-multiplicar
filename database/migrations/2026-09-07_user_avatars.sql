ALTER TABLE users
  ADD COLUMN IF NOT EXISTS avatar_icon VARCHAR(64),
  ADD COLUMN IF NOT EXISTS avatar_color VARCHAR(16);

UPDATE users
SET avatar_icon = COALESCE(avatar_icon, 'GiLion'),
    avatar_color = COALESCE(avatar_color, '#5B8DEF')
WHERE avatar_icon IS NULL OR avatar_color IS NULL;
