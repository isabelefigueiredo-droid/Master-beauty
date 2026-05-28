import { getStoredToken, silentRefresh } from "./google-auth.js";

async function getToken() {
  let token = getStoredToken();
  if (!token) token = await silentRefresh();
  return token;
}

async function apiFetch(url) {
  const token = await getToken();
  if (!token) throw new Error("no_token");
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 401) throw new Error("unauthorized");
  if (!res.ok) throw new Error(`api_error_${res.status}`);
  return res.json();
}

export async function fetchTodayEvents() {
  const now  = new Date();
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  const end   = new Date(now); end.setHours(23, 59, 59, 999);

  const params = new URLSearchParams({
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "20",
  });

  const data = await apiFetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`
  );

  return (data.items || []).map((ev) => {
    const startDt = ev.start?.dateTime || ev.start?.date;
    const endDt   = ev.end?.dateTime   || ev.end?.date;
    const toHHMM = (iso) => { const d = new Date(iso); return String(d.getHours()).padStart(2,"0") + ":" + String(d.getMinutes()).padStart(2,"0"); };
    const timeStr = startDt?.includes("T") ? toHHMM(startDt) : "Dia todo";
    const endStr  = endDt?.includes("T")   ? toHHMM(endDt)   : "";
    const people  = (ev.attendees || []).map((a) => a.displayName || a.email).slice(0, 4);
    const link    = ev.hangoutLink || ev.location || null;

    return {
      id:     ev.id,
      time:   timeStr,
      end:    endStr,
      title:  ev.summary || "(sem título)",
      kind:   link?.includes("meet.google") ? "meet" : "event",
      people,
      tag:    ev.organizer?.self ? "organizer" : "guest",
      hot:    people.length > 3,
      link,
    };
  });
}

async function fetchEmailMeta(id, token) {
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) return null;
  return res.json();
}

export async function fetchUnreadEmails() {
  const token = await getToken();
  if (!token) throw new Error("no_token");

  const listRes = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages?q=in:inbox+is:unread&maxResults=8",
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!listRes.ok) throw new Error(`api_error_${listRes.status}`);
  const listData = await listRes.json();

  const messages = await Promise.all(
    (listData.messages || []).map((m) => fetchEmailMeta(m.id, token))
  );

  return messages.filter(Boolean).map((msg) => {
    const headers = msg.payload?.headers || [];
    const get = (name) => headers.find((h) => h.name === name)?.value || "";

    const fromRaw = get("From");
    const fromMatch = fromRaw.match(/^"?([^"<]+)"?\s*<?([^>]*)>?$/);
    const fromName = fromMatch ? fromMatch[1].trim() : fromRaw;
    const fromEmail = fromMatch ? fromMatch[2].trim() : fromRaw;

    const snippet = msg.snippet || "";
    const dateRaw = get("Date");
    const date = dateRaw ? new Date(dateRaw) : new Date();
    const timeStr = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    const labelIds = msg.labelIds || [];

    return {
      id:          msg.id,
      from:        fromName || fromEmail,
      fromEmail,
      subject:     get("Subject") || "(sem assunto)",
      preview:     snippet.slice(0, 100),
      time:        timeStr,
      unread:      labelIds.includes("UNREAD"),
      needsReply:  !labelIds.includes("SENT"),
      label:       labelIds.includes("IMPORTANT") ? "importante" : null,
    };
  });
}

export async function fetchRecentDriveFiles() {
  const fields = "files(id,name,mimeType,modifiedTime,webViewLink,iconLink)";
  const params = new URLSearchParams({
    orderBy: "viewedByMeTime desc",
    pageSize: "6",
    fields,
  });

  const data = await apiFetch(
    `https://www.googleapis.com/drive/v3/files?${params}`
  );

  const typeMap = {
    "application/vnd.google-apps.spreadsheet": "Planilha",
    "application/vnd.google-apps.document":    "Documento",
    "application/vnd.google-apps.presentation":"Apresentação",
    "application/vnd.google-apps.folder":      "Pasta",
    "application/pdf":                         "PDF",
  };

  return (data.files || []).map((f) => ({
    id:   f.id,
    name: f.name,
    type: typeMap[f.mimeType] || "Arquivo",
    when: f.modifiedTime
      ? new Date(f.modifiedTime).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
      : "",
    link: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view`,
  }));
}
