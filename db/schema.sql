CREATE TABLE IF NOT EXISTS categories (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(255) UNIQUE NOT NULL,
  sort_order   INT          NOT NULL,
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS items (
  id            SERIAL PRIMARY KEY,
  category_id   INT REFERENCES categories(id) ON DELETE SET NULL,
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  price_cents   INT          NOT NULL,
  veg           BOOLEAN      NOT NULL DEFAULT FALSE,
  spice_level   INT,
  image_url     TEXT,
  is_available  BOOLEAN      NOT NULL DEFAULT TRUE,
  is_special    BOOLEAN      NOT NULL DEFAULT FALSE,
  sort_order    INT          NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
