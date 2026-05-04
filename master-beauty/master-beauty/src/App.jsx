import { useState, useEffect } from "react";

/* ── Storage (localStorage) ── */
const DB = {
  get(k)    { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

const todayStr = () => new Date().toISOString().split("T")[0];
const daysFrom = (n) => new Date(Date.now() + n * 86400000).toISOString().split("T")[0];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const isOv = (d) => !!d && d < todayStr();
const isTd = (d) => !!d && d === todayStr();
const fmt  = (d) => d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR") : "—";

const SEED_TASKS = [
  { id:"t1", title:"Apresentação Q2 Beauty",          type:"projeto", entity:"Beauty Vertical Q2",  deadline:daysFrom(0),  status:"doing", priority:"alta",  notes:"Incluir dados de sell-out e GMV por categoria" },
  { id:"t2", title:"Análise de concorrência skincare", type:"projeto", entity:"Beauty Vertical Q2",  deadline:daysFrom(5),  status:"todo",  priority:"media", notes:"" },
  { id:"t3", title:"Brief campanha Dia das Mães",      type:"marca", entity:"L'Oréal Brasil",      deadline:daysFrom(-1), status:"todo",  priority:"alta",  notes:"Confirmar verbas com time comercial" },
  { id:"t4", title:"Revisão de contrato anual",        type:"marca", entity:"L'Oréal Brasil",      deadline:daysFrom(10), status:"done",  priority:"baixa", notes:"" },
  { id:"t5", title:"Deck de sell-in fragrance",        type:"marca", entity:"O Boticário",         deadline:daysFrom(3),  status:"doing", priority:"alta",  notes:"" },
  { id:"t6", title:"Mapeamento de sellers beauty",     type:"projeto", entity:"Expansão Sellers 26", deadline:daysFrom(7),  status:"todo",  priority:"media", notes:"" },
];
const SEED_LINKS = [
  { id:"l1", title:"Pasta Beauty Q2 — Drive", url:"https://drive.google.com",      category:"Arquivos", description:"Apresentações e reports do trimestre" },
  { id:"l2", title:"Dashboard GMV Beauty",    url:"https://datastudio.google.com", category:"Arquivos", description:"Métricas consolidadas por categoria" },
];
const SEED_CATS = ["Arquivos"];

/* ── Palette ── */
const Y    = "#FFF159";
const Yd   = "#F5E200";
const Yp   = "#FFFBE0";
const P1   = "#E8608A";
const P2   = "#F090B0";
const P3   = "#F8C0D4";
const P4   = "#FDEAF2";
const P5   = "#FFF3F8";
const INK  = "#2A1020";
const MUTED= "#7A4A60";
const FAINT= "#B888A0";
const CARD = "#FFFFFF";
const BDR  = "#F0C8D8";
const SW   = 220;

const F_DISPLAY = "'Cormorant Garamond', Georgia, serif";
const F_BODY    = "'DM Sans', 'Segoe UI', sans-serif";

const STATS = { todo:"A Fazer", doing:"Em Andamento", done:"Concluído" };
const SCOLS = ["todo","doing","done"];
const SM = {
  todo:  { dot:"#C8A0B0", bg:"#FDF5F8", bdr:"#F0D8E4", badge:"#F8ECF2", btxt:"#8A5070" },
  doing: { dot:"#4878E8", bg:"#F0F4FF", bdr:"#C8D8FF", badge:"#DBEAFE", btxt:"#2050C0" },
  done:  { dot:"#38AA68", bg:"#EEFAF4", bdr:"#A8E8C4", badge:"#D1FAE5", btxt:"#186840" },
};
const PRIOS = {
  alta:  { label:"Alta",  bg:"#FDEAEA", c:"#C03030" },
  media: { label:"Média", bg:"#FFF3CD", c:"#926800" },
  baixa: { label:"Baixa", bg:"#E8F5EE", c:"#1E6B3E" },
};

const INP   = { width:"100%", padding:"10px 13px", border:`1.5px solid ${BDR}`, borderRadius:"8px", fontSize:"13px", outline:"none", boxSizing:"border-box", background:P5, fontFamily:F_BODY, color:INK };
const BTNML = { padding:"10px 22px", background:Y,  color:INK, border:`1.5px solid ${Yd}`, borderRadius:"8px", fontWeight:700, fontSize:"13px", cursor:"pointer", fontFamily:F_BODY };
const BTNPK = { padding:"10px 22px", background:P1, color:"#FFF", border:`1.5px solid ${P1}`, borderRadius:"8px", fontWeight:600, fontSize:"13px", cursor:"pointer", fontFamily:F_BODY };
const BTNG  = { padding:"10px 20px", background:CARD, color:MUTED, border:`1.5px solid ${BDR}`, borderRadius:"8px", fontWeight:500, fontSize:"13px", cursor:"pointer", fontFamily:F_BODY };
const BTNR  = { padding:"10px 20px", background:"#FDEAEA", color:"#C03030", border:"1.5px solid #F0C0C0", borderRadius:"8px", fontWeight:600, fontSize:"13px", cursor:"pointer", fontFamily:F_BODY };
const LBL   = { display:"block", fontSize:"10px", fontWeight:600, color:FAINT, marginBottom:"5px", marginTop:"16px", textTransform:"uppercase", letterSpacing:"0.9px", fontFamily:F_BODY };

function Tag({ children, bg, color, size=11 }) {
  return <span style={{ fontSize:`${size}px`, fontWeight:600, background:bg, color, borderRadius:"5px", padding:"3px 9px", whiteSpace:"nowrap", display:"inline-block" }}>{children}</span>;
}

function Overlay({ children, onClose }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(42,16,32,0.45)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }} onClick={onClose}>
      <div style={{ background:CARD, borderRadius:"16px", padding:"36px", width:"580px", maxWidth:"100%", maxHeight:"90vh", overflowY:"auto", boxShadow:"0 24px 60px rgba(42,16,32,0.18)", border:`1px solid ${BDR}` }} onClick={e=>e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function Confirm({ msg, sub, onYes, onNo }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(42,16,32,0.5)", zIndex:400, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }} onClick={onNo}>
      <div style={{ background:CARD, borderRadius:"16px", padding:"36px", maxWidth:"380px", width:"100%", boxShadow:"0 20px 60px rgba(42,16,32,0.18)", textAlign:"center", border:`1px solid ${BDR}` }} onClick={e=>e.stopPropagation()}>
        <div style={{ width:"48px", height:"48px", background:P4, border:`1px solid ${P3}`, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px", fontSize:"20px" }}>🗑</div>
        <p style={{ fontFamily:F_DISPLAY, fontSize:"21px", fontWeight:700, color:INK, margin:"0 0 8px", lineHeight:1.3 }}>{msg}</p>
        {sub && <p style={{ fontSize:"13px", color:MUTED, margin:"0 0 26px", lineHeight:1.6, fontFamily:F_BODY }}>{sub}</p>}
        <div style={{ display:"flex", gap:"10px" }}>
          <button onClick={onYes} style={{ ...BTNR, flex:1, padding:"11px" }}>Confirmar exclusão</button>
          <button onClick={onNo}  style={{ ...BTNG, flex:1, padding:"11px" }}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, count }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ display:"flex", alignItems:"center", gap:"9px", width:"100%", padding:"9px 12px",
        background: active ? Y : h ? Yp : "transparent",
        color: active ? INK : h ? MUTED : FAINT,
        border: active ? `1.5px solid ${Yd}` : "1.5px solid transparent",
        borderRadius:"8px", cursor:"pointer", fontFamily:F_BODY,
        fontSize:"13px", fontWeight: active ? 700 : 400, textAlign:"left", transition:"all 0.15s",
        boxShadow: active ? "0 2px 8px rgba(240,220,0,0.25)" : "none" }}>
      <span style={{ fontSize:"14px", lineHeight:1 }}>{icon}</span>
      <span style={{ flex:1 }}>{label}</span>
      {count !== undefined && (
        <span style={{ fontSize:"11px", fontWeight:600, background: active ? "rgba(0,0,0,0.10)" : P4, color: active ? INK : MUTED, borderRadius:"10px", padding:"1px 7px" }}>{count}</span>
      )}
    </button>
  );
}

