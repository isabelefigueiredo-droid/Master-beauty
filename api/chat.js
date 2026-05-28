export const config = { runtime: "edge" };

const SYSTEM_PROMPT = `Você é a assistente de IA do Master Hunting Beauty, o hub de trabalho de Isabele Figueiredo, Hunter de Beauty no Mercado Livre (Brasil).

Contexto do papel:
- Isabele é responsável por prospectar, negociar e fazer onboarding de marcas de beleza (skincare, cosmetics, etc.) no Mercado Livre.
- Ela gerencia um pipeline de marcas, acompanha KPIs de GMV, comissões, repasse e frete Full.
- O foco diário é: fechar propostas comerciais, preparar reuniões, responder e-mails prioritários e destravaar onboardings.

Diretrizes de resposta:
- Seja direta, objetiva e prática — sem floreios corporativos.
- Priorize ações concretas: "faça X hoje", não "considere fazer X".
- Use linguagem profissional em português brasileiro.
- Quando perguntar sobre e-mails, agenda ou tarefas, use os dados de contexto fornecidos.
- Se puder sugerir um rascunho ou próximo passo, sugira sem que peçam.
- Limite respostas a no máximo 5 parágrafos curtos ou listas de até 6 itens.`;

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "not_configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const { messages, context } = body;
  if (!messages || !Array.isArray(messages)) {
    return new Response("Bad request", { status: 400 });
  }

  const systemBlocks = [
    {
      type: "text",
      text: SYSTEM_PROMPT,
      cache_control: { type: "ephemeral" },
    },
  ];

  if (context) {
    systemBlocks.push({
      type: "text",
      text: `Dados atuais da Isabele (${new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}):\n${context}`,
      cache_control: { type: "ephemeral" },
    });
  }

  const anthropicReq = {
    model: "claude-opus-4-8",
    max_tokens: 1024,
    thinking: { type: "adaptive" },
    system: systemBlocks,
    messages,
    stream: true,
  };

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "prompt-caching-2024-07-31",
    },
    body: JSON.stringify(anthropicReq),
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    return new Response(text, { status: upstream.status, headers: { "Content-Type": "application/json" } });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
