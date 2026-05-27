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
  { id:"pipe1", name:"Skincare Coreana X", stage:"Negotiation", custId:"", sellerOrBrand:"Brand", priority:"Alta", createdAt:"01/05", updatedAt:"20/05", segment:"Skincare", gmvMonth:50000, gmvYear:600000, tiktok:false, shoppee:true, meeting:true, meetingDate:"26/05", notes:"Proposta enviada" },
  { id:"pipe2", name:"Perfumaria Y", stage:"Not initiated", custId:"", sellerOrBrand:"Seller", priority:"Média", createdAt:"10/05", updatedAt:"10/05", segment:"Perfumaria", gmvMonth:30000, gmvYear:360000, tiktok:false, shoppee:false, meeting:false, meetingDate:"", notes:"" },
  { id:"pipe3", name:"Marca Z Premium", stage:"Setup", custId:"", sellerOrBrand:"Brand", priority:"Alta", createdAt:"15/04", updatedAt:"22/05", segment:"Maquiagem", gmvMonth:80000, gmvYear:960000, tiktok:true, shoppee:true, meeting:true, meetingDate:"28/05", notes:"Setup em andamento" },
  { id:"pipe4", name:"BeautyBrand W", stage:"3P Go Live", custId:"", sellerOrBrand:"Brand", priority:"Alta", createdAt:"01/04", updatedAt:"25/05", segment:"Haircare", gmvMonth:45000, gmvYear:540000, tiktok:true, shoppee:false, meeting:false, meetingDate:"", notes:"Go live semana que vem" },
  { id:"pipe5", name:"Cosméticos V", stage:"Onboarded", custId:"", sellerOrBrand:"Seller", priority:"Baixa", createdAt:"01/03", updatedAt:"15/05", segment:"Skincare", gmvMonth:20000, gmvYear:240000, tiktok:false, shoppee:true, meeting:false, meetingDate:"", notes:"Onboarding concluído ✓" },
];

function SegmentSelect({ value, options, onChange, onAdd, style = {} }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const commit = () => {
    const v = draft.trim();
    if (v) { onAdd(v); onChange(v); }
    setDraft(""); setAdding(false);
  };
  if (adding) return (
    <div className="row" style={{ gap:4 }}>
      <input autoFocus className="input" value={draft} onChange={e => setDraft(e.target.value)}
        placeholder="novo segmento" style={{ fontSize:11, flex:1 }}
        onKeyDown={e => { if (e.key==="Enter") commit(); if (e.key==="Escape") { setDraft(""); setAdding(false); } }}
        onBlur={commit} />
    </div>
  );
  return (
    <select value={value || ""} onChange={e => e.target.value === "__add__" ? setAdding(true) : onChange(e.target.value)}
      style={{ fontSize:11, fontWeight:600, padding:"3px 10px", paddingRight:22, borderRadius:20,
        border:"1.5px solid var(--ink)", background: value ? "var(--cream-deep)" : "var(--paper)",
        cursor:"pointer", appearance:"none", width:"100%",
        backgroundImage:"url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6'><path fill='rgba(0,0,0,.45)' d='M0 0h10L5 6z'/></svg>\")",
        backgroundRepeat:"no-repeat", backgroundPosition:"right 7px center", ...style }}>
      <option value="">— segmento —</option>
      {options.map(s => <option key={s} value={s}>{s}</option>)}
      <option value="__add__">＋ novo segmento</option>
    </select>
  );
}