function TaskCard({ task, onEdit }) {
  const ov  = task.status !== "done" && isOv(task.deadline);
  const ttd = task.status !== "done" && isTd(task.deadline);
  const p   = PRIOS[task.priority];
  const [h, setH] = useState(false);
  return (
    <div onClick={()=>onEdit(task)} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ background:CARD, borderRadius:"10px", padding:"15px 16px", marginBottom:"8px", cursor:"pointer",
        border: ov ? `1.5px solid ${P1}` : ttd ? `1.5px solid ${Yd}` : `1px solid ${BDR}`,
        boxShadow: h ? "0 5px 18px rgba(232,96,138,0.13)" : "0 1px 4px rgba(42,16,32,0.05)",
        transform: h ? "translateY(-1px)" : "none", transition:"all 0.15s" }}>
      {ov  && <div style={{ fontSize:"10px", fontWeight:700, color:P1, marginBottom:"7px", fontFamily:F_BODY }}>⚠ Atrasada</div>}
      {ttd && <div style={{ fontSize:"10px", fontWeight:700, color:"#7A5800", marginBottom:"7px", background:Y, borderRadius:"4px", padding:"2px 8px", display:"inline-block", fontFamily:F_BODY }}>⏰ Vence hoje</div>}
      <div style={{ fontWeight:500, fontSize:"13.5px", color:INK, marginBottom:"10px", lineHeight:1.4, fontFamily:F_BODY }}>{task.title}</div>
      <div style={{ display:"flex", gap:"5px", flexWrap:"wrap", alignItems:"center" }}>
        <Tag bg={task.type==="projeto" ? Yp : P4} color={task.type==="projeto" ? "#7A5800" : P1}>{task.type==="projeto" ? "Projeto" : "Marca"}</Tag>
        {task.entity && <Tag bg={P5} color={MUTED}>{task.entity}</Tag>}
        <Tag bg={p.bg} color={p.c}>{p.label}</Tag>
        {task.deadline && <span style={{ fontSize:"11px", color:ov?P1:FAINT, marginLeft:"auto", fontFamily:F_BODY }}>📅 {fmt(task.deadline)}</span>}
      </div>
    </div>
  );
}

