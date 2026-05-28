import { useState, useEffect } from 'react';
import {
  useLocalState, DAYS_PT_SHORT, Card, CardHeader, Sticker, Chip,
  InlineEdit, AddRow, DeleteBtn,
} from './shared.jsx';

// ─── Cortisol Protocol ───────────────────────────────────────────────────────

const ROTINA = [
  { id:"c1",  text:"☀️ Acordar 7h + luz solar 10min" },
  { id:"c2",  text:"🍋 Água com limão morna em jejum" },
  { id:"c3",  text:"🌬️ Respiração 4-7-8 (3 rodadas)" },
  { id:"c4",  text:"🚶 Movimento leve 10min" },
  { id:"c5",  text:"🥚 Café da manhã proteico" },
  { id:"c6",  text:"⏸️ Pausa 5min a cada 90min de trabalho" },
  { id:"c7",  text:"🍽️ Almoço sem tela" },
  { id:"c8",  text:"🌿 Caminhada 20min após o almoço" },
  { id:"c9",  text:"🚫☕ Sem cafeína após 14h" },
  { id:"c10", text:"🌙 Modo noturno nos dispositivos 21h" },
  { id:"c11", text:"🛁 Banho morno" },
  { id:"c12", text:"📓 Diário de gratidão" },
  { id:"c13", text:"💤 Dormir até 23h" },
];

const MASSAGEM = [
  "Limpar o rosto",
  "Aplicar óleo (rosa mosqueta ou jojoba)",
  "Testa: centro → têmporas, 5x",
  "Olhos: canto interno → externo, delicado, 5x",
  "Maçãs do rosto: nariz → orelhas, 5x",
  "Mandíbula (jawline): queixo → orelhas, 5x",
  "Pescoço: cima → baixo, 5x",
];

const EXERCICIOS = [
  { d:"Seg", icon:"🚶", text:"Caminhada 30min + mobilidade 10min" },
  { d:"Ter", icon:"🧘", text:"Yoga ou pilates 45min" },
  { d:"Qua", icon:"🚶", text:"Caminhada 45min (ritmo moderado)" },
  { d:"Qui", icon:"🏺", text:"Cerâmica — atividade manual anti-estresse" },
  { d:"Sex", icon:"🧘", text:"Treino de resistência leve 45min" },
  { d:"Sáb", icon:"🌳", text:"Atividade prazerosa ao ar livre" },
  { d:"Dom", icon:"😴", text:"Descanso ativo — alongamento 20min" },
];

const SUPLEMENTOS = [
  { name:"Ashwagandha KSM-66", dose:"300mg", when:"manhã, com o café", c:"var(--olive)" },
  { name:"Magnésio glicimato", dose:"400mg", when:"noite, antes de dormir", c:"var(--plum)" },
  { name:"Vitamina C", dose:"1000mg", when:"almoço", c:"var(--terracotta)" },
  { name:"Ômega-3 (EPA+DHA)", dose:"2g", when:"almoço", c:"var(--blue)" },
  { name:"Vitamina D3 + K2", dose:"5000UI", when:"almoço", c:"var(--mustard)" },
];

const EXAMES = [
  "Cortisol sérico basal (sangue — manhã em jejum)",
  "Cortisol salivar (3x ao dia: 8h, 13h, 20h)",
  "DHEA-S",
  "TSH + T3 livre + T4 livre",
  "Hemograma completo + PCR",
];

