INSERT INTO categories (name, sort_order) VALUES
('Appetizers', 10),
('Curries', 20),
('Breads', 30)
ON CONFLICT (name) DO NOTHING;

INSERT INTO items (name, category_id, description, price_cents, veg, spice_level, sort_order) VALUES
('Vegetable Samosa', (SELECT id FROM categories WHERE name='Appetizers'), 'Crispy fried pastry filled with spiced potatoes and peas.', 1200, TRUE, 1, 10),
('Pork Vindaloo', (SELECT id FROM categories WHERE name='Curries'), 'Spicy Goan curry with tender pork.', 3200, FALSE, 3, 10),
('Garlic Naan', (SELECT id FROM categories WHERE name='Breads'), 'Soft flatbread with garlic.', 600, TRUE, 0, 10)
ON CONFLICT DO NOTHING;
