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
    const { id } = event.queryStringParameters;
    await query('DELETE FROM items WHERE id = $1', [id]);
    return { statusCode: 200, headers, body: 'deleted' };
  } catch (error) {
    console.error('Error deleting item:', error);
    return { statusCode: 500, headers, body: 'Internal Server Error' };
  }
}