function EntityCard({ name, type, tasks, onEditTask, onNewTask, onDeleteEntity }) {
  const [open, setOpen]             = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const counts = { todo:0, doing:0, done:0 };
  tasks.forEach(t => counts[t.status]++);
  const total = tasks.length, ratio = total ? counts.done / total : 0;
  const hasOv = tasks.some(t => t.status !== "done" && isOv(t.deadline));
  const hasTd = tasks.some(t => t.status !== "done" && isTd(t.deadline));
  const isProj = type === "projeto";
  return (
    <>
      {confirmDel && <Confirm
        msg={`Excluir "${name}"?`}
        sub={`Essa ação vai remover permanentemente ${total} tarefa${total!==1?"s":""} vinculada${total!==1?"s":""}.`}
        onYes={()=>{ onDeleteEntity(name, type); setConfirmDel(false); }}
        onNo={()=>setConfirmDel(false)} />}
      <div style={{ background:CARD, border:`1px solid ${BDR}`, borderRadius:"12px", overflow:"hidden", boxShadow:"0 2px 10px rgba(232,96,138,0.08)", marginBottom:"12px" }}>
        <div style={{ height:"3px", background: isProj ? `linear-gradient(90deg,${Y},${Yd})` : `linear-gradient(90deg,${P2},${P1})` }} />
        <div style={{ padding:"20px 24px", borderBottom:open?`1px solid ${BDR}`:"none", cursor:"pointer" }} onClick={()=>setOpen(o=>!o)}>
          <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
            <div style={{ width:"44px", height:"44px", borderRadius:"10px", flexShrink:0, background:isProj?Yp:P4, border:isProj?`1.5px solid ${Yd}`:`1.5px solid ${P3}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"17px", color:isProj?"#7A5800":P1, fontWeight:700 }}>
              {isProj ? "◆" : "◇"}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"6px", flexWrap:"wrap" }}>
                <span style={{ fontFamily:F_DISPLAY, fontWeight:700, fontSize:"18px", color:INK, letterSpacing:"-0.2px" }}>{name}</span>
                {hasOv && <Tag bg="#FDEAEA" color="#C03030">⚠ atrasada</Tag>}
                {!hasOv && hasTd && <Tag bg={Y} color="#7A5800">⏰ hoje</Tag>}
              </div>
              <div style={{ display:"flex", gap:"20px" }}>
                {SCOLS.map(s=>(
                  <span key={s} style={{ fontSize:"12px", color:FAINT, fontFamily:F_BODY }}>
                    <span style={{ fontWeight:700, color:SM[s].dot }}>{counts[s]}</span>{" "}{STATS[s]}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:"12px", flexShrink:0 }}>
              <span style={{ fontSize:"13px", fontWeight:600, color:MUTED, fontFamily:F_BODY }}>{Math.round(ratio*100)}%</span>
              <button onClick={e=>{ e.stopPropagation(); setConfirmDel(true); }}
                style={{ background:"#FDEAEA", border:"1.5px solid #F0C0C0", color:"#C03030", borderRadius:"7px", padding:"5px 11px", fontSize:"11px", fontWeight:600, cursor:"pointer", fontFamily:F_BODY, display:"flex", alignItems:"center", gap:"4px", whiteSpace:"nowrap" }}
                onMouseEnter={e=>(e.currentTarget.style.background="#FAD8D8")}
                onMouseLeave={e=>(e.currentTarget.style.background="#FDEAEA")}>🗑 Excluir</button>
              <span style={{ color:FAINT, fontSize:"16px", display:"inline-block", transform:open?"rotate(90deg)":"none", transition:"transform 0.2s" }}>›</span>
            </div>
          </div>
          <div style={{ marginTop:"14px", height:"4px", background:P4, borderRadius:"4px", overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${ratio*100}%`, background:isProj?`linear-gradient(90deg,${Y},${Yd})`:`linear-gradient(90deg,${P2},${P1})`, borderRadius:"4px", transition:"width 0.5s" }} />
          </div>
        </div>
        {open && (
          <div style={{ padding:"16px 24px 20px", background:P5 }}>
            {tasks.length===0
              ? <p style={{ color:FAINT, fontSize:"13px", textAlign:"center", padding:"16px 0", margin:0 }}>Nenhuma tarefa ainda.</p>
              : tasks.map(t=>{
                  const ov=t.status!=="done"&&isOv(t.deadline), ttd=t.status!=="done"&&isTd(t.deadline);
                  const p=PRIOS[t.priority], m=SM[t.status];
                  return (
                    <div key={t.id} onClick={()=>onEditTask(t)}
                      style={{ display:"flex", alignItems:"center", gap:"12px", padding:"10px 0", borderBottom:`1px solid ${BDR}`, cursor:"pointer" }}>
                      <div style={{ width:"7px", height:"7px", borderRadius:"50%", background:m.dot, flexShrink:0 }} />
                      <span style={{ flex:1, fontSize:"13px", fontWeight:500, color:INK, minWidth:0, fontFamily:F_BODY }}>
                        {ov  && <span style={{ color:"#C03030", marginRight:"5px", fontSize:"10px" }}>⚠</span>}
                        {ttd && <span style={{ color:"#7A5800", marginRight:"5px", fontSize:"10px" }}>⏰</span>}
                        {t.title}
                      </span>
                      <Tag bg={m.badge} color={m.btxt}>{STATS[t.status]}</Tag>
                      <Tag bg={p.bg} color={p.c}>{p.label}</Tag>
                      {t.deadline && <span style={{ fontSize:"11px", color:FAINT, flexShrink:0, fontFamily:F_BODY }}>{fmt(t.deadline)}</span>}
                    </div>
                  );
                })}
            <button onClick={()=>onNewTask({type,entity:name})} style={{ ...BTNG, marginTop:"14px", fontSize:"12px", padding:"7px 14px" }}>+ Adicionar tarefa</button>
          </div>
        )}
      </div>
    </>
  );
}

