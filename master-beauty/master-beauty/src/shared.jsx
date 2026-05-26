import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

export { useState, useEffect, useRef, useMemo, useCallback };

// --- Decorative inline SVGs ---

export const DecoSun = ({ size = 80, color = "#e0a234", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" style={style}>
    <circle cx="40" cy="40" r="14" fill={color} stroke="#2a1f17" strokeWidth="2"/>
    {[...Array(12)].map((_, i) => {
      const a = (i * Math.PI * 2) / 12;
      const x1 = 40 + Math.cos(a) * 20;
      const y1 = 40 + Math.sin(a) * 20;
      const x2 = 40 + Math.cos(a) * 32;
      const y2 = 40 + Math.sin(a) * 32;
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2a1f17" strokeWidth="2" strokeLinecap="round"/>;
    })}
  </svg>
);

export const DecoFlower = ({ size = 60, color = "#efb7ad", center = "#e0a234", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" style={style}>
    {[0, 60, 120, 180, 240, 300].map((rot) => (
      <ellipse key={rot} cx="30" cy="14" rx="7" ry="11" fill={color} stroke="#2a1f17" strokeWidth="1.5" transform={`rotate(${rot} 30 30)`}/>
    ))}
    <circle cx="30" cy="30" r="6" fill={center} stroke="#2a1f17" strokeWidth="1.5"/>
  </svg>
);

export const DecoStar = ({ size = 30, color = "#2c5b9b", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 30 30" style={style}>
    <path d="M15 2 L17 13 L28 15 L17 17 L15 28 L13 17 L2 15 L13 13 Z" fill={color} stroke="#2a1f17" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

export const DecoSquiggle = ({ width = 80, color = "#c84a3a", style = {} }) => (
  <svg width={width} height="16" viewBox="0 0 80 16" style={style}>
    <path d="M2 8 Q 10 0, 18 8 T 34 8 T 50 8 T 66 8 T 78 8" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

export const DecoCheckered = ({ size = 60, color = "#6e7d3a", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" style={style}>
    <rect width="60" height="60" fill="#fdf8ec" stroke="#2a1f17" strokeWidth="1.5"/>
    {[0,1,2,3,4,5].map(r =>
      [0,1,2,3,4,5].map(c => (
        ((r+c)%2===0) ? <rect key={`${r}-${c}`} x={c*10} y={r*10} width="10" height="10" fill={color}/> : null
      ))
    )}
  </svg>
);

// --- Small reusable UI primitives ---

export function Card({ children, tilt, className = "", style }) {
  const t = tilt === "l" ? "tilt-l" : tilt === "r" ? "tilt-r" : "";
  return <div className={`card ${t} ${className}`} style={style}>{children}</div>;
}

export function CardHeader({ title, hand, action }) {
  return (
    <div className="card-h">
      <div>
        <h3>{title}</h3>
        {hand && <div className="hand-label">{hand}</div>}
      </div>
      {action}
    </div>
  );
}

export function Sticker({ children, color = "mustard", rotate = -3, top, left, right, bottom }) {
  const bg = {
    mustard: "var(--mustard-soft)",
    terracotta: "var(--terracotta)",
    olive: "var(--olive)",
    rose: "var(--rose)",
    blue: "var(--sky)",
  }[color] || color;
  return (
    <span className="sticker" style={{
      background: bg,
      transform: `rotate(${rotate}deg)`,
      top, left, right, bottom,
    }}>{children}</span>
  );
}

export function Task({ task, onToggle }) {
  return (
    <label className={`task ${task.done ? "done" : ""}`}>
      <input type="checkbox" className="check" checked={task.done} onChange={() => onToggle(task.id)} />
      <span className="label">{task.label}</span>
      {task.due && <span className="due">{task.due}</span>}
    </label>
  );
}

export function Chip({ children, color }) {
  return <span className={`chip ${color || ""}`}>{children}</span>;
}

export function BigStat({ value, label, color, hand }) {
  return (
    <div>
      <div className={`bignum ${color || ""}`}>{value}</div>
      <div className="hand" style={{ marginTop: 2 }}>{hand || label}</div>
    </div>
  );
}

export function Bar({ label, value, max = 100, color = "var(--terracotta)" }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="bar-row">
      <div>
        <div style={{ fontWeight: 500 }}>{label}</div>
        <div className="bar-track" style={{ marginTop: 4 }}>
          <div className="bar-fill" style={{ width: `${pct}%`, background: color }}></div>
        </div>
      </div>
      <div className="tright" style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
        {value} / {max}
      </div>
    </div>
  );
}

export function useLocalState(key, initial) {
  const [v, setV] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initial;
    } catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  }, [key, v]);
  return [v, setV];
}

export const MONTHS_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
export const DAYS_PT_SHORT = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
export const DAYS_PT = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];

export function formatBRL(n) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function InlineEdit({ value, onChange, placeholder = "...", style, multiline = false, className = "" }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const commit = () => { onChange(draft); setEditing(false); };
  const cancel = () => { setDraft(value); setEditing(false); };
  if (editing) {
    const Tag = multiline ? "textarea" : "input";
    return (
      <Tag autoFocus value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !multiline) commit();
          if (e.key === "Escape") cancel();
        }}
        placeholder={placeholder}
        className={className}
        style={{
          border: "1.5px dashed var(--ink)",
          background: "var(--paper)",
          padding: "2px 6px",
          borderRadius: 6,
          font: "inherit",
          color: "inherit",
          minWidth: 40,
          width: multiline ? "100%" : "auto",
          ...style,
        }} />
    );
  }
  return (
    <span onClick={() => setEditing(true)}
      className={className}
      style={{ cursor: "text", borderBottom: "1px dashed transparent", ...style }}
      onMouseEnter={(e) => e.currentTarget.style.borderBottomColor = "rgba(42,31,23,0.3)"}
      onMouseLeave={(e) => e.currentTarget.style.borderBottomColor = "transparent"}
      title="clique pra editar">
      {value || <span style={{ color: "var(--ink-mute)", fontStyle: "italic" }}>{placeholder}</span>}
    </span>
  );
}

