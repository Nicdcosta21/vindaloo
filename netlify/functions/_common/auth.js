export function requireAdmin(event) {
  const token = event.headers.authorization?.split(' ')[1];
  if (token !== process.env.ADMIN_SECRET) {
    return {
      statusCode: 403,
      body: 'Forbidden'
    };
  }
  return null;
}

const ALLOWED = [
  'https://vindaloo.nikagenyx.com',
  'https://pos.vindaloo.nikagenyx.com'
];

export function cors(h = {}, origin = '') {
  const allow = ALLOWED.includes(origin) ? origin : ALLOWED[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    ...h
  };
}
