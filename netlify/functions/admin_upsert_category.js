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
    const { id, name, sort_order } = JSON.parse(event.body);

    if (id) {
      await query(`
        UPDATE categories
        SET name = $1, sort_order = $2, updated_at = NOW()
        WHERE id = $3
      `, [name, sort_order, id]);
      return { statusCode: 200, headers, body: 'updated' };
    } else {
      const { rows } = await query(`
        INSERT INTO categories (name, sort_order) VALUES ($1, $2) RETURNING id
      `, [name, sort_order]);
      return { statusCode: 201, headers, body: JSON.stringify({ id: rows[0].id }) };
    }
  } catch (error) {
    console.error('Error upserting category:', error);
    return { statusCode: 500, headers, body: 'Internal Server Error' };
  }
}
