import { useState } from 'react';
import {
  useLocalState, DAYS_PT, MONTHS_PT,
  Card, CardHeader, Sticker, BigStat, Chip,
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
    { id:"c4", text:"📚 lendo: A Hipótese do Amor", color:"rose" },
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
    { id: "t4", label: "Pagar conta de luz — vence hoje", area: "Finanças", done: false },
    { id: "t5", label: "20min de meditação", area: "Vida", done: true },
  ]);
  const toggle = (id) => setTodayTasks(todayTasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const editTask = (id, label) => setTodayTasks(todayTasks.map(t => t.id === id ? { ...t, label } : t));
  const editTaskArea = (id, area) => setTodayTasks(todayTasks.map(t => t.id === id ? { ...t, area } : t));
  const deleteTask = (id) => setTodayTasks(todayTasks.filter(t => t.id !== id));
  const addTask = (label) => setTodayTasks([...todayTasks, { id: `t${Date.now()}`, label, area: "Vida", done: false }]);
  const doneCount = todayTasks.filter(t => t.done).length;

  const moods = ["😊","🙂","😐","😔","😤"];
  const [mood, setMood] = useLocalState("isa.inicio.mood", null);

  const headlines = {
    "Profissional e direto": `${greet}.`,
    "Amigável": `${greet}, Isa ✿`,
    "Minimalista": `${greet}.`,
    "Bem-humorado": `${greet}, glória!`,
  };
  const subline = {
    "Profissional e direto": `${dia}, ${data}.`,
    "Amigável": `Hoje é ${dia.toLowerCase()}, ${data.toLowerCase()}. Bora?`,
    "Minimalista": `${dia.toLowerCase()} · ${data.toLowerCase()}`,
    "Bem-humorado": `É ${dia.toLowerCase()}, ${data.toLowerCase()} — e a vida é uma colagem.`,
  };

  return (
    <div>
      <div className="paint-banner" style={{ marginBottom: 28 }}>
        <DecoSun size={70} style={{ position: "absolute", right: 18, top: 16 }} />
        <DecoFlower size={50} style={{ position: "absolute", left: -10, bottom: -18, transform: "rotate(-15deg)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 className="section-title" style={{ fontSize: 56 }}>
            {headlines[tone] || `${greet}, Isa`}
          </h1>
          <div className="section-sub" style={{ marginBottom: 16 }}>
            {subline[tone] || `Hoje é ${dia.toLowerCase()}, ${data.toLowerCase()}.`}
          </div>
          <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
            {chips.map(c => (
              <EditChip key={c.id} chip={c}
                onChange={(next) => updateChip(c.id, next)}
                onDelete={() => deleteChip(c.id)} />
            ))}
            <AddChipBtn onAdd={addChip} />
          </div>
        </div>
      </div>

      <div className="grid cols-12" style={{ marginBottom: 28 }}>
        <Card className="span-5" tilt="l">
          <CardHeader title="Como você está hoje?" hand="check-in rápido" />
          <div className="row" style={{ gap: 8, justifyContent: "space-between" }}>
            {moods.map((m, i) => (
              <button key={i}
                className={`mood-face ${mood === i ? "active" : ""}`}
                onClick={() => setMood(i)}>
                {m}
              </button>
            ))}
          </div>
          {mood !== null && (
            <div className="hand" style={{ marginTop: 10 }}>
              {["uhul, dia bom!","tudo certo por aqui","mais ou menos","dia difícil","tá tenso, respira"][mood]}
            </div>
          )}
        </Card>

        <Card className="span-7" tilt="r">
          <CardHeader title="Foco de hoje" hand={`${doneCount}/${todayTasks.length} concluídas`} />
          <div>
            {todayTasks.map(t => (
              <div key={t.id} className={`task ${t.done ? "done" : ""}`} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <input type="checkbox" className="check" checked={t.done} onChange={() => toggle(t.id)} />
                <span className="label" style={{ flex:1 }}>
                  <InlineEdit value={t.label} onChange={(v) => editTask(t.id, v)} />
                </span>
                <select value={t.area} onChange={(e) => editTaskArea(t.id, e.target.value)}
                  className="chip" style={{ fontSize: 11, padding:"2px 6px", cursor:"pointer", appearance:"none" }}>
                  {["Início","Estudo","Trabalho","Vida","Casa","Finanças"].map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <DeleteBtn onClick={() => deleteTask(t.id)} />
              </div>
            ))}
          </div>
          <AddRow onAdd={addTask} placeholder="+ nova tarefa pra hoje..." buttonClass="terracotta" />
        </Card>
      </div>

      <h2 className="section-title" style={{ fontSize: 32 }}>
        Sua vida hoje <span className="hand">um olhar de relance</span>
      </h2>
      <DecoSquiggle width={120} color="var(--terracotta)" style={{ margin: "4px 0 18px" }} />

      <div className="grid cols-3" style={{ marginBottom: 28 }}>
        <Card tilt="l" style={{ position: "relative", cursor: "pointer" }} onClick={() => goTo("estudo")}>
          <Sticker color="terracotta" rotate={-8} top={-12} right={-6}>livros</Sticker>
          <CardHeader title="Estudo" hand="leitura & cursos" />
          <div className="row" style={{ gap: 18, alignItems: "flex-end" }}>
            <BigStat value="3" color="terracotta" hand="livros este mês" />
            <BigStat value="78%" color="olive" hand="meta de leitura" />
          </div>
          <div style={{ marginTop: 14 }} className="hand">→ próxima entrega: terça</div>
        </Card>

        <Card style={{ cursor: "pointer" }} onClick={() => goTo("trabalho")}>
          <CardHeader title="Trabalho" hand="hunter de novos negócios" />
          <div className="row" style={{ gap: 18, alignItems: "flex-end" }}>
            <BigStat value="12" color="blue" hand="leads ativos" />
            <BigStat value="4" hand="reuniões hoje" />
          </div>
          <div style={{ marginTop: 14 }} className="hand">→ próxima reunião 14h</div>
        </Card>

        <Card tilt="r" style={{ cursor: "pointer" }} onClick={() => goTo("vida")}>
          <Sticker color="rose" rotate={6} top={-10} left={-6}>self-care</Sticker>
          <CardHeader title="Vida" hand="hábitos & humor" />
          <div className="row" style={{ gap: 18, alignItems: "flex-end" }}>
            <BigStat value="6/7" hand="hábitos esta semana" />
            <BigStat value="🌿" hand="meditou hoje" />
          </div>
          <div style={{ marginTop: 14 }} className="hand">→ aniversário da Bia em 4 dias</div>
        </Card>

        <Card style={{ cursor: "pointer" }} onClick={() => goTo("casa")}>
          <CardHeader title="Casa" hand="lar com 3 patinhas" />
          <div className="row" style={{ gap: 18, alignItems: "flex-end" }}>
            <BigStat value="7" color="olive" hand="itens p/ mercado" />
            <BigStat value="🐾" hand="pets ok" />
          </div>
          <div style={{ marginTop: 14 }} className="hand">→ janta: nhoque de batata-doce</div>
        </Card>

        <Card tilt="l" style={{ cursor: "pointer" }} onClick={() => goTo("financas")}>
          <Sticker color="olive" rotate={-5} top={-10} right={-6}>+12% mês</Sticker>
          <CardHeader title="Finanças" hand="contas em ordem" />
          <div className="row" style={{ gap: 18, alignItems: "flex-end" }}>
            <BigStat value="68%" color="olive" hand="meta de poupança" />
            <BigStat value="R$3.420" hand="livre p/ gastar" />
          </div>
          <div style={{ marginTop: 14 }} className="hand">→ 1 conta vence hoje</div>
        </Card>

        <Card tilt="r">
          <CardHeader title="Pílula do dia" hand="✦" />
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, lineHeight: 1.2, marginBottom: 10 }}>
            "Faça pequeno, faça hoje, faça de novo amanhã."
          </div>
          <div className="hand">— sua versão de seis meses atrás</div>
        </Card>
      </div>

      <div className="grid cols-12">
        <Card className="span-7">
          <CardHeader title="Agenda da semana" hand="reuniões + compromissos" />
          {[
            { d:"SEG", date:"26", items:[{t:"10h Daily comercial", c:"blue"},{t:"15h Café com fornecedor", c:"mustard"}] },
            { d:"TER", date:"27", items:[{t:"14h Apresentar pipeline Q2", c:"terracotta"},{t:"19h Yoga", c:"rose"}] },
            { d:"QUA", date:"28", items:[{t:"Folga 🌿", c:"olive"}] },
            { d:"QUI", date:"29", items:[{t:"11h Onboarding novo lead", c:"blue"}] },
            { d:"SEX", date:"30", items:[{t:"Aniversário Bia 🎂", c:"rose"},{t:"20h Jantar com Lu", c:"mustard"}] },
          ].map(d => (
            <div key={d.d} className="row" style={{ alignItems:"flex-start", padding:"10px 0", borderBottom:"1px dashed rgba(42,31,23,0.18)" }}>
              <div style={{ width:54, textAlign:"center" }}>
                <div className="hand" style={{ fontSize:18 }}>{d.d}</div>
                <div style={{ fontFamily:"var(--font-display)", fontSize:24, lineHeight:1 }}>{d.date}</div>
              </div>
              <div className="row" style={{ flexWrap:"wrap", gap:6, flex:1 }}>
                {d.items.map((it, i) => <span key={i} className={`chip ${it.c}`}>{it.t}</span>)}
              </div>
            </div>
          ))}
        </Card>

        <Card className="span-5" tilt="r">
          <CardHeader title="Lembretes" hand="bday + recorrentes" />
          <div className="col" style={{ gap: 10 }}>
            {[
              { bg:"var(--rose)", ico:"🎂", title:"Bia faz 32 anos", sub:"sexta · em 4 dias" },
              { bg:"var(--mustard-soft)", ico:"💡", title:"Conta de luz", sub:"vence hoje · R$ 187,40" },
              { bg:"var(--sky)", ico:"💊", title:"Vermífugo dos pets", sub:"sábado · semestral" },
              { bg:"var(--cream-deep)", ico:"✈️", title:"Viagem Lisboa", sub:"em 38 dias · arrumar passaporte" },
            ].map((r, i) => (
              <div key={i} className="row">
                <div style={{ width:42, height:42, borderRadius:"50%", border:"2px solid var(--ink)", background:r.bg, display:"grid", placeItems:"center", fontSize:20 }}>{r.ico}</div>
                <div className="flex1">
                  <div className="bold">{r.title}</div>
                  <div className="hand">{r.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
