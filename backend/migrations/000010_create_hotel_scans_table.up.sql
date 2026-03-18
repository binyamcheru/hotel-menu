CREATE TABLE hotel_scans (
    hotel_scan_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(hotel_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hotel_scans_hotel_id ON hotel_scans(hotel_id);
CREATE INDEX idx_hotel_scans_created_at ON hotel_scans(created_at);
