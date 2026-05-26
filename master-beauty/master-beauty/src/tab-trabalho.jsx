import { useState } from 'react';
import {
  useLocalState, Card, CardHeader, Chip, formatBRL,
  InlineEdit, AddRow, DeleteBtn,
} from './shared.jsx';

const PIPE_STAGES = ["Not initiated", "Negotiation", "Setup", "3P Go Live", "Onboarded"];
const STAGE_COLORS = {
  "Not initiated": "var(--ink-mute)",
  "Negotiation":   "var(--mustard)",
  "Setup":         "var(--blue)",
  "3P Go Live":    "var(--olive)",
  "Onboarded":     "var(--terracotta)",
};
const STAGE_BG = {
  "Not initiated": "rgba(42,31,23,0.08)",
  "Negotiation":   "var(--mustard-soft)",
  "Setup":         "var(--sky)",
  "3P Go Live":    "#e8f0d8",
  "Onboarded":     "#fde8e5",
};
const PRIORITY_CHIP = { Alta: "terracotta", Média: "mustard", Baixa: "olive" };

const defaultPipeline = [
  { id:"pipe1", name:"Skincare Coreana X", stage:"Negotiation", sellerOrBrand:"Brand", priority:"Alta", createdAt:"01/05", updatedAt:"20/05", segment:"Skincare", gmvMonth:50000, gmvYear:600000, tiktok:false, shoppee:true, meeting:true, meetingDate:"26/05", notes:"Proposta enviada" },
  { id:"pipe2", name:"Perfumaria Y", stage:"Not initiated", sellerOrBrand:"Seller", priority:"Média", createdAt:"10/05", updatedAt:"10/05", segment:"Perfumaria", gmvMonth:30000, gmvYear:360000, tiktok:false, shoppee:false, meeting:false, meetingDate:"", notes:"" },
  { id:"pipe3", name:"Marca Z Premium", stage:"Setup", sellerOrBrand:"Brand", priority:"Alta", createdAt:"15/04", updatedAt:"22/05", segment:"Maquiagem", gmvMonth:80000, gmvYear:960000, tiktok:true, shoppee:true, meeting:true, meetingDate:"28/05", notes:"Setup em andamento" },
  { id:"pipe4", name:"BeautyBrand W", stage:"3P Go Live", sellerOrBrand:"Brand", priority:"Alta", createdAt:"01/04", updatedAt:"25/05", segment:"Haircare", gmvMonth:45000, gmvYear:540000, tiktok:true, shoppee:false, meeting:false, meetingDate:"", notes:"Go live semana que vem" },
  { id:"pipe5", name:"Cosméticos V", stage:"Onboarded", sellerOrBrand:"Seller", priority:"Baixa", createdAt:"01/03", updatedAt:"15/05", segment:"Skincare", gmvMonth:20000, gmvYear:240000, tiktok:false, shoppee:true, meeting:false, meetingDate:"", notes:"Onboarding concluído ✓" },
];

