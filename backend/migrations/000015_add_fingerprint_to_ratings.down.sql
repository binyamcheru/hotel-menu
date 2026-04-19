ALTER TABLE ratings DROP CONSTRAINT IF EXISTS uq_ratings_menu_item_fingerprint;
ALTER TABLE ratings DROP COLUMN IF EXISTS fingerprint;
