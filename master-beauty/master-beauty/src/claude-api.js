import { aiAnswer } from "./ai-mock.js";

function buildContext(data) {
  const lines = [];

  if (data.agenda?.length) {
    lines.push("AGENDA DE HOJE:");
    data.agenda.forEach((e) => {
      const people = Array.isArray(e.people) ? e.people.join(", ") : `${e.people} participantes`;
      lines.push(`  ${e.time}–${e.end || "?"} | ${e.title} | ${people}`);
    });
  }

  if (data.emails?.length) {
    lines.push("\nE-MAILS PENDENTES:");
    data.emails.forEach((e) => {
      lines.push(`  De: ${e.from} | Assunto: ${e.subject} | ${e.preview}`);
    });
  }

  if (data.tasks?.length) {
    const open = data.tasks.filter((t) => !t.done);
    if (open.length) {
      lines.push("\nTAREFAS ABERTAS:");
      open.forEach((t) => lines.push(`  [${t.priority}] ${t.title} — vence: ${t.due}`));
    }
  }

  return lines.join("\n");
}

export async function streamClaude({ messages, context, onChunk, onDone, onError }) {
  let res;
  try {
    res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages,
        context: buildContext(context || {}),
      }),
    });
  } catch (err) {
    onError?.(err);
    return;
  }

  if (res.status === 503) {
    // API key not configured — fall back to mock
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    const mockText = aiAnswer(lastUserMsg?.content || "");
    onDone?.(mockText);
    return;
  }

  if (!res.ok) {
    onError?.(new Error(`api_error_${res.status}`));
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let accumulated = "";
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop(); // keep incomplete line

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6);
        if (data === "[DONE]") continue;

        let evt;
        try { evt = JSON.parse(data); } catch { continue; }

        if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
          accumulated += evt.delta.text;
          onChunk?.(accumulated);
        }
      }
    }
  } catch (err) {
    onError?.(err);
    return;
  }

  onDone?.(accumulated);
}
