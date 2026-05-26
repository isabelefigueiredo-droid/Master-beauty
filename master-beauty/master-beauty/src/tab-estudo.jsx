import { useState } from 'react';
import {
  useLocalState, Card, CardHeader, Chip,
  InlineEdit, AddRow, DeleteBtn,
} from './shared.jsx';

function StarRating({ value = 0, onChange }) {
  return (
    <div className="row" style={{ gap: 2 }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} onClick={() => onChange(s === value ? 0 : s)}
          style={{ cursor:"pointer", fontSize:18, color: s <= value ? "var(--mustard)" : "var(--ink-mute)", userSelect:"none" }}>
          {s <= value ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

export function TabEstudo() {
  const [tasks, setTasks] = useLocalState("isa.estudo.tasks", [
    { id:"e1", label:"Capítulo 4 — A Hipótese do Amor", due:"hoje", done:false },
    { id:"e2", label:"Resumo: 'Atomic Habits' cap. 6", due:"qua", done:false },
    { id:"e3", label:"Curso de inglês — Unit 7", due:"qui", done:true },
    { id:"e4", label:"Anki — revisar 30 cards", due:"diário", done:false },
    { id:"e5", label:"Leitura: artigo HBR sobre B2B", due:"sex", done:false },
  ]);
  const toggle = (id) => setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const editLabel = (id, label) => setTasks(tasks.map(t => t.id === id ? { ...t, label } : t));
  const editDue = (id, due) => setTasks(tasks.map(t => t.id === id ? { ...t, due } : t));
  const removeTask = (id) => setTasks(tasks.filter(t => t.id !== id));
  const addTaskLabel = (label) => setTasks([...tasks, { id: `e${Date.now()}`, label, due: "sem prazo", done: false }]);

  const COLORS = ["var(--terracotta)","var(--olive)","var(--blue)","var(--mustard)","var(--rose-deep)","var(--plum)","var(--terracotta-deep)","var(--olive-deep)","var(--blue-deep)"];

  const [books, setBooks] = useLocalState("isa.estudo.books", {
    lendo: [
      { id:"bl1", t:"A Hipótese do Amor", a:"Ali Hazelwood", c:"var(--terracotta)", p:64 },
      { id:"bl2", t:"Beleza e Negócios", a:"Estée Lauder", c:"var(--blue)", p:30 },
    ],
    quero: [
      { id:"bq1", t:"Demon Copperhead", a:"Barbara Kingsolver", c:"var(--olive)" },
      { id:"bq2", t:"Tomorrow x3", a:"Gabrielle Zevin", c:"var(--mustard)" },
      { id:"bq3", t:"Klara e o Sol", a:"Ishiguro", c:"var(--plum)" },
      { id:"bq4", t:"Mulheres que correm com os lobos", a:"Estés", c:"var(--rose-deep)" },
    ],
    lidos: [
      { id:"bd1", t:"Lessons in Chemistry", a:"Garmus", c:"var(--olive-deep)", rating:5 },
      { id:"bd2", t:"O Conto da Aia", a:"Atwood", c:"var(--terracotta-deep)", rating:5 },
      { id:"bd3", t:"Babel", a:"R.F. Kuang", c:"var(--blue-deep)", rating:4 },
      { id:"bd4", t:"Pequena Coreografia do Adeus", a:"Lara", c:"var(--plum)", rating:4 },
      { id:"bd5", t:"Pachinko", a:"Min Jin Lee", c:"var(--mustard)", rating:5 },
    ],
  });
  const addBook = (shelf, title) => {
    if (!title) return;
    const id = `b${shelf[0]}${Date.now()}`;
    const c = COLORS[Math.floor(Math.random()*COLORS.length)];
    const entry = shelf === "lendo" ? { id, t:title, a:"—", c, p:0 } : shelf === "lidos" ? { id, t:title, a:"—", c, rating:0 } : { id, t:title, a:"—", c };
    setBooks({ ...books, [shelf]: [...books[shelf], entry] });
  };
  const updateBook = (shelf, id, patch) => {
    setBooks({ ...books, [shelf]: books[shelf].map(b => b.id === id ? { ...b, ...patch } : b) });
  };
  const removeBook = (shelf, id) => {
    setBooks({ ...books, [shelf]: books[shelf].filter(b => b.id !== id) });
  };
  const moveBook = (fromShelf, id, toShelf) => {
    const b = books[fromShelf].find(x => x.id === id);
    if (!b) return;
    const entry = toShelf === "lidos" ? { ...b, rating: b.rating ?? 0 } : b;
    setBooks({
      ...books,
      [fromShelf]: books[fromShelf].filter(x => x.id !== id),
      [toShelf]: [...books[toShelf], entry],
    });
  };

  const [subjects, setSubjects] = useLocalState("isa.estudo.subjects", [
    { id:"s1", name: "Inglês (B2→C1)", color: "var(--terracotta)", hours: 8, goal: 12 },
    { id:"s2", name: "Mercado de beleza", color: "var(--blue)", hours: 5, goal: 6 },
    { id:"s3", name: "Negociação B2B", color: "var(--olive)", hours: 3, goal: 4 },
    { id:"s4", name: "Leitura por prazer", color: "var(--rose-deep)", hours: 6, goal: 5 },
  ]);
  const updateSubject = (id, patch) => setSubjects(subjects.map(s => s.id === id ? { ...s, ...patch } : s));
  const removeSubject = (id) => setSubjects(subjects.filter(s => s.id !== id));
  const addSubject = (name) => {
    const c = COLORS[subjects.length % COLORS.length];
    setSubjects([...subjects, { id:`s${Date.now()}`, name, color:c, hours:0, goal:1 }]);
  };

  const [flashcards, setFlashcards] = useLocalState("isa.estudo.flashcards", [
    { id:"fc1", f: "EBITDA", v: "Earnings Before Interest, Taxes, Depreciation & Amortization" },
    { id:"fc2", f: "Sell-in vs Sell-out", v: "Sell-in: marca → varejo. Sell-out: varejo → consumidor." },
    { id:"fc3", f: "Take rate", v: "% que o marketplace cobra do vendedor sobre cada venda" },
    { id:"fc4", f: "GMV", v: "Gross Merchandise Value — volume total transacionado" },
  ]);
  const [flip, setFlip] = useState({});
  const updateFC = (id, patch) => setFlashcards(flashcards.map(c => c.id === id ? { ...c, ...patch } : c));
  const removeFC = (id) => setFlashcards(flashcards.filter(c => c.id !== id));
  const addFC = () => setFlashcards([...flashcards, { id:`fc${Date.now()}`, f:"novo conceito", v:"sua definição..." }]);

  return (
    <div>
      <div className="row between" style={{ marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="section-title">Estudo <span className="hand">em ordem</span></h1>
          <div className="section-sub">leitura, cursos e o que você está aprendendo</div>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <Chip color="olive">22h esta semana</Chip>
          <Chip color="terracotta">3 livros em junho</Chip>
        </div>
      </div>

      {/* Cronograma + Tarefas */}
      <div className="grid cols-12" style={{ marginBottom: 24 }}>
        <Card className="span-7">
          <CardHeader title="Cronograma" hand="horas / meta semanal" />
          <div>
            {subjects.map(s => (
              <div key={s.id} className="row" style={{ alignItems:"flex-start", gap:8, marginBottom:6 }}>
                <div style={{ flex:1 }}>
                  <div className="row between" style={{ marginBottom:4 }}>
                    <div style={{ fontWeight:500, fontSize:14 }}>
                      <InlineEdit value={s.name} onChange={(v) => updateSubject(s.id, { name: v })} />
                    </div>
                    <div style={{ fontFamily:"var(--font-mono)", fontSize:12 }}>
                      <input type="number" value={s.hours} min={0}
                        onChange={(e) => updateSubject(s.id, { hours: +e.target.value })}
                        style={{ width:38, border:"1.5px dashed var(--ink)", background:"var(--paper)", borderRadius:4, padding:"1px 4px", fontFamily:"var(--font-mono)", textAlign:"right" }} />
                      {" / "}
                      <input type="number" value={s.goal} min={1}
                        onChange={(e) => updateSubject(s.id, { goal: +e.target.value })}
                        style={{ width:38, border:"1.5px dashed var(--ink)", background:"var(--paper)", borderRadius:4, padding:"1px 4px", fontFamily:"var(--font-mono)", textAlign:"right" }} />
                      h
                    </div>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width:`${Math.min(100,(s.hours/s.goal)*100)}%`, background:s.color }}></div>
                  </div>
                </div>
                <DeleteBtn onClick={() => removeSubject(s.id)} />
              </div>
            ))}
          </div>
          <AddRow onAdd={addSubject} placeholder="+ nova matéria..." buttonClass="olive" />
        </Card>

        <Card className="span-5">
          <CardHeader title="Tarefas & prazos" hand={`${tasks.filter(t=>!t.done).length} abertas`} />
          <div style={{ maxHeight: 240, overflowY: "auto" }}>
            {tasks.map(t => (
              <div key={t.id} className={`task ${t.done ? "done" : ""}`} style={{ display:"flex", alignItems:"center", gap:8 }}>
                <input type="checkbox" className="check" checked={t.done} onChange={() => toggle(t.id)} />
                <span className="label" style={{ flex:1 }}>
                  <InlineEdit value={t.label} onChange={(v) => editLabel(t.id, v)} />
                </span>
                <span className="due">
                  <InlineEdit value={t.due} onChange={(v) => editDue(t.id, v)} placeholder="prazo" />
                </span>
                <DeleteBtn onClick={() => removeTask(t.id)} />
              </div>
            ))}
          </div>
          <AddRow onAdd={addTaskLabel} placeholder="+ nova tarefa..." buttonClass="terracotta" />
        </Card>
      </div>

      {/* Livros */}
      <div className="grid cols-3" style={{ marginBottom: 24 }}>
        {/* Lendo agora */}
        <Card>
          <CardHeader title="Lendo agora" hand={`${books.lendo.length} livros`} />
          <div className="col" style={{ gap: 12 }}>
            {books.lendo.map(b => (
              <div key={b.id} className="row" style={{ alignItems:"flex-start" }}>
                <div style={{ width: 34, height: 52, background: b.c, border: "2px solid var(--ink)", borderRadius: "3px 3px 0 0", boxShadow: "2px 2px 0 var(--ink)", flexShrink:0 }}></div>
                <div className="flex1">
                  <div className="bold" style={{ fontSize: 14 }}>
                    <InlineEdit value={b.t} onChange={(v) => updateBook("lendo", b.id, { t:v })} />
                  </div>
                  <div className="hand" style={{ fontSize: 16 }}>
                    <InlineEdit value={b.a} onChange={(v) => updateBook("lendo", b.id, { a:v })} placeholder="autor" />
                  </div>
                  <div className="row" style={{ gap:6, marginTop:4 }}>
                    <input type="range" min={0} max={100} value={b.p}
                      onChange={(e) => updateBook("lendo", b.id, { p: +e.target.value })}
                      style={{ flex:1, accentColor: b.c }} />
                    <span className="small muted" style={{ minWidth:36, textAlign:"right" }}>{b.p}%</span>
                  </div>
                  <div className="row" style={{ gap:4, marginTop:4 }}>
                    <button className="btn ghost sm" onClick={() => moveBook("lendo", b.id, "lidos")}>✓ terminei</button>
                    <DeleteBtn onClick={() => removeBook("lendo", b.id)} />
                  </div>
                </div>
              </div>
            ))}
            <AddRow onAdd={(t) => addBook("lendo", t)} placeholder="+ comecei a ler..." buttonClass="terracotta" />
          </div>
        </Card>

        {/* Quero ler */}
        <Card>
          <CardHeader title="Quero ler" hand={`${books.quero.length} na fila`} />
          <div className="shelf">
            {books.quero.map(b => (
              <div key={b.id} className="book" style={{ background: b.c, position:"relative" }}
                title={`${b.t} — clique pra começar`}
                onClick={() => moveBook("quero", b.id, "lendo")}>
                {b.t}
              </div>
            ))}
          </div>
          <div className="col" style={{ gap:4, marginTop:10 }}>
            {books.quero.map(b => (
              <div key={b.id} className="row" style={{ fontSize:12, padding:"3px 0", borderBottom:"1px dashed rgba(42,31,23,0.18)" }}>
                <span className="flex1"><InlineEdit value={b.t} onChange={(v) => updateBook("quero", b.id, { t:v })} /></span>
                <DeleteBtn onClick={() => removeBook("quero", b.id)} />
              </div>
            ))}
          </div>
          <AddRow onAdd={(t) => addBook("quero", t)} placeholder="+ quero ler..." buttonClass="ghost" />
        </Card>

        {/* Já lidos — com estrelas */}
        <Card>
          <CardHeader title="Já lidos" hand={`${books.lidos.length} este ano`} />
          <div className="shelf">
            {books.lidos.map(b => (
              <div key={b.id} className="book" style={{ background: b.c }} title={b.t}>{b.t}</div>
            ))}
          </div>
          <div className="col" style={{ gap:6, marginTop:10 }}>
            {books.lidos.map(b => (
              <div key={b.id} style={{ padding:"5px 0", borderBottom:"1px dashed rgba(42,31,23,0.18)" }}>
                <div className="row" style={{ fontSize:12, gap:6 }}>
                  <span className="flex1"><InlineEdit value={b.t} onChange={(v) => updateBook("lidos", b.id, { t:v })} /></span>
                  <DeleteBtn onClick={() => removeBook("lidos", b.id)} />
                </div>
                <StarRating value={b.rating ?? 0} onChange={v => updateBook("lidos", b.id, { rating: v })} />
              </div>
            ))}
          </div>
          <AddRow onAdd={(t) => addBook("lidos", t)} placeholder="+ terminei..." buttonClass="olive" />
          <div className="hand mt-2">meta anual: 24 livros · {books.lidos.length}/24</div>
        </Card>
      </div>

      {/* Flashcards */}
      <Card className="mb-3">
        <CardHeader title="Resumos & Flashcards" hand="clique pra revelar" action={<button className="btn sm olive" onClick={addFC}>+ novo card</button>} />
        <div className="grid cols-4" style={{ gap: 12 }}>
          {flashcards.map((c) => (
            <div key={c.id} style={{
              background: flip[c.id] ? "var(--mustard-soft)" : "var(--paper)",
              border: "2px solid var(--ink)",
              borderRadius: 14,
              padding: 16,
              minHeight: 120,
              position:"relative",
              boxShadow: "2px 2px 0 var(--ink)",
            }}>
              <div onClick={() => setFlip({ ...flip, [c.id]: !flip[c.id] })}
                style={{
                  cursor:"pointer", textAlign:"center", display:"grid", placeItems:"center",
                  minHeight: 70, fontFamily: flip[c.id] ? "var(--font-body)" : "var(--font-display)",
                  fontSize: flip[c.id] ? 13 : 22, lineHeight: 1.3,
                }}>
                {flip[c.id] ? c.v : c.f}
              </div>
              <div className="row between" style={{ marginTop:8, paddingTop:8, borderTop:"1px dashed rgba(42,31,23,0.18)" }}>
                <span className="small muted" style={{ fontSize:10 }}>
                  {flip[c.id] ? "verso" : "frente"} · clique pra virar
                </span>
                <div className="row" style={{ gap:4 }}>
                  <button className="btn ghost sm" style={{ fontSize:10, padding:"2px 6px" }}
                    onClick={() => {
                      const novo = prompt(flip[c.id] ? "editar verso:" : "editar frente:", flip[c.id] ? c.v : c.f);
                      if (novo !== null) updateFC(c.id, flip[c.id] ? { v: novo } : { f: novo });
                    }}>edit</button>
                  <DeleteBtn onClick={() => removeFC(c.id)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
