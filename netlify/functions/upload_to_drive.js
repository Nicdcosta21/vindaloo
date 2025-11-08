// netlify/functions/upload_to_drive.js
import { google } from "googleapis";
import stream from "stream";
import jwt from "jsonwebtoken";

const allowedOrigins = [
  "https://pos.vindaloo.nikagenyx.com",
  "https://vindaloo.nikagenyx.com",
  "http://localhost:8888"
];

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

function respond(code, body, event) {
  return {
    statusCode: code,
    headers: { "Content-Type": "application/json", ...cors(event) },
    body: JSON.stringify(body),
  };
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors(event) };
  }

  // ✅ Verify JWT
  const auth = event.headers.authorization || "";
  const token = auth.replace("Bearer ", "");
  try {
    jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
  } catch {
    return respond(401, { error: "unauthorized" }, event);
  }

  // ✅ Convert file to stream
  const bodyBuffer = Buffer.from(event.body, "base64");
  const fileStream = new stream.PassThrough();
  fileStream.end(bodyBuffer);

  try {
    // ✅ Google Drive setup
    const credentials = JSON.parse(process.env.GDRIVE_SERVICE_ACCOUNT_JSON);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });
    const drive = google.drive({ version: "v3", auth });

    const folderId = process.env.GDRIVE_FOLDER_ID;
    const fileMetadata = {
      name: `menu_${Date.now()}.jpg`,
      parents: [folderId],
    };

    const media = {
      mimeType: "image/jpeg",
      body: fileStream,
    };

    // ✅ Upload
    const res = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: "id, webViewLink",
    });

    // ✅ Make public
    await drive.permissions.create({
      fileId: res.data.id,
      requestBody: { role: "reader", type: "anyone" },
    });

    const fileUrl = `https://drive.google.com/uc?export=view&id=${res.data.id}`;
    return respond(200, { ok: true, fileUrl }, event);
  } catch (err) {
    console.error(err);
    return respond(500, { error: err.message }, event);
  }
};
