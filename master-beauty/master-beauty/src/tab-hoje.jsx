import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Icons from './icons.jsx';
import { MHB } from './data.js';
import { useLocalState } from './shared.jsx';

const I = Icons;

/* ── Mock AI responses ──────────────────────────────────── */
function aiAnswer(q) {
  const s = q.toLowerCase();
  if (s.includes("inbox") || s.includes("resumir") || s.includes("e-mail") || s.includes("email"))
    return "4 e-mails pedem resposta hoje. Por urgência:\n\n— Glowé (Renata): aceitou os 14%, falta fechar o prazo de repasse. É o que destrava o maior negócio da semana.\n— Carlos (liderança): quer o consolidado do trimestre até sexta.\n— Dermavita: já enviou a documentação — basta seguir com o onboarding.\n— Bloom (Marina): pediu para remarcar a call para quinta.\n\nQuer que eu rascunhe a resposta da Glowé primeiro?";
  if (s.includes("priorida"))
    return "Suas 3 prioridades agora:\n\n1. Fechar a proposta da Glowé (14% + repasse 30d) — trava o maior negócio do mês.\n2. Preparar a reunião das 11h com a Glowé — começa em 18 min.\n3. Consolidar os fechamentos do trimestre para o Carlos antes de sexta.\n\nO resto pode esperar a tarde.";
  if (s.includes("glow") || s.includes("rascunh") || s.includes("resposta"))
    return "Rascunho de resposta — Glowé:\n\n\"Oi Renata, ótima notícia. Fechamos nos 14%. Sobre o repasse, conseguimos trabalhar com 30 dias corridos após a venda. Te envio a minuta ainda hoje para assinatura. Seguimos com a exclusividade do lançamento de skincare, combinado?\"\n\nQuer que eu ajuste o tom ou já deixo pronto para enviar?";
  if (s.includes("dermavita") || s.includes("onboarding"))
    return "Dermavita já enviou contrato social e dados bancários. Pendências para o onboarding:\n\n— Confirmar frete Full.\n— Validar documentação com o Jurídico (contrato no Drive).\n— Agendar go-live.\n\nPosso abrir as 3 tarefas e marcar a call de onboarding das 16h30?";
  return "Posso te ajudar com a inbox, a agenda, as tarefas e os arquivos do Drive. Tente, por exemplo: \"prepara a reunião das 11h\", \"quais minhas prioridades?\" ou \"o que ficou pendente com a Dermavita?\".";
}

