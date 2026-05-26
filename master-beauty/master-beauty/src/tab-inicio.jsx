import { useState } from 'react';
import {
  useLocalState, DAYS_PT, MONTHS_PT,
  Card, CardHeader, Sticker, Chip,
  DecoSun, DecoFlower, DecoSquiggle,
  InlineEdit, EditChip, AddChipBtn, AddRow, DeleteBtn,
} from './shared.jsx';

export function TabInicio({ goTo, tone }) {
  const now = new Date();
  const hour = now.getHours();
  const greet = hour < 6 ? "Boa madrugada" : hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const dia = DAYS_PT[now.getDay()];
  const data = `${now.getDate()} de ${MONTHS_PT[now.getMonth()]}`;

  const [chips, setChips] = useLocalState("isa.inicio.chips", [
    { id:"c1", text:"📍 São Paulo", color:"terracotta" },
    { id:"c2", text:"☕ bom dia", color:"mustard" },
    { id:"c3", text:`🌱 dia ${Math.floor((Date.now()/86400000) % 365)} do ano`, color:"olive" },
  ]);
  const updateChip = (id, next) => setChips(chips.map(c => c.id === id ? next : c));
  const deleteChip = (id) => setChips(chips.filter(c => c.id !== id));
  const addChip = () => {
    const colors = ["terracotta","mustard","olive","rose","blue","cream"];
    setChips([...chips, { id:`c${Date.now()}`, text:"novo chip", color: colors[chips.length % colors.length] }]);
  };

  const [todayTasks, setTodayTasks] = useLocalState("isa.inicio.todayTasks", [
    { id: "t1", label: "Revisar relatório Q1 — Mercado Livre", area: "Trabalho", done: false },
    { id: "t2", label: "Ler capítulo 4 de A Hipótese do Amor", area: "Estudo", done: false },
    { id: "t3", label: "Passear com os pets 18h", area: "Casa", done: true },
    { id: "t4", label: "Pagar conta de luz", area: "Casa", done: false },
  ]);
  const toggle = (id) => setTodayTasks(todayTasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const editTask = (id, label) => setTodayTasks(todayTasks.map(t => t.id === id ? { ...t, label } : t));
  const editTaskArea = (id, area) => setTodayTasks(todayTasks.map(t => t.id === id ? { ...t, area } : t));
  const deleteTask = (id) => setTodayTasks(todayTasks.filter(t => t.id !== id));
  const addTask = (label) => setTodayTasks([...todayTasks, { id: `t${Date.now()}`, label, area: "Vida", done: false }]);
  const doneCount = todayTasks.filter(t => t.done).length;

  const moods = ["😊","🙂","😐","😔","😤"];
  const [mood, setMood] = useLocalState("isa.inicio.mood", null);

  // Lê o livro atual do tab de estudo
  const [studyBooks] = useLocalState("isa.estudo.books", { lendo: [] });
  const currentBook = studyBooks.lendo?.[0];

  // Agenda editável
  const [agenda, setAgenda] = useLocalState("isa.inicio.agenda", [
    { d:"SEG", date:"26", items:[{id:"a1",t:"10h Daily comercial",c:"blue"},{id:"a2",t:"15h Café com fornecedor",c:"mustard"}] },
    { d:"TER", date:"27", items:[{id:"a3",t:"14h Apresentar pipeline Q2",c:"terracotta"},{id:"a4",t:"19h Yoga",c:"rose"}] },
    { d:"QUA", date:"28", items:[{id:"a5",t:"Folga 🌿",c:"olive"}] },
    { d:"QUI", date:"29", items:[{id:"a6",t:"11h Onboarding novo lead",c:"blue"}] },
    { d:"SEX", date:"30", items:[{id:"a7",t:"Aniversário Bia 🎂",c:"rose"},{id:"a8",t:"20h Jantar com Lu",c:"mustard"}] },
  ]);
  const editAgendaItem = (dIdx, iIdx, text) => {
    const next = agenda.map((d, di) => di !== dIdx ? d : {
      ...d, items: d.items.map((it, ii) => ii !== iIdx ? it : { ...it, t: text })
    });
    setAgenda(next);
  };
  const removeAgendaItem = (dIdx, iIdx) => {
    const next = agenda.map((d, di) => di !== dIdx ? d : {
      ...d, items: d.items.filter((_, ii) => ii !== iIdx)
    });
    setAgenda(next);
  };
  const addAgendaItem = (dIdx) => {
    const next = agenda.map((d, di) => di !== dIdx ? d : {
      ...d, items: [...d.items, { id:`a${Date.now()}`, t:"novo evento", c:"mustard" }]
    });
    setAgenda(next);
  };

  const headlines = {
    "Profissional e direto": `${greet}.`,
    "Amigável": `${greet}, Isa ✿`,
    "Minimalista": `${greet}.`,
    "Bem-humorado": `${greet}, glória!`,
  };
  const sublines = {
    "Profissional e direto": `${dia}, ${data}.`,
    "Amigável": `${dia.toLowerCase()}, ${data.toLowerCase()}.`,
    "Minimalista": `${dia.toLowerCase()} · ${data.toLowerCase()}`,
    "Bem-humorado": `${dia.toLowerCase()}, ${data.toLowerCase()} ✦`,
  };

  return (
    <div>
      {/* Hero */}
      <div className="paint-banner" style={{ marginBottom: 28 }}>
        <DecoSun size={64} style={{ position: "absolute", right: 18, top: 14 }} />
        <DecoFlower size={44} style={{ position: "absolute", left: -8, bottom: -14, transform: "rotate(-15deg)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 className="section-title" style={{ fontSize: 48 }}>
            {headlines[tone] || `${greet}, Isa`}
          </h1>
          <div className="section-sub" style={{ marginBottom: 14 }}>
            {sublines[tone] || `${dia.toLowerCase()}, ${data.toLowerCase()}.`}
          </div>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            {chips.map(c => (
              <EditChip key={c.id} chip={c}
                onChange={(next) => updateChip(c.id, next)}
                onDelete={() => deleteChip(c.id)} />
            ))}
            <AddChipBtn onAdd={addChip} />
          </div>
        </div>
      </div>

      {/* Check-in + Tarefas */}
      <div className="grid cols-12" style={{ marginBottom: 24 }}>
        <Card className="span-5" tilt="l">
          <CardHeader title="Como você está?" hand="check-in rápido" />
          <div className="row" style={{ gap: 8, justifyContent: "space-between" }}>
            {moods.map((m, i) => (
              <button key={i} className={`mood-face ${mood === i ? "active" : ""}`} onClick={() => setMood(i)}>
                {m}
              </button>
            ))}
          </div>
          {mood !== null && (
            <div className="hand" style={{ marginTop: 10 }}>
              {["uhul, dia bom!","tudo certo","mais ou menos","dia difícil","tá tenso, respira"][mood]}
            </div>
          )}
        </Card>

        <Card className="span-7" tilt="r">
          <CardHeader title="Foco de hoje" hand={`${doneCount}/${todayTasks.length} concluídas`} />
          <div>
            {todayTasks.map(t => (
              <div key={t.id} className={`task ${t.done ? "done" : ""}`} style={{ display:"flex", alignItems:"center", gap:8 }}>
                <input type="checkbox" className="check" checked={t.done} onChange={() => toggle(t.id)} />
                <span className="label" style={{ flex:1 }}>
                  <InlineEdit value={t.label} onChange={(v) => editTask(t.id, v)} />
                </span>
                <select value={t.area} onChange={(e) => editTaskArea(t.id, e.target.value)}
                  className="chip" style={{ fontSize: 11, padding:"2px 6px", cursor:"pointer", appearance:"none" }}>
                  {["Início","Estudo","Trabalho","Vida","Casa"].map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <DeleteBtn onClick={() => deleteTask(t.id)} />
              </div>
            ))}
          </div>
          <AddRow onAdd={addTask} placeholder="+ tarefa do dia..." buttonClass="terracotta" />
        </Card>
      </div>

      {/* Overview */}
      <h2 className="section-title" style={{ fontSize: 28 }}>em resumo</h2>
      <DecoSquiggle width={100} color="var(--terracotta)" style={{ margin: "4px 0 16px" }} />

      <div className="grid cols-3" style={{ marginBottom: 24 }}>
        {/* Estudo: mostra livro atual */}
        <Card tilt="l" style={{ cursor: "pointer" }} onClick={() => goTo("estudo")}>
          <CardHeader title="Estudo" hand="lendo agora" />
          {currentBook ? (
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{currentBook.t}</div>
              <div className="hand" style={{ fontSize: 15, marginBottom: 10 }}>{currentBook.a}</div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width:`${currentBook.p || 0}%`, background:"var(--terracotta)" }}></div>
              </div>
              <div className="hand" style={{ marginTop: 6, fontSize: 14 }}>{currentBook.p || 0}% concluído</div>
            </div>
          ) : (
            <div className="hand" style={{ color: "var(--ink-mute)" }}>nenhum livro em andamento</div>
          )}
        </Card>

        <Card style={{ cursor: "pointer" }} onClick={() => goTo("trabalho")}>
          <CardHeader title="Trabalho" hand="pipe ativo" />
          <div className="row" style={{ gap: 14, alignItems: "flex-end" }}>
            <div>
              <div className="bignum blue">12</div>
              <div className="hand">marcas no pipe</div>
            </div>
            <div>
              <div className="bignum terracotta">3</div>
              <div className="hand">em negociação</div>
            </div>
          </div>
          <div style={{ marginTop: 12 }} className="hand">→ próxima reunião 14h</div>
        </Card>

        <Card tilt="r" style={{ cursor: "pointer" }} onClick={() => goTo("vida")}>
          <Sticker color="rose" rotate={6} top={-10} left={-6}>self-care</Sticker>
          <CardHeader title="Vida" hand="hábitos & rotina" />
          <div className="row" style={{ gap: 14, alignItems: "flex-end" }}>
            <div>
              <div className="bignum">6/7</div>
              <div className="hand">hábitos esta semana</div>
            </div>
          </div>
          <div style={{ marginTop: 12 }} className="hand">→ aniversário da Bia em 4 dias</div>
        </Card>

        <Card style={{ cursor: "pointer" }} onClick={() => goTo("casa")}>
          <CardHeader title="Casa" hand="lar & pets" />
          <div className="row" style={{ gap: 14, alignItems: "flex-end" }}>
            <div>
              <div className="bignum olive">7</div>
              <div className="hand">itens p/ mercado</div>
            </div>
            <div>
              <div className="bignum">🐾</div>
              <div className="hand">pets ok</div>
            </div>
          </div>
        </Card>

        <Card tilt="r">
          <CardHeader title="Pílula do dia" hand="✦" />
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, lineHeight: 1.3, marginBottom: 8 }}>
            "Faça pequeno, faça hoje, faça de novo amanhã."
          </div>
          <div className="hand">— sua versão de seis meses atrás</div>
        </Card>
      </div>

      {/* Agenda — editável manualmente */}
      <div className="grid cols-12">
        <Card className="span-8">
          <CardHeader title="Agenda da semana" hand="manual · clique pra editar" />
          {agenda.map((d, dIdx) => (
            <div key={d.d} className="row" style={{ alignItems:"flex-start", padding:"8px 0", borderBottom:"1px dashed rgba(42,31,23,0.18)" }}>
              <div style={{ width:50, textAlign:"center", flexShrink:0 }}>
                <div className="hand" style={{ fontSize:16 }}>{d.d}</div>
                <div style={{ fontFamily:"var(--font-display)", fontSize:22, lineHeight:1 }}>{d.date}</div>
              </div>
              <div className="row" style={{ flexWrap:"wrap", gap:6, flex:1, alignItems:"center" }}>
                {d.items.map((it, iIdx) => (
                  <span key={it.id} className={`chip ${it.c}`} style={{ position:"relative", paddingRight:20 }}>
                    <InlineEdit value={it.t} onChange={v => editAgendaItem(dIdx, iIdx, v)} />
                    <button onClick={() => removeAgendaItem(dIdx, iIdx)}
                      style={{ position:"absolute", right:4, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"inherit", fontSize:10, padding:0 }}>×</button>
                  </span>
                ))}
                <button className="btn ghost sm" style={{ fontSize:10, padding:"2px 8px" }} onClick={() => addAgendaItem(dIdx)}>+</button>
              </div>
            </div>
          ))}
        </Card>

        <Card className="span-4" tilt="r">
          <CardHeader title="Lembretes" hand="próximos" />
          <div className="col" style={{ gap: 10 }}>
            {[
              { bg:"var(--rose)", ico:"🎂", title:"Bia faz 32 anos", sub:"sexta · em 4 dias" },
              { bg:"var(--mustard-soft)", ico:"💡", title:"Conta de luz", sub:"vence hoje" },
              { bg:"var(--sky)", ico:"💊", title:"Vermífugo dos pets", sub:"sábado" },
              { bg:"var(--cream-deep)", ico:"✈️", title:"Viagem Lisboa", sub:"em 38 dias" },
            ].map((r, i) => (
              <div key={i} className="row" style={{ gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:"50%", border:"2px solid var(--ink)", background:r.bg, display:"grid", placeItems:"center", fontSize:16, flexShrink:0 }}>{r.ico}</div>
                <div className="flex1">
                  <div className="bold" style={{ fontSize:13 }}>{r.title}</div>
                  <div className="hand" style={{ fontSize:14 }}>{r.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