const CARDAPIO_SEMANAS = [
  {
    sem: "Semana 1 — Reset",
    dias: [
      { d:"Seg", m:"Iogurte grego + frutas vermelhas + chia", a:"Frango grelhado + quinoa + salada verde", j:"Salmão assado + batata doce + brócolis", s:"Castanhas + banana" },
      { d:"Ter", m:"Omelete de espinafre (2 ovos) + torrada integral", a:"Carne magra + arroz integral + legumes no vapor", j:"Ovo cozido + sopa de legumes", s:"Iogurte grego + mel" },
      { d:"Qua", m:"Vitamina: leite vegetal + banana + cacau + aveia", a:"Peixe grelhado + purê de cenoura + couve refogada", j:"Frango desfiado + abobrinha + quinoa", s:"Maçã + pasta de amendoim (1 col)" },
      { d:"Qui", m:"Mingau de aveia + canela + castanhas", a:"Grão-de-bico + legumes assados + tahine", j:"Salmão + aspargos + arroz integral", s:"Chá de camomila + tâmaras" },
      { d:"Sex", m:"Ovos mexidos + abacate + torrada integral", a:"Frango + batata doce + salada colorida", j:"Sopa proteica (lentilha + frango)", s:"Frutas vermelhas + kefir" },
    ],
  },
  {
    sem: "Semana 2 — Regulação",
    dias: [
      { d:"Seg", m:"Smoothie verde: espinafre + banana + limão + gengibre", a:"Frango orgânico + quinoa + rúcula", j:"Peixe branco + abobrinha grelhada + arroz", s:"Castanhas do Pará (2-3 un)" },
      { d:"Ter", m:"Iogurte grego + granola caseira + morangos", a:"Carne magra + feijão preto + couve", j:"Omelete de cogumelos + salada", s:"Banana + amendoim" },
      { d:"Qua", m:"Tapioca de ricota e tomate-seco + suco de laranja", a:"Salmão + batata doce + legumes coloridos", j:"Frango + sopa de abóbora", s:"Kefir de leite" },
      { d:"Qui", m:"Aveia + chia + leite de amêndoa + frutas", a:"Tofu grelhado + arroz integral + temperos", j:"Ovo + batata doce + brócolis no vapor", s:"Chá verde + castanhas" },
      { d:"Sex", m:"Ovos + espinafre refogado + torrada", a:"Peixe assado + quinoa + salada de beterraba", j:"Frango desfiado + couve-flor gratinada", s:"Frutas secas + semente de girassol" },
    ],
  },
  {
    sem: "Semana 3 — Consolidação",
    dias: [
      { d:"Seg", m:"Panqueca de banana + ovos + aveia", a:"Frango + legumes assados + arroz integral", j:"Salmão + aspargos + batata doce", s:"Iogurte + chia" },
      { d:"Ter", m:"Vitamina proteica: leite de coco + banana + proteína vegetal", a:"Carne magra + feijão + couve + arroz", j:"Sopa de lentilha + pão integral", s:"Castanhas + barra proteica caseira" },
      { d:"Qua", m:"Omelete + abacate + torrada + suco natural", a:"Grão-de-bico + tabule + homus", j:"Frango + brócolis + quinoa", s:"Maçã + pasta de amêndoa" },
      { d:"Qui", m:"Iogurte grego + frutas vermelhas + mel + granola", a:"Peixe + batata doce + salada colorida", j:"Carne magra + legumes + arroz integral", s:"Kefir + banana" },
      { d:"Sex", m:"Mingau proteico de aveia + chia + castanhas", a:"Frango + couve-flor + arroz negro", j:"Omelete de vegetais + salada verde", s:"Frutas + amendoim" },
    ],
  },
  {
    sem: "Semana 4 — Manutenção",
    dias: [
      { d:"Seg", m:"Smoothie bowl: açaí + granola + frutas + chia", a:"Salmão + quinoa + legumes no vapor", j:"Frango + batata doce + brócolis", s:"Iogurte grego + mel" },
      { d:"Ter", m:"Tapioca de ovo + queijo + frutas", a:"Carne magra + arroz + feijão + salada", j:"Sopa proteica + torrada integral", s:"Castanhas + banana" },
      { d:"Qua", m:"Ovos mexidos + espinafre + torrada + suco verde", a:"Frango orgânico + batata doce + couve", j:"Peixe + abobrinha + arroz integral", s:"Kefir + frutas vermelhas" },
      { d:"Qui", m:"Aveia + leite vegetal + banana + canela", a:"Grão-de-bico assado + legumes + tahine", j:"Salmão + aspargos + quinoa", s:"Chá + tâmaras" },
      { d:"Sex", m:"Vitamina: leite de amêndoa + abacate + cacau + chia", a:"Frango + arroz integral + legumes coloridos", j:"Omelete de cogumelos + salada verde", s:"Frutas secas + semente de abóbora" },
    ],
  },
];

const BREATH_PHASES = [
  { label:"Inspire", dur:4, color:"var(--olive)" },
  { label:"Segure",  dur:7, color:"var(--mustard)" },
  { label:"Expire",  dur:8, color:"var(--terracotta)" },
];

