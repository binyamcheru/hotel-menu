CREATE TABLE menu_views (
    menu_view_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(hotel_id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(menu_item_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_menu_views_hotel_id ON menu_views(hotel_id);
CREATE INDEX idx_menu_views_menu_item_id ON menu_views(menu_item_id);
CREATE INDEX idx_menu_views_created_at ON menu_views(created_at);
