-- Migration to create increment_downloads RPC function for atomic downlods count updates
CREATE OR REPLACE FUNCTION increment_downloads(mod_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE mods
  SET downloads_count = COALESCE(downloads_count, 0) + 1
  WHERE id = mod_id
  RETURNING downloads_count INTO new_count;
  
  RETURN COALESCE(new_count, 0);
END;
$$ LANGUAGE plpgsql;
