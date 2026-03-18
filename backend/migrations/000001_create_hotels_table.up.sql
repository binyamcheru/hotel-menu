CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE hotels (
    hotel_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    logo TEXT DEFAULT '',
    address TEXT DEFAULT '',
    phone VARCHAR(50) DEFAULT '',
    language_settings VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