function BreathingTimer() {
  const [phase, setPhase] = useState(null);
  const [count, setCount] = useState(0);
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (phase === null) return;
    if (count <= 0) {
      const next = (phase + 1) % 3;
      if (next === 0 && round >= 4) { setPhase(null); setRound(0); return; }
      if (next === 0) setRound(r => r + 1);
      setPhase(next);
      setCount(BREATH_PHASES[next].dur);
      return;
    }
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, count]);

  const start = () => { setPhase(0); setCount(BREATH_PHASES[0].dur); setRound(1); };
  const stop  = () => { setPhase(null); setCount(0); setRound(0); };

  const cur = phase !== null ? BREATH_PHASES[phase] : null;
  const circumference = 2 * Math.PI * 38;
  const progress = cur ? (cur.dur - count) / cur.dur : 0;

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14, padding:"10px 0" }}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="38" fill="var(--paper)" stroke="rgba(42,31,23,0.1)" strokeWidth="6" />
        {cur && (
          <circle cx="50" cy="50" r="38" fill="none"
            stroke={cur.color} strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition:"stroke-dashoffset 1s linear" }}
          />
        )}
        <text x="50" y="47" textAnchor="middle"
          style={{ fontFamily:"var(--font-display)", fontSize:22, fill:"var(--ink)" }}>
          {phase !== null ? count : "4-7-8"}
        </text>
        {cur && (
          <text x="50" y="63" textAnchor="middle"
            style={{ fontFamily:"var(--font-hand)", fontSize:12, fill:"var(--ink-soft)" }}>
            {cur.label}
          </text>
        )}
      </svg>
      {phase !== null && (
        <div style={{ fontFamily:"var(--font-hand)", fontSize:15, color:"var(--ink-soft)" }}>
          rodada {round} de 4
        </div>
      )}
      {phase === null
        ? <button className="btn sm terracotta" onClick={start}>iniciar</button>
        : <button className="btn sm" onClick={stop}
            style={{ background:"var(--paper)", border:"1.5px solid var(--ink)" }}>parar</button>
      }
    </div>
  );
}

