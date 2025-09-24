import { query } from './_common/db.js';
import { cors } from './_common/auth.js';

export async function handler(event, context) {
  const headers = cors({}, event.headers.origin);
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  const { specials } = event.queryStringParameters || {};
  
  let itemQuery = 'SELECT * FROM items';
  if (specials) {
    itemQuery += ' WHERE is_special = TRUE AND is_available = TRUE';
  }
  itemQuery += ' ORDER BY sort_order';

  try {
    const { rows: categories } = await query('SELECT * FROM categories ORDER BY sort_order');
    const { rows: items } = await query(itemQuery);

    const categoriesWithItems = categories.map(cat => ({
      ...cat,
      items: items.filter(item => item.category_id === cat.id)
    }));
    
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories: categoriesWithItems })
    };
  } catch (error) {
    console.error('Error fetching menu:', error);
    return {
      statusCode: 500,
      headers,
      body: 'Internal Server Error'
    };
  }
}
