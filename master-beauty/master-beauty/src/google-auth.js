/*
  Google Identity Services — OAuth implicit flow (access token)
  No backend needed. Token lives in localStorage (expires in ~1 hour).

  SETUP (one-time, ~10 min):
  1. console.cloud.google.com → New Project → "Master Hunting Beauty"
  2. APIs & Services → Library → enable: Gmail API, Google Calendar API, Google Drive API
  3. APIs & Services → Credentials → + Create Credentials → OAuth 2.0 Client ID
     - Type: Web application
     - Authorized JS origins: https://seu-site.vercel.app  AND  http://localhost:5173
     - Authorized redirect URIs: (leave empty for implicit flow)
  4. Copy the Client ID → Vercel Dashboard → Settings → Environment Variables
     - Key:   VITE_GOOGLE_CLIENT_ID
     - Value: 123456789-abc....apps.googleusercontent.com
  5. Redeploy.

  While testing locally: create .env.local at project root:
    VITE_GOOGLE_CLIENT_ID=your-client-id-here
*/

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/drive.readonly",
].join(" ");

const TOKEN_KEY  = "mhb_gtoken";
const EXPIRY_KEY = "mhb_gexpiry";

let _client = null;
let _pendingResolve = null;
let _pendingReject  = null;

function loadGIS() {
  return new Promise((resolve) => {
    if (window.google?.accounts?.oauth2) { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = resolve;
    s.onerror = resolve; // fail silently — app still works with mock data
    document.head.appendChild(s);
  });
}

export async function initGoogleAuth() {
  if (!GOOGLE_CLIENT_ID) return; // not configured — mock mode
  if (_client) return;
  await loadGIS();
  if (!window.google?.accounts?.oauth2) return;

  _client = window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: SCOPES,
    callback: (resp) => {
      if (resp.error) {
        _pendingReject?.(new Error(resp.error));
        _pendingReject = null; _pendingResolve = null;
        return;
      }
      if (resp.access_token) {
        const expiry = Date.now() + (Number(resp.expires_in) - 120) * 1000;
        localStorage.setItem(TOKEN_KEY,  resp.access_token);
        localStorage.setItem(EXPIRY_KEY, String(expiry));
      }
      _pendingResolve?.(resp.access_token || null);
      _pendingResolve = null; _pendingReject = null;
    },
    error_callback: (err) => {
      _pendingReject?.(new Error(err.type));
      _pendingReject = null; _pendingResolve = null;
    },
  });
}

export function getStoredToken() {
  const token  = localStorage.getItem(TOKEN_KEY);
  const expiry = Number(localStorage.getItem(EXPIRY_KEY) || 0);
  if (token && Date.now() < expiry) return token;
  return null;
}

export function signIn() {
  return new Promise((resolve, reject) => {
    if (!_client) { reject(new Error("GIS not initialized")); return; }
    _pendingResolve = resolve;
    _pendingReject  = reject;
    _client.requestAccessToken({ prompt: "consent" });
  });
}

export function silentRefresh() {
  return new Promise((resolve) => {
    if (!_client) { resolve(null); return; }
    _pendingResolve = resolve;
    _pendingReject  = () => resolve(null);
    _client.requestAccessToken({ prompt: "" });
  });
}

export function signOut() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && window.google?.accounts?.oauth2) {
    try { window.google.accounts.oauth2.revoke(token, () => {}); } catch {}
  }
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRY_KEY);
}

export function isConfigured() {
  return !!GOOGLE_CLIENT_ID;
}
