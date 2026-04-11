-- Drop category column and make menu_item_id required
ALTER TABLE feedback DROP COLUMN IF EXISTS category;
ALTER TABLE feedback ALTER COLUMN menu_item_id SET NOT NULL;