function TaskModal({ task, prefill, onSave, onClose, onDelete, entities }) {
  const isNew = !task?.id;
  const [f, setF]               = useState(task||{title:"",type:"projeto",entity:"",deadline:"",status:"todo",priority:"media",notes:"",...(prefill||{})});
  const [confirmDel, setConfirmDel] = useState(false);
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const entList = entities[f.type]||[];
  return (
    <>
      {confirmDel && <Confirm msg="Excluir esta tarefa?" sub={`"${f.title}" será removida permanentemente.`} onYes={()=>onDelete(task.id)} onNo={()=>setConfirmDel(false)} />}
      <Overlay onClose={onClose}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"24px", gap:"12px" }}>
          <div>
            <h2 style={{ fontFamily:F_DISPLAY, fontSize:"26px", fontWeight:700, margin:"0 0 4px", color:INK }}>{isNew?"Nova Tarefa":"Editar Tarefa"}</h2>
            <p style={{ margin:0, fontSize:"13px", color:FAINT, fontFamily:F_BODY }}>{isNew?"Preencha os detalhes abaixo":"Atualize as informações"}</p>
          </div>
          {!isNew && <button onClick={()=>setConfirmDel(true)} style={{ ...BTNR, flexShrink:0, fontSize:"12px", padding:"8px 14px" }}>🗑 Excluir tarefa</button>}
        </div>
        <label style={LBL}>Título</label>
        <input style={INP} value={f.title} onChange={e=>set("title",e.target.value)} placeholder="Ex: Deck de sell-in fragrance" autoFocus />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
          <div><label style={LBL}>Tipo</label>
            <select style={INP} value={f.type} onChange={e=>set("type",e.target.value)}>
              <option value="projeto">Projeto</option>
              <option value="marca">Marca</option>
            </select>
          </div>
          <div><label style={LBL}>{f.type==="projeto"?"Nome do Projeto":"Nome da Marca"}</label>
            <input style={INP} value={f.entity} onChange={e=>set("entity",e.target.value)} placeholder={f.type==="projeto"?"Ex: Beauty Vertical Q2":"Ex: L'Oréal Brasil"} list="ent-dl" />
            <datalist id="ent-dl">{entList.map(e=><option key={e} value={e}/>)}</datalist>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"12px" }}>
          <div><label style={LBL}>Status</label>
            <select style={INP} value={f.status} onChange={e=>set("status",e.target.value)}>
              {Object.entries(STATS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div><label style={LBL}>Prioridade</label>
            <select style={INP} value={f.priority} onChange={e=>set("priority",e.target.value)}>
              {Object.entries(PRIOS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div><label style={LBL}>Prazo</label>
            <input style={INP} type="date" value={f.deadline} onChange={e=>set("deadline",e.target.value)} />
          </div>
        </div>
        <label style={LBL}>Notas</label>
        <textarea style={{...INP, height:"80px", resize:"vertical"}} value={f.notes} onChange={e=>set("notes",e.target.value)} placeholder="Contexto, links, observações..." />
        <div style={{ display:"flex", gap:"10px", marginTop:"28px" }}>
          <button onClick={()=>f.title.trim()&&onSave({...f,id:f.id||uid()})} style={{...BTNML,flex:1,padding:"12px"}}
            onMouseEnter={e=>(e.currentTarget.style.background=Yd)} onMouseLeave={e=>(e.currentTarget.style.background=Y)}>Salvar</button>
          <button onClick={onClose} style={{...BTNG,flex:1,padding:"12px"}}>Cancelar</button>
        </div>
      </Overlay>
    </>
  );
}

function LinkModal({ onSave, onClose, cats }) {
  const [f, setF]   = useState({title:"",url:"",category:cats[0]||"Arquivos",description:""});
  const [nc, setNc] = useState(""); const [addC, setAddC] = useState(false);
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const confirmNew  = () => { if(nc.trim()){ set("category",nc.trim()); setNc(""); setAddC(false); } };
  return (
    <Overlay onClose={onClose}>
      <h2 style={{ fontFamily:F_DISPLAY, fontSize:"26px", fontWeight:700, margin:"0 0 4px", color:INK }}>Novo Link</h2>
      <p style={{ margin:"0 0 20px", fontSize:"13px", color:FAINT, fontFamily:F_BODY }}>Adicione ao seu diretório</p>
      <label style={LBL}>Título</label>
      <input style={INP} value={f.title} onChange={e=>set("title",e.target.value)} placeholder="Ex: Dashboard GMV Beauty" autoFocus />
      <label style={LBL}>URL</label>
      <input style={INP} value={f.url} onChange={e=>set("url",e.target.value)} placeholder="https://..." />
      <label style={LBL}>Categoria</label>
      <div style={{ display:"flex", gap:"8px" }}>
        <select style={{...INP,flex:1}} value={f.category} onChange={e=>set("category",e.target.value)}>
          {cats.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={()=>setAddC(a=>!a)} style={{...BTNG,padding:"10px 14px",flexShrink:0}}>+ categoria</button>
      </div>
      {addC && (
        <div style={{ display:"flex", gap:"8px", marginTop:"8px" }}>
          <input style={{...INP,flex:1}} value={nc} onChange={e=>setNc(e.target.value)} placeholder="Nome da nova categoria..." onKeyDown={e=>e.key==="Enter"&&confirmNew()} />
          <button onClick={confirmNew} style={{...BTNML,padding:"10px 16px"}}
            onMouseEnter={e=>(e.currentTarget.style.background=Yd)} onMouseLeave={e=>(e.currentTarget.style.background=Y)}>OK</button>
        </div>
      )}
      <label style={LBL}>Descrição</label>
      <input style={INP} value={f.description} onChange={e=>set("description",e.target.value)} placeholder="Opcional" />
      <div style={{ display:"flex", gap:"10px", marginTop:"28px" }}>
        <button onClick={()=>f.title.trim()&&f.url.trim()&&onSave({...f,id:uid()},nc.trim()||null)} style={{...BTNML,flex:1,padding:"12px"}}
          onMouseEnter={e=>(e.currentTarget.style.background=Yd)} onMouseLeave={e=>(e.currentTarget.style.background=Y)}>Salvar</button>
        <button onClick={onClose} style={{...BTNG,flex:1,padding:"12px"}}>Cancelar</button>
      </div>
    </Overlay>
  );
}

function LinkCard({ link, onDelete }) {
  const [h, setH]               = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  return (
    <>
      {confirmDel && <Confirm msg={`Excluir "${link.title}"?`} onYes={()=>onDelete(link.id)} onNo={()=>setConfirmDel(false)} />}
      <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
        style={{ background:CARD, borderRadius:"10px", padding:"18px", border:`1px solid ${BDR}`, display:"flex", flexDirection:"column", gap:"10px", boxShadow:h?"0 4px 16px rgba(232,96,138,0.10)":"0 1px 4px rgba(42,16,32,0.04)", transition:"all 0.15s" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"8px" }}>
          <a href={link.url} target="_blank" rel="noopener noreferrer"
            style={{ fontWeight:500, fontSize:"14px", color:INK, textDecoration:"none", lineHeight:1.4, fontFamily:F_BODY }}
            onClick={e=>e.stopPropagation()}>🔗 {link.title}</a>
          <button onClick={()=>setConfirmDel(true)}
            style={{ background:"#FDEAEA", border:"1.5px solid #F0C0C0", color:"#C03030", borderRadius:"6px", padding:"4px 9px", fontSize:"11px", fontWeight:600, cursor:"pointer", fontFamily:F_BODY, flexShrink:0 }}>
            🗑 Excluir
          </button>
        </div>
        {link.description && <p style={{ fontSize:"12px", color:FAINT, margin:0, lineHeight:1.6, fontFamily:F_BODY }}>{link.description}</p>}
        {link.category && <Tag bg={P4} color={P1}>{link.category}</Tag>}
      </div>
    </>
  );
}

export default function App() {
  const [tasks, setTasks]         = useState(null);
  const [links, setLinks]         = useState(null);
  const [cats,  setCats]          = useState(null);
  const [tab,   setTab]           = useState("kanban");
  const [editTask,  setEditTask]  = useState(null);
  const [prefill,   setPrefill]   = useState(null);
  const [showTask,  setShowTask]  = useState(false);
  const [showLink,  setShowLink]  = useState(false);
  const [fType, setFType]         = useState("");
  const [fEnt,  setFEnt]         = useState("");
  const [fPrio, setFPrio]         = useState("");
  const [lq,    setLq]            = useState("");
  const [lcat,  setLcat]          = useState("");

  useEffect(()=>{
    // localStorage is synchronous — no async needed
    const t = DB.get("mst_tasks");
    const l = DB.get("mst_links");
    const c = DB.get("mst_cats");
    setTasks(t || SEED_TASKS);
    setLinks(l || SEED_LINKS);
    setCats(c  || SEED_CATS);
  },[]);

  const saveTasks = t => { setTasks(t); DB.set("mst_tasks",t); };
  const saveLinks = l => { setLinks(l); DB.set("mst_links",l); };
  const saveCats  = c => { setCats(c);  DB.set("mst_cats",c);  };

  if(!tasks||!links||!cats) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:P4, fontFamily:F_BODY }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:"44px", height:"44px", background:Y, border:`2px solid ${Yd}`, borderRadius:"12px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px", margin:"0 auto 12px" }}>◈</div>
        <div style={{ fontSize:"13px", color:FAINT }}>carregando...</div>
      </div>
    </div>
  );

  const entities = {
    projeto:[...new Set(tasks.filter(t=>t.type==="projeto").map(t=>t.entity).filter(Boolean))],
    marca:[...new Set(tasks.filter(t=>t.type==="marca").map(t=>t.entity).filter(Boolean))],
  };
  const allEnts = [...new Set(tasks.map(t=>t.entity).filter(Boolean))];
  const ovCount = tasks.filter(t=>t.status!=="done"&&isOv(t.deadline)).length;
  const tdCount = tasks.filter(t=>t.status!=="done"&&isTd(t.deadline)).length;

  const handleSaveTask  = form => { saveTasks(tasks.some(t=>t.id===form.id)?tasks.map(t=>t.id===form.id?form:t):[...tasks,form]); setShowTask(false); setEditTask(null); setPrefill(null); };
  const handleDelTask   = id   => { saveTasks(tasks.filter(t=>t.id!==id)); setShowTask(false); setEditTask(null); };
  const handleDelEntity = (name,type) => saveTasks(tasks.filter(t=>!(t.type===type&&t.entity===name)));
  const handleSaveLink  = (form,newCat) => { const nc=newCat&&!cats.includes(newCat)?[...cats,newCat]:cats; saveLinks([...links,form]); saveCats(nc); setShowLink(false); };
  const handleDelLink   = id   => saveLinks(links.filter(l=>l.id!==id));

  const openNew  = (pre=null) => { setEditTask(null); setPrefill(pre); setShowTask(true); };
  const openEdit = t => { setEditTask(t); setPrefill(null); setShowTask(true); };

  const filtered = tasks.filter(t=>(!fType||t.type===fType)&&(!fEnt||t.entity===fEnt)&&(!fPrio||t.priority===fPrio));
  const filtLinks = links.filter(l=>{
    const q=lq.toLowerCase();
    return(!lcat||l.category===lcat)&&(!q||[l.title,l.category,l.description].some(s=>s?.toLowerCase().includes(q)));
  });

  const NAV = [
    { id:"kanban",   icon:"⊞", label:"Kanban",   count:tasks.filter(t=>t.status==="doing").length },
    { id:"list",     icon:"☰", label:"Lista",    count:tasks.length },
    { id:"projetos", icon:"◆", label:"Projetos", count:entities.projeto.length },
    { id:"marcas", icon:"◇", label:"Marcas", count:entities.marca.length },
  ];
  const tabLabel = { kanban:"Kanban", list:"Lista de Tarefas", projetos:"Projetos", marcas:"Marcas", links:"Links Úteis" };

  return (
    <div style={{ minHeight:"100vh", background:P4, fontFamily:F_BODY, color:INK }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet" />

      {/* SIDEBAR */}
      <aside style={{ position:"fixed", top:0, left:0, width:SW, height:"100vh", background:CARD, borderRight:`1px solid ${BDR}`, overflowY:"auto", zIndex:50, display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"24px 20px 20px", borderBottom:`1px solid ${BDR}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:"11px" }}>
            <div style={{ width:"38px", height:"38px", background:Y, border:`2px solid ${Yd}`, borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", flexShrink:0, color:INK, fontWeight:900 }}>◈</div>
            <div>
              <div style={{ fontFamily:F_DISPLAY, fontWeight:700, fontSize:"18px", color:INK, lineHeight:1 }}>Master</div>
              <div style={{ fontSize:"9px", color:P1, fontWeight:700, letterSpacing:"1.5px", marginTop:"3px", textTransform:"uppercase" }}>Beauty · ML</div>
            </div>
          </div>
        </div>

        {(ovCount>0||tdCount>0) && (
          <div style={{ margin:"14px 14px 0", padding:"12px 14px", background:P4, borderRadius:"8px", border:`1.5px solid ${P3}` }}>
            {ovCount>0 && <div style={{ fontSize:"12px", fontWeight:600, color:"#C03030", marginBottom:tdCount>0?"5px":0 }}>⚠ {ovCount} tarefa{ovCount>1?"s":""} atrasada{ovCount>1?"s":""}</div>}
            {tdCount>0 && <div style={{ fontSize:"12px", fontWeight:600, color:"#7A5800" }}>⏰ {tdCount} vence{tdCount>1?"m":""} hoje</div>}
          </div>
        )}

        <div style={{ padding:"18px 12px 0" }}>
          <p style={{ fontSize:"10px", fontWeight:600, color:FAINT, letterSpacing:"1px", padding:"0 4px 8px", textTransform:"uppercase", margin:0 }}>Tarefas</p>
          {NAV.map(n=><NavItem key={n.id} {...n} active={tab===n.id} onClick={()=>setTab(n.id)}/>)}
          <p style={{ fontSize:"10px", fontWeight:600, color:FAINT, letterSpacing:"1px", padding:"20px 4px 8px", textTransform:"uppercase", margin:0 }}>Diretório</p>
          <NavItem icon="🔗" label="Links Úteis" active={tab==="links"} onClick={()=>setTab("links")} count={links.length} />
        </div>

        <div style={{ marginTop:"auto", padding:"20px 14px 24px" }}>
          <div style={{ background:P5, borderRadius:"10px", padding:"16px", border:`1px solid ${BDR}` }}>
            <p style={{ fontSize:"10px", fontWeight:600, color:FAINT, letterSpacing:"1px", textTransform:"uppercase", margin:"0 0 12px" }}>Resumo</p>
            {SCOLS.map(s=>{
              const n=tasks.filter(t=>t.status===s).length;
              return <div key={s} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
                <span style={{ display:"flex", alignItems:"center", gap:"7px", fontSize:"12px", color:MUTED }}>
                  <span style={{ width:"7px", height:"7px", borderRadius:"50%", background:SM[s].dot, display:"inline-block" }}/>
                  {STATS[s]}
                </span>
                <span style={{ fontWeight:600, fontSize:"13px", color:INK }}>{n}</span>
              </div>;
            })}
            <div style={{ height:"1px", background:BDR, margin:"10px 0" }}/>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"7px" }}>
              <span style={{ fontSize:"12px", color:MUTED }}>Projetos</span>
              <Tag bg={Yp} color="#7A5800">{entities.projeto.length}</Tag>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:"12px", color:MUTED }}>Marcas</span>
              <Tag bg={P4} color={P1}>{entities.marca.length}</Tag>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ marginLeft:SW }}>
        <header style={{ background:CARD, borderBottom:`1px solid ${BDR}`, padding:"0 32px", height:"60px", display:"flex", alignItems:"center", gap:"14px", position:"sticky", top:0, zIndex:40, boxShadow:"0 1px 6px rgba(232,96,138,0.07)" }}>
          <h2 style={{ fontFamily:F_DISPLAY, fontSize:"22px", fontWeight:700, margin:0, color:INK, letterSpacing:"-0.3px", flexShrink:0 }}>{tabLabel[tab]}</h2>

          {(tab==="kanban"||tab==="list") && (
            <div style={{ display:"flex", gap:"8px", marginLeft:"8px" }}>
              <select style={{...INP,width:"auto",padding:"6px 10px",fontSize:"12px"}} value={fType} onChange={e=>setFType(e.target.value)}>
                <option value="">Todos os tipos</option>
                <option value="projeto">Projetos</option>
                <option value="marca">Marcas</option>
              </select>
              <select style={{...INP,width:"auto",padding:"6px 10px",fontSize:"12px"}} value={fEnt} onChange={e=>setFEnt(e.target.value)}>
                <option value="">Todas as entidades</option>
                {allEnts.map(e=><option key={e} value={e}>{e}</option>)}
              </select>
              <select style={{...INP,width:"auto",padding:"6px 10px",fontSize:"12px"}} value={fPrio} onChange={e=>setFPrio(e.target.value)}>
                <option value="">Todas as prioridades</option>
                {Object.entries(PRIOS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          )}
          {tab==="links" && (
            <div style={{ display:"flex", gap:"8px", marginLeft:"8px" }}>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:"10px", top:"50%", transform:"translateY(-50%)", color:FAINT, fontSize:"13px", pointerEvents:"none" }}>🔍</span>
                <input style={{...INP,width:"190px",padding:"6px 10px 6px 30px"}} placeholder="Buscar..." value={lq} onChange={e=>setLq(e.target.value)} />
              </div>
              <select style={{...INP,width:"auto",padding:"6px 10px",fontSize:"12px"}} value={lcat} onChange={e=>setLcat(e.target.value)}>
                <option value="">Todas as categorias</option>
                {cats.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          <div style={{ marginLeft:"auto" }}>
            {tab!=="links"
              ? <button onClick={()=>openNew()} style={BTNML} onMouseEnter={e=>(e.currentTarget.style.background=Yd)} onMouseLeave={e=>(e.currentTarget.style.background=Y)}>+ Nova Tarefa</button>
              : <button onClick={()=>setShowLink(true)} style={BTNPK} onMouseEnter={e=>(e.currentTarget.style.background=P2)} onMouseLeave={e=>(e.currentTarget.style.background=P1)}>+ Novo Link</button>
            }
          </div>
        </header>

        <main style={{ padding:"28px 32px" }}>
          {tab==="kanban" && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"16px", alignItems:"start" }}>
              {SCOLS.map(status=>{
                const col=filtered.filter(t=>t.status===status), m=SM[status];
                return (
                  <div key={status} style={{ background:m.bg, borderRadius:"12px", padding:"18px", border:`1px solid ${m.bdr}` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"9px", marginBottom:"16px" }}>
                      <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:m.dot }}/>
                      <span style={{ fontWeight:600, fontSize:"13px", color:INK }}>{STATS[status]}</span>
                      <Tag bg={m.badge} color={m.btxt} size={11}>{col.length}</Tag>
                    </div>
                    {col.map(t=><TaskCard key={t.id} task={t} onEdit={openEdit}/>)}
                    {col.length===0 && <div style={{ textAlign:"center", color:FAINT, fontSize:"13px", padding:"28px 0" }}>Vazio</div>}
                  </div>
                );
              })}
            </div>
          )}

          {tab==="list" && (
            <div style={{ background:CARD, borderRadius:"12px", overflow:"hidden", border:`1px solid ${BDR}`, boxShadow:"0 1px 6px rgba(232,96,138,0.06)" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px", fontFamily:F_BODY }}>
                <thead>
                  <tr style={{ background:P5, borderBottom:`1px solid ${BDR}` }}>
                    {["Tarefa","Tipo","Entidade","Prazo","Status","Prioridade"].map(h=>(
                      <th key={h} style={{ padding:"12px 18px", textAlign:"left", fontWeight:600, color:FAINT, fontSize:"10px", textTransform:"uppercase", letterSpacing:"0.8px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t=>{
                    const ov=t.status!=="done"&&isOv(t.deadline), ttd=t.status!=="done"&&isTd(t.deadline);
                    const p=PRIOS[t.priority], m=SM[t.status];
                    return (
                      <tr key={t.id} onClick={()=>openEdit(t)}
                        style={{ borderBottom:`1px solid ${BDR}`, cursor:"pointer", background:ov?"#FDF5F5":ttd?Yp:CARD, transition:"background 0.1s" }}
                        onMouseEnter={e=>{ if(!ov&&!ttd) e.currentTarget.style.background=P5; }}
                        onMouseLeave={e=>{ e.currentTarget.style.background=ov?"#FDF5F5":ttd?Yp:CARD; }}>
                        <td style={{ padding:"14px 18px", fontWeight:500, color:INK }}>
                          {ov && <span style={{ color:"#C03030", marginRight:"5px", fontSize:"10px" }}>⚠</span>}
                          {ttd && <span style={{ background:Y, fontSize:"10px", borderRadius:"3px", padding:"1px 6px", marginRight:"6px", fontWeight:700, color:INK }}>⏰</span>}
                          {t.title}
                        </td>
                        <td style={{ padding:"14px 18px" }}><Tag bg={t.type==="projeto"?Yp:P4} color={t.type==="projeto"?"#7A5800":P1}>{t.type==="projeto"?"Projeto":"Marca"}</Tag></td>
                        <td style={{ padding:"14px 18px", color:MUTED }}>{t.entity||"—"}</td>
                        <td style={{ padding:"14px 18px", color:ov?"#C03030":FAINT, fontWeight:ov?600:400 }}>{fmt(t.deadline)}</td>
                        <td style={{ padding:"14px 18px" }}><Tag bg={m.badge} color={m.btxt}>{STATS[t.status]}</Tag></td>
                        <td style={{ padding:"14px 18px" }}><Tag bg={p.bg} color={p.c}>{p.label}</Tag></td>
                      </tr>
                    );
                  })}
                  {filtered.length===0 && <tr><td colSpan={6} style={{ padding:"60px", textAlign:"center", color:FAINT }}>Nenhuma tarefa encontrada</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {(tab==="projetos"||tab==="marcas") && (()=>{
            const type=tab==="projetos"?"projeto":"marca";
            const ents=entities[type];
            return (
              <div>
                {ents.length===0 && (
                  <div style={{ textAlign:"center", padding:"80px 0", color:FAINT, fontSize:"14px" }}>
                    Nenhum {type} cadastrado ainda.{" "}
                    <span style={{ color:P1, cursor:"pointer", fontWeight:600, borderBottom:`1.5px solid ${P3}`, paddingBottom:"1px" }} onClick={()=>openNew({type})}>Criar tarefa</span>
                  </div>
                )}
                {ents.map(name=>(
                  <EntityCard key={name} name={name} type={type}
                    tasks={tasks.filter(t=>t.type===type&&t.entity===name)}
                    onEditTask={openEdit} onNewTask={openNew} onDeleteEntity={handleDelEntity} />
                ))}
              </div>
            );
          })()}

          {tab==="links" && (()=>{
            const activeCats=[...new Set(filtLinks.map(l=>l.category||"Sem categoria"))];
            if(activeCats.length===0) return <div style={{ textAlign:"center", color:FAINT, padding:"80px 0" }}>Nenhum link encontrado</div>;
            return activeCats.map(cat=>{
              const catLinks=filtLinks.filter(l=>(l.category||"Sem categoria")===cat);
              return (
                <div key={cat} style={{ marginBottom:"36px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"16px" }}>
                    <h3 style={{ fontFamily:F_DISPLAY, fontSize:"19px", fontWeight:600, color:MUTED, margin:0 }}>{cat}</h3>
                    <div style={{ flex:1, height:"1px", background:BDR }}/>
                    <span style={{ fontSize:"11px", color:FAINT, fontWeight:500 }}>{catLinks.length} link{catLinks.length!==1?"s":""}</span>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:"14px" }}>
                    {catLinks.map(l=><LinkCard key={l.id} link={l} onDelete={handleDelLink}/>)}
                  </div>
                </div>
              );
            });
          })()}
        </main>
      </div>

      {showTask && <TaskModal task={editTask} prefill={prefill} entities={entities} onSave={handleSaveTask} onDelete={handleDelTask} onClose={()=>{ setShowTask(false); setEditTask(null); setPrefill(null); }}/>}
      {showLink && <LinkModal cats={cats} onSave={handleSaveLink} onClose={()=>setShowLink(false)}/>}
    </div>
  );
}
