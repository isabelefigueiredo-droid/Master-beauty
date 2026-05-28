import React, { useState } from 'react';
import { useLocalState } from './shared.jsx';
import Icons from './icons.jsx';
import { MHB } from './data.js';

const I = Icons;

const STAGES = ["Not initiated", "Negotiation", "Setup", "3P Go Live", "Onboarded"];

const STAGE_CLASS = {
  "Not initiated": "stage-not",
  "Negotiation":   "stage-neg",
  "Setup":         "stage-set",
  "3P Go Live":    "stage-go",
  "Onboarded":     "stage-on",
};

function fmtBRL(n) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function SegmentSelect({ value, options, onChange, onAdd }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const commit = () => {
    const v = draft.trim();
    if (v) { onAdd(v); onChange(v); }
    setDraft(""); setAdding(false);
  };
  if (adding) return (
    <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="novo segmento"
      style={{ fontSize: 11, padding: "3px 8px", border: "1px solid var(--bd-2)", borderRadius: 8, background: "var(--bg)", color: "var(--text)", fontFamily: "inherit", width: 120 }}
      onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setDraft(""); setAdding(false); } }}
      onBlur={commit} />
  );
  return (
    <select value={value || ""} onChange={(e) => e.target.value === "__add__" ? setAdding(true) : onChange(e.target.value)}
      style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999, border: "1px solid var(--bd-2)", background: "var(--surface-2)", color: "var(--text-2)", fontFamily: "inherit", cursor: "pointer" }}>
      <option value="">— segmento —</option>
      {options.map((s) => <option key={s} value={s}>{s}</option>)}
      <option value="__add__">＋ novo segmento</option>
    </select>
  );
}