function BrandCard({ brand, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{
      background: "var(--paper)",
      border: "2px solid var(--ink)",
      borderRadius: 12,
      padding: "10px 12px",
      marginBottom: 8,
    }}>
      {/* Header clicável */}
      <div className="row between" style={{ cursor:"pointer" }} onClick={() => setExpanded(e => !e)}>
        <div style={{ fontWeight:600, fontSize:13, flex:1 }}>
          <InlineEdit value={brand.name} onChange={v => onUpdate({ name: v })} />
        </div>
        <div className="row" style={{ gap:4 }}>
          <span className={`chip ${PRIORITY_CHIP[brand.priority] || ""}`} style={{ fontSize:10, padding:"2px 6px" }}>
            {brand.priority}
          </span>
          <span style={{ color:"var(--ink-mute)", fontSize:12 }}>{expanded ? "▲" : "▼"}</span>
        </div>
      </div>
      {!expanded && (
        <div style={{ fontSize:11, color:"var(--ink-soft)", marginTop:4 }}>
          {brand.segment} · {formatBRL(brand.gmvMonth)}/mês
        </div>
      )}
      {expanded && (
        <div style={{ marginTop:10, borderTop:"1px dashed rgba(42,31,23,0.2)", paddingTop:10 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, fontSize:12 }}>
            <div>
              <div className="hand" style={{ fontSize:13 }}>Seller ou Brand</div>
              <select value={brand.sellerOrBrand} onChange={e => onUpdate({ sellerOrBrand: e.target.value })}
                className="input" style={{ fontSize:12, padding:"3px 6px", width:"100%" }}>
                <option>Seller</option><option>Brand</option>
              </select>
            </div>
            <div>
              <div className="hand" style={{ fontSize:13 }}>Prioridade</div>
              <select value={brand.priority} onChange={e => onUpdate({ priority: e.target.value })}
                className="input" style={{ fontSize:12, padding:"3px 6px", width:"100%" }}>
                <option>Alta</option><option>Média</option><option>Baixa</option>
              </select>
            </div>
            <div>
              <div className="hand" style={{ fontSize:13 }}>Segmento</div>
              <InlineEdit value={brand.segment} onChange={v => onUpdate({ segment: v })} placeholder="ex: Skincare" />
            </div>
            <div>
              <div className="hand" style={{ fontSize:13 }}>Criado em</div>
              <InlineEdit value={brand.createdAt} onChange={v => onUpdate({ createdAt: v })} placeholder="dd/mm" />
            </div>
            <div>
              <div className="hand" style={{ fontSize:13 }}>GMV mês (R$)</div>
              <input type="number" value={brand.gmvMonth} onChange={e => onUpdate({ gmvMonth: +e.target.value })}
                style={{ width:"100%", border:"1.5px dashed var(--ink)", background:"var(--paper)", borderRadius:4, padding:"2px 6px", fontFamily:"var(--font-mono)", fontSize:12 }} />
            </div>
            <div>
              <div className="hand" style={{ fontSize:13 }}>GMV ano (R$)</div>
              <input type="number" value={brand.gmvYear} onChange={e => onUpdate({ gmvYear: +e.target.value })}
                style={{ width:"100%", border:"1.5px dashed var(--ink)", background:"var(--paper)", borderRadius:4, padding:"2px 6px", fontFamily:"var(--font-mono)", fontSize:12 }} />
            </div>
          </div>
          <div style={{ marginTop:8, fontSize:12 }}>
            <div className="row" style={{ gap:16, flexWrap:"wrap" }}>
              <label className="row" style={{ gap:4, cursor:"pointer" }}>
                <input type="checkbox" checked={!!brand.tiktok} onChange={e => onUpdate({ tiktok: e.target.checked })} />
                TikTok Shop
              </label>
              <label className="row" style={{ gap:4, cursor:"pointer" }}>
                <input type="checkbox" checked={!!brand.shoppee} onChange={e => onUpdate({ shoppee: e.target.checked })} />
                Shoppee
              </label>
              <label className="row" style={{ gap:4, cursor:"pointer" }}>
                <input type="checkbox" checked={!!brand.meeting} onChange={e => onUpdate({ meeting: e.target.checked })} />
                Reunião agendada
              </label>
              {brand.meeting && (
                <span>
                  <InlineEdit value={brand.meetingDate} onChange={v => onUpdate({ meetingDate: v })} placeholder="dd/mm" />
                </span>
              )}
            </div>
          </div>
          <div style={{ marginTop:8 }}>
            <div className="hand" style={{ fontSize:13, marginBottom:4 }}>Observações</div>
            <textarea value={brand.notes} onChange={e => onUpdate({ notes: e.target.value })}
              placeholder="notas..."
              style={{ width:"100%", border:"1.5px dashed var(--ink)", background:"var(--paper)", borderRadius:8, padding:"6px 10px", font:"inherit", fontSize:12, resize:"vertical", minHeight:48 }} />
          </div>
          <div style={{ marginTop:8 }}>
            <DeleteBtn onClick={onDelete} title="remover marca" />
          </div>
        </div>
      )}
    </div>
  );
}