function CortisolSection() {
  const today = new Date().toISOString().slice(0, 10);
  const [checked, setChecked] = useLocalState(`isa.cortisol.check.${today}`, {});
  const [open, setOpen]       = useState(null);
  const [week, setWeek]       = useState(0);
  const [dayOpen, setDayOpen] = useState(null);

  const toggle    = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  const acc       = (s)  => setOpen(o => o === s ? null : s);

  const done = ROTINA.filter(r => checked[r.id]).length;
  const pct  = Math.round((done / ROTINA.length) * 100);

  return (
    <div>
      {/* header */}
      <div className="row between" style={{ marginBottom:18, flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ fontFamily:"var(--font-display)", fontSize:22, margin:0 }}>
            Protocolo Cortisol
          </h2>
          <div style={{ fontFamily:"var(--font-hand)", fontSize:17, color:"var(--ink-soft)", marginTop:2 }}>
            regulando o sistema nervoso, dia a dia
          </div>
        </div>
        <Chip color="olive">{pct}% do dia concluído</Chip>
      </div>

      {/* Checklist diário */}
      <Card className="mb-3">
        <CardHeader title="Rotina diária" hand={`${done} de ${ROTINA.length} itens`} />
        <div style={{ display:"flex", flexWrap:"wrap", gap:"8px 12px", marginTop:8 }}>
          {ROTINA.map(r => (
            <label key={r.id} style={{
              display:"flex", alignItems:"center", gap:8, cursor:"pointer",
              padding:"6px 10px",
              background: checked[r.id] ? "rgba(110,125,58,0.12)" : "transparent",
              border:`1.5px solid ${checked[r.id] ? "var(--olive)" : "rgba(42,31,23,0.15)"}`,
              borderRadius:10, fontSize:13,
              flex:"1 0 calc(50% - 12px)",
              textDecoration: checked[r.id] ? "line-through" : "none",
              color: checked[r.id] ? "var(--ink-soft)" : "var(--ink)",
              transition:"all 0.15s",
            }}>
              <input type="checkbox" checked={!!checked[r.id]} onChange={() => toggle(r.id)}
                style={{ accentColor:"var(--olive)", width:14, height:14, flexShrink:0 }} />
              {r.text}
            </label>
          ))}
        </div>
        <div style={{ marginTop:14, height:8, background:"rgba(42,31,23,0.08)", borderRadius:99, overflow:"hidden", border:"1.5px solid var(--ink)" }}>
          <div style={{ width:`${pct}%`, height:"100%", background:"var(--olive)", borderRadius:99, transition:"width 0.4s" }} />
        </div>
      </Card>

      {/* Respiração 4-7-8 */}
      <Card className="mb-3">
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:20, flexWrap:"wrap" }}>
          <div style={{ flex:1 }}>
            <CardHeader title="Respiração 4-7-8" hand="ativa o nervo vago" />
            <div style={{ fontFamily:"var(--font-hand)", fontSize:16, color:"var(--ink-soft)", lineHeight:1.7, marginTop:8 }}>
              <div>🌬️ <b>Inspire</b> pelo nariz — 4 seg</div>
              <div>⏸️ <b>Segure</b> — 7 seg</div>
              <div>💨 <b>Expire</b> pela boca — 8 seg</div>
              <div style={{ marginTop:8, fontSize:14, opacity:0.7 }}>
                3-4 rodadas · ao acordar, antes do almoço e antes de dormir
              </div>
            </div>
          </div>
          <BreathingTimer />
        </div>
      </Card>

      {/* Massagem linfática */}
      <Card className="mb-3">
        <div onClick={() => acc("massage")} style={{ cursor:"pointer" }}>
          <CardHeader
            title="Massagem linfática facial"
            hand={open === "massage" ? "fechar" : "7 passos · 5min por dia"}
            action={<span style={{ fontSize:16, color:"var(--ink-soft)", userSelect:"none" }}>{open === "massage" ? "▲" : "▼"}</span>}
          />
        </div>
        {open === "massage" && (
          <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:8 }}>
            {MASSAGEM.map((m, i) => (
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:12,
                padding:"8px 10px",
                background:"rgba(239,183,173,0.15)",
                border:"1.5px solid var(--rose)",
                borderRadius:10,
              }}>
                <div style={{
                  width:26, height:26, borderRadius:"50%",
                  background:"var(--rose-deep)", border:"2px solid var(--ink)",
                  display:"grid", placeItems:"center",
                  fontFamily:"var(--font-display)", fontSize:12, color:"var(--paper)", flexShrink:0,
                }}>{i + 1}</div>
                <span style={{ fontFamily:"var(--font-hand)", fontSize:16 }}>{m}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Exercícios */}
      <Card className="mb-3">
        <div onClick={() => acc("exercise")} style={{ cursor:"pointer" }}>
          <CardHeader
            title="Exercícios da semana"
            hand={open === "exercise" ? "fechar" : "movimento anti-cortisol"}
            action={<span style={{ fontSize:16, color:"var(--ink-soft)", userSelect:"none" }}>{open === "exercise" ? "▲" : "▼"}</span>}
          />
        </div>
        {open === "exercise" && (
          <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:6 }}>
            {EXERCICIOS.map((e, i) => (
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:12,
                padding:"8px 12px",
                background:"rgba(110,125,58,0.08)",
                border:"1.5px solid rgba(110,125,58,0.3)",
                borderRadius:10,
              }}>
                <div style={{ fontFamily:"var(--font-display)", fontSize:13, color:"var(--olive)", minWidth:30 }}>{e.d}</div>
                <span style={{ fontSize:18 }}>{e.icon}</span>
                <span style={{ fontFamily:"var(--font-hand)", fontSize:16 }}>{e.text}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Suplementos */}
      <Card className="mb-3">
        <div onClick={() => acc("supp")} style={{ cursor:"pointer" }}>
          <CardHeader
            title="Suplementos"
            hand={open === "supp" ? "fechar" : "5 aliados do equilíbrio"}
            action={<span style={{ fontSize:16, color:"var(--ink-soft)", userSelect:"none" }}>{open === "supp" ? "▲" : "▼"}</span>}
          />
        </div>
        {open === "supp" && (
          <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:8 }}>
            {SUPLEMENTOS.map((s, i) => (
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:12,
                padding:"10px 12px",
                background:"var(--paper)",
                border:"2px solid var(--ink)",
                borderRadius:12,
              }}>
                <div style={{
                  width:10, height:10, borderRadius:"50%",
                  background:s.c, border:"1.5px solid var(--ink)", flexShrink:0,
                }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"var(--font-body)", fontSize:14, fontWeight:600 }}>{s.name}</div>
                  <div style={{ fontFamily:"var(--font-hand)", fontSize:15, color:"var(--ink-soft)" }}>
                    {s.dose} · {s.when}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Cardápio */}
      <Card className="mb-3">
        <div onClick={() => acc("menu")} style={{ cursor:"pointer" }}>
          <CardHeader
            title="Cardápio anti-inflamatório"
            hand={open === "menu" ? "fechar" : "4 semanas de equilíbrio"}
            action={<span style={{ fontSize:16, color:"var(--ink-soft)", userSelect:"none" }}>{open === "menu" ? "▲" : "▼"}</span>}
          />
        </div>
        {open === "menu" && (
          <div style={{ marginTop:12 }}>
            <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
              {CARDAPIO_SEMANAS.map((s, i) => (
                <button key={i}
                  onClick={(e) => { e.stopPropagation(); setWeek(i); setDayOpen(null); }}
                  className="btn sm"
                  style={{
                    background: week === i ? "var(--mustard)" : "var(--paper)",
                    border:`1.5px solid ${week === i ? "var(--ink)" : "rgba(42,31,23,0.2)"}`,
                    fontWeight: week === i ? 700 : 400,
                    fontSize: 12,
                  }}>
                  Sem {i + 1}
                </button>
              ))}
            </div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:13, color:"var(--ink-soft)", marginBottom:10 }}>
              {CARDAPIO_SEMANAS[week].sem}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {CARDAPIO_SEMANAS[week].dias.map((d, i) => (
                <div key={i} style={{ border:"1.5px solid var(--ink)", borderRadius:10, overflow:"hidden" }}>
                  <div
                    onClick={(e) => { e.stopPropagation(); setDayOpen(o => o === i ? null : i); }}
                    style={{
                      display:"flex", alignItems:"center", gap:10, padding:"8px 12px",
                      background: dayOpen === i ? "var(--mustard)" : "var(--paper)", cursor:"pointer",
                    }}>
                    <span style={{ fontFamily:"var(--font-display)", fontSize:13, minWidth:28 }}>{d.d}</span>
                    <span style={{ fontFamily:"var(--font-hand)", fontSize:14, flex:1, color:"var(--ink-soft)" }}>
                      {d.m.split(" ").slice(0, 4).join(" ")}…
                    </span>
                    <span style={{ fontSize:13, color:"var(--ink-soft)" }}>{dayOpen === i ? "▲" : "▼"}</span>
                  </div>
                  {dayOpen === i && (
                    <div style={{ padding:"10px 14px", background:"rgba(253,248,236,0.6)", borderTop:"1px dashed rgba(42,31,23,0.2)" }}>
                      {[["🌅 Manhã", d.m], ["☀️ Almoço", d.a], ["🌙 Jantar", d.j], ["🍎 Snack", d.s]].map(([label, val]) => (
                        <div key={label} style={{ display:"flex", gap:10, marginBottom:6 }}>
                          <span style={{ fontFamily:"var(--font-hand)", fontSize:13, color:"var(--ink-soft)", minWidth:80 }}>{label}</span>
                          <span style={{ fontFamily:"var(--font-hand)", fontSize:13, flex:1 }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Exames */}
      <Card>
        <div onClick={() => acc("exams")} style={{ cursor:"pointer" }}>
          <CardHeader
            title="Exames recomendados"
            hand={open === "exams" ? "fechar" : "monitorar para ajustar"}
            action={<span style={{ fontSize:16, color:"var(--ink-soft)", userSelect:"none" }}>{open === "exams" ? "▲" : "▼"}</span>}
          />
        </div>
        {open === "exams" && (
          <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:8 }}>
            {EXAMES.map((ex, i) => (
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:12,
                padding:"8px 12px",
                background:"rgba(44,91,155,0.07)",
                border:"1.5px solid rgba(44,91,155,0.25)",
                borderRadius:10,
              }}>
                <div style={{
                  width:24, height:24, borderRadius:"50%",
                  background:"var(--blue)", border:"2px solid var(--ink)",
                  display:"grid", placeItems:"center",
                  fontFamily:"var(--font-display)", fontSize:11, color:"var(--paper)", flexShrink:0,
                }}>{i + 1}</div>
                <span style={{ fontFamily:"var(--font-hand)", fontSize:16 }}>{ex}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Main Tab ────────────────────────────────────────────────────────────────

export function TabVida() {
  const defaultHabits = [
    { id:"h1", name: "💧 Beber 2L água", d: [1,1,1,0,1,1,0] },
    { id:"h2", name: "🧘‍♀️ Meditar 10min", d: [1,1,0,1,1,1,0] },
    { id:"h3", name: "🚶‍♀️ Caminhar", d: [1,0,1,1,1,1,0] },
    { id:"h4", name: "📖 Ler 30min", d: [1,1,1,1,1,1,1] },
    { id:"h5", name: "💤 Dormir 23h", d: [0,1,0,1,1,0,0] },
    { id:"h6", name: "🌱 Sem rede social manhã", d: [1,1,1,0,1,1,0] },
  ];
  const [hStore, setHStore] = useLocalState("isa.vida.habits", defaultHabits);
  const today = new Date().getDay();

  const toggleCell = (rowI, colI) => {
    const copy = hStore.map((h, i) => i !== rowI ? h : { ...h, d: h.d.map((v, j) => j === colI ? (v ? 0 : 1) : v) });
    setHStore(copy);
  };
  const editHabit   = (id, name) => setHStore(hStore.map(h => h.id === id ? { ...h, name } : h));
  const removeHabit = (id)       => setHStore(hStore.filter(h => h.id !== id));
  const addHabit    = (name)     => setHStore([...hStore, { id:`h${Date.now()}`, name, d:[0,0,0,0,0,0,0] }]);

  const moodHistory = [4,3,4,4,2,3,4,5,4,4,3,4,5,4];
  const moodColors  = { 1:"var(--ink-mute)", 2:"var(--blue)", 3:"var(--mustard)", 4:"var(--olive)", 5:"var(--terracotta)" };

  const [journal, setJournal] = useLocalState("isa.vida.journal", "Hoje foi um dia bom. A reunião com o fornecedor fluiu, e ainda consegui terminar o capítulo antes de dormir. A Luna roeu o tapete de novo, mas tá tudo bem. ☕✨");

  const [hobbies, setHobbies] = useLocalState("isa.vida.hobbies", [
    { id:"hb1", name:"Cerâmica",               c:"var(--terracotta)", p:40, hand:"aula de quinta" },
    { id:"hb2", name:"Aquarela",               c:"var(--rose)",       p:60, hand:"diário visual" },
    { id:"hb3", name:"Cozinhar receitas novas",c:"var(--olive)",      p:75, hand:"experimentando italianas" },
    { id:"hb4", name:"Corrida",                c:"var(--blue)",       p:25, hand:"voltando devagar" },
  ]);
  const updateHobby = (id, patch) => setHobbies(hobbies.map(h => h.id === id ? { ...h, ...patch } : h));
  const removeHobby = (id)        => setHobbies(hobbies.filter(h => h.id !== id));
  const addHobby    = (name)      => {
    const colors = ["var(--terracotta)","var(--olive)","var(--blue)","var(--mustard)","var(--rose)","var(--plum)"];
    setHobbies([...hobbies, { id:`hb${Date.now()}`, name, c:colors[hobbies.length % colors.length], p:0, hand:"comecei agora" }]);
  };

  const [birthdays, setBirthdays] = useLocalState("isa.vida.birthdays", [
    { id:"b1", name:"Bia (irmã)",  d:"30/05", age:32, when:"em 4 dias",  c:"var(--rose)" },
    { id:"b2", name:"Mãe",        d:"12/06", age:61, when:"em 17 dias", c:"var(--terracotta)" },
    { id:"b3", name:"Lu (BFF)",   d:"22/06", age:31, when:"em 27 dias", c:"var(--mustard)" },
    { id:"b4", name:"André",      d:"08/07", age:33, when:"em 43 dias", c:"var(--olive)" },
    { id:"b5", name:"Tia Marcia", d:"19/08", age:58, when:"em 85 dias", c:"var(--blue)" },
  ]);
  const updateBday = (id, patch) => setBirthdays(birthdays.map(b => b.id === id ? { ...b, ...patch } : b));
  const removeBday = (id)        => setBirthdays(birthdays.filter(b => b.id !== id));
  const addBday    = (name)      => {
    const colors = ["var(--rose)","var(--terracotta)","var(--mustard)","var(--olive)","var(--blue)","var(--plum)"];
    setBirthdays([...birthdays, { id:`b${Date.now()}`, name, d:"--/--", age:"?", when:"—", c:colors[birthdays.length % colors.length] }]);
  };

  const [trips, setTrips] = useLocalState("isa.vida.trips", [
    { id:"t1", p:"Lisboa",               d:"Jul 2026", c:"var(--blue)",       st:"Reservada",   em:"38 dias" },
    { id:"t2", p:"Fernando de Noronha",  d:"Out 2026", c:"var(--olive)",      st:"Pesquisando", em:"150 dias" },
    { id:"t3", p:"Buenos Aires",         d:"Mar 2027", c:"var(--terracotta)", st:"Wishlist",    em:"—" },
  ]);
  const updateTrip = (id, patch) => setTrips(trips.map(t => t.id === id ? { ...t, ...patch } : t));
  const removeTrip = (id)        => setTrips(trips.filter(t => t.id !== id));
  const addTrip    = (p)         => {
    const colors = ["var(--blue)","var(--olive)","var(--terracotta)","var(--mustard)","var(--rose)"];
    setTrips([...trips, { id:`t${Date.now()}`, p, d:"data?", c:colors[trips.length % colors.length], st:"Wishlist", em:"—" }]);
  };

  return (
    <div>
      <div className="row between" style={{ marginBottom:18, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 className="section-title">Vida <span className="hand">em ordem</span></h1>
          <div className="section-sub">os pedacinhos que constroem o tipo de pessoa que você é</div>
        </div>
        <div className="row" style={{ gap:10 }}>
          <Chip color="rose">streak: 8 dias</Chip>
          <Chip color="olive">humor médio: alto</Chip>
        </div>
      </div>

      <Card className="mb-3">
        <CardHeader title="Hábitos da semana" hand="clique pra marcar" />
        <div style={{ overflowX:"auto" }}>
          <div className="habit-row" style={{ fontFamily:"var(--font-hand)", fontSize:18, color:"var(--ink-soft)" }}>
            <div></div>
            {DAYS_PT_SHORT.map((d, i) => (
              <div key={i} className="tcenter" style={{ color:i === today ? "var(--terracotta)" : "inherit" }}>
                {d}
              </div>
            ))}
          </div>
          {hStore.map((h, rowI) => (
            <div key={h.id} className="habit-row" style={{ gridTemplateColumns:"1.5fr repeat(7, 1fr) auto", gap:6 }}>
              <div className="h-name">
                <InlineEdit value={h.name} onChange={(v) => editHabit(h.id, v)} />
              </div>
              {h.d.map((v, colI) => (
                <div key={colI}
                  className={`habit-cell ${v ? "done" : ""} ${colI === today ? "today" : ""}`}
                  onClick={() => toggleCell(rowI, colI)}
                ></div>
              ))}
              <DeleteBtn onClick={() => removeHabit(h.id)} />
            </div>
          ))}
        </div>
        <AddRow onAdd={addHabit} placeholder="+ novo hábito (ex: 🌿 Yoga 20min)" buttonClass="olive" />
      </Card>

      <div className="grid cols-12 mb-3">
        <Card className="span-5">
          <CardHeader title="Humor — últimos 14 dias" hand="seu mapa emocional" />
          <div className="row" style={{ gap:4, alignItems:"flex-end", height:110, padding:"10px 0" }}>
            {moodHistory.map((m, i) => (
              <div key={i} style={{
                flex:1, height:`${m * 20}%`,
                background:moodColors[m],
                border:"1.5px solid var(--ink)",
                borderRadius:"4px 4px 0 0",
                minHeight:20,
              }}></div>
            ))}
          </div>
          <div className="row between" style={{ fontFamily:"var(--font-hand)", fontSize:16, color:"var(--ink-soft)" }}>
            <span>13/mai</span><span>hoje</span>
          </div>
          <div className="hand mt-2">↑ tendência de alta · sua melhor sequência desde fevereiro</div>
        </Card>

        <Card className="span-7" tilt="r">
          <CardHeader title="Diário de hoje" hand={new Date().toLocaleDateString("pt-BR")} />
          <textarea
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            placeholder="Como foi o seu dia?"
            style={{
              width:"100%", minHeight:130,
              border:"2px dashed var(--ink)", borderRadius:12,
              padding:14, background:"var(--paper)",
              fontFamily:"var(--font-hand)", fontSize:20, lineHeight:1.4,
              color:"var(--ink-soft)", resize:"vertical",
            }}
          />
          <div className="row between mt-2">
            <div className="hand">{journal.length} caracteres</div>
            <button className="btn sm olive">salvar entrada</button>
          </div>
        </Card>
      </div>

      <div className="grid cols-3 mb-3">
        <Card>
          <CardHeader title="Hobbies & projetos" hand="o que te dá tesão" />
          <div className="col" style={{ gap:12 }}>
            {hobbies.map(h => (
              <div key={h.id}>
                <div className="row between mb-1" style={{ gap:6 }}>
                  <span className="bold" style={{ fontSize:14, flex:1 }}>
                    <InlineEdit value={h.name} onChange={(v) => updateHobby(h.id, { name:v })} />
                  </span>
                  <span className="hand" style={{ fontSize:15 }}>
                    <InlineEdit value={h.hand} onChange={(v) => updateHobby(h.id, { hand:v })} />
                  </span>
                  <DeleteBtn onClick={() => removeHobby(h.id)} />
                </div>
                <div className="row" style={{ gap:6 }}>
                  <input type="range" min={0} max={100} value={h.p}
                    onChange={(e) => updateHobby(h.id, { p:+e.target.value })}
                    style={{ flex:1, accentColor:h.c }} />
                  <span className="small muted" style={{ minWidth:32, textAlign:"right" }}>{h.p}%</span>
                </div>
              </div>
            ))}
          </div>
          <AddRow onAdd={addHobby} placeholder="+ novo hobby..." buttonClass="terracotta" />
        </Card>

        <Card style={{ position:"relative" }}>
          <Sticker color="rose" rotate={-4} top={-12} right={-6}>🎂 {birthdays.length}</Sticker>
          <CardHeader title="Aniversários" hand="ninguém esquecido" />
          <div className="col" style={{ gap:6 }}>
            {birthdays.map((b) => (
              <div key={b.id} className="row" style={{ padding:"6px 0", borderBottom:"1px dashed rgba(42,31,23,0.18)", gap:8 }}>
                <div style={{
                  width:36, height:36, borderRadius:"50%",
                  background:b.c, border:"2px solid var(--ink)",
                  display:"grid", placeItems:"center",
                  fontFamily:"var(--font-display)", fontSize:14, color:"var(--paper)", flexShrink:0,
                }}>{(b.name || "?")[0]}</div>
                <div className="flex1">
                  <div className="bold" style={{ fontSize:13 }}>
                    <InlineEdit value={b.name} onChange={(v) => updateBday(b.id, { name:v })} />
                  </div>
                  <div className="hand" style={{ fontSize:15 }}>
                    <InlineEdit value={b.d} onChange={(v) => updateBday(b.id, { d:v })} placeholder="dd/mm" />
                    {" · faz "}
                    <InlineEdit value={String(b.age)} onChange={(v) => updateBday(b.id, { age:v })} placeholder="?" />
                  </div>
                </div>
                <DeleteBtn onClick={() => removeBday(b.id)} />
              </div>
            ))}
          </div>
          <AddRow onAdd={addBday} placeholder="+ aniversariante..." buttonClass="terracotta" />
        </Card>

        <Card>
          <CardHeader title="Viagens" hand="próximos destinos" />
          <div className="col" style={{ gap:10 }}>
            {trips.map((t) => (
              <div key={t.id} style={{
                background:"var(--paper)", border:"2px solid var(--ink)",
                borderRadius:12, padding:"10px 12px",
              }}>
                <div className="row between mb-1" style={{ gap:6 }}>
                  <div className="bold" style={{ fontSize:15, flex:1 }}>
                    ✈️ <InlineEdit value={t.p} onChange={(v) => updateTrip(t.id, { p:v })} />
                  </div>
                  <select value={t.st} onChange={(e) => updateTrip(t.id, { st:e.target.value })}
                    className="chip" style={{ background:t.c, color:"var(--paper)", fontSize:10, appearance:"none", cursor:"pointer", padding:"3px 8px" }}>
                    {["Wishlist","Pesquisando","Reservada","Confirmada","Concluída"].map(s =>
                      <option key={s} value={s} style={{ background:"var(--paper)", color:"var(--ink)" }}>{s}</option>
                    )}
                  </select>
                  <DeleteBtn onClick={() => removeTrip(t.id)} />
                </div>
                <div className="hand" style={{ fontSize:16 }}>
                  <InlineEdit value={t.d}  onChange={(v) => updateTrip(t.id, { d:v })}  placeholder="quando" />
                  {" · "}
                  <InlineEdit value={t.em} onChange={(v) => updateTrip(t.id, { em:v })} placeholder="faltam X dias" />
                </div>
              </div>
            ))}
          </div>
          <AddRow onAdd={addTrip} placeholder="+ destino..." buttonClass="olive" />
        </Card>
      </div>

      {/* ── Protocolo Cortisol ─────────────────────────── */}
      <div style={{ borderTop:"2.5px solid var(--ink)", marginTop:32, paddingTop:28, marginBottom:8 }}>
        <CortisolSection />
      </div>
    </div>
  );
}