export function DeleteBtn({ onClick, title = "remover" }) {
  return (
    <button onClick={onClick} title={title}
      style={{
        width: 20, height: 20, border: "1.5px solid var(--ink)",
        background: "var(--paper)", borderRadius: 4,
        display: "inline-grid", placeItems: "center",
        fontSize: 11, lineHeight: 1, cursor: "pointer", color: "var(--ink-soft)",
        padding: 0, flexShrink: 0,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--terracotta)"; e.currentTarget.style.color = "var(--paper)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "var(--paper)"; e.currentTarget.style.color = "var(--ink-soft)"; }}>
      ×
    </button>
  );
}

export function AddRow({ onAdd, placeholder = "+ adicionar...", buttonLabel = "add", buttonClass = "olive" }) {
  const [v, setV] = useState("");
  const submit = () => {
    if (!v.trim()) return;
    onAdd(v.trim());
    setV("");
  };
  return (
    <div className="row" style={{ gap: 6, marginTop: 10 }}>
      <input className="input" placeholder={placeholder} value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()} />
      <button className={`btn ${buttonClass} sm`} onClick={submit}>{buttonLabel}</button>
    </div>
  );
}

export function EditChip({ chip, onChange, onDelete }) {
  const bgMap = {
    cream: "var(--cream-deep)",
    terracotta: "var(--terracotta)",
    olive: "var(--olive)",
    blue: "var(--blue)",
    rose: "var(--rose)",
    mustard: "var(--mustard)",
  };
  const fg = ["terracotta","olive","blue"].includes(chip.color) ? "var(--paper)" : "var(--ink)";
  return (
    <span className="chip" style={{
      background: bgMap[chip.color] || "var(--cream-deep)",
      color: fg,
      position: "relative",
      paddingRight: 22,
    }}>
      <InlineEdit value={chip.text} onChange={(t) => onChange({ ...chip, text: t })} />
      <button onClick={onDelete} title="remover"
        style={{
          position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)",
          width: 14, height: 14, borderRadius: "50%",
          border: "none", background: "rgba(0,0,0,0.15)",
          color: "inherit", fontSize: 10, lineHeight: 1, cursor: "pointer", padding: 0,
        }}>×</button>
    </span>
  );
}

export function AddChipBtn({ onAdd }) {
  return (
    <button onClick={onAdd} className="chip"
      style={{ background: "transparent", borderStyle: "dashed", cursor: "pointer", color: "var(--ink-soft)" }}>
      + chip
    </button>
  );
}