/* ── Kanban card ────────────────────────────────────────── */
function PipeCard({ brand, onUpdate, onDelete, onDragStart, onDragOver, onDrop, segmentOptions, onAddSegment }) {
  const [expanded, setExpanded] = useState(false);
  const [dragging, setDragging] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => { setDragging(true); onDragStart(e); }}
      onDragEnd={() => setDragging(false)}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={"pipe-pcard" + (dragging ? " dragging" : "")}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }} onClick={() => setExpanded((x) => !x)}>
        <div className="pipe-pcard-name" style={{ flex: 1 }}>{brand.name}</div>
        <span style={{ color: "var(--text-4)", fontSize: 11 }}>{expanded ? "▲" : "▼"}</span>
      </div>

      <div className="pipe-pcard-meta">
        {brand.segment && <span className="tag">{brand.segment}</span>}
        <span className="tag" style={{ background: "transparent", color: "var(--text-4)", border: "1px solid var(--bd)" }}>{brand.sellerOrBrand}</span>
      </div>

      {!expanded && (
        <div style={{ fontSize: 11.5, color: "var(--text-4)", marginTop: 8 }}>
          {fmtBRL(brand.gmvMonth)}/mês · {fmtBRL(brand.gmvYear)}/ano
        </div>
      )}

      {expanded && (
        <div style={{ marginTop: 12, borderTop: "1px solid var(--bd)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
            <div>
              <div style={{ color: "var(--text-4)", fontWeight: 600, marginBottom: 2 }}>Seller / Brand</div>
              <select value={brand.sellerOrBrand} onChange={(e) => onUpdate({ sellerOrBrand: e.target.value })}
                style={{ fontSize: 12, padding: "3px 8px", border: "1px solid var(--bd)", borderRadius: 8, background: "var(--bg)", color: "var(--text)", fontFamily: "inherit" }}>
                <option value="Brand">Brand</option>
                <option value="Seller">Seller</option>
              </select>
            </div>
            <div>
              <div style={{ color: "var(--text-4)", fontWeight: 600, marginBottom: 2 }}>Segmento</div>
              <SegmentSelect value={brand.segment} options={segmentOptions} onChange={(v) => onUpdate({ segment: v })} onAdd={onAddSegment} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
            <div>
              <div style={{ color: "var(--text-4)", fontWeight: 600, marginBottom: 2 }}>GMV/mês</div>
              <input type="number" value={brand.gmvMonth}
                onChange={(e) => onUpdate({ gmvMonth: +e.target.value })}
                style={{ fontSize: 12, padding: "4px 8px", border: "1px solid var(--bd)", borderRadius: 8, background: "var(--bg)", color: "var(--text)", width: "100%", fontFamily: "inherit" }} />
            </div>
            <div>
              <div style={{ color: "var(--text-4)", fontWeight: 600, marginBottom: 2 }}>GMV/ano</div>
              <input type="number" value={brand.gmvYear}
                onChange={(e) => onUpdate({ gmvYear: +e.target.value })}
                style={{ fontSize: 12, padding: "4px 8px", border: "1px solid var(--bd)", borderRadius: 8, background: "var(--bg)", color: "var(--text)", width: "100%", fontFamily: "inherit" }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, fontSize: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
              <input type="checkbox" checked={brand.tiktok} onChange={(e) => onUpdate({ tiktok: e.target.checked })} />
              TikTok Shop
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
              <input type="checkbox" checked={brand.shoppee} onChange={(e) => onUpdate({ shoppee: e.target.checked })} />
              Shopee
            </label>
          </div>

          {brand.notes !== undefined && (
            <div>
              <div style={{ color: "var(--text-4)", fontWeight: 600, fontSize: 11, marginBottom: 3 }}>Notas</div>
              <textarea value={brand.notes} onChange={(e) => onUpdate({ notes: e.target.value })}
                style={{ width: "100%", minHeight: 52, fontSize: 12, padding: "6px 8px", border: "1px solid var(--bd)", borderRadius: 8, background: "var(--bg)", color: "var(--text)", resize: "vertical", fontFamily: "inherit" }} />
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={onDelete} style={{ fontSize: 11.5, color: "var(--crit)", fontWeight: 600, padding: "4px 10px", border: "1px solid var(--bd)", borderRadius: 8 }}>
              Remover
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Stage column ───────────────────────────────────────── */
function StageCol({ stage, brands, onUpdate, onDelete, onDragStart, onDropOnCard, onDropOnCol, segmentOptions, onAddSegment }) {
  return (
    <div className="pipe-col"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); onDropOnCol(stage); }}>
      <div className="pipe-col-head">
        <span className={"stage-badge " + STAGE_CLASS[stage]}>{stage}</span>
        <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "var(--text-4)" }}>{brands.length}</span>
      </div>
      <div className="pipe-col-body">
        {brands.map((b) => (
          <PipeCard key={b.id} brand={b}
            onUpdate={(patch) => onUpdate(b.id, patch)}
            onDelete={() => onDelete(b.id)}
            onDragStart={(e) => { e.dataTransfer.setData("brandId", b.id); onDragStart(b.id); }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); onDropOnCard(e.dataTransfer.getData("brandId"), b.id); }}
            segmentOptions={segmentOptions}
            onAddSegment={onAddSegment} />
        ))}
      </div>
    </div>
  );
}

