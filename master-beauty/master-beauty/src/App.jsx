import React, { useState, useEffect, useCallback } from 'react';
import Icons from './icons.jsx';
import TabHoje, { AIDrawer, DebriefModal, CommandPalette } from './tab-hoje.jsx';
import TabPipeline from './tab-pipeline.jsx';
import { initGoogleAuth, getStoredToken, signIn, signOut, isConfigured } from './google-auth.js';

const I = Icons;

const NAV = [
  { id: "hoje",     ic: "home",     label: "Hoje" },
  { id: "inbox",    ic: "mail",     label: "Inbox",    dot: true },
  { id: "agenda",   ic: "calendar", label: "Agenda" },
  { id: "pipeline", ic: "drive",    label: "Pipeline" },
  { id: "tarefas",  ic: "check",    label: "Tarefas" },
  { id: "notas",    ic: "note",     label: "Notas" },
];

function Placeholder({ nav, onBack }) {
  const item = NAV.find((n) => n.id === nav);
  const Ico = I[item.ic];
  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "60vh", textAlign: "center" }}>
      <div>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: "var(--surface)", border: "1px solid var(--bd)", display: "grid", placeItems: "center", margin: "0 auto 18px", color: "var(--text-3)" }}><Ico size={30} /></div>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Módulo</div>
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>{item.label}</div>
        <div style={{ color: "var(--text-3)", fontSize: 15, maxWidth: 380, margin: "0 auto 22px" }}>
          A visão completa de <span className="hl">{item.label}</span> entra aqui. Por enquanto, tudo o que importa já vive no hub <b>Hoje</b>.
        </div>
        <button onClick={onBack} style={{ height: 42, padding: "0 20px", borderRadius: 10, background: "var(--accent)", color: "var(--on-accent)", fontWeight: 700, fontSize: 14 }}>Voltar para Hoje</button>
      </div>
    </div>
  );
}

export default function App() {
  const [nav, setNav]       = useState("hoje");
  const [dark, setDark]     = useState(false);
  const [accent, setAccent] = useState("yellow");
  const [drawer, setDrawer] = useState(false);
  const [seed, setSeed]     = useState("");
  const [debrief, setDebrief] = useState(null);
  const [palette, setPalette] = useState(false);
  const [toast, setToast]   = useState(null);
  const [googleConnected, setGoogleConnected] = useState(() => !!getStoredToken());

  useEffect(() => {
    document.body.dataset.theme   = dark ? "dark" : "light";
    document.body.dataset.accent  = accent;
    document.body.dataset.density = "comfortable";
  }, [dark, accent]);

  useEffect(() => { initGoogleAuth(); }, []);

  const fireToast = useCallback((msg) => setToast(msg), []);

  useEffect(() => {
    if (toast) { const id = setTimeout(() => setToast(null), 2800); return () => clearTimeout(id); }
  }, [toast]);

  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((p) => !p); }
      if (e.key === "Escape") setPalette(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    try {
      await signIn();
      setGoogleConnected(true);
      fireToast("Google conectado!");
    } catch (e) {
      if (e.message !== "popup_closed_by_user" && e.message !== "access_denied") {
        fireToast("Erro ao conectar: " + e.message);
      }
    }
  }, [fireToast]);

  const handleGoogleSignOut = useCallback(() => {
    signOut();
    setGoogleConnected(false);
    fireToast("Google desconectado.");
  }, [fireToast]);

  const askAI = (q) => {
    if (/debrief/i.test(q)) { setDebrief({ title: "Daily — Squad Hunting Beauty", mode: "debrief" }); return; }
    setSeed(q);
    setDrawer(true);
  };

  const runCmd = (kind, payload) => {
    if (kind === "nav") setNav(payload);
    else if (kind === "ai") { setSeed(payload); setDrawer(true); }
    else if (kind === "debrief") setDebrief(payload);
    else if (kind === "create") {
      if (payload === "debrief") setDebrief({ title: "Daily — Squad Hunting Beauty", mode: "debrief" });
      else fireToast("Novo " + payload + " — abrindo…");
    }
  };

  const curNav = NAV.find((n) => n.id === nav);
  const configured = isConfigured();

  return (
    <div className="app">
      {/* Rail */}
      <nav className="rail">
        <div className="logo">
          <img src={dark ? "/assets/mercado-libre-monochrome.png" : "/assets/mercado-libre.png"} alt="ML"
            onError={(e) => { e.target.style.display = "none"; }} />
        </div>
        {NAV.map((n) => {
          const Ico = I[n.ic];
          return (
            <button key={n.id} className={"rnav" + (nav === n.id ? " on" : "")} onClick={() => setNav(n.id)}>
              <Ico size={21} />
              {n.dot && nav !== n.id && <span className="dot" />}
              <span className="rtip">{n.label}</span>
            </button>
          );
        })}
        <div className="spacer" />
        <button className="rnav" onClick={() => setDark((d) => !d)}>
          {dark ? <I.sun size={20} /> : <I.moon size={20} />}
          <span className="rtip">{dark ? "Tema claro" : "Tema escuro"}</span>
        </button>
        <button className="rnav" onClick={() => setAccent((a) => a === "yellow" ? "navy" : "yellow")}>
          <span style={{ width: 16, height: 16, borderRadius: 999, background: accent === "yellow" ? "#FFE600" : "#2D3277", border: "2px solid var(--bd-2)" }} />
          <span className="rtip">Alternar cor</span>
        </button>
      </nav>

      {/* Main */}
      <div className="main">
        <div className="topbar">
          <div className="crumb">{curNav.label} <span className="sub">· Master Hunting Beauty</span></div>
          <div className="grow" />
          <button className="kbtn" onClick={() => setPalette(true)}>
            <I.search size={16} /> Buscar ou executar comando <span className="kk">⌘K</span>
          </button>
          <div className="avatar" title="Isabele · Hunter Beauty">IS</div>
        </div>

        <div className="scroll">
          <div className="canvas">
            {nav === "hoje" && (
              <TabHoje
                onAsk={askAI}
                onDebrief={setDebrief}
                onJoin={() => fireToast("Abrindo Google Meet…")}
                onCreate={(k) => runCmd("create", k)}
                googleConnected={googleConnected}
                onGoogleSignIn={configured ? handleGoogleSignIn : null}
                onGoogleSignOut={configured ? handleGoogleSignOut : null} />
            )}
            {nav === "pipeline" && <TabPipeline />}
            {(nav === "inbox" || nav === "agenda" || nav === "tarefas" || nav === "notas") && (
              <Placeholder nav={nav} onBack={() => setNav("hoje")} />
            )}
          </div>
        </div>
      </div>

      <AIDrawer open={drawer} seed={seed} onClose={() => setDrawer(false)} onDebrief={setDebrief} />
      <DebriefModal meeting={debrief} onClose={() => setDebrief(null)} toast={fireToast} />
      <CommandPalette open={palette} onClose={() => setPalette(false)} onRun={runCmd} />

      {toast && (
        <div className="fade-in" style={{ position: "fixed", bottom: 26, left: "50%", transform: "translateX(-50%)", background: "var(--text)", color: "var(--bg)", padding: "12px 20px", borderRadius: 11, fontSize: 14, fontWeight: 600, boxShadow: "var(--shadow-pop)", zIndex: 120, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "var(--accent)" }}><I.check size={16} sw={3} /></span>{toast}
        </div>
      )}
    </div>
  );
}
