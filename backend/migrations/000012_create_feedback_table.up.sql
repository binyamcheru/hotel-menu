CREATE TABLE feedback (
    feedback_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(hotel_id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(menu_item_id) ON DELETE SET NULL,
    category VARCHAR(100) DEFAULT '',
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feedback_hotel_id ON feedback(hotel_id);
CREATE INDEX idx_feedback_menu_item_id ON feedback(menu_item_id);
