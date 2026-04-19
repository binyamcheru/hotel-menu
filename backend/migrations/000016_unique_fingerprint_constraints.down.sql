ALTER TABLE ratings DROP CONSTRAINT IF EXISTS uq_ratings_menu_item_fingerprint;
ALTER TABLE feedback DROP CONSTRAINT IF EXISTS uq_feedback_menu_item_fingerprint;
ALTER TABLE feedback DROP COLUMN IF EXISTS fingerprint;
