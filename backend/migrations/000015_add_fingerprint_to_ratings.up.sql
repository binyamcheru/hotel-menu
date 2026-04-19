ALTER TABLE ratings ADD COLUMN fingerprint VARCHAR(64) NOT NULL DEFAULT '';
ALTER TABLE ratings ADD CONSTRAINT uq_ratings_menu_item_fingerprint UNIQUE (menu_item_id, fingerprint);
