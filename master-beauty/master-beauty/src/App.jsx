/* Master Hunting Beauty — ML Workspace Shell */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalState } from './shared.jsx';
import { TabHoje } from './tab-hoje.jsx';
import { TabTrabalho } from './tab-trabalho.jsx';
import { TabVida } from './tab-vida.jsx';
import { TabCasa } from './tab-casa.jsx';
import { TabEstudo } from './tab-estudo.jsx';
import { TabFinancas } from './tab-financas.jsx';
import {
  IcoHome, IcoMail, IcoCalendar, IcoPipeline, IcoCheck,
  IcoNote, IcoLife, IcoHome2, IcoSearch, IcoSun, IcoMoon, IcoArrow, IcoSparkle,
} from './icons.jsx';

/* ── Navigation items ─────────────────────────────────────── */
const NAV = [
  { id: "hoje",     label: "Hoje",       Ico: IcoHome },
  { id: "inbox",    label: "Inbox",      Ico: IcoMail,      dot: true },
  { id: "agenda",   label: "Agenda",     Ico: IcoCalendar },
  { id: "pipeline", label: "Pipeline",   Ico: IcoPipeline },
  { id: "tarefas",  label: "Tarefas",    Ico: IcoCheck },
  { id: "notas",    label: "Notas",      Ico: IcoNote },
  { id: "vida",     label: "Vida",       Ico: IcoLife },
  { id: "casa",     label: "Casa",       Ico: IcoHome2 },
];

/* ── Command palette ──────────────────────────────────────── */
function CommandPalette({ open, onClose, onRun }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) { setQ(""); setSel(0); setTimeout(() => inputRef.current && inputRef.current.focus(), 30); }
  }, [open]);

  const cmds = [
    { g: "Navegar", label: "Ir para Hoje",        Ico: IcoHome,     act: () => onRun("nav", "hoje") },
    { g: "Navegar", label: "Abrir Pipeline",       Ico: IcoPipeline, act: () => onRun("nav", "pipeline") },
    { g: "Navegar", label: "Abrir Agenda",         Ico: IcoCalendar, act: () => onRun("nav", "agenda") },
    { g: "Navegar", label: "Abrir Tarefas",        Ico: IcoCheck,    act: () => onRun("nav", "tarefas") },
    { g: "Criar",   label: "Novo e-mail",          Ico: IcoMail,     act: () => onRun("create", "mail") },
    { g: "Criar",   label: "Novo evento",          Ico: IcoCalendar, act: () => onRun("create", "event") },
    { g: "Criar",   label: "Nova tarefa",          Ico: IcoCheck,    act: () => onRun("create", "task") },
    { g: "IA",      label: "Resumir minha inbox",  Ico: IcoSparkle,  act: () => onRun("ai", "Resumir minha inbox de hoje") },
    { g: "IA",      label: "Minhas prioridades",   Ico: IcoSparkle,  act: () => onRun("ai", "Quais são minhas 3 prioridades agora?") },
    { g: "IA",      label: "Gerar debriefing",     Ico: IcoSparkle,  act: () => onRun("ai", "Gerar debriefing da última reunião") },
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
          <span style={{ color: "var(--text-4)" }}><IcoSearch size={19} /></span>
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey}
            placeholder="Buscar ou executar um comando…"
            style={{ flex: 1, border: "none", background: "none", outline: "none", color: "var(--text)", fontSize: 16, fontFamily: "inherit" }} />
          <span className="kk" style={{ fontSize: 11, fontWeight: 700, color: "var(--text-4)", border: "1px solid var(--bd)", borderRadius: 5, padding: "1px 6px" }}>esc</span>
        </div>
        <div style={{ maxHeight: 380, overflowY: "auto", padding: 8 }}>
          {filtered.length === 0 && (
            <div style={{ padding: 28, textAlign: "center", color: "var(--text-4)", fontSize: 14 }}>Nada encontrado para "{q}"</div>
          )}
          {filtered.map((c, i) => {
            const head = c.g !== lastG ? c.g : null; lastG = c.g;
            return (
              <React.Fragment key={i}>
                {head && <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-4)", padding: "10px 10px 5px" }}>{head}</div>}
                <div onMouseEnter={() => setSel(i)} onClick={() => { c.act(); onClose(); }}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, cursor: "pointer", background: sel === i ? "var(--surface-hover)" : "transparent" }}>
                  <span style={{ color: sel === i ? "var(--text)" : "var(--text-3)" }}><c.Ico size={18} /></span>
                  <span style={{ fontSize: 14.5, fontWeight: 600, flex: 1 }}>{c.label}</span>
                  {sel === i && <span style={{ color: "var(--text-4)" }}><IcoArrow size={15} /></span>}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Placeholder (secondary screens) ─────────────────────── */
function Placeholder({ navItem, onBack }) {
  const { label, Ico } = navItem;
  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "60vh", textAlign: "center" }}>
      <div>
        <div style={{ width: 60, height: 60, borderRadius: 14, background: "var(--surface)", border: "1px solid var(--bd)", display: "grid", placeItems: "center", margin: "0 auto 16px", color: "var(--text-3)" }}>
          <Ico size={28} />
        </div>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Módulo</div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8, color: "var(--text)" }}>{label}</div>
        <div style={{ color: "var(--text-3)", fontSize: 14, maxWidth: 360, margin: "0 auto 22px" }}>
          A visão completa de <span className="hl">{label}</span> entra aqui. Por enquanto, tudo o que importa já vive no hub <b>Hoje</b>.
        </div>
        <button onClick={onBack} style={{ height: 40, padding: "0 20px", borderRadius: 10, background: "var(--accent)", color: "var(--on-accent)", fontWeight: 700, fontSize: 14 }}>
          Voltar para Hoje
        </button>
      </div>
    </div>
  );
}

