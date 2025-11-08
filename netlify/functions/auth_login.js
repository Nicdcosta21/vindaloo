// netlify/functions/auth_login.js
import jwt from "jsonwebtoken";

const allowedOrigins = [
  "https://pos.vindaloo.nikagenyx.com",
  "https://vindaloo.nikagenyx.com",
  "http://localhost:8888" // optional for local testing
];

// ✅ Dynamic CORS handler
function cors(event) {
  const origin = event?.headers?.origin || "";
  const allowOrigin = allowedOrigins.includes(origin)
    ? origin
    : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

// ✅ Unified response helper
function respond(code, body, event) {
  return {
    statusCode: code,
    headers: { "Content-Type": "application/json", ...cors(event) },
    body: JSON.stringify(body),
  };
}

// ✅ Main handler
export const handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors(event) };
  }

  try {
    const { username, pin } = JSON.parse(event.body || "{}");
    if (!username || !pin) {
      return respond(400, { error: "username and pin required" }, event);
    }

    // --- DEV-MODE SUPERUSER ---
    if (username === "superuser" && pin === "271025") {
      const token = jwt.sign(
        { username, role: "super_admin" },
        process.env.JWT_SECRET || "dev_secret",
        { expiresIn: "12h" }
      );
      return respond(200, { ok: true, token, role: "super_admin" }, event);
    }

    // (Future) Query NeonDB here for real users
    return respond(401, { error: "Invalid credentials" }, event);
  } catch (err) {
    return respond(500, { error: err.message }, event);
  }
};
