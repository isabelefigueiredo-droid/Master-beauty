import React, { useState } from 'react';
import { useLocalState } from './shared.jsx';
import { MHB } from './data.js';

const VERTICALS = ["Todos", "BEAUTY", "FASHION", "CPG", "FURNISHING & HOUSEWARE", "SPORTS", "CONSTRUCTION & INDUSTRY", "VEHICLE PARTS & ACCESSORIES", "T & B"];
const STAGES    = ["Todos", "Not initiated", "Negotiation", "Setup", "3P Go Live", "Onboarded"];
const STAGE_COLOR = {
  "Not initiated": { bg: "var(--surface-2)", color: "var(--text-3)" },
  "Negotiation":   { bg: "#FFF3CD",          color: "#856404" },
  "Setup":         { bg: "#CCE5FF",          color: "#004085" },
  "3P Go Live":    { bg: "#D4EDDA",          color: "#155724" },
  "Onboarded":     { bg: "var(--ok)",        color: "#fff" },
};

function StageBadge({ stage }) {
  const s = STAGE_COLOR[stage] || { bg: "var(--surface-2)", color: "var(--text-3)" };
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>
      {stage || "—"}
    </span>
  );
}

function BoolChip({ value }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: value ? "var(--ok)" : "var(--surface-2)", color: value ? "#fff" : "var(--text-4)" }}>
      {value ? "Sim" : "Não"}
    </span>
  );
}

function CopyCell({ value }) {
  const [copied, setCopied] = useState(false);
  if (!value) return <span style={{ color: "var(--text-4)", fontSize: 12 }}>—</span>;
  const copy = () => { navigator.clipboard?.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <span onClick={copy} title="Clique para copiar"
      style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-3)", cursor: "pointer", borderBottom: "1px dashed var(--bd-2)", whiteSpace: "nowrap" }}>
      {copied ? "✓ copiado" : value}
    </span>
  );
}

