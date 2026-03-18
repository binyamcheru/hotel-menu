CREATE TABLE menu_items (
    menu_item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(hotel_id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
    chef_id UUID REFERENCES chefs(chef_id) ON DELETE SET NULL,
    name_en VARCHAR(255) NOT NULL,
    name_am VARCHAR(255) NOT NULL DEFAULT '',
    description_en TEXT DEFAULT '',
    description_am TEXT DEFAULT '',
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    image_url TEXT DEFAULT '',
    video_url TEXT DEFAULT '',
    is_special BOOLEAN NOT NULL DEFAULT FALSE,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    view_count INTEGER NOT NULL DEFAULT 0,
    slug VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_menu_items_hotel_id ON menu_items(hotel_id);
CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_menu_items_chef_id ON menu_items(chef_id);
CREATE INDEX idx_menu_items_slug ON menu_items(slug);
