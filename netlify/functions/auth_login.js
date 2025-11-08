// netlify/functions/auth_login.js
import jwt from "jsonwebtoken";

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors() };
  }

  try {
    const { username, pin } = JSON.parse(event.body || "{}");
    if (!username || !pin) {
      return respond(400, { error: "username and pin required" });
    }

    // --- DEV-MODE SUPERUSER ---
    if (username === "superuser" && pin === "271025") {
      const token = jwt.sign(
        { username, role: "super_admin" },
        process.env.JWT_SECRET || "dev_secret",
        { expiresIn: "12h" }
      );
      return respond(200, { ok: true, token, role: "super_admin" });
    }

    // later: query NeonDB for user + bcrypt.compare(pin, hash)
    return respond(401, { error: "Invalid credentials" });
  } catch (err) {
    return respond(500, { error: err.message });
  }
};

function cors() {
  return {
    "Access-Control-Allow-Origin":
      process.env.ALLOW_ORIGIN ||
      "https://pos.vindaloo.nikagenyx.com",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
  };
}
function respond(code, body) {
  return {
    statusCode: code,
    headers: { "Content-Type": "application/json", ...cors() },
    body: JSON.stringify(body),
  };
}