/* ── Table view ─────────────────────────────────────────── */
function PipeTable({ brands, onUpdate, onDelete, segmentOptions, onAddSegment }) {
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState(1);

  const toggle = (k) => { if (sortKey === k) setSortDir((d) => -d); else { setSortKey(k); setSortDir(1); } };
  const sorted = [...brands].sort((a, b) => {
    const av = a[sortKey] ?? ""; const bv = b[sortKey] ?? "";
    return (av < bv ? -1 : av > bv ? 1 : 0) * sortDir;
  });
  const Th = ({ k, children }) => (
    <th onClick={() => toggle(k)} style={{ cursor: "pointer" }}>
      {children} {sortKey === k ? (sortDir === 1 ? " ↑" : " ↓") : ""}
    </th>
  );

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="pipe-table">
        <thead>
          <tr>
            <Th k="name">Marca</Th>
            <Th k="stage">Estágio</Th>
            <Th k="segment">Segmento</Th>
            <Th k="sellerOrBrand">Tipo</Th>
            <Th k="gmvMonth">GMV/mês</Th>
            <Th k="gmvYear">GMV/ano</Th>
            <th>TikTok</th>
            <th>Shopee</th>
            <th>Notas</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((b) => (
            <tr key={b.id}>
              <td style={{ fontWeight: 700, minWidth: 140 }}>
                <input value={b.name} onChange={(e) => onUpdate(b.id, { name: e.target.value })}
                  style={{ border: "none", background: "transparent", fontFamily: "inherit", fontSize: "inherit", fontWeight: 700, color: "var(--text)", width: "100%", outline: "none" }} />
              </td>
              <td>
                <select value={b.stage} onChange={(e) => onUpdate(b.id, { stage: e.target.value })}
                  style={{ fontSize: 12, padding: "3px 8px", borderRadius: 999, border: "1px solid var(--bd)", background: "var(--surface-2)", color: "var(--text-2)", fontFamily: "inherit" }}>
                  {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td><SegmentSelect value={b.segment} options={segmentOptions} onChange={(v) => onUpdate(b.id, { segment: v })} onAdd={onAddSegment} /></td>
              <td>
                <select value={b.sellerOrBrand} onChange={(e) => onUpdate(b.id, { sellerOrBrand: e.target.value })}
                  style={{ fontSize: 12, padding: "3px 8px", borderRadius: 999, border: "1px solid var(--bd)", background: "var(--surface-2)", color: "var(--text-2)", fontFamily: "inherit" }}>
                  <option value="Brand">Brand</option>
                  <option value="Seller">Seller</option>
                </select>
              </td>
              <td className="mono" style={{ whiteSpace: "nowrap" }}>
                <input type="number" value={b.gmvMonth} onChange={(e) => onUpdate(b.id, { gmvMonth: +e.target.value })}
                  style={{ border: "none", background: "transparent", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text)", width: 90, outline: "none" }} />
              </td>
              <td className="mono" style={{ whiteSpace: "nowrap" }}>
                <input type="number" value={b.gmvYear} onChange={(e) => onUpdate(b.id, { gmvYear: +e.target.value })}
                  style={{ border: "none", background: "transparent", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text)", width: 110, outline: "none" }} />
              </td>
              <td style={{ textAlign: "center" }}><input type="checkbox" checked={b.tiktok} onChange={(e) => onUpdate(b.id, { tiktok: e.target.checked })} /></td>
              <td style={{ textAlign: "center" }}><input type="checkbox" checked={b.shoppee} onChange={(e) => onUpdate(b.id, { shoppee: e.target.checked })} /></td>
              <td style={{ maxWidth: 200 }}>
                <input value={b.notes || ""} onChange={(e) => onUpdate(b.id, { notes: e.target.value })}
                  placeholder="notas…"
                  style={{ border: "none", background: "transparent", fontFamily: "inherit", fontSize: 12, color: "var(--text-3)", width: "100%", outline: "none" }} />
              </td>
              <td>
                <button onClick={() => onDelete(b.id)} style={{ color: "var(--crit)", fontSize: 16, lineHeight: 1 }}>×</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Tab Pipeline ───────────────────────────────────────── */
export default function TabPipeline() {
  const [brands, setBrands] = useLocalState("mhb_pipeline", MHB.pipeline);
  const [segments, setSegments] = useLocalState("mhb_segments", ["Skincare", "Maquiagem", "Haircare", "Perfumaria", "Dermocosméticos", "Corpo & Banho"]);
  const [view, setView] = useState("kanban");
  const [dragId, setDragId] = useState(null);

  const update = (id, patch) => setBrands((bs) => bs.map((b) => b.id === id ? { ...b, ...patch } : b));
  const remove = (id) => setBrands((bs) => bs.filter((b) => b.id !== id));
  const addBrand = () => {
    const nb = { id: "p" + Date.now(), name: "Nova marca", stage: "Not initiated", segment: "", sellerOrBrand: "Brand", gmvMonth: 0, gmvYear: 0, tiktok: false, shoppee: false, notes: "" };
    setBrands((bs) => [nb, ...bs]);
  };
  const addSegment = (seg) => { if (!segments.includes(seg)) setSegments((ss) => [...ss, seg].sort()); };

  const dropOnCard = (srcId, tgtId) => {
    if (srcId === tgtId) return;
    setBrands((bs) => {
      const src = bs.find((b) => b.id === srcId);
      const tgtIdx = bs.findIndex((b) => b.id === tgtId);
      const rest = bs.filter((b) => b.id !== srcId);
      rest.splice(tgtIdx, 0, src);
      return rest;
    });
  };
  const dropOnCol = (stage) => {
    if (!dragId) return;
    setBrands((bs) => bs.map((b) => b.id === dragId ? { ...b, stage } : b));
    setDragId(null);
  };

  const exportCSV = () => {
    const h = ["Nome", "Estágio", "Segmento", "Tipo", "GMV Mês", "GMV Ano", "TikTok", "Shopee", "Notas"];
    const rows = brands.map((b) => [b.name, b.stage, b.segment, b.sellerOrBrand, b.gmvMonth, b.gmvYear, b.tiktok ? "Sim" : "Não", b.shoppee ? "Sim" : "Não", b.notes || ""].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csv = [h.join(","), ...rows].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    a.download = "pipeline-hunting-beauty.csv";
    a.click();
  };

  const totalGMV = brands.reduce((s, b) => s + (b.gmvYear || 0), 0);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.025em" }}>Pipeline Hunting Beauty</div>
          <div style={{ fontSize: 13, color: "var(--text-4)", marginTop: 2 }}>
            <b style={{ color: "var(--text)" }}>{brands.length}</b> marcas · GMV/ano potencial:{" "}
            <b style={{ color: "var(--text)" }}>{fmtBRL(totalGMV)}</b>
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setView("kanban")}
            style={{ display: "flex", alignItems: "center", gap: 6, height: 34, padding: "0 12px", borderRadius: 9, border: "1px solid var(--bd)", background: view === "kanban" ? "var(--text)" : "var(--surface)", color: view === "kanban" ? "var(--bg)" : "var(--text-3)", fontWeight: 600, fontSize: 13 }}>
            <I.grid size={15} /> Kanban
          </button>
          <button onClick={() => setView("table")}
            style={{ display: "flex", alignItems: "center", gap: 6, height: 34, padding: "0 12px", borderRadius: 9, border: "1px solid var(--bd)", background: view === "table" ? "var(--text)" : "var(--surface)", color: view === "table" ? "var(--bg)" : "var(--text-3)", fontWeight: 600, fontSize: 13 }}>
            <I.table size={15} /> Tabela
          </button>
          <button onClick={exportCSV}
            style={{ display: "flex", alignItems: "center", gap: 6, height: 34, padding: "0 12px", borderRadius: 9, border: "1px solid var(--bd)", background: "var(--surface)", color: "var(--text-3)", fontWeight: 600, fontSize: 13 }}>
            <I.filePresent size={15} /> Exportar CSV
          </button>
          <a href="https://meli.lightning.force.com/lightning/page/home" target="_blank" rel="noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 6, height: 34, padding: "0 12px", borderRadius: 9, border: "1px solid var(--bd)", background: "var(--surface)", color: "var(--text-3)", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
            Salesforce →
          </a>
          <button onClick={addBrand}
            style={{ display: "flex", alignItems: "center", gap: 6, height: 34, padding: "0 14px", borderRadius: 9, background: "var(--accent)", color: "var(--on-accent)", fontWeight: 700, fontSize: 13 }}>
            <I.plus size={15} /> Adicionar
          </button>
        </div>
      </div>

      {view === "kanban" ? (
        <div className="pipe-board">
          {STAGES.map((stage) => (
            <StageCol key={stage} stage={stage}
              brands={brands.filter((b) => b.stage === stage)}
              onUpdate={update}
              onDelete={remove}
              onDragStart={(id) => setDragId(id)}
              onDropOnCard={dropOnCard}
              onDropOnCol={dropOnCol}
              segmentOptions={segments}
              onAddSegment={addSegment} />
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="body" style={{ padding: 0, overflowX: "auto" }}>
            <PipeTable brands={brands} onUpdate={update} onDelete={remove} segmentOptions={segments} onAddSegment={addSegment} />
          </div>
        </div>
      )}
    </div>
  );
}
