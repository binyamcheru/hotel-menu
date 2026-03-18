CREATE TABLE menu_item_ingredients (
    menu_item_ingredient_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID NOT NULL REFERENCES menu_items(menu_item_id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
    UNIQUE(menu_item_id, ingredient_id)
);

CREATE INDEX idx_mii_menu_item_id ON menu_item_ingredients(menu_item_id);
CREATE INDEX idx_mii_ingredient_id ON menu_item_ingredients(ingredient_id);
