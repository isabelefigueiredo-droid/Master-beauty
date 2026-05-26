import { useEffect } from 'react';
import { useLocalState } from './shared.jsx';
import { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakSelect } from './tweaks-panel.jsx';
import { TabInicio } from './tab-inicio.jsx';
import { TabEstudo } from './tab-estudo.jsx';
import { TabTrabalho } from './tab-trabalho.jsx';
import { TabVida } from './tab-vida.jsx';
import { TabCasa } from './tab-casa.jsx';
import { TabFinancas } from './tab-financas.jsx';

const TABS = [
  { k: "inicio",   label: "Início",    ico: "✿", color: "var(--terracotta)" },
  { k: "estudo",   label: "Estudo",    ico: "✎", color: "var(--olive)" },
  { k: "trabalho", label: "Trabalho",  ico: "❍", color: "var(--blue)" },
  { k: "vida",     label: "Vida",      ico: "❀", color: "var(--rose-deep)" },
  { k: "casa",     label: "Casa",      ico: "⌂", color: "var(--mustard)" },
  { k: "financas", label: "Finanças",  ico: "$", color: "var(--plum)" },
];

const TWEAK_DEFAULTS = {
  palette: "atelier",
  density: "confortavel",
  displayFont: "caprasimo",
  decor: "on",
  tone: "Amigável",
};

export default function App() {
  const [activeTab, setActiveTab] = useLocalState("isa.activeTab", "inicio");
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.palette = t.palette;
    root.dataset.density = t.density === "confortavel" ? "" : t.density;
    root.dataset.decor = t.decor;
    const fontMap = {
      caprasimo: '"Caprasimo", Georgia, serif',
      serifdisp: '"DM Serif Display", Georgia, serif',
      caveat: '"Caveat", "Bradley Hand", cursive',
    };
    root.style.setProperty("--font-display", fontMap[t.displayFont] || fontMap.caprasimo);
  }, [t]);

  const renderTab = () => {
    switch (activeTab) {
      case "inicio":   return <TabInicio goTo={setActiveTab} tone={t.tone} />;
      case "estudo":   return <TabEstudo />;
      case "trabalho": return <TabTrabalho />;
      case "vida":     return <TabVida />;
      case "casa":     return <TabCasa />;
      case "financas": return <TabFinancas />;
      default:         return null;
    }
  };

  const now = new Date();
  const dataCurta = `${now.getDate()}/${now.getMonth()+1}`;

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          isa<span className="dot"></span>
          <span className="small">painel da vida</span>
        </div>
        <div className="header-meta">
          <span className="weather">☀️ 24° SP</span>
          <span>{dataCurta}</span>
          <div className="avatar">I</div>
        </div>
      </header>

      <nav className="tabs-row" role="tablist">
        {TABS.map(tab => (
          <button key={tab.k}
            role="tab"
            aria-selected={activeTab === tab.k}
            className="tab"
            onClick={() => setActiveTab(tab.k)}>
            <span className="ico" style={{ color: tab.color }}>{tab.ico}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="surface" data-screen-label={`Tab: ${activeTab}`}>
        {renderTab()}
      </main>

      <footer style={{ textAlign: "center", marginTop: 28, fontFamily: "var(--font-hand)", fontSize: 18, color: "var(--ink-mute)" }}>
        feito com cuidado · pequenos passos, todos os dias ✿
      </footer>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Visual">
          <TweakSelect label="paleta" value={t.palette} onChange={v => setTweak("palette", v)}
            options={[
              { value: "atelier", label: "atelier (creme + terracota)" },
              { value: "oliveira", label: "oliveira (tons terrosos)" },
              { value: "rosa", label: "rosa (gourmand)" },
              { value: "azulao", label: "azulão (mediterrâneo)" },
              { value: "noite", label: "noite (escuro)" },
            ]} />
          <TweakRadio label="densidade" value={t.density} onChange={v => setTweak("density", v)}
            options={[
              { value: "confortavel", label: "confortável" },
              { value: "compacto", label: "compacto" },
            ]} />
          <TweakSelect label="fonte display" value={t.displayFont} onChange={v => setTweak("displayFont", v)}
            options={[
              { value: "caprasimo", label: "Caprasimo (chunky serif)" },
              { value: "serifdisp", label: "DM Serif Display" },
              { value: "caveat", label: "Caveat (manual)" },
            ]} />
          <TweakRadio label="decorações" value={t.decor} onChange={v => setTweak("decor", v)}
            options={[
              { value: "on", label: "stickers" },
              { value: "off", label: "limpo" },
            ]} />
        </TweakSection>

        <TweakSection label="Conteúdo">
          <TweakSelect label="tom de voz" value={t.tone} onChange={v => setTweak("tone", v)}
            options={[
              { value: "Profissional e direto", label: "Profissional" },
              { value: "Amigável", label: "Amigável" },
              { value: "Minimalista", label: "Minimalista" },
              { value: "Bem-humorado", label: "Bem-humorado" },
            ]} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}
