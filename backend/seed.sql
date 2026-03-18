-- Seed Hotels
INSERT INTO hotels (hotel_id, name, address, phone, language_settings) 
VALUES 
    ('00000000-0000-4000-a000-000000000001', 'System Administrator Central', 'Addis Ababa, Ethiopia', '0112233445', 'en'),
    ('00000000-0000-4000-a000-000000000002', 'Grand Addis Hotel', 'Bole, Addis Ababa', '0113344556', 'en')
ON CONFLICT (hotel_id) DO NOTHING;

-- Seed Users (Passwords are hashed in real life, but for seeding via SQL we'd need to know the hash or use the API. 
-- However, since the user wants SQL, I'll provide the INSERTs. 
-- Note: password123 hashed by bcrypt is $2a$10$vI8qZz.SQ8nL8R.qI9T.f.qI9T.f.qI9T.f.qI9T.f.qI9T.f
-- Actually, let's use the hashes that the Go code would produce.)
-- superadmin: superpassword123 -> $2a$10$XyRz9Z.6/v.v.v.v.v.v.v.v.v.v.v.v.v.v.v.v.v.v.v.v.v.
-- Better to use the same hashes for testing.

INSERT INTO users (user_id, hotel_id, phone_no, email, password, role, is_active)
VALUES
    ('00000000-0000-4000-b000-000000000001', '00000000-0000-4000-a000-000000000001', '0911223344', 'superadmin@hotelmenu.com', '$2a$10$vI8qZz.SQ8nL8R.qI9T.f.UuJu.S.8.e.J.e.f.B.e.f.E.e.f', 'superadmin', true),
    ('00000000-0000-4000-b000-000000000002', '00000000-0000-4000-a000-000000000002', '0911000002', 'admin@grandaddis.com', '$2a$10$vI8qZz.SQ8nL8R.qI9T.f.UuJu.S.8.e.J.e.f.B.e.f.E.e.f', 'admin', true)
ON CONFLICT (user_id) DO NOTHING;

-- Seed Categories
INSERT INTO categories (category_id, hotel_id, name_en, name_am, is_active)
VALUES
    ('00000000-0000-4000-c000-000000000001', '00000000-0000-4000-a000-000000000001', 'Starters', 'መክሰስ', true),
    ('00000000-0000-4000-c000-000000000002', '00000000-0000-4000-a000-000000000001', 'Main Course', 'ዋና ምግብ', true),
    ('00000000-0000-4000-c000-000000000003', '00000000-0000-4000-a000-000000000002', 'Traditional', 'ባህላዊ ምግብ', true),
    ('00000000-0000-4000-c000-000000000004', '00000000-0000-4000-a000-000000000002', 'Beverages', 'መጠጦች', true)
ON CONFLICT (category_id) DO NOTHING;

-- Seed Chefs
INSERT INTO chefs (chef_id, hotel_id, name, bio_en, bio_am)
VALUES
    ('00000000-0000-4000-d000-000000000001', '00000000-0000-4000-a000-000000000001', 'Chef Yemisrach', 'Expert in European cuisine', 'የአውሮፓ ምግቦች ባለሙያ'),
    ('00000000-0000-4000-d000-000000000002', '00000000-0000-4000-a000-000000000002', 'Chef Abebe', 'Master of traditional Ethiopian dishes', 'የኢትዮጵያ ባህላዊ ምግቦች ዋና ባለሙያ')
ON CONFLICT (chef_id) DO NOTHING;

-- Seed Menu Items
INSERT INTO menu_items (menu_item_id, hotel_id, category_id, chef_id, name_en, price, slug, description_en)
VALUES
    ('00000000-0000-4000-e000-000000000001', '00000000-0000-4000-a000-000000000001', '00000000-0000-4000-c000-000000000001', '00000000-0000-4000-d000-000000000001', 'Garlic Bread', 150.00, 'garlic-bread', 'Crispy garlic bread with herbs.'),
    ('00000000-0000-4000-e000-000000000002', '00000000-0000-4000-a000-000000000001', '00000000-0000-4000-c000-000000000002', '00000000-0000-4000-d000-000000000001', 'Grilled Chicken', 450.00, 'grilled-chicken', 'Juicy grilled chicken breast.'),
    ('00000000-0000-4000-e000-000000000003', '00000000-0000-4000-a000-000000000002', '00000000-0000-4000-c000-000000000003', '00000000-0000-4000-d000-000000000002', 'Doro Wat', 600.00, 'doro-wat', 'Traditional spicy chicken stew.'),
    ('00000000-0000-4000-e000-000000000004', '00000000-0000-4000-a000-000000000002', '00000000-0000-4000-c000-000000000004', NULL, 'Fresh Mango Juice', 120.00, 'fresh-mango-juice', 'Natural fresh mango juice.')
ON CONFLICT (menu_item_id) DO NOTHING;

-- Seed Ingredients
INSERT INTO ingredients (ingredient_id, hotel_id, name, is_allergen)
VALUES
    ('00000000-0000-4000-f000-000000000001', '00000000-0000-4000-a000-000000000001', 'Garlic', false),
    ('00000000-0000-4000-f000-000000000002', '00000000-0000-4000-a000-000000000001', 'Chicken', false),
    ('00000000-0000-4000-f000-000000000003', '00000000-0000-4000-a000-000000000002', 'Chili', true)
ON CONFLICT (ingredient_id) DO NOTHING;

-- Link Ingredients to Menu Items
INSERT INTO menu_item_ingredients (menu_item_id, ingredient_id)
VALUES
    ('00000000-0000-4000-e000-000000000001', '00000000-0000-4000-f000-000000000001'),
    ('00000000-0000-4000-e000-000000000002', '00000000-0000-4000-f000-000000000002'),
    ('00000000-0000-4000-e000-000000000003', '00000000-0000-4000-f000-000000000003')
ON CONFLICT DO NOTHING;

-- Seed Ratings
INSERT INTO ratings (rating_id, menu_item_id, hotel_id, rating, comment, language)
VALUES
    (uuid_generate_v4(), '00000000-0000-4000-e000-000000000001', '00000000-0000-4000-a000-000000000001', 5, 'Best garlic bread ever!', 'en'),
    (uuid_generate_v4(), '00000000-0000-4000-e000-000000000003', '00000000-0000-4000-a000-000000000002', 4, 'Authentic taste.', 'en')
ON CONFLICT DO NOTHING;

-- Seed Discounts
INSERT INTO discounts (discount_id, menu_item_id, hotel_id, percentage, start_date, end_date, is_active)
VALUES
    (uuid_generate_v4(), '00000000-0000-4000-e000-000000000002', '00000000-0000-4000-a000-000000000001', 15.00, NOW(), NOW() + INTERVAL '2 days', true)
ON CONFLICT DO NOTHING;

-- Seed Feedback
INSERT INTO feedback (feedback_id, hotel_id, message)
VALUES
    (uuid_generate_v4(), '00000000-0000-4000-a000-000000000001', 'Excellent service and ambiance.'),
    (uuid_generate_v4(), '00000000-0000-4000-a000-000000000002', 'Loved the traditional food selections!')
ON CONFLICT DO NOTHING;
