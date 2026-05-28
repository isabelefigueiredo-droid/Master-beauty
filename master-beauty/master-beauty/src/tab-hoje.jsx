/* Master Hunting Beauty — Hub "Hoje" */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useLocalState } from './shared.jsx';
import {
  IcoMail, IcoCalendar, IcoDrive, IcoCheck, IcoChat, IcoNote,
  IcoSparkle, IcoVideo, IcoPlus, IcoArrow, IcoDoc, IcoBolt, IcoFile,
} from './icons.jsx';

/* ── Mock data defaults (contexto: Isabele, hunter Beauty ML) ── */
const DEFAULT_AGENDA = [
  { id: "ev1", time: "09:30", end: "09:45", title: "Daily — Squad Hunting Beauty", kind: "meet", people: 6, tag: "Rotina", hot: false },
  { id: "ev2", time: "11:00", end: "11:45", title: "Negociação · Glowé Cosméticos", kind: "meet", people: 3, tag: "Pipeline", hot: true },
  { id: "ev3", time: "13:00", end: "13:30", title: "Almoço — bloqueado", kind: "block", people: 0, tag: "Pessoal", hot: false },
  { id: "ev4", time: "14:00", end: "15:00", title: "Review de pipeline com liderança", kind: "meet", people: 4, tag: "Interno", hot: false },
  { id: "ev5", time: "16:30", end: "17:00", title: "Call onboarding · Dermavita", kind: "meet", people: 2, tag: "Onboarding", hot: false },
];
const DEFAULT_EMAILS = [
  { id: "m1", from: "Renata · Glowé", subject: "Re: proposta de comissão e prazo de repasse", preview: "Oi Isabele, conversamos internamente e topamos os 14%, mas precisamos alinhar o prazo de repasse…", time: "08:12", unread: true, needsReply: true, label: "Pipeline" },
  { id: "m2", from: "Carlos Bueno (Liderança)", subject: "Números do trimestre — hunting beauty", preview: "Pode me mandar o consolidado de novas marcas fechadas até sexta? Quero levar pro QBR.", time: "07:54", unread: true, needsReply: true, label: "Interno" },
  { id: "m3", from: "Dermavita Oficial", subject: "Documentação para cadastro de seller", preview: "Segue em anexo o contrato social e os dados bancários para iniciarmos o onboarding.", time: "Ontem", unread: true, needsReply: true, label: "Onboarding" },
  { id: "m4", from: "Marina · Bloom", subject: "Podemos remarcar nossa call?", preview: "Surgiu um imprevisto aqui, conseguimos mover para quinta no mesmo horário?", time: "Ontem", unread: false, needsReply: true, label: "Pipeline" },
];
const DEFAULT_TASKS = [
  { id: "t1", title: "Fechar proposta da Glowé (14% + repasse 30d)", due: "Hoje", priority: "alta", done: false, ctx: "Pipeline" },
  { id: "t2", title: "Consolidar marcas fechadas p/ Carlos", due: "Hoje", priority: "alta", done: false, ctx: "Interno" },
  { id: "t3", title: "Enviar contrato de onboarding · Dermavita", due: "Hoje", priority: "média", done: false, ctx: "Onboarding" },
  { id: "t4", title: "Mapear 5 novas marcas de skincare clean", due: "Amanhã", priority: "média", done: false, ctx: "Hunting" },
  { id: "t5", title: "Atualizar planilha de pipeline (semana)", due: "Hoje", priority: "baixa", done: true, ctx: "Pipeline" },
];
const DEFAULT_DRIVE = [
  { id: "d1", name: "Pipeline Hunting Beauty — 2026", type: "sheet", when: "20 min" },
  { id: "d2", name: "Proposta comercial · Glowé", type: "slides", when: "2 h" },
  { id: "d3", name: "Contrato onboarding · Dermavita", type: "doc", when: "ontem" },
  { id: "d4", name: "Benchmark de comissões — categoria", type: "sheet", when: "ontem" },
  { id: "d5", name: "Deck QBR — fechamentos do trimestre", type: "slides", when: "2 dias" },
];
const DEFAULT_WHATSAPP = [
  { id: "w1", name: "Renata (Glowé)", preview: "Perfeito, mando o aceite por e-mail ainda hoje.", time: "08:30", unread: 2 },
  { id: "w2", name: "Fornecedor Dermavita", preview: "Já enviei a documentação no seu e-mail!", time: "08:01", unread: 1 },
  { id: "w3", name: "Squad Beauty (grupo)", preview: "Marina: alguém pega a call das 11?", time: "07:40", unread: 0 },
  { id: "w4", name: "Bloom Cosméticos", preview: "Conseguimos remarcar pra quinta?", time: "ontem", unread: 0 },
];
const DEFAULT_NOTES = "Glowé: piso de 14% ok, lutar por exclusividade de lançamento.\nDermavita: confirmar frete full.\nIdeia: criar trilha de hunting p/ skincare coreano.";
const AI_SUGGESTIONS = [
  "Resumir minha inbox de hoje",
  "Quais são minhas 3 prioridades agora?",
  "Gerar debriefing da última reunião",
  "Rascunhar resposta para a Glowé",
];

