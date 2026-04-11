-- Revert: re-add category column and make menu_item_id nullable
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT '';
ALTER TABLE feedback ALTER COLUMN menu_item_id DROP NOT NULL;
