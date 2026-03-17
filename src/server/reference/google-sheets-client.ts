import { createSign } from "node:crypto";

interface ServiceAccountCredentials {
  clientEmail: string;
  privateKey: string;
}

interface TokenResponse {
  access_token: string;
}

export interface GoogleSheetsClient {
  getValues: (spreadsheetId: string, range: string) => Promise<string[][]>;
}

export function createGoogleSheetsClient(
  credentials: ServiceAccountCredentials,
): GoogleSheetsClient {
  return {
    getValues: async (spreadsheetId, range) => {
      const token = await fetchAccessToken(credentials);
      const encodedRange = encodeURIComponent(range);
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!response.ok) {
        throw new Error(
          `Google Sheets values.get failed: ${response.status} ${response.statusText}`,
        );
      }
      const json = (await response.json()) as { values?: string[][] };
      return json.values ?? [];
    },
  };
}

export function readServiceAccountFromEnv(env: NodeJS.ProcessEnv = process.env) {
  const clientEmail = env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "";
  const privateKey = (env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");
  }
  return { clientEmail, privateKey };
}

async function fetchAccessToken(credentials: ServiceAccountCredentials): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const assertion = signJwt(credentials, now);
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch Google access token: ${response.status} ${response.statusText}`,
    );
  }
  const json = (await response.json()) as TokenResponse;
  return json.access_token;
}

function signJwt(credentials: ServiceAccountCredentials, now: number): string {
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: credentials.clientEmail,
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();
  const signature = signer.sign(credentials.privateKey);

  return `${unsignedToken}.${base64UrlEncode(signature)}`;
}

function base64UrlEncode(input: string | Buffer): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}