/* ── Meeting Hero ─────────────────────────────────────────── */
function MeetingHero({ agenda, onAsk }) {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const toMin = (t) => +t.slice(0, 2) * 60 + +t.slice(3);
  const next = agenda.find((e) => e.kind === "meet" && toMin(e.time) >= nowMin) || agenda[agenda.length - 1];
  const diff = toMin(next.time) - nowMin;
  const timeStr = now.toTimeString().slice(0, 5);

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div style={{ padding: "var(--pad)", borderBottom: "1px solid var(--bd)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span className="dash" />
          <span className="eyebrow">Agora · {timeStr}</span>
          <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: "var(--text-4)" }}>Próxima reunião</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 18, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span className="mono" style={{ fontSize: 14, fontWeight: 600, color: "var(--text-3)" }}>{next.time}–{next.end}</span>
              <span className="tag">{next.tag}</span>
              {next.hot && <span className="tag" style={{ background: "var(--accent)", color: "var(--on-accent)" }}>Prioridade</span>}
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.1, color: "var(--text)" }}>{next.title}</div>
            <div style={{ marginTop: 8, fontSize: 13, color: "var(--text-3)", fontWeight: 500 }}>
              {next.people > 0 ? `${next.people} participantes · ` : ""}
              {diff > 0 ? `começa em ${diff} min` : "em andamento"}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 172 }}>
            <button style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 40, borderRadius: 10, background: "var(--accent)", color: "var(--on-accent)", fontWeight: 700, fontSize: 13.5 }}>
              <IcoVideo size={17} /> Entrar no Meet
            </button>
            <button onClick={() => onAsk && onAsk("Preparar reunião " + next.title)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 40, borderRadius: 10, background: "var(--surface)", color: "var(--text)", border: "1px solid var(--bd-2)", fontWeight: 700, fontSize: 13.5 }}>
              <IcoSparkle size={16} /> Preparar com IA
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: "14px var(--pad) var(--pad)" }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Resto do dia</div>
        {agenda.map((e) => {
          const past = toMin(e.time) + 15 < nowMin;
          const isNext = e.id === next.id;
          return (
            <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 4px", opacity: past ? 0.45 : 1 }}>
              <span className="mono" style={{ fontSize: 12, fontWeight: 600, width: 38, color: "var(--text-3)", flexShrink: 0 }}>{e.time}</span>
              <span style={{ width: 8, height: 8, borderRadius: 999, flexShrink: 0, background: isNext ? "var(--accent)" : past ? "var(--text-4)" : "transparent", border: isNext || past ? "none" : "2px solid var(--bd-2)" }} className={isNext ? "pulse" : ""} />
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: isNext ? 700 : 500, color: e.kind === "block" ? "var(--text-4)" : "var(--text)", textDecoration: past ? "line-through" : "none" }}>{e.title}</span>
              {e.kind === "meet" && !past && <IcoVideo size={14} style={{ color: "var(--text-4)", flexShrink: 0 }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Create shortcuts ─────────────────────────────────────── */
function CreateCard({ onAction }) {
  const items = [
    { k: "mail",    label: "E-mail",     Ico: IcoMail },
    { k: "event",   label: "Evento",     Ico: IcoCalendar },
    { k: "doc",     label: "Documento",  Ico: IcoDoc },
    { k: "task",    label: "Tarefa",     Ico: IcoCheck },
    { k: "note",    label: "Nota",       Ico: IcoNote },
    { k: "debrief", label: "Debrief",    Ico: IcoSparkle },
  ];
  return (
    <div className="card">
      <div className="head">
        <div className="t"><span className="ico"><IcoBolt size={17} /></span>Criar</div>
      </div>
      <div className="body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {items.map(({ k, label, Ico }) => (
          <button key={k} onClick={() => onAction(k)}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, padding: "14px 8px", border: "1px solid var(--bd)", borderRadius: 10, background: "var(--bg)", color: "var(--text-2)", fontWeight: 600, fontSize: 12, transition: "all .12s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--bd)"; e.currentTarget.style.color = "var(--text-2)"; }}>
            <Ico size={20} />{label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Inbox ────────────────────────────────────────────────── */
function InboxCard({ emails, onAsk }) {
  const needsReply = emails.filter((e) => e.needsReply);
  return (
    <div className="card">
      <div className="head">
        <div className="t"><span className="ico"><IcoMail size={17} /></span>Precisam de resposta <span className="count">{needsReply.length}</span></div>
        <button className="more" onClick={() => onAsk("Resumir minha inbox de hoje")}><IcoSparkle size={13} /> Resumir</button>
      </div>
      <div className="body" style={{ paddingTop: 6 }}>
        {needsReply.map((m) => (
          <div className="lrow" key={m.id}>
            <span style={{ width: 8, height: 8, borderRadius: 999, flexShrink: 0, marginTop: 6, background: m.unread ? "var(--accent)" : "transparent", border: m.unread ? "none" : "2px solid var(--bd-2)" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: m.unread ? 700 : 600, fontSize: 13.5, whiteSpace: "nowrap" }}>{m.from}</span>
                <span className="tag" style={{ fontSize: 9.5 }}>{m.label}</span>
                <span className="mono" style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-4)" }}>{m.time}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.subject}</div>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.preview}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Drive ────────────────────────────────────────────────── */
function DriveCard({ drive }) {
  const color = { sheet: "var(--ok)", slides: "var(--warn)", doc: "#1B5BD9" };
  const kind  = { sheet: "Planilha", slides: "Apresentação", doc: "Documento" };
  return (
    <div className="card">
      <div className="head">
        <div className="t"><span className="ico"><IcoDrive size={17} /></span>Drive — recentes</div>
        <button className="more">Abrir <IcoArrow size={13} /></button>
      </div>
      <div className="body" style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 18 }}>
        {drive.map((f) => (
          <div key={f.id} style={{ flex: "0 0 156px", border: "1px solid var(--bd)", borderRadius: 10, padding: 13, background: "var(--bg)", cursor: "pointer" }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", background: color[f.type] + "22", color: color[f.type], marginBottom: 9 }}>
              <IcoFile size={16} />
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.25, marginBottom: 5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{f.name}</div>
            <div style={{ fontSize: 11, color: "var(--text-4)" }}>{kind[f.type]} · {f.when}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Tasks ────────────────────────────────────────────────── */
function TasksCard({ tasks, setTasks }) {
  const toggle = (id) => setTasks((ts) => ts.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  const open = tasks.filter((t) => !t.done).length;
  const pc = { alta: "var(--crit)", média: "var(--warn)", baixa: "var(--text-4)" };
  return (
    <div className="card">
      <div className="head">
        <div className="t"><span className="ico"><IcoCheck size={17} /></span>Tarefas de hoje <span className="count">{open}</span></div>
        <button className="more"><IcoPlus size={14} /></button>
      </div>
      <div className="body" style={{ paddingTop: 6 }}>
        {tasks.map((t) => (
          <div className="lrow" key={t.id} onClick={() => toggle(t.id)} style={{ alignItems: "center" }}>
            <span style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, display: "grid", placeItems: "center", background: t.done ? "var(--text)" : "transparent", border: t.done ? "none" : "2px solid var(--bd-2)", color: "var(--bg)" }}>
              {t.done && <IcoCheck size={11} sw={3} />}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.done ? "var(--text-4)" : "var(--text)", textDecoration: t.done ? "line-through" : "none", lineHeight: 1.3 }}>{t.title}</div>
              <div style={{ display: "flex", gap: 7, marginTop: 3, alignItems: "center" }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: pc[t.priority] }} />
                <span style={{ fontSize: 11, color: "var(--text-4)", fontWeight: 600 }}>{t.due} · {t.ctx}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── WhatsApp ─────────────────────────────────────────────── */
function WhatsappCard({ chats }) {
  return (
    <div className="card">
      <div className="head">
        <div className="t"><span className="ico"><IcoChat size={17} /></span>WhatsApp</div>
        <button className="more">Abrir <IcoArrow size={13} /></button>
      </div>
      <div className="body" style={{ paddingTop: 6 }}>
        {chats.map((c) => (
          <div className="lrow" key={c.id} style={{ alignItems: "center" }}>
            <span style={{ width: 34, height: 34, borderRadius: 999, flexShrink: 0, display: "grid", placeItems: "center", background: "var(--surface-2)", fontWeight: 700, fontSize: 13, color: "var(--text-2)" }}>{c.name[0]}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                <span className="mono" style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-4)", flexShrink: 0 }}>{c.time}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.preview}</div>
            </div>
            {c.unread > 0 && (
              <span style={{ flexShrink: 0, minWidth: 18, height: 18, padding: "0 5px", borderRadius: 999, background: "var(--ok)", color: "#fff", fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center" }}>{c.unread}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Notes ────────────────────────────────────────────────── */
function NotesCard({ notes, setNotes }) {
  return (
    <div className="card">
      <div className="head">
        <div className="t"><span className="ico"><IcoNote size={17} /></span>Notas rápidas</div>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-4)" }}>salvo automaticamente</span>
      </div>
      <div className="body" style={{ paddingTop: 10 }}>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} spellCheck={false}
          style={{ width: "100%", minHeight: 90, resize: "vertical", border: "none", outline: "none", background: "transparent", color: "var(--text-2)", fontFamily: "inherit", fontSize: 13.5, lineHeight: 1.55, letterSpacing: "-0.005em" }} />
      </div>
    </div>
  );
}

/* ── AI Drawer (simple) ───────────────────────────────────── */
function AIDrawer({ open, seed, onClose }) {
  const [msgs, setMsgs] = useState([]);
  const [typing, setTyping] = useState("");
  const [input, setInput] = useState("");
  const bodyRef = useRef(null);
  const seededRef = useRef(null);

  const scrollDown = () => { const el = bodyRef.current; if (el) el.scrollTop = el.scrollHeight; };

  const ask = useCallback((q) => {
    if (!q.trim()) return;
    setMsgs((m) => [...m, { role: "user", text: q }]);
    const full = `Entendido! Para "${q.slice(0, 40)}…" — Análise em progresso. Esta funcionalidade de IA estará disponível em breve. Por enquanto, use os atalhos do dashboard para suas ações mais comuns.`;
    let i = 0;
    setTyping("");
    const tick = () => {
      i += Math.max(2, Math.round(full.length / 80));
      setTyping(full.slice(0, i));
      scrollDown();
      if (i < full.length) setTimeout(tick, 18);
      else { setMsgs((m) => [...m, { role: "ai", text: full }]); setTyping(""); }
    };
    setTimeout(tick, 300);
  }, []);

  useEffect(() => {
    if (open && seed && seededRef.current !== seed) { seededRef.current = seed; ask(seed); }
    if (!open) { seededRef.current = null; }
  }, [open, seed, ask]);

  useEffect(() => { scrollDown(); }, [msgs, typing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) { ask(input); setInput(""); }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(17,19,21,0.32)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity .2s", zIndex: 90 }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 440, maxWidth: "92vw", background: "var(--surface)", borderLeft: "1px solid var(--bd)", boxShadow: "var(--shadow-pop)", transform: open ? "none" : "translateX(110%)", transition: "transform .26s cubic-bezier(.2,.8,.2,1)", zIndex: 91, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "16px 18px", borderBottom: "1px solid var(--bd)" }}>
          <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--accent)", color: "var(--on-accent)", display: "grid", placeItems: "center" }}><IcoSparkle size={17} /></span>
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontWeight: 800, fontSize: 14.5, letterSpacing: "-0.02em" }}>Assistente</div>
            <div style={{ fontSize: 11.5, color: "var(--text-4)" }}>Master Hunting Beauty</div>
          </div>
          <button className="iconbtn" style={{ marginLeft: "auto" }} onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div ref={bodyRef} style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          {msgs.length === 0 && !typing && (
            <div style={{ margin: "auto 0", textAlign: "center", color: "var(--text-4)", padding: "20px 10px" }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: "var(--accent-tint)", color: "var(--accent-line)", display: "grid", placeItems: "center", margin: "0 auto 12px" }}><IcoSparkle size={24} /></div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-3)", maxWidth: 280, margin: "0 auto" }}>Pergunte sobre seus e-mails, agenda, tarefas ou arquivos.</div>
            </div>
          )}
          {msgs.map((m, i) => (
            <div key={i} className="fade-in" style={{ alignSelf: m.role === "ai" ? "flex-start" : "flex-end", maxWidth: "90%" }}>
              {m.role === "ai" && <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-4)", marginBottom: 4 }}>IA</div>}
              <div style={{ background: m.role === "ai" ? "var(--bg)" : "var(--accent)", color: m.role === "ai" ? "var(--text-2)" : "var(--on-accent)", border: m.role === "ai" ? "1px solid var(--bd)" : "none", borderRadius: 12, padding: "10px 13px", fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{m.text}</div>
            </div>
          ))}
          {typing && (
            <div className="fade-in" style={{ alignSelf: "flex-start", maxWidth: "90%" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-4)", marginBottom: 4 }}>IA</div>
              <div style={{ background: "var(--bg)", color: "var(--text-2)", border: "1px solid var(--bd)", borderRadius: 12, padding: "10px 13px", fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{typing}<span className="pulse">▍</span></div>
            </div>
          )}
        </div>

        <div style={{ padding: 14, borderTop: "1px solid var(--bd)" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            {["Resumir inbox", "Minhas prioridades", "Pendências Dermavita"].map((c) => (
              <button key={c} className="chip" onClick={() => ask(c)}>{c}</button>
            ))}
          </div>
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, alignItems: "center", background: "var(--bg)", border: "1px solid var(--bd)", borderRadius: 11, padding: "5px 5px 5px 14px" }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Peça algo à IA…"
              style={{ flex: 1, border: "none", background: "none", outline: "none", color: "var(--text)", fontSize: 14, fontFamily: "inherit" }} />
            <button type="submit" style={{ width: 34, height: 34, borderRadius: 8, background: "var(--text)", color: "var(--bg)", display: "grid", placeItems: "center" }}><IcoArrow size={17} /></button>
          </form>
        </div>
      </div>
    </>
  );
}

/* ── TabHoje main export ──────────────────────────────────── */
export function TabHoje({ onNavPipeline, fireToast }) {
  const [agenda]    = useLocalState("mhb.agenda", DEFAULT_AGENDA);
  const [emails]    = useLocalState("mhb.emails", DEFAULT_EMAILS);
  const [tasks, setTasks]  = useLocalState("mhb.tasks", DEFAULT_TASKS);
  const [drive]     = useLocalState("mhb.drive", DEFAULT_DRIVE);
  const [whatsapp]  = useLocalState("mhb.whatsapp", DEFAULT_WHATSAPP);
  const [notes, setNotes]  = useLocalState("mhb.notes", DEFAULT_NOTES);

  const [drawer, setDrawer] = useState(false);
  const [seed, setSeed]     = useState("");

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const dateStr = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const nReply = emails.filter((e) => e.needsReply).length;
  const nTasks = tasks.filter((x) => !x.done).length;

  const askAI = (q) => { setSeed(q); setDrawer(true); };

  const handleCreate = (k) => {
    if (k === "debrief") {
      askAI("Gerar debriefing da última reunião");
    } else {
      const labels = { mail: "e-mail", event: "evento", doc: "documento", task: "tarefa", note: "nota" };
      fireToast && fireToast("Novo " + (labels[k] || k) + " — abrindo…");
    }
  };

  return (
    <>
      {/* Hero */}
      <div className="hero">
        <div className="greet">
          {greet}, <span className="hl">Isabele</span>.{" "}
          <span className="when">vamos ao que importa.</span>
        </div>
        <div className="herometa">
          <span style={{ textTransform: "capitalize" }}>{dateStr}</span>
          <span><b>{nReply}</b> e-mails p/ responder</span>
          <span><b>{nTasks}</b> tarefas abertas</span>
          <span><b>{agenda.filter(e => e.kind === "meet").length}</b> reuniões hoje</span>
        </div>

        <div className="aibar">
          <form className="row" onSubmit={(e) => { e.preventDefault(); const v = e.target.q.value.trim(); if (v) { askAI(v); e.target.q.value = ""; } }}>
            <span className="spark"><IcoSparkle size={17} /></span>
            <input name="q" placeholder="Pergunte ou peça algo — ex.: prepara a reunião das 11h, resume minha inbox…" />
            <button type="submit" className="send"><IcoArrow size={18} /></button>
          </form>
          <div className="chips">
            {AI_SUGGESTIONS.map((s) => (
              <button key={s} className="chip" onClick={() => askAI(s)}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid">
        <div className="col">
          <MeetingHero agenda={agenda} onAsk={askAI} />
          <InboxCard emails={emails} onAsk={askAI} />
          <DriveCard drive={drive} />
        </div>
        <div className="col">
          <CreateCard onAction={handleCreate} />
          <TasksCard tasks={tasks} setTasks={setTasks} />
          <WhatsappCard chats={whatsapp} />
          <NotesCard notes={notes} setNotes={setNotes} />
        </div>
      </div>

      <AIDrawer open={drawer} seed={seed} onClose={() => setDrawer(false)} />
    </>
  );
}
