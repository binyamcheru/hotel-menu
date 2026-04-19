-- Rating: enforce one rating per user (fingerprint) per menu item
DELETE FROM ratings a USING ratings b
  WHERE a.rating_id > b.rating_id
    AND a.menu_item_id = b.menu_item_id
    AND a.fingerprint = b.fingerprint;

ALTER TABLE ratings
  ADD CONSTRAINT uq_ratings_menu_item_fingerprint UNIQUE (menu_item_id, fingerprint);

-- Feedback: add fingerprint column and enforce one feedback per user per menu item
ALTER TABLE feedback ADD COLUMN fingerprint VARCHAR(64) NOT NULL DEFAULT '';

ALTER TABLE feedback
  ADD CONSTRAINT uq_feedback_menu_item_fingerprint UNIQUE (menu_item_id, fingerprint);