/* ── Próxima reunião + timeline do dia ──────────────────── */
export function MeetingHero({ now, onDebrief, onJoin }) {
  const ag = MHB.agenda;
  const toMin = (t) => +t.slice(0, 2) * 60 + +t.slice(3);
  const nowMin = toMin(now);
  const next = ag.find((e) => e.kind === "meet" && toMin(e.time) >= nowMin) || ag[ag.length - 1];

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div style={{ padding: "var(--pad)", borderBottom: "1px solid var(--bd)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span className="dash" />
          <span className="eyebrow">Agora · {now}</span>
          <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: "var(--text-4)" }}>Sua próxima reunião</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 18, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span className="mono" style={{ fontSize: 14, fontWeight: 600, color: "var(--text-3)" }}>{next.time}–{next.end}</span>
              <span className="tag">{next.tag}</span>
              {next.hot && <span className="tag" style={{ background: "var(--accent)", color: "var(--on-accent)" }}>Prioridade</span>}
            </div>
            <div style={{ fontSize: 25, fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.08 }}>{next.title}</div>
            <div style={{ marginTop: 8, fontSize: 13, color: "var(--text-3)", fontWeight: 500 }}>
              {next.people} participantes · começa em {Math.max(0, toMin(next.time) - nowMin)} min
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 188 }}>
            <button onClick={onJoin} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 42, borderRadius: 10, background: "var(--accent)", color: "var(--on-accent)", fontWeight: 700, fontSize: 14 }}>
              <I.video size={18} /> Entrar no Meet
            </button>
            <button onClick={() => onDebrief(next)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 42, borderRadius: 10, background: "var(--surface)", color: "var(--text)", border: "1px solid var(--bd-2)", fontWeight: 700, fontSize: 14 }}>
              <I.sparkle size={17} /> Preparar com IA
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: "16px var(--pad) var(--pad)" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-4)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>Resto do dia</div>
        {ag.map((e) => {
          const past = toMin(e.time) + 15 < nowMin;
          const isNext = e.id === next.id;
          return (
            <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 13, padding: "9px 4px", opacity: past ? 0.45 : 1 }}>
              <span className="mono" style={{ fontSize: 12.5, fontWeight: 600, width: 42, color: "var(--text-3)" }}>{e.time}</span>
              <span style={{ width: 9, height: 9, borderRadius: 999, flex: "0 0 auto", background: isNext ? "var(--accent)" : past ? "var(--text-4)" : "transparent", border: isNext || past ? "none" : "2px solid var(--bd-2)" }} className={isNext ? "pulse" : ""} />
              <span style={{ flex: 1, fontSize: 14, fontWeight: isNext ? 700 : 500, color: e.kind === "block" ? "var(--text-4)" : "var(--text)", textDecoration: past ? "line-through" : "none" }}>{e.title}</span>
              {e.kind === "meet" && !past && <span style={{ color: "var(--text-4)", display: "grid", placeItems: "center" }}><I.video size={15} /></span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Atalhos de criação ─────────────────────────────────── */
export function CreateCard({ onCreate }) {
  const items = [
    { k: "mail", label: "E-mail", ic: "mail" },
    { k: "event", label: "Evento", ic: "calendar" },
    { k: "doc", label: "Documento", ic: "doc" },
    { k: "task", label: "Tarefa", ic: "check" },
    { k: "note", label: "Nota", ic: "note" },
    { k: "debrief", label: "Debrief", ic: "sparkle" },
  ];
  return (
    <div className="card">
      <div className="head"><div className="t"><span className="ico"><I.bolt size={17} /></span>Criar</div></div>
      <div className="body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {items.map((it) => {
          const Ico = I[it.ic];
          return (
            <button key={it.k} onClick={() => onCreate(it.k)}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, padding: "16px 8px", border: "1px solid var(--bd)", borderRadius: 12, background: "var(--bg)", color: "var(--text-2)", fontWeight: 600, fontSize: 12.5, transition: "all .12s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--text)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--bd)"; e.currentTarget.style.color = "var(--text-2)"; }}>
              <Ico size={20} />{it.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Inbox ──────────────────────────────────────────────── */
export function InboxCard({ onAsk }) {
  const emails = MHB.emails.filter((e) => e.needsReply);
  return (
    <div className="card">
      <div className="head">
        <div className="t"><span className="ico"><I.mail size={17} /></span>Precisam de resposta <span className="count">{emails.length}</span></div>
        <button className="more" onClick={() => onAsk("Resumir minha inbox de hoje")}><I.sparkle size={14} /> Resumir com IA</button>
      </div>
      <div className="body" style={{ paddingTop: 6 }}>
        {emails.map((m) => (
          <div className="lrow" key={m.id} onClick={() => onAsk(`Rascunhar resposta para ${m.from}: "${m.subject}"`)}
            title="Clique para rascunhar resposta com IA">
            <span style={{ width: 8, height: 8, borderRadius: 999, background: m.unread ? "var(--accent)" : "transparent", border: m.unread ? "none" : "2px solid var(--bd-2)", marginTop: 6, flex: "0 0 auto" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: m.unread ? 700 : 600, fontSize: 14, whiteSpace: "nowrap" }}>{m.from}</span>
                <span className="tag" style={{ fontSize: 9.5 }}>{m.label}</span>
                <span className="mono" style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--text-4)" }}>{m.time}</span>
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-2)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.subject}</div>
              <div style={{ fontSize: 12.5, color: "var(--text-3)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.preview}</div>
            </div>
            <span style={{ flex: "0 0 auto", color: "var(--text-4)", opacity: 0 }} className="reply-hint"><I.sparkle size={14} /></span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Drive recentes ─────────────────────────────────────── */
export function DriveCard() {
  const files = MHB.drive;
  const color = { sheet: "#1F8A5B", slides: "#F9A825", doc: "#1B5BD9" };
  const kind  = { sheet: "Planilha", slides: "Apresentação", doc: "Documento" };
  const openDrive = () => window.open("https://drive.google.com", "_blank", "noopener");
  return (
    <div className="card">
      <div className="head">
        <div className="t"><span className="ico"><I.drive size={17} /></span>Drive — recentes</div>
        <button className="more" onClick={openDrive}>Abrir Drive <I.arrow size={13} /></button>
      </div>
      <div className="body" style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 18 }}>
        {files.map((f) => (
          <div key={f.id} onClick={openDrive}
            style={{ flex: "0 0 168px", border: "1px solid var(--bd)", borderRadius: 12, padding: 14, background: "var(--bg)", cursor: "pointer", transition: "box-shadow .12s, border-color .12s" }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-pop)"; e.currentTarget.style.borderColor = "var(--bd-2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "var(--bd)"; }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, display: "grid", placeItems: "center", background: color[f.type] + "22", color: color[f.type], marginBottom: 10 }}><I.filePresent size={17} /></div>
            <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2, marginBottom: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{f.name}</div>
            <div style={{ fontSize: 11, color: "var(--text-4)" }}>{kind[f.type]} · {f.when}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Tarefas ────────────────────────────────────────────── */
export function TasksCard() {
  const [tasks, setTasks] = useLocalState("mhb_tasks", MHB.tasks);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const toggle = (id) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const addTask = () => {
    if (!draft.trim()) { setAdding(false); return; }
    setTasks((ts) => [...ts, { id: "t" + Date.now(), title: draft.trim(), due: "Hoje", priority: "média", done: false, ctx: "Hunting" }]);
    setDraft(""); setAdding(false);
  };
  const open = tasks.filter((t) => !t.done).length;
  const pc = { alta: "var(--crit)", "média": "var(--warn)", baixa: "var(--text-4)" };
  return (
    <div className="card">
      <div className="head">
        <div className="t"><span className="ico"><I.check size={17} /></span>Tarefas de hoje <span className="count">{open}</span></div>
        <button className="more" onClick={() => { setAdding((a) => !a); setTimeout(() => document.getElementById("task-draft")?.focus(), 30); }} title="Adicionar tarefa"><I.plus size={14} /></button>
      </div>
      <div className="body" style={{ paddingTop: 6 }}>
        {adding && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "8px 6px", marginBottom: 4 }}>
            <span style={{ width: 19, height: 19, borderRadius: 6, flex: "0 0 auto", border: "2px dashed var(--bd-2)" }} />
            <input id="task-draft" autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
              placeholder="Nova tarefa…"
              onKeyDown={(e) => { if (e.key === "Enter") addTask(); if (e.key === "Escape") { setAdding(false); setDraft(""); } }}
              onBlur={addTask}
              style={{ flex: 1, border: "none", background: "transparent", color: "var(--text)", fontFamily: "inherit", fontSize: 13.5, outline: "none" }} />
          </div>
        )}
        {tasks.map((t) => (
          <div className="lrow" key={t.id} onClick={() => toggle(t.id)} style={{ alignItems: "center" }}>
            <span style={{ width: 19, height: 19, borderRadius: 6, flex: "0 0 auto", display: "grid", placeItems: "center", background: t.done ? "var(--text)" : "transparent", border: t.done ? "none" : "2px solid var(--bd-2)", color: "var(--bg)" }}>
              {t.done && <I.check size={12} sw={3} />}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: t.done ? "var(--text-4)" : "var(--text)", textDecoration: t.done ? "line-through" : "none", lineHeight: 1.25 }}>{t.title}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 3, alignItems: "center" }}>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: pc[t.priority] }} />
                <span style={{ fontSize: 11, color: "var(--text-4)", fontWeight: 600 }}>{t.due} · {t.ctx}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── WhatsApp ───────────────────────────────────────────── */
export function WhatsappCard() {
  const chats = MHB.whatsapp;
  return (
    <div className="card">
      <div className="head"><div className="t"><span className="ico"><I.chat size={17} /></span>WhatsApp</div>
        <button className="more" onClick={() => window.open("https://web.whatsapp.com", "_blank", "noopener")}>Abrir <I.arrow size={13} /></button>
      </div>
      <div className="body" style={{ paddingTop: 6 }}>
        {chats.map((c) => (
          <div className="lrow" key={c.id} style={{ alignItems: "center" }}>
            <span style={{ width: 34, height: 34, borderRadius: 999, flex: "0 0 auto", display: "grid", placeItems: "center", background: "var(--surface-2)", fontWeight: 700, fontSize: 13 }}>{c.name[0]}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 8 }}><span style={{ fontWeight: 700, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span><span className="mono" style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-4)" }}>{c.time}</span></div>
              <div style={{ fontSize: 12.5, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.preview}</div>
            </div>
            {c.unread > 0 && <span style={{ flex: "0 0 auto", minWidth: 18, height: 18, padding: "0 5px", borderRadius: 999, background: "var(--ok)", color: "#fff", fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center" }}>{c.unread}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Notas rápidas ──────────────────────────────────────── */
export function NotesCard() {
  const [v, setV] = useLocalState("mhb_notes", MHB.notes);
  const [saved, setSaved] = useState(true);
  const timerRef = useRef(null);

  const onChange = (e) => {
    setV(e.target.value);
    setSaved(false);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSaved(true), 800);
  };

  return (
    <div className="card">
      <div className="head">
        <div className="t"><span className="ico"><I.note size={17} /></span>Notas rápidas</div>
        <span style={{ marginLeft: "auto", fontSize: 11, color: saved ? "var(--text-4)" : "var(--warn)", transition: "color .3s" }}>
          {saved ? "salvo" : "salvando…"}
        </span>
      </div>
      <div className="body" style={{ paddingTop: 10 }}>
        <textarea value={v} onChange={onChange} spellCheck={false}
          style={{ width: "100%", minHeight: 96, resize: "vertical", border: "none", outline: "none", background: "transparent", color: "var(--text-2)", fontFamily: "inherit", fontSize: 13.5, lineHeight: 1.55, letterSpacing: "-0.005em" }} />
      </div>
    </div>
  );
}

/* ── AI Drawer ──────────────────────────────────────────── */
export function AIDrawer({ open, seed, onClose, onDebrief }) {
  const [msgs, setMsgs] = useState([]);
  const [typing, setTyping] = useState("");
  const [input, setInput] = useState("");
  const bodyRef = useRef(null);
  const seededRef = useRef(null);

  const scrollDown = () => { const el = bodyRef.current; if (el) el.scrollTop = el.scrollHeight; };

  const ask = useCallback((q) => {
    if (!q.trim()) return;
    setMsgs((m) => [...m, { role: "user", text: q }]);
    const full = aiAnswer(q);
    let i = 0;
    setTyping("");
    const tick = () => {
      i += Math.max(2, Math.round(full.length / 90));
      setTyping(full.slice(0, i));
      scrollDown();
      if (i < full.length) setTimeout(tick, 16);
      else { setMsgs((m) => [...m, { role: "ai", text: full }]); setTyping(""); }
    };
    setTimeout(tick, 280);
  }, []);

  useEffect(() => {
    if (open && seed && seededRef.current !== seed) { seededRef.current = seed; ask(seed); }
    if (!open) seededRef.current = null;
  }, [open, seed, ask]);
  useEffect(() => { scrollDown(); }, [msgs, typing]);

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(17,19,21,0.32)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity .2s", zIndex: 90 }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 440, maxWidth: "92vw", background: "var(--surface)", borderLeft: "1px solid var(--bd)", boxShadow: "var(--shadow-pop)", transform: open ? "none" : "translateX(110%)", transition: "transform .26s cubic-bezier(.2,.8,.2,1)", zIndex: 91, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "16px 18px", borderBottom: "1px solid var(--bd)" }}>
          <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--accent)", color: "var(--on-accent)", display: "grid", placeItems: "center" }}><I.sparkle size={17} /></span>
          <div style={{ lineHeight: 1.1 }}><div style={{ fontWeight: 800, fontSize: 14.5, letterSpacing: "-0.02em" }}>Assistente</div><div style={{ fontSize: 11.5, color: "var(--text-4)" }}>Master Hunting Beauty</div></div>
          <button className="iconbtn" style={{ marginLeft: "auto" }} onClick={onClose}>✕</button>
        </div>

        <div ref={bodyRef} style={{ flex: 1, overflowY: "auto", padding: "18px", display: "flex", flexDirection: "column", gap: 14 }}>
          {msgs.length === 0 && !typing && (
            <div style={{ margin: "auto 0", textAlign: "center", color: "var(--text-4)", padding: "20px 10px" }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: "var(--accent-tint)", color: "var(--accent-line)", display: "grid", placeItems: "center", margin: "0 auto 12px" }}><I.sparkle size={24} /></div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-3)", maxWidth: 280, margin: "0 auto" }}>Pergunte sobre seus e-mails, agenda, tarefas ou arquivos. Eu organizo o resto.</div>
            </div>
          )}
          {msgs.map((m, idx) => <AIChatBubble key={idx} role={m.role} text={m.text} onDebrief={onDebrief} />)}
          {typing && <AIChatBubble role="ai" text={typing} blink />}
        </div>

        <div style={{ padding: 14, borderTop: "1px solid var(--bd)" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            {["Resumir inbox", "Minhas prioridades", "Pendências Dermavita"].map((c) => (
              <button key={c} className="chip" onClick={() => ask(c)}>{c}</button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); ask(input); setInput(""); }} style={{ display: "flex", gap: 8, alignItems: "center", background: "var(--bg)", border: "1px solid var(--bd)", borderRadius: 11, padding: "5px 5px 5px 14px" }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Peça algo à IA…" style={{ flex: 1, border: "none", background: "none", outline: "none", color: "var(--text)", fontSize: 14.5, fontFamily: "inherit" }} />
            <button type="submit" style={{ width: 34, height: 34, borderRadius: 8, background: "var(--text)", color: "var(--bg)", display: "grid", placeItems: "center" }}><I.arrow size={17} /></button>
          </form>
        </div>
      </div>
    </>
  );
}

function AIChatBubble({ role, text, blink }) {
  const ai = role === "ai";
  return (
    <div className="fade-in" style={{ alignSelf: ai ? "flex-start" : "flex-end", maxWidth: "90%" }}>
      {ai && <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-4)", marginBottom: 5 }}>IA</div>}
      <div style={{ background: ai ? "var(--bg)" : "var(--accent)", color: ai ? "var(--text-2)" : "var(--on-accent)", border: ai ? "1px solid var(--bd)" : "none", borderRadius: 13, padding: "11px 14px", fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap", letterSpacing: "-0.005em" }}>
        {text}{blink && <span className="pulse" style={{ marginLeft: 1 }}>▍</span>}
      </div>
    </div>
  );
}

/* ── Debrief Modal ──────────────────────────────────────── */
function debriefContent(meeting) {
  const title = (meeting && meeting.title) || "Reunião";
  const prep = meeting && meeting.mode !== "debrief";
  if (/glow/i.test(title) && prep) {
    return {
      mode: "prep", title,
      summary: "Renata aceitou os 14% por e-mail hoje de manhã. O único ponto em aberto é o prazo de repasse. Reunião curta e decisória — chegue com a minuta pronta.",
      blocks: [
        { h: "Objetivo da call", items: ["Fechar comissão de 14% + repasse em 30 dias", "Garantir exclusividade no lançamento de skincare"] },
        { h: "Pontos a levantar", items: ["Confirmar repasse de 30 dias corridos", "Propor exclusividade de lançamento", "Alinhar data de go-live e frete Full"] },
        { h: "Material de apoio", items: ["Proposta comercial · Glowé (Drive)", "Benchmark de comissões da categoria"] },
      ],
      actions: [
        { t: "Enviar minuta de contrato à Glowé", who: "você", due: "Hoje" },
        { t: "Confirmar frete Full com operações", who: "você", due: "Hoje" },
      ],
    };
  }
  return {
    mode: "debrief", title,
    summary: "Resumo gerado a partir da reunião. Três decisões e dois acionáveis foram identificados. Revise antes de transformar em tarefas.",
    blocks: [
      { h: "Decisões", items: ["Avançar com Glowé nos 14%", "Priorizar skincare clean no hunting da semana", "Levar consolidado do trimestre ao QBR"] },
      { h: "Riscos / atenção", items: ["Concorrente pode oferecer 12% à Glowé", "Documentação da Dermavita pendente no Jurídico"] },
    ],
    actions: [
      { t: "Consolidar marcas fechadas no trimestre", who: "Isabele", due: "Sexta" },
      { t: "Validar contrato Dermavita com Jurídico", who: "Jurídico", due: "Amanhã" },
      { t: "Mapear 5 marcas de skincare clean", who: "Isabele", due: "Amanhã" },
    ],
  };
}

export function DebriefModal({ meeting, onClose, toast }) {
  const [phase, setPhase] = useState("gen");
  const data = useMemo(() => debriefContent(meeting), [meeting]);
  useEffect(() => {
    setPhase("gen");
    const t = setTimeout(() => setPhase("ready"), 1100);
    return () => clearTimeout(t);
  }, [meeting]);
  if (!meeting) return null;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(17,19,21,0.42)", display: "grid", placeItems: "center", zIndex: 95, padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} className="fade-in" style={{ width: 620, maxWidth: "100%", maxHeight: "88vh", background: "var(--surface)", border: "1px solid var(--bd)", borderRadius: 18, boxShadow: "var(--shadow-pop)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--bd)", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 34, height: 34, borderRadius: 9, background: "var(--accent)", color: "var(--on-accent)", display: "grid", placeItems: "center", flex: "0 0 auto" }}><I.sparkle size={18} /></span>
          <div style={{ flex: 1 }}>
            <div className="eyebrow" style={{ color: "var(--accent-line)" }}>{data.mode === "prep" ? "Preparação · IA" : "Debriefing · IA"}</div>
            <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em", lineHeight: 1.15 }}>{data.title}</div>
          </div>
          <button className="iconbtn" onClick={onClose}>✕</button>
        </div>

        {phase === "gen" ? (
          <div style={{ padding: "50px 24px", textAlign: "center", color: "var(--text-3)" }}>
            <div className="pulse" style={{ fontSize: 14, fontWeight: 600 }}>Analisando agenda, e-mails e arquivos relacionados…</div>
          </div>
        ) : (
          <div className="fade-in" style={{ overflowY: "auto", padding: "20px 24px" }}>
            <div style={{ background: "var(--accent-tint)", borderRadius: 12, padding: "14px 16px", fontSize: 14, lineHeight: 1.5, color: "var(--text-2)", marginBottom: 20 }}>{data.summary}</div>
            {data.blocks.map((b, i) => (
              <div key={i} style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-4)", marginBottom: 9 }}>{b.h}</div>
                {b.items.map((it, j) => (
                  <div key={j} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "5px 0" }}>
                    <span style={{ width: 18, height: 18, borderRadius: 999, background: "var(--text)", color: "var(--accent)", display: "grid", placeItems: "center", flex: "0 0 auto", marginTop: 1 }}><I.check size={11} sw={3} /></span>
                    <span style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.4 }}>{it}</span>
                  </div>
                ))}
              </div>
            ))}
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-4)", marginBottom: 9 }}>Acionáveis sugeridos</div>
            {data.actions.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", border: "1px solid var(--bd)", borderRadius: 11, marginBottom: 8, background: "var(--bg)" }}>
                <span className="dash" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{a.t}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-4)", marginTop: 1 }}>{a.who} · {a.due}</div>
                </div>
                <button onClick={() => toast("Tarefa criada: " + a.t)} style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", border: "1px solid var(--bd-2)", borderRadius: 8, padding: "6px 11px" }}>Criar tarefa</button>
              </div>
            ))}
          </div>
        )}

        {phase === "ready" && (
          <div style={{ padding: "14px 24px", borderTop: "1px solid var(--bd)", display: "flex", gap: 10 }}>
            <button onClick={() => { toast(data.actions.length + " tarefas criadas"); onClose(); }} style={{ flex: 1, height: 42, borderRadius: 10, background: "var(--accent)", color: "var(--on-accent)", fontWeight: 700, fontSize: 14 }}>Criar {data.actions.length} tarefas</button>
            <button onClick={() => toast("Resumo enviado por e-mail")} style={{ height: 42, padding: "0 16px", borderRadius: 10, border: "1px solid var(--bd-2)", fontWeight: 700, fontSize: 14 }}>Enviar resumo</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Command Palette ────────────────────────────────────── */
export function CommandPalette({ open, onClose, onRun }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef(null);
  useEffect(() => { if (open) { setQ(""); setSel(0); setTimeout(() => inputRef.current && inputRef.current.focus(), 30); } }, [open]);

  const cmds = [
    { g: "Navegar", label: "Ir para Hoje",     ic: "home",     act: () => onRun("nav", "hoje") },
    { g: "Navegar", label: "Abrir Inbox",       ic: "mail",     act: () => onRun("nav", "inbox") },
    { g: "Navegar", label: "Abrir Agenda",      ic: "calendar", act: () => onRun("nav", "agenda") },
    { g: "Navegar", label: "Abrir Pipeline",    ic: "drive",    act: () => onRun("nav", "pipeline") },
    { g: "Navegar", label: "Abrir Tarefas",     ic: "check",    act: () => onRun("nav", "tarefas") },
    { g: "Navegar", label: "Abrir Notas",       ic: "note",     act: () => onRun("nav", "notas") },
    { g: "Criar",   label: "Novo e-mail",        ic: "mail",    act: () => onRun("create", "mail") },
    { g: "Criar",   label: "Novo evento",        ic: "calendar",act: () => onRun("create", "event") },
    { g: "Criar",   label: "Nova tarefa",        ic: "check",   act: () => onRun("create", "task") },
    { g: "IA",      label: "Resumir minha inbox",ic: "sparkle", act: () => onRun("ai", "Resumir minha inbox de hoje") },
    { g: "IA",      label: "Minhas prioridades", ic: "sparkle", act: () => onRun("ai", "Quais são minhas 3 prioridades agora?") },
    { g: "IA",      label: "Gerar debriefing",   ic: "sparkle", act: () => onRun("debrief", { title: "Daily — Squad Hunting Beauty", mode: "debrief" }) },
  ];
  const filtered = cmds.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));
  useEffect(() => { setSel(0); }, [q]);

  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); const c = filtered[sel]; if (c) { c.act(); onClose(); } }
    else if (e.key === "Escape") onClose();
  };
  if (!open) return null;

  let lastG = null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(17,19,21,0.38)", display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: "12vh", zIndex: 100 }}>
      <div onClick={(e) => e.stopPropagation()} className="fade-in" style={{ width: 580, maxWidth: "92vw", background: "var(--surface)", border: "1px solid var(--bd)", borderRadius: 16, boxShadow: "var(--shadow-pop)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", borderBottom: "1px solid var(--bd)" }}>
          <span style={{ color: "var(--text-4)" }}><I.search size={19} /></span>
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder="Buscar ou executar um comando…" style={{ flex: 1, border: "none", background: "none", outline: "none", color: "var(--text)", fontSize: 16, fontFamily: "inherit" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-4)", border: "1px solid var(--bd)", borderRadius: 5, padding: "1px 6px" }}>esc</span>
        </div>
        <div style={{ maxHeight: 380, overflowY: "auto", padding: 8 }}>
          {filtered.length === 0 && <div style={{ padding: "28px", textAlign: "center", color: "var(--text-4)", fontSize: 14 }}>Nada encontrado para "{q}"</div>}
          {filtered.map((c, i) => {
            const head = c.g !== lastG ? c.g : null; lastG = c.g;
            const Ico = I[c.ic];
            return (
              <React.Fragment key={i}>
                {head && <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-4)", padding: "10px 10px 5px" }}>{head}</div>}
                <div onMouseEnter={() => setSel(i)} onClick={() => { c.act(); onClose(); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, cursor: "pointer", background: sel === i ? "var(--surface-hover)" : "transparent" }}>
                  <span style={{ color: sel === i ? "var(--text)" : "var(--text-3)" }}><Ico size={18} /></span>
                  <span style={{ fontSize: 14.5, fontWeight: 600, flex: 1 }}>{c.label}</span>
                  {sel === i && <span style={{ color: "var(--text-4)" }}><I.arrow size={15} /></span>}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Tab Hoje (hub) ─────────────────────────────────────── */
export default function TabHoje({ onAsk, onDebrief, onJoin, onCreate }) {
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const dateStr = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const nReply = MHB.emails.filter((e) => e.needsReply).length;
  const nTasks = MHB.tasks.filter((x) => !x.done).length;
  const now = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const toMin = (t) => +t.slice(0, 2) * 60 + +t.slice(3);
  const nMeetPM = MHB.agenda.filter((e) => e.kind === "meet" && toMin(e.time) >= 720).length;

  return (
    <>
      <div className="hero">
        <div className="greet">{greet}, Isabele. <span className="when">vamos ao que importa.</span></div>
        <div className="herometa">
          <span style={{ textTransform: "capitalize" }}>{dateStr}</span>
          <span><b>{nReply}</b> e-mails p/ responder</span>
          <span><b>{nTasks}</b> tarefas abertas</span>
          <span><b>{nMeetPM}</b> {nMeetPM === 1 ? "reunião" : "reuniões"} à tarde</span>
        </div>

        <div className="aibar">
          <form className="row" onSubmit={(e) => { e.preventDefault(); const v = e.target.q.value; if (v.trim()) { onAsk(v); e.target.q.value = ""; } }}>
            <span className="spark"><I.sparkle size={17} /></span>
            <input name="q" placeholder="Pergunte ou peça algo — ex.: prepara a reunião das 11h, resume minha inbox…" />
            <button type="submit" className="send"><I.arrow size={18} /></button>
          </form>
          <div className="chips">
            {MHB.aiSuggestions.map((s) => <button key={s} className="chip" onClick={() => onAsk(s)}>{s}</button>)}
          </div>
        </div>
      </div>

      <div className="grid">
        <div className="col">
          <MeetingHero now={now} onDebrief={(m) => onDebrief({ ...m, mode: "prep" })} onJoin={onJoin} />
          <InboxCard onAsk={onAsk} />
          <DriveCard />
        </div>
        <div className="col">
          <CreateCard onCreate={onCreate} />
          <TasksCard />
          <WhatsappCard />
          <NotesCard />
        </div>
      </div>
    </>
  );
}
