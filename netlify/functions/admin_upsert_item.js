import { query } from './_common/db.js';
import { requireAdmin, cors } from './_common/auth.js';

export async function handler(event, context) {
  const authResponse = requireAdmin(event);
  if (authResponse) return authResponse;

  const headers = cors({}, event.headers.origin);
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    const { id, category_id, name, description, price_cents, veg, spice_level, image_url, is_available, is_special, sort_order } = JSON.parse(event.body);

    if (id) {
      await query(`
        UPDATE items
        SET
          category_id = $1, name = $2, description = $3, price_cents = $4, veg = $5, spice_level = $6,
          image_url = $7, is_available = $8, is_special = $9, sort_order = $10, updated_at = NOW()
        WHERE id = $11
      `, [category_id, name, description, price_cents, veg, spice_level, image_url, is_available, is_special, sort_order, id]);
      return { statusCode: 200, headers, body: 'updated' };
    } else {
      const { rows } = await query(`
        INSERT INTO items (
          category_id, name, description, price_cents, veg, spice_level, image_url, is_available, is_special, sort_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `, [category_id, name, description, price_cents, veg, spice_level, image_url, is_available, is_special, sort_order]);
      return { statusCode: 201, headers, body: JSON.stringify({ id: rows[0].id }) };
    }
  } catch (error) {
    console.error('Error upserting item:', error);
    return { statusCode: 500, headers, body: 'Internal Server Error' };
  }
}