/* ── Export / Import data ─────────────────────────────────── */
function useDataIO(fireToast) {
  const exportData = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("isa.") || key.startsWith("mhb."))) {
        try { data[key] = JSON.parse(localStorage.getItem(key)); }
        catch { data[key] = localStorage.getItem(key); }
      }
    }
    const d = new Date();
    const stamp = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `mhb-${stamp}.json`; a.click();
    URL.revokeObjectURL(url);
    fireToast && fireToast("Dados exportados com sucesso");
  };

  const importData = () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          Object.entries(data).forEach(([key, value]) => {
            if (key.startsWith("isa.") || key.startsWith("mhb.")) localStorage.setItem(key, JSON.stringify(value));
          });
          window.location.reload();
        } catch { alert("Arquivo inválido — use um .json exportado pelo painel."); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return { exportData, importData };
}

/* ── App ──────────────────────────────────────────────────── */
export default function App() {
  const [nav, setNav]       = useLocalState("mhb.nav", "hoje");
  const [dark, setDark]     = useLocalState("mhb.dark", false);
  const [accent, setAccent] = useLocalState("mhb.accent", "yellow");
  const [palette, setPalette] = useState(false);
  const [toast, setToast]   = useState(null);

  /* Apply theme to body */
  useEffect(() => {
    document.body.dataset.theme  = dark ? "dark" : "light";
    document.body.dataset.accent = accent;
  }, [dark, accent]);

  /* Keyboard shortcuts */
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((p) => !p); }
      if (e.key === "Escape") setPalette(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  /* Toast */
  const fireToast = useCallback((msg) => setToast(msg), []);
  useEffect(() => {
    if (toast) { const id = setTimeout(() => setToast(null), 2800); return () => clearTimeout(id); }
  }, [toast]);

  const { exportData, importData } = useDataIO(fireToast);

  const runCmd = (kind, payload) => {
    if (kind === "nav")    setNav(payload);
    else if (kind === "ai")    { /* AI handled inside TabHoje */ }
    else if (kind === "create") fireToast("Novo: " + payload);
  };

  const current = NAV.find((n) => n.id === nav) || NAV[0];

  const renderContent = () => {
    switch (nav) {
      case "hoje":     return <TabHoje onNavPipeline={() => setNav("pipeline")} fireToast={fireToast} />;
      case "pipeline": return <TabTrabalho />;
      case "vida":     return <div className="surface-legacy"><TabVida /></div>;
      case "casa":     return <div className="surface-legacy"><TabCasa /></div>;
      case "notas":    return <div className="surface-legacy"><TabEstudo /></div>;
      case "tarefas":  return <div className="surface-legacy"><TabFinancas /></div>;
      default:         return <Placeholder navItem={current} onBack={() => setNav("hoje")} />;
    }
  };

  return (
    <div className="app">
      {/* ── Rail ── */}
      <nav className="rail">
        <div className="logo">
          <img src="/assets/mercado-libre.png" alt="ML" />
        </div>

        {NAV.map((n) => (
          <button key={n.id} className={"rnav" + (nav === n.id ? " on" : "")} onClick={() => setNav(n.id)} title={n.label}>
            <n.Ico size={21} />
            {n.dot && nav !== n.id && <span className="dot" />}
            <span className="rtip">{n.label}</span>
          </button>
        ))}

        <div className="spacer" />

        <button className="rnav" onClick={() => setAccent((a) => a === "yellow" ? "navy" : "yellow")} title="Mudar cor">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
            <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" opacity="0.6" />
            <circle cx="12" cy="12" r="9" />
          </svg>
          <span className="rtip">{accent === "yellow" ? "Cor: Navy" : "Cor: Amarelo"}</span>
        </button>

        <button className="rnav" onClick={() => setDark((d) => !d)} title={dark ? "Tema claro" : "Tema escuro"}>
          {dark ? <IcoSun size={20} /> : <IcoMoon size={20} />}
          <span className="rtip">{dark ? "Tema claro" : "Tema escuro"}</span>
        </button>
      </nav>

      {/* ── Main ── */}
      <div className="main">
        {/* Topbar */}
        <div className="topbar">
          <div className="crumb">
            {current.label} <span className="sub">· Master Hunting Beauty</span>
          </div>
          <div className="grow" />

          <button className="kbtn" onClick={() => setPalette(true)}>
            <IcoSearch size={15} />
            Buscar ou executar comando
            <span className="kk">⌘K</span>
          </button>

          <button className="iconbtn" onClick={() => setDark((d) => !d)} title={dark ? "Tema claro" : "Tema escuro"}>
            {dark ? <IcoSun size={18} /> : <IcoMoon size={18} />}
          </button>

          <button className="iconbtn" onClick={exportData} title="Exportar dados JSON" style={{ fontSize: 11, fontWeight: 700, width: "auto", padding: "0 10px", gap: 4, display: "flex", alignItems: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v14M5 14l7 7 7-7M3 20h18"/></svg>
            Export
          </button>

          <button className="iconbtn" onClick={importData} title="Importar dados JSON" style={{ fontSize: 11, fontWeight: 700, width: "auto", padding: "0 10px", gap: 4, display: "flex", alignItems: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21V7M5 10l7-7 7 7M3 20h18"/></svg>
            Import
          </button>

          <div className="avatar">IS</div>
        </div>

        {/* Content */}
        <div className="scroll">
          <div className="canvas">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* ── Command Palette ── */}
      <CommandPalette open={palette} onClose={() => setPalette(false)} onRun={(kind, payload) => { runCmd(kind, payload); setPalette(false); }} />

      {/* ── Toast ── */}
      {toast && (
        <div className="fade-in" style={{ position: "fixed", bottom: 26, left: "50%", transform: "translateX(-50%)", background: "var(--text)", color: "var(--bg)", padding: "11px 18px", borderRadius: 10, fontSize: 14, fontWeight: 600, boxShadow: "var(--shadow-pop)", zIndex: 120, display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ color: "var(--accent)" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square"><path d="M5 13l4 4L19 7"/></svg>
          </span>
          {toast}
        </div>
      )}
    </div>
  );
}
