import { useState } from 'react';
import {
  useLocalState, Card, CardHeader, Chip,
  InlineEdit, AddRow, DeleteBtn,
} from './shared.jsx';

export function TabTrabalho() {
  const [board, setBoard] = useLocalState("isa.trabalho.board", {
    backlog: [
      { id: "k1", title: "Prospectar marca de skincare coreana", tag: "Hunting", c: "blue", due: "qua" },
      { id: "k2", title: "Análise de gap categoria perfumaria", tag: "Research", c: "olive", due: "sex" },
      { id: "k3", title: "Atualizar pipeline no CRM", tag: "Admin", c: "mustard", due: "—" },
    ],
    fazendo: [
      { id: "k4", title: "Negociar condições — fornecedor X", tag: "Negociação", c: "terracotta", due: "hoje" },
      { id: "k5", title: "Apresentação pipeline Q2", tag: "Deck", c: "blue", due: "ter" },
    ],
    feito: [
      { id: "k6", title: "Onboarding 2 marcas novas ✨", tag: "Win", c: "olive", due: "21/05" },
      { id: "k7", title: "Daily da semana", tag: "Rotina", c: "mustard", due: "—" },
    ],
  });
  const [newItem, setNewItem] = useState({ backlog: "", fazendo: "", feito: "" });
  const cols = [
    { k: "backlog", title: "A fazer", hand: "do backlog" },
    { k: "fazendo", title: "Fazendo", hand: "foco da semana" },
    { k: "feito", title: "Feito ✿", hand: "rega de regozijo" },
  ];

  const add = (k) => {
    if (!newItem[k].trim()) return;
    setBoard({ ...board, [k]: [...board[k], { id: `k${Date.now()}`, title: newItem[k], tag: "Nova", c: "mustard", due: "—" }] });
    setNewItem({ ...newItem, [k]: "" });
  };
  const move = (id, from, to) => {
    const card = board[from].find(c => c.id === id);
    if (!card) return;
    setBoard({
      ...board,
      [from]: board[from].filter(c => c.id !== id),
      [to]: [...board[to], card],
    });
  };
  const updateCard = (k, id, patch) => {
    setBoard({ ...board, [k]: board[k].map(c => c.id === id ? { ...c, ...patch } : c) });
  };
  const removeCard = (k, id) => {
    setBoard({ ...board, [k]: board[k].filter(c => c.id !== id) });
  };

  const [notes, setNotes] = useLocalState("isa.trabalho.notes", [
    { id: "n1", title: "1:1 com Letícia", date: "23/05", body: "Foco do trimestre: dobrar novas marcas em premium. Pedir budget pra evento Beauty Fair." },
    { id: "n2", title: "Call fornecedor Soko", date: "21/05", body: "Topam exclusividade por 90 dias. Pedem ajuda em search + posicionamento de página." },
    { id: "n3", title: "Brainstorm categoria masculina", date: "18/05", body: "Hipótese: barba+cuidados é gap. Conferir Embelleze, Bozzano, marcas indie." },
  ]);
  const [activeNote, setActiveNote] = useState(notes[0]?.id);
  const note = notes.find(n => n.id === activeNote);
  const updateNote = (id, patch) => setNotes(notes.map(n => n.id === id ? { ...n, ...patch } : n));
  const removeNote = (id) => {
    const next = notes.filter(n => n.id !== id);
    setNotes(next);
    if (id === activeNote) setActiveNote(next[0]?.id);
  };
  const addNote = () => {
    const id = `n${Date.now()}`;
    const today = new Date();
    const d = `${String(today.getDate()).padStart(2,"0")}/${String(today.getMonth()+1).padStart(2,"0")}`;
    setNotes([{ id, title: "nova reunião", date: d, body: "" }, ...notes]);
    setActiveNote(id);
  };

  const [okrs, setOkrs] = useLocalState("isa.trabalho.okrs", [
    { id:"o1", o: "Crescer GMV de beleza premium", krs: [
      { id:"k1", t: "Trazer 8 marcas novas no semestre", v: 5, m: 8 },
      { id:"k2", t: "Negociar take rate +1.5pp em top-20", v: 9, m: 20 },
    ]},
    { id:"o2", o: "Tornar-se referência no setor", krs: [
      { id:"k3", t: "1 palestra externa no semestre", v: 0, m: 1 },
      { id:"k4", t: "Curso de Negociação Avançada", v: 60, m: 100 },
    ]},
  ]);
  const updateOkr = (oid, patch) => setOkrs(okrs.map(o => o.id === oid ? { ...o, ...patch } : o));
  const updateKr = (oid, kid, patch) => setOkrs(okrs.map(o => o.id === oid ? { ...o, krs: o.krs.map(k => k.id === kid ? { ...k, ...patch } : k) } : o));
  const removeKr = (oid, kid) => setOkrs(okrs.map(o => o.id === oid ? { ...o, krs: o.krs.filter(k => k.id !== kid) } : o));
  const addKr = (oid) => setOkrs(okrs.map(o => o.id === oid ? { ...o, krs: [...o.krs, { id:`k${Date.now()}`, t:"novo resultado-chave", v:0, m:1 }] } : o));
  const removeObjective = (oid) => setOkrs(okrs.filter(o => o.id !== oid));
  const addObjective = (text) => setOkrs([...okrs, { id:`o${Date.now()}`, o:text, krs:[] }]);

  return (
    <div>
      <div className="row between" style={{ marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="section-title">Trabalho <span className="hand">em ordem</span></h1>
          <div className="section-sub">hunter de novos negócios · beleza · mercado livre</div>
        </div>
        <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
          <Chip color="blue">12 leads ativos</Chip>
          <Chip color="terracotta">3 em negociação</Chip>
          <Chip color="olive">5 fechados em 2026</Chip>
        </div>
      </div>

      <Card className="mb-3">
        <CardHeader title="Quadro da semana" hand="arraste mentalmente, clique pra mover" />
        <div className="kanban">
          {cols.map(col => (
            <div key={col.k} className="kanban-col">
              <h4>
                <span>{col.title} <span className="hand">· {board[col.k].length}</span></span>
                <span className="hand">{col.hand}</span>
              </h4>
              {board[col.k].map(c => (
                <div key={c.id} className="kanban-card">
                  <div className="row between mb-1">
                    <select value={c.tag} onChange={(e) => updateCard(col.k, c.id, { tag: e.target.value })}
                      className={`chip ${c.c}`} style={{ fontSize:10, padding:"2px 6px", appearance:"none", cursor:"pointer", border:"1.5px solid var(--ink)" }}>
                      {["Hunting","Research","Admin","Negociação","Deck","Rotina","Win","Nova"].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <span className="meta">
                      <InlineEdit value={c.due} onChange={(v) => updateCard(col.k, c.id, { due: v })} placeholder="—" />
                    </span>
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.35 }}>
                    <InlineEdit value={c.title} onChange={(v) => updateCard(col.k, c.id, { title: v })} multiline />
                  </div>
                  <div className="row between" style={{ gap: 4, marginTop: 8 }}>
                    <div className="row" style={{ gap:4 }}>
                      {col.k !== "backlog" && <button className="btn ghost sm" style={{ padding:"3px 7px" }} onClick={() => move(c.id, col.k, col.k === "fazendo" ? "backlog" : "fazendo")}>←</button>}
                      {col.k !== "feito" && <button className="btn ghost sm" style={{ padding:"3px 7px" }} onClick={() => move(c.id, col.k, col.k === "backlog" ? "fazendo" : "feito")}>→</button>}
                    </div>
                    <DeleteBtn onClick={() => removeCard(col.k, c.id)} />
                  </div>
                </div>
              ))}
              <div className="row" style={{ gap: 4, marginTop: 6 }}>
                <input className="input" style={{ fontSize: 12, padding: "5px 8px" }}
                  placeholder="+ adicionar"
                  value={newItem[col.k]}
                  onChange={e => setNewItem({ ...newItem, [col.k]: e.target.value })}
                  onKeyDown={e => e.key === "Enter" && add(col.k)} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid cols-12">
        <Card className="span-7">
          <CardHeader title="Anotações de reunião" hand={`${notes.length} notas`} action={<button className="btn sm" onClick={addNote}>+ nova</button>} />
          <div className="row" style={{ alignItems: "stretch", gap: 14 }}>
            <div style={{ width: 180, borderRight: "1px dashed var(--ink)", paddingRight: 12 }}>
              {notes.map(n => (
                <div key={n.id} className="row" style={{ alignItems:"flex-start", gap:6 }}>
                  <div onClick={() => setActiveNote(n.id)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      background: n.id === activeNote ? "var(--mustard-soft)" : "transparent",
                      cursor: "pointer",
                      marginBottom: 4,
                      flex:1,
                    }}>
                    <div className="bold" style={{ fontSize: 13 }}>{n.title}</div>
                    <div className="hand" style={{ fontSize: 15 }}>{n.date}</div>
                  </div>
                  <DeleteBtn onClick={() => removeNote(n.id)} />
                </div>
              ))}
            </div>
            <div className="flex1">
              {note && (
                <>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 4 }}>
                    <InlineEdit value={note.title} onChange={(v) => updateNote(note.id, { title: v })} />
                  </div>
                  <div className="hand mb-2">
                    <InlineEdit value={note.date} onChange={(v) => updateNote(note.id, { date: v })} placeholder="dd/mm" />
                  </div>
                  <textarea value={note.body}
                    onChange={(e) => updateNote(note.id, { body: e.target.value })}
                    placeholder="escreva suas anotações..."
                    style={{
                      width:"100%", minHeight:140,
                      border:"1.5px dashed var(--ink)", background:"var(--paper)",
                      borderRadius:10, padding:12, fontFamily:"var(--font-body)",
                      fontSize:14, lineHeight:1.55, color:"var(--ink-soft)", resize:"vertical",
                    }} />
                </>
              )}
            </div>
          </div>
        </Card>

        <Card className="span-5">
          <CardHeader title="Carreira & OKRs" hand="2º semestre 2026" action={<button className="btn sm olive" onClick={() => addObjective("novo objetivo")}>+ objetivo</button>} />
          <div className="col" style={{ gap: 16 }}>
            {okrs.map((o) => (
              <div key={o.id}>
                <div className="row between mb-1">
                  <div className="bold" style={{ fontSize: 14, flex:1 }}>
                    <InlineEdit value={o.o} onChange={(v) => updateOkr(o.id, { o: v })} />
                  </div>
                  <DeleteBtn onClick={() => removeObjective(o.id)} />
                </div>
                {o.krs.map((kr, j) => (
                  <div key={kr.id} className="row" style={{ alignItems:"flex-start", gap:6, marginBottom:6 }}>
                    <div style={{ flex:1 }}>
                      <div className="row between" style={{ marginBottom:3 }}>
                        <div style={{ fontSize:13 }}>
                          <InlineEdit value={kr.t} onChange={(v) => updateKr(o.id, kr.id, { t: v })} />
                        </div>
                        <div style={{ fontFamily:"var(--font-mono)", fontSize:11 }}>
                          <input type="number" value={kr.v} min={0}
                            onChange={(e) => updateKr(o.id, kr.id, { v: +e.target.value })}
                            style={{ width:42, border:"1.5px dashed var(--ink)", background:"var(--paper)", borderRadius:4, padding:"1px 4px", fontFamily:"var(--font-mono)", textAlign:"right" }} />
                          {" / "}
                          <input type="number" value={kr.m} min={1}
                            onChange={(e) => updateKr(o.id, kr.id, { m: +e.target.value })}
                            style={{ width:42, border:"1.5px dashed var(--ink)", background:"var(--paper)", borderRadius:4, padding:"1px 4px", fontFamily:"var(--font-mono)", textAlign:"right" }} />
                        </div>
                      </div>
                      <div className="bar-track" style={{ height:10 }}>
                        <div className="bar-fill" style={{ width:`${Math.min(100,(kr.v/kr.m)*100)}%`, background:["var(--terracotta)","var(--olive)","var(--blue)","var(--mustard)"][j%4] }}></div>
                      </div>
                    </div>
                    <DeleteBtn onClick={() => removeKr(o.id, kr.id)} />
                  </div>
                ))}
                <button className="btn ghost sm" onClick={() => addKr(o.id)} style={{ fontSize:11 }}>+ resultado-chave</button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