export function TabTrabalho() {
  // Pipeline
  const [pipeline, setPipeline] = useLocalState("isa.trabalho.pipeline", defaultPipeline);
  const updateBrand = (id, patch) => setPipeline(pipeline.map(b => b.id === id ? { ...b, ...patch, updatedAt: new Date().toLocaleDateString("pt-BR","dd/MM").split("/").slice(0,2).join("/") } : b));
  const removeBrand = (id) => setPipeline(pipeline.filter(b => b.id !== id));
  const moveBrand = (id, stage) => updateBrand(id, { stage });
  const addBrand = (name, stage) => setPipeline([...pipeline, {
    id:`pipe${Date.now()}`, name, stage, sellerOrBrand:"Brand", priority:"Média",
    createdAt: `${new Date().getDate()}/${new Date().getMonth()+1}`,
    updatedAt: `${new Date().getDate()}/${new Date().getMonth()+1}`,
    segment:"", gmvMonth:0, gmvYear:0, tiktok:false, shoppee:false, meeting:false, meetingDate:"", notes:"",
  }]);

  // Vista de tabela
  const [tableView, setTableView] = useState(false);

  // Acionáveis / tarefas de hunting
  const [actionables, setActionables] = useLocalState("isa.trabalho.actionables", [
    { id:"ac1", label:"Enviar proposta para Skincare X", ctx:"Pipe", due:"hoje", done:false },
    { id:"ac2", label:"Follow-up Marca Z — setup técnico", ctx:"Pipe", due:"qua", done:false },
    { id:"ac3", label:"Preparar deck Beauty Fair", ctx:"Projeto", due:"sex", done:false },
    { id:"ac4", label:"Mapear concorrentes categoria masculina", ctx:"Research", due:"sem prazo", done:true },
  ]);
  const toggleAc = (id) => setActionables(actionables.map(a => a.id === id ? { ...a, done: !a.done } : a));
  const editAc = (id, patch) => setActionables(actionables.map(a => a.id === id ? { ...a, ...patch } : a));
  const removeAc = (id) => setActionables(actionables.filter(a => a.id !== id));
  const addAc = (label) => setActionables([...actionables, { id:`ac${Date.now()}`, label, ctx:"Pipe", due:"sem prazo", done:false }]);

  // Anotações de reunião
  const [notes, setNotes] = useLocalState("isa.trabalho.notes", [
    { id:"n1", title:"1:1 com Letícia", date:"23/05", body:"Foco do trimestre: dobrar novas marcas em premium." },
    { id:"n2", title:"Call fornecedor Soko", date:"21/05", body:"Topam exclusividade por 90 dias." },
    { id:"n3", title:"Brainstorm categoria masculina", date:"18/05", body:"Hipótese: barba+cuidados é gap." },
  ]);
  const [activeNote, setActiveNote] = useState(notes[0]?.id);
  const note = notes.find(n => n.id === activeNote);
  const updateNote = (id, patch) => setNotes(notes.map(n => n.id === id ? { ...n, ...patch } : n));
  const removeNote = (id) => { const next = notes.filter(n => n.id !== id); setNotes(next); if (id === activeNote) setActiveNote(next[0]?.id); };
  const addNote = () => {
    const id = `n${Date.now()}`;
    const d = new Date(); const date = `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`;
    setNotes([{ id, title:"nova reunião", date, body:"" }, ...notes]);
    setActiveNote(id);
  };

  // OKRs
  const [okrs, setOkrs] = useLocalState("isa.trabalho.okrs", [
    { id:"o1", o:"Crescer GMV de beleza premium", krs:[
      { id:"k1", t:"Trazer 8 marcas novas no semestre", v:5, m:8 },
      { id:"k2", t:"Negociar take rate +1.5pp em top-20", v:9, m:20 },
    ]},
    { id:"o2", o:"Tornar-se referência no setor", krs:[
      { id:"k3", t:"1 palestra externa no semestre", v:0, m:1 },
      { id:"k4", t:"Curso de Negociação Avançada", v:60, m:100 },
    ]},
  ]);
  const updateOkr = (oid, patch) => setOkrs(okrs.map(o => o.id === oid ? { ...o, ...patch } : o));
  const updateKr = (oid, kid, patch) => setOkrs(okrs.map(o => o.id === oid ? { ...o, krs:o.krs.map(k => k.id === kid ? { ...k, ...patch } : k) } : o));
  const removeKr = (oid, kid) => setOkrs(okrs.map(o => o.id === oid ? { ...o, krs:o.krs.filter(k => k.id !== kid) } : o));
  const addKr = (oid) => setOkrs(okrs.map(o => o.id === oid ? { ...o, krs:[...o.krs, { id:`k${Date.now()}`, t:"novo resultado-chave", v:0, m:1 }] } : o));
  const removeObjective = (oid) => setOkrs(okrs.filter(o => o.id !== oid));
  const addObjective = () => setOkrs([...okrs, { id:`o${Date.now()}`, o:"novo objetivo", krs:[] }]);

  return (
    <div>
      <div className="row between" style={{ marginBottom: 18, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 className="section-title">Trabalho <span className="hand">em ordem</span></h1>
          <div className="section-sub">hunter de novos negócios · beleza · mercado livre</div>
        </div>
        <div className="row" style={{ gap:10, flexWrap:"wrap" }}>
          <Chip color="blue">{pipeline.length} marcas no pipe</Chip>
          <Chip color="terracotta">{pipeline.filter(b=>b.stage==="Negotiation").length} em negociação</Chip>
          <Chip color="olive">{pipeline.filter(b=>b.stage==="Onboarded").length} onboardadas</Chip>
        </div>
      </div>

      {/* ── PIPELINE ── */}
      <Card className="mb-3">
        <div className="row between" style={{ marginBottom: 16 }}>
          <CardHeader title="Pipeline de Hunting" hand="Not initiated → Onboarded" />
          <button className="btn ghost sm" onClick={() => setTableView(v => !v)}>
            {tableView ? "ver cards" : "ver tabela"}
          </button>
        </div>

        {!tableView ? (
          /* Cards view */
          <div style={{ display:"flex", gap:16, overflowX:"auto", paddingBottom:8, alignItems:"flex-start" }}>
            {PIPE_STAGES.map(stage => {
              const brands = pipeline.filter(b => b.stage === stage);
              return (
                <div key={stage} style={{ minWidth:220, flex:"0 0 220px" }}>
                  {/* Cabeçalho da coluna */}
                  <div className="row between" style={{
                    marginBottom:10, padding:"6px 10px",
                    background: STAGE_BG[stage],
                    border:"1.5px solid var(--ink)",
                    borderRadius:8,
                  }}>
                    <span style={{ fontWeight:600, fontSize:12 }}>{stage}</span>
                    <span style={{
                      width:22, height:22, borderRadius:"50%",
                      background: STAGE_COLORS[stage],
                      border:"1.5px solid var(--ink)",
                      display:"grid", placeItems:"center",
                      fontSize:11, fontWeight:700,
                      color: stage === "Not initiated" ? "var(--ink)" : "var(--paper)",
                      flexShrink:0,
                    }}>{brands.length}</span>
                  </div>
                  {/* Brand cards */}
                  {brands.map(b => (
                    <BrandCard key={b.id} brand={b}
                      onUpdate={patch => updateBrand(b.id, patch)}
                      onDelete={() => removeBrand(b.id)} />
                  ))}
                  {/* Mover seleção */}
                  {brands.length > 0 && (
                    <div style={{ marginBottom:6 }}>
                      {brands.map(b => (
                        <div key={b.id} style={{ fontSize:10, color:"var(--ink-mute)", marginBottom:2 }}>
                          mover <span style={{ fontWeight:600 }}>{b.name.split(" ")[0]}</span>:{" "}
                          {PIPE_STAGES.filter(s => s !== stage).map(s => (
                            <button key={s} onClick={() => moveBrand(b.id, s)}
                              className="btn ghost sm" style={{ fontSize:9, padding:"1px 5px", marginRight:2 }}>→ {s.split(" ")[0]}</button>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                  <button className="btn ghost sm" style={{ width:"100%", fontSize:11, marginTop:4 }}
                    onClick={() => addBrand("nova marca", stage)}>+ marca</button>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table view */
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead>
                <tr style={{ background:"var(--cream-deep)" }}>
                  {["Nome","Stage","Tipo","Prioridade","Segmento","GMV mês","GMV ano","TikTok","Shoppee","Reunião","Data","Observações",""].map(h => (
                    <th key={h} style={{ padding:"6px 10px", textAlign:"left", border:"1px solid var(--ink)", fontFamily:"var(--font-display)", fontSize:11, whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pipeline.map((b, i) => (
                  <tr key={b.id} style={{ background: i%2===0 ? "var(--paper)" : "var(--cream)" }}>
                    <td style={{ padding:"5px 10px", border:"1px solid rgba(42,31,23,0.18)", fontWeight:600 }}>
                      <InlineEdit value={b.name} onChange={v => updateBrand(b.id, { name:v })} />
                    </td>
                    <td style={{ padding:"5px 10px", border:"1px solid rgba(42,31,23,0.18)" }}>
                      <select value={b.stage} onChange={e => updateBrand(b.id, { stage: e.target.value })}
                        style={{ fontSize:11, border:"none", background:"transparent", cursor:"pointer", fontFamily:"inherit" }}>
                        {PIPE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding:"5px 10px", border:"1px solid rgba(42,31,23,0.18)" }}>
                      <select value={b.sellerOrBrand} onChange={e => updateBrand(b.id, { sellerOrBrand: e.target.value })}
                        style={{ fontSize:11, border:"none", background:"transparent", cursor:"pointer", fontFamily:"inherit" }}>
                        <option>Seller</option><option>Brand</option>
                      </select>
                    </td>
                    <td style={{ padding:"5px 10px", border:"1px solid rgba(42,31,23,0.18)" }}>
                      <span className={`chip ${PRIORITY_CHIP[b.priority]||""}`} style={{ fontSize:10 }}>{b.priority}</span>
                    </td>
                    <td style={{ padding:"5px 10px", border:"1px solid rgba(42,31,23,0.18)" }}>
                      <InlineEdit value={b.segment} onChange={v => updateBrand(b.id, { segment:v })} placeholder="—" />
                    </td>
                    <td style={{ padding:"5px 10px", border:"1px solid rgba(42,31,23,0.18)", fontFamily:"var(--font-mono)", textAlign:"right" }}>
                      {formatBRL(b.gmvMonth)}
                    </td>
                    <td style={{ padding:"5px 10px", border:"1px solid rgba(42,31,23,0.18)", fontFamily:"var(--font-mono)", textAlign:"right" }}>
                      {formatBRL(b.gmvYear)}
                    </td>
                    <td style={{ padding:"5px 10px", border:"1px solid rgba(42,31,23,0.18)", textAlign:"center" }}>{b.tiktok ? "✓" : "—"}</td>
                    <td style={{ padding:"5px 10px", border:"1px solid rgba(42,31,23,0.18)", textAlign:"center" }}>{b.shoppee ? "✓" : "—"}</td>
                    <td style={{ padding:"5px 10px", border:"1px solid rgba(42,31,23,0.18)", textAlign:"center" }}>{b.meeting ? "✓" : "—"}</td>
                    <td style={{ padding:"5px 10px", border:"1px solid rgba(42,31,23,0.18)" }}>{b.meetingDate || "—"}</td>
                    <td style={{ padding:"5px 10px", border:"1px solid rgba(42,31,23,0.18)", maxWidth:160 }}>
                      <InlineEdit value={b.notes} onChange={v => updateBrand(b.id, { notes:v })} placeholder="—" />
                    </td>
                    <td style={{ padding:"5px 10px", border:"1px solid rgba(42,31,23,0.18)" }}>
                      <DeleteBtn onClick={() => removeBrand(b.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop:10 }}>
              <AddRow onAdd={(n) => addBrand(n, "Not initiated")} placeholder="+ nova marca no pipe..." buttonClass="terracotta" />
            </div>
          </div>
        )}
      </Card>

      {/* ── ACIONÁVEIS ── */}
      <Card className="mb-3">
        <CardHeader title="Acionáveis & Projetos" hand="tarefas do hunting + reuniões" />
        <div style={{ maxHeight:280, overflowY:"auto" }}>
          {actionables.map(a => (
            <div key={a.id} className={`task ${a.done ? "done" : ""}`} style={{ display:"flex", alignItems:"center", gap:8 }}>
              <input type="checkbox" className="check" checked={a.done} onChange={() => toggleAc(a.id)} />
              <span className="label" style={{ flex:1 }}>
                <InlineEdit value={a.label} onChange={v => editAc(a.id, { label:v })} />
              </span>
              <select value={a.ctx} onChange={e => editAc(a.id, { ctx: e.target.value })}
                className="chip" style={{ fontSize:10, padding:"2px 6px", cursor:"pointer", appearance:"none" }}>
                {["Pipe","Projeto","Research","Admin","Reunião"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className="due">
                <InlineEdit value={a.due} onChange={v => editAc(a.id, { due:v })} placeholder="prazo" />
              </span>
              <DeleteBtn onClick={() => removeAc(a.id)} />
            </div>
          ))}
        </div>
        <AddRow onAdd={addAc} placeholder="+ acionável ou projeto..." buttonClass="blue" />
      </Card>

      {/* ── NOTAS + OKRs ── */}
      <div className="grid cols-12 mb-3">
        <Card className="span-7">
          <CardHeader title="Anotações de reunião" hand={`${notes.length} notas`} action={<button className="btn sm" onClick={addNote}>+ nova</button>} />
          <div className="row" style={{ alignItems:"stretch", gap:14 }}>
            <div style={{ width:180, borderRight:"1px dashed var(--ink)", paddingRight:12 }}>
              {notes.map(n => (
                <div key={n.id} className="row" style={{ alignItems:"flex-start", gap:6 }}>
                  <div onClick={() => setActiveNote(n.id)}
                    style={{ padding:"8px 10px", borderRadius:8, background: n.id===activeNote ? "var(--mustard-soft)" : "transparent", cursor:"pointer", marginBottom:4, flex:1 }}>
                    <div className="bold" style={{ fontSize:13 }}>{n.title}</div>
                    <div className="hand" style={{ fontSize:15 }}>
                      <InlineEdit value={n.date} onChange={v => updateNote(n.id, { date:v })} placeholder="dd/mm" />
                    </div>
                  </div>
                  <DeleteBtn onClick={() => removeNote(n.id)} />
                </div>
              ))}
            </div>
            <div className="flex1">
              {note && (
                <>
                  <div style={{ fontFamily:"var(--font-display)", fontSize:22, marginBottom:4 }}>
                    <InlineEdit value={note.title} onChange={v => updateNote(note.id, { title:v })} />
                  </div>
                  <textarea value={note.body} onChange={e => updateNote(note.id, { body: e.target.value })}
                    placeholder="escreva suas anotações..."
                    style={{ width:"100%", minHeight:140, border:"1.5px dashed var(--ink)", background:"var(--paper)", borderRadius:10, padding:12, fontFamily:"var(--font-body)", fontSize:14, lineHeight:1.55, color:"var(--ink-soft)", resize:"vertical" }} />
                </>
              )}
            </div>
          </div>
        </Card>

        <Card className="span-5">
          <CardHeader title="Carreira & OKRs" hand="2º semestre 2026" action={<button className="btn sm olive" onClick={addObjective}>+ objetivo</button>} />
          <div className="col" style={{ gap:16 }}>
            {okrs.map(o => (
              <div key={o.id}>
                <div className="row between mb-1">
                  <div className="bold" style={{ fontSize:14, flex:1 }}>
                    <InlineEdit value={o.o} onChange={v => updateOkr(o.id, { o:v })} />
                  </div>
                  <DeleteBtn onClick={() => removeObjective(o.id)} />
                </div>
                {o.krs.map((kr, j) => (
                  <div key={kr.id} className="row" style={{ alignItems:"flex-start", gap:6, marginBottom:6 }}>
                    <div style={{ flex:1 }}>
                      <div className="row between" style={{ marginBottom:3 }}>
                        <div style={{ fontSize:13 }}><InlineEdit value={kr.t} onChange={v => updateKr(o.id, kr.id, { t:v })} /></div>
                        <div style={{ fontFamily:"var(--font-mono)", fontSize:11 }}>
                          <input type="number" value={kr.v} min={0}
                            onChange={e => updateKr(o.id, kr.id, { v: +e.target.value })}
                            style={{ width:42, border:"1.5px dashed var(--ink)", background:"var(--paper)", borderRadius:4, padding:"1px 4px", fontFamily:"var(--font-mono)", textAlign:"right" }} />
                          {" / "}
                          <input type="number" value={kr.m} min={1}
                            onChange={e => updateKr(o.id, kr.id, { m: +e.target.value })}
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