function BrandCard({ brand, onUpdate, onDelete, onDragStart, segmentOptions, onAddSegment }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      draggable
      onDragStart={onDragStart}
      style={{
        background: "var(--paper)",
        border: "2px solid var(--ink)",
        borderRadius: 12,
        padding: "10px 12px",
        marginBottom: 8,
        cursor: "grab",
      }}>
      {/* Header clicável */}
      <div className="row between" style={{ cursor:"pointer" }} onClick={() => setExpanded(e => !e)}>
        <div style={{ fontWeight:600, fontSize:13, flex:1 }}>
          <InlineEdit value={brand.name} onChange={v => onUpdate({ name: v })} />
        </div>
        <div className="row" style={{ gap:4 }}>
          {brand.segment && (
            <span className="chip" style={{ fontSize:10, padding:"2px 6px", background:"var(--cream-deep)", border:"1px solid var(--ink)" }}>
              {brand.segment}
            </span>
          )}
          <span style={{ color:"var(--ink-mute)", fontSize:12 }}>{expanded ? "▲" : "▼"}</span>
        </div>
      </div>
      {!expanded && (
        <div style={{ fontSize:11, color:"var(--ink-soft)", marginTop:4 }}>
          {brand.segment} · {formatBRL(brand.gmvMonth)}/mês
          {brand.custId && <span style={{ marginLeft:6, fontFamily:"var(--font-mono)", color:"var(--ink-mute)" }}>#{brand.custId}</span>}
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
              <div className="hand" style={{ fontSize:13, marginBottom:4 }}>Segmento</div>
              <SegmentSelect value={brand.segment} options={segmentOptions}
                onChange={v => onUpdate({ segment: v })} onAdd={onAddSegment} />
            </div>
            <div>
              <div className="hand" style={{ fontSize:13 }}>Cust ID</div>
              <input value={brand.custId || ""} onChange={e => onUpdate({ custId: e.target.value })}
                placeholder="ex: 123456789"
                style={{ width:"100%", border:"1.5px dashed var(--ink)", background:"var(--paper)", borderRadius:4, padding:"2px 6px", fontFamily:"var(--font-mono)", fontSize:12 }} />
            </div>
            <div>
              <div className="hand" style={{ fontSize:13 }}>Criado em</div>
              <InlineEdit value={brand.createdAt} onChange={v => onUpdate({ createdAt: v })} placeholder="dd/mm" />
            </div>
          </div>
          {/* GMV — linha própria para alinhar perfeitamente */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, fontSize:12, marginTop:8 }}>
            <div>
              <div className="hand" style={{ fontSize:13 }}>GMV mês (R$)</div>
              <input type="number" value={brand.gmvMonth}
                onChange={e => { const m = +e.target.value; onUpdate({ gmvMonth: m, gmvYear: m * 12 }); }}
                style={{ width:"100%", border:"1.5px dashed var(--ink)", background:"var(--paper)", borderRadius:4, padding:"2px 6px", fontFamily:"var(--font-mono)", fontSize:12 }} />
            </div>
            <div>
              <div className="hand" style={{ fontSize:13 }}>GMV ano (R$)</div>
              <input type="number" value={brand.gmvYear} onChange={e => onUpdate({ gmvYear: +e.target.value })}
                style={{ width:"100%", border:"1.5px dashed var(--ink)", background:"var(--paper)", borderRadius:4, padding:"2px 6px", fontFamily:"var(--font-mono)", fontSize:12 }} />
              <div style={{ fontSize:10, color:"var(--ink-mute)", marginTop:2 }}>↺ auto (×12) · editável</div>
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

  // Segmentos customizáveis
  const [segmentOptions, setSegmentOptions] = useLocalState("isa.trabalho.segments",
    ["Skincare", "Perfumaria", "Maquiagem", "Haircare", "Unhas", "Corpo & Bem-estar", "Masculino", "Outros"]
  );
  const addSegmentOption = (v) => {
    if (!segmentOptions.includes(v)) setSegmentOptions([...segmentOptions, v]);
  };
  const addBrand = (name, stage) => setPipeline([...pipeline, {
    id:`pipe${Date.now()}`, name, stage, custId:"", sellerOrBrand:"Brand", priority:"Média",
    createdAt: `${new Date().getDate()}/${new Date().getMonth()+1}`,
    updatedAt: `${new Date().getDate()}/${new Date().getMonth()+1}`,
    segment:"", gmvMonth:0, gmvYear:0, tiktok:false, shoppee:false, meeting:false, meetingDate:"", notes:"",
  }]);

  // Vista de tabela + ordenação
  const [tableView, setTableView] = useState(false);
  const [dragOverStage, setDragOverStage] = useState(null);
  const [sort, setSort] = useState({ key: null, dir: "asc" });

  const TABLE_COLS = [
    { label:"Nome",        key:"name",          type:"string" },
    { label:"Cust ID",     key:"custId",        type:"string" },
    { label:"Stage",       key:"stage",         type:"stage" },
    { label:"Tipo",        key:"sellerOrBrand",  type:"string" },
    { label:"Prioridade",  key:"priority",      type:"priority" },
    { label:"Segmento",    key:"segment",       type:"string" },
    { label:"GMV mês",     key:"gmvMonth",      type:"number" },
    { label:"GMV ano",     key:"gmvYear",       type:"number" },
    { label:"TikTok",      key:"tiktok",        type:"bool" },
    { label:"Shoppee",     key:"shoppee",       type:"bool" },
    { label:"Reunião",     key:"meeting",       type:"bool" },
    { label:"Data",        key:"meetingDate",   type:"string" },
    { label:"Observações", key:"notes",         type:"string" },
  ];
  const PRIORITY_ORDER = { Alta:0, Média:1, Baixa:2 };

  const cycleSort = (key) => {
    setSort(prev =>
      prev.key !== key ? { key, dir:"asc" }
      : prev.dir === "asc" ? { key, dir:"desc" }
      : { key: null, dir:"asc" }
    );
  };

  const sortedPipeline = [...pipeline].sort((a, b) => {
    if (!sort.key) return 0;
    const col = TABLE_COLS.find(c => c.key === sort.key);
    const mult = sort.dir === "asc" ? 1 : -1;
    if (col?.type === "number") return mult * (a[sort.key] - b[sort.key]);
    if (col?.type === "bool")   return mult * ((a[sort.key] ? 1 : 0) - (b[sort.key] ? 1 : 0));
    if (col?.type === "priority") return mult * ((PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9));
    if (col?.type === "stage") return mult * (PIPE_STAGES.indexOf(a.stage) - PIPE_STAGES.indexOf(b.stage));
    return mult * String(a[sort.key] ?? "").localeCompare(String(b[sort.key] ?? ""), "pt-BR");
  });

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

  // Links úteis
  const [links, setLinks] = useLocalState("isa.trabalho.links", [
    { id:"l1", label:"Salesforce", url:"https://meli.lightning.force.com/lightning/page/home", color:"blue" },
    { id:"l2", label:"ML Seller Center", url:"https://www.mercadolivre.com.br/", color:"mustard" },
  ]);
  const sortedLinks = [...links].sort((a, b) => a.label.localeCompare(b.label, "pt-BR", { sensitivity:"base" }));
  const [newLink, setNewLink] = useState({ label:"", url:"" });
  const addLink = () => {
    const url = newLink.url.trim();
    const label = newLink.label.trim() || url;
    if (!url) return;
    const colors = ["blue","mustard","terracotta","olive","rose"];
    setLinks([...links, { id:`l${Date.now()}`, label, url, color: colors[links.length % colors.length] }]);
    setNewLink({ label:"", url:"" });
  };
  const updateLink = (id, patch) => setLinks(links.map(l => l.id === id ? { ...l, ...patch } : l));
  const removeLink = (id) => setLinks(links.filter(l => l.id !== id));

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

  const exportCSV = () => {
    const headers = TABLE_COLS.map(c => c.label).join(",");
    const rows = sortedPipeline.map(b =>
      TABLE_COLS.map(c => {
        const v = b[c.key];
        if (c.type === "bool")   return v ? "Sim" : "Não";
        if (c.type === "number") return v ?? 0;
        return `"${String(v ?? "").replace(/"/g, '""')}"`;
      }).join(",")
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pipeline_${new Date().toLocaleDateString("pt-BR").replace(/\//g,"-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
        <div className="row between" style={{ marginBottom: 16, flexWrap:"wrap", gap:8 }}>
          <CardHeader title="Pipeline de Hunting" hand="Not initiated → Onboarded" />
          <div className="row" style={{ gap:8, flexWrap:"wrap" }}>
            <a href="https://meli.lightning.force.com/lightning/page/home" target="_blank" rel="noopener noreferrer"
              style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 12px",
                background:"#0070d2", color:"#fff", border:"2px solid var(--ink)", borderRadius:20,
                fontSize:11, fontWeight:600, textDecoration:"none", letterSpacing:".01em" }}>
              ⚡ Salesforce
            </a>
            <button className="btn ghost sm" onClick={exportCSV}>↓ exportar CSV</button>
            <button className="btn ghost sm" onClick={() => setTableView(v => !v)}>
              {tableView ? "ver cards" : "ver tabela"}
            </button>
          </div>
        </div>

        {!tableView ? (
          /* Cards view */
          <div style={{ display:"flex", gap:16, overflowX:"auto", paddingBottom:8, alignItems:"flex-start" }}>
            {PIPE_STAGES.map(stage => {
              const brands = pipeline.filter(b => b.stage === stage);
              const isOver = dragOverStage === stage;
              return (
                <div key={stage}
                  onDragOver={e => { e.preventDefault(); setDragOverStage(stage); }}
                  onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOverStage(null); }}
                  onDrop={e => {
                    e.preventDefault();
                    const id = e.dataTransfer.getData("brandId");
                    if (id) moveBrand(id, stage);
                    setDragOverStage(null);
                  }}
                  style={{
                    minWidth:220, flex:"0 0 220px",
                    borderRadius:10,
                    outline: isOver ? "2px dashed var(--terracotta)" : "2px solid transparent",
                    padding: 4,
                    transition: "outline 0.1s",
                  }}>
                  {/* Cabeçalho da coluna */}
                  <div className="row between" style={{
                    marginBottom:10, padding:"6px 10px",
                    background: isOver ? STAGE_COLORS[stage] : STAGE_BG[stage],
                    border:"1.5px solid var(--ink)",
                    borderRadius:8,
                    transition: "background 0.1s",
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
                      onDelete={() => removeBrand(b.id)}
                      onDragStart={e => { e.dataTransfer.setData("brandId", b.id); e.dataTransfer.effectAllowed = "move"; }}
                      segmentOptions={segmentOptions}
                      onAddSegment={addSegmentOption} />
                  ))}
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
                  {TABLE_COLS.map(col => (
                    <th key={col.key} onClick={() => cycleSort(col.key)}
                      style={{ padding:"6px 10px", textAlign:"left", border:"1px solid var(--ink)", fontFamily:"var(--font-display)", fontSize:11, whiteSpace:"nowrap", cursor:"pointer", userSelect:"none" }}>
                      {col.label}{sort.key === col.key ? (sort.dir === "asc" ? " ▲" : " ▼") : ""}
                    </th>
                  ))}
                  <th style={{ padding:"6px 10px", border:"1px solid var(--ink)", width:32 }}></th>
                </tr>
              </thead>
              <tbody>
                {sortedPipeline.map((b, i) => (
                  <tr key={b.id} style={{ background: i%2===0 ? "var(--paper)" : "var(--cream)" }}>
                    <td style={{ padding:"5px 10px", border:"1px solid rgba(42,31,23,0.18)", fontWeight:600 }}>
                      <InlineEdit value={b.name} onChange={v => updateBrand(b.id, { name:v })} />
                    </td>
                    <td style={{ padding:"5px 10px", border:"1px solid rgba(42,31,23,0.18)", fontFamily:"var(--font-mono)", fontSize:11 }}>
                      <InlineEdit value={b.custId || ""} onChange={v => updateBrand(b.id, { custId:v })} placeholder="—" />
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
                      <select value={b.priority} onChange={e => updateBrand(b.id, { priority: e.target.value })}
                        style={{ fontSize:11, border:"none", background:"transparent", cursor:"pointer", fontFamily:"inherit" }}>
                        <option>Alta</option><option>Média</option><option>Baixa</option>
                      </select>
                    </td>
                    <td style={{ padding:"5px 10px", border:"1px solid rgba(42,31,23,0.18)" }}>
                      <SegmentSelect value={b.segment} options={segmentOptions}
                        onChange={v => updateBrand(b.id, { segment: v })}
                        onAdd={addSegmentOption}
                        style={{ fontSize:10, padding:"2px 8px" }} />
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

      {/* ── LINKS ÚTEIS ── */}
      <Card>
        <CardHeader title="Links úteis" hand="acesso rápido" />
        <div className="row" style={{ flexWrap:"wrap", gap:10, marginBottom:14 }}>
          {sortedLinks.map(l => (
            <div key={l.id} className={`chip ${l.color}`}
              style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:12, fontWeight:600, paddingRight:22, position:"relative" }}>
              <a href={l.url} target="_blank" rel="noopener noreferrer"
                style={{ color:"inherit", textDecoration:"none", opacity:.65, fontSize:11, flexShrink:0 }}
                title={l.url}>↗</a>
              <InlineEdit value={l.label} onChange={v => updateLink(l.id, { label: v })} />
              <button onClick={() => removeLink(l.id)}
                style={{ position:"absolute", right:5, top:"50%", transform:"translateY(-50%)",
                  background:"none", border:"none", cursor:"pointer", fontSize:10, lineHeight:1,
                  color:"inherit", opacity:.55, padding:0 }}>×</button>
            </div>
          ))}
        </div>
        <div className="row" style={{ gap:8, flexWrap:"wrap" }}>
          <input className="input" placeholder="nome do link" value={newLink.label}
            style={{ flex:"1 1 130px", minWidth:0 }}
            onChange={e => setNewLink(p => ({ ...p, label: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && addLink()} />
          <input className="input" placeholder="https://..." value={newLink.url}
            style={{ flex:"2 1 220px", minWidth:0 }}
            onChange={e => setNewLink(p => ({ ...p, url: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && addLink()} />
          <button className="btn blue sm" onClick={addLink}>+ link</button>
        </div>
      </Card>
    </div>
  );
}
