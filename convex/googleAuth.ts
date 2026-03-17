"use node";

import { GoogleAuth } from "google-auth-library";

export function buildGoogleAuth(): GoogleAuth {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "";
  const key = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
  if (!email || !key) throw new Error("Missing Google service account credentials");
  return new GoogleAuth({
    credentials: { client_email: email, private_key: key },
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.metadata.readonly",
    ],
  });
}