export default function TabResultados() {
  const [rows, setRows]             = useLocalState("mhb_resultados_v2", MHB.resultados);
  const [sortKey, setSortKey]       = useState("huntingName");
  const [sortDir, setSortDir]       = useState(1);
  const [filterVertical, setFilterVertical] = useState("Todos");
  const [filterStage, setFilterStage]       = useState("Todos");
  const [search, setSearch]         = useState("");
  const [exportMsg, setExportMsg]   = useState("");

  const toggle = (k) => {
    if (sortKey === k) setSortDir((d) => -d);
    else { setSortKey(k); setSortDir(1); }
  };

  const Th = ({ k, children, align }) => (
    <th onClick={() => toggle(k)}
      style={{ cursor: "pointer", textAlign: align || "left", userSelect: "none", whiteSpace: "nowrap" }}>
      {children}{sortKey === k ? (sortDir === 1 ? " ↑" : " ↓") : ""}
    </th>
  );

  const filtered = rows
    .filter((r) => filterVertical === "Todos" || r.verticalSf === filterVertical)
    .filter((r) => filterStage   === "Todos" || r.huntingStage === filterStage)
    .filter((r) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return r.huntingName.toLowerCase().includes(q)
          || r.cusCustId.includes(q)
          || r.officialStoreId.includes(q)
          || r.huntingId.toLowerCase().includes(q)
          || r.hunterName.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const av = a[sortKey] ?? ""; const bv = b[sortKey] ?? "";
      return (av < bv ? -1 : av > bv ? 1 : 0) * sortDir;
    });

  const onboarded  = rows.filter((r) => r.huntingStage === "Onboarded").length;
  const goLive     = rows.filter((r) => r.huntingStage === "3P Go Live").length;
  const inProgress = rows.filter((r) => !["Onboarded", "Not initiated"].includes(r.huntingStage)).length;

  const exportCSV = () => {
    const h = ["SIT_SITE_ID","HUNTING_ID","HUNTING_NAME","CUS_CUST_ID","OFFICIAL_STORE_ID","HUNTER_NAME","HUNTING_STATUS","HUNTING_STAGE","RECORD_TYPE","TIER","CORP_FLAG","EXTRA_PLAN_FLAG","PARTY_TYPE_ID","FECHA_ONBOARDADED","VERTICAL_SF","DOMAIN_AGG1_SF"];
    const data = rows.map((r) => [
      r.siteSiteId, r.huntingId, r.huntingName, r.cusCustId, r.officialStoreId,
      r.hunterName, r.huntingStatus, r.huntingStage, r.recordType, r.tier,
      r.corpFlag, r.extraPlanFlag, r.partyTypeId, r.fechaOnboardaded,
      r.verticalSf, r.domainAgg1Sf,
    ].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","));
    const csv = [h.join(","), ...data].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    a.download = "dm_mkp_hunting_beauty.csv";
    a.click();
    setExportMsg("✓ CSV exportado");
    setTimeout(() => setExportMsg(""), 2500);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.025em" }}>Huntings · MLB 2026</div>
          <div style={{ fontSize: 12, color: "var(--text-4)", marginTop: 3, fontFamily: "var(--font-mono)" }}>
            DM_MKP_HUNTING · 3P · 2-LOCAL · site MLB
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar nome, CUST, loja, hunter…"
            style={{ height: 34, padding: "0 12px", borderRadius: 9, border: "1px solid var(--bd)", background: "var(--surface)", color: "var(--text)", fontSize: 13, outline: "none", minWidth: 220 }} />
          <select value={filterVertical} onChange={(e) => setFilterVertical(e.target.value)}
            style={{ height: 34, padding: "0 10px", borderRadius: 9, border: "1px solid var(--bd)", background: "var(--surface)", color: "var(--text-2)", fontSize: 12, fontFamily: "inherit" }}>
            {VERTICALS.map((v) => <option key={v} value={v}>{v === "Todos" ? "Todas as verticais" : v}</option>)}
          </select>
          <select value={filterStage} onChange={(e) => setFilterStage(e.target.value)}
            style={{ height: 34, padding: "0 10px", borderRadius: 9, border: "1px solid var(--bd)", background: "var(--surface)", color: "var(--text-2)", fontSize: 12, fontFamily: "inherit" }}>
            {STAGES.map((s) => <option key={s} value={s}>{s === "Todos" ? "Todos os estágios" : s}</option>)}
          </select>
          <button onClick={exportCSV}
            style={{ display: "flex", alignItems: "center", gap: 6, height: 34, padding: "0 12px", borderRadius: 9, border: "1px solid var(--bd)", background: exportMsg ? "var(--ok)" : "var(--surface)", color: exportMsg ? "#fff" : "var(--text-3)", fontWeight: 600, fontSize: 13, transition: "all .2s" }}>
            {exportMsg || "Exportar CSV"}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total huntings",  value: rows.length,    color: "var(--text)" },
          { label: "Onboarded",       value: onboarded,      color: "var(--ok)" },
          { label: "3P Go Live",      value: goLive,         color: "#2a9d8f" },
          { label: "Em andamento",    value: inProgress,     color: "var(--accent)" },
          { label: "Exibindo",        value: filtered.length, color: "var(--text-3)" },
        ].map((k) => (
          <div key={k.label} className="card" style={{ padding: "14px 18px" }}>
            <div style={{ fontSize: 11, color: "var(--text-4)", fontWeight: 600, marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: k.color, letterSpacing: "-0.03em" }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="card">
        <div className="body" style={{ padding: 0, overflowX: "auto" }}>
          <table className="pipe-table">
            <thead>
              <tr>
                <Th k="huntingId">Hunting ID</Th>
                <Th k="huntingName">Hunting Name</Th>
                <Th k="cusCustId">CUS_CUST_ID</Th>
                <Th k="officialStoreId">Official Store ID</Th>
                <Th k="hunterName">Hunter</Th>
                <Th k="huntingStatus">Status</Th>
                <Th k="huntingStage">Stage</Th>
                <Th k="tier">Tier</Th>
                <Th k="extraPlanFlag">Extra Plan</Th>
                <Th k="fechaOnboardaded">Fecha Onboarded</Th>
                <Th k="verticalSf">Vertical</Th>
                <Th k="domainAgg1Sf">Domínio</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={12} style={{ textAlign: "center", padding: "32px 0", color: "var(--text-4)" }}>
                    Nenhum hunting encontrado com os filtros aplicados.
                  </td>
                </tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-4)", whiteSpace: "nowrap" }}>{r.huntingId}</td>
                  <td style={{ fontWeight: 700, minWidth: 180 }}>{r.huntingName}</td>
                  <td><CopyCell value={r.cusCustId} /></td>
                  <td><CopyCell value={r.officialStoreId} /></td>
                  <td style={{ fontSize: 13, whiteSpace: "nowrap" }}>{r.hunterName}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: 12, color: "var(--text-3)" }}>{r.huntingStatus}</span>
                  </td>
                  <td><StageBadge stage={r.huntingStage} /></td>
                  <td style={{ fontSize: 12, fontWeight: 700, color: r.tier === "Gold" ? "#b8860b" : r.tier === "Silver" ? "var(--text-3)" : "var(--text-4)" }}>
                    {r.tier}
                  </td>
                  <td style={{ textAlign: "center" }}><BoolChip value={r.extraPlanFlag} /></td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-3)", whiteSpace: "nowrap" }}>
                    {r.fechaOnboardaded || "—"}
                  </td>
                  <td style={{ fontSize: 11, fontWeight: 600, color: "var(--text-2)", whiteSpace: "nowrap" }}>{r.verticalSf}</td>
                  <td style={{ fontSize: 12, color: "var(--text-3)" }}>{r.domainAgg1Sf}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
