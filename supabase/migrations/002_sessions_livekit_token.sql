-- Store LiveKit JWT for in-app video (join_url alone is the wss server, not a web page)
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS livekit_token TEXT;
