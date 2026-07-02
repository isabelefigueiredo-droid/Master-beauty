import React, { useState } from 'react';
import { useLocalState } from './shared.jsx';
import { MHB } from './data.js';

function fmtBRL(n) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function fmtPct(meta, realizado) {
  if (!meta) return "—";
  const p = (realizado / meta) * 100;
  return p.toFixed(1) + "%";
}

function StatusBadge({ status }) {
  const colors = {
    "Acima da meta":   { bg: "var(--ok)",    color: "#fff" },
    "Meta atingida":   { bg: "var(--accent)", color: "var(--on-accent)" },
    "Abaixo da meta":  { bg: "var(--crit)",  color: "#fff" },
  };
  const s = colors[status] || { bg: "var(--surface-2)", color: "var(--text-2)" };
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>
      {status}
    </span>
  );
}

function ProgressBar({ meta, realizado }) {
  const pct = meta ? Math.min((realizado / meta) * 100, 120) : 0;
  const over = realizado > meta;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 120 }}>
      <div style={{ flex: 1, height: 6, background: "var(--bd)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: Math.min(pct, 100) + "%", height: "100%", background: over ? "var(--ok)" : "var(--accent)", borderRadius: 99, transition: "width .3s" }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: over ? "var(--ok)" : "var(--text-2)", minWidth: 40, textAlign: "right" }}>
        {fmtPct(meta, realizado)}
      </span>
    </div>
  );
}

export default function TabResultados() {
  const [rows, setRows] = useLocalState("mhb_resultados", MHB.resultados);
  const [sortKey, setSortKey]   = useState("marca");
  const [sortDir, setSortDir]   = useState(1);
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [search, setSearch]     = useState("");
  const [exportMsg, setExportMsg] = useState("");

  const toggle = (k) => {
    if (sortKey === k) setSortDir((d) => -d);
    else { setSortKey(k); setSortDir(1); }
  };

  const Th = ({ k, children, align }) => (
    <th onClick={() => toggle(k)} style={{ cursor: "pointer", textAlign: align || "left", userSelect: "none" }}>
      {children}{sortKey === k ? (sortDir === 1 ? " ↑" : " ↓") : ""}
    </th>
  );

  const STATUS_OPTIONS = ["Todos", "Acima da meta", "Meta atingida", "Abaixo da meta"];

  const filtered = rows
    .filter((r) => filterStatus === "Todos" || r.status === filterStatus)
    .filter((r) => !search || r.marca.toLowerCase().includes(search.toLowerCase()) || r.cust.toLowerCase().includes(search.toLowerCase()) || r.lojaOficial.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const av = a[sortKey] ?? ""; const bv = b[sortKey] ?? "";
      return (av < bv ? -1 : av > bv ? 1 : 0) * sortDir;
    });

  const totalMeta      = rows.reduce((s, r) => s + r.gmvMeta, 0);
  const totalRealizado = rows.reduce((s, r) => s + r.gmvRealizado, 0);
  const totalPedidos   = rows.reduce((s, r) => s + r.pedidos, 0);

  const updateRow = (id, patch) => setRows((rs) => rs.map((r) => r.id === id ? { ...r, ...patch } : r));

  const exportCSV = () => {
    const h = ["Marca", "CUST", "ID Loja Oficial", "Período", "GMV Meta", "GMV Realizado", "Atingimento", "Pedidos", "Ticket Médio", "Status"];
    const data = rows.map((r) => [r.marca, r.cust, r.lojaOficial, r.periodoRef, r.gmvMeta, r.gmvRealizado, fmtPct(r.gmvMeta, r.gmvRealizado), r.pedidos, r.ticketMedio.toFixed(2), r.status]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csv = [h.join(","), ...data].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    a.download = "resultados-vendas-beauty.csv";
    a.click();
    setExportMsg("✓ CSV exportado");
    setTimeout(() => setExportMsg(""), 2500);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.025em" }}>Resultado de Vendas</div>
          <div style={{ fontSize: 13, color: "var(--text-4)", marginTop: 2 }}>
            <b style={{ color: "var(--text)" }}>{rows.length}</b> lojas · Meta total:{" "}
            <b style={{ color: "var(--text)" }}>{fmtBRL(totalMeta)}</b> · Realizado:{" "}
            <b style={{ color: totalRealizado >= totalMeta ? "var(--ok)" : "var(--crit)" }}>{fmtBRL(totalRealizado)}</b>
            {" · "}{totalPedidos.toLocaleString("pt-BR")} pedidos
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar marca, CUST, loja…"
            style={{ height: 34, padding: "0 12px", borderRadius: 9, border: "1px solid var(--bd)", background: "var(--surface)", color: "var(--text)", fontSize: 13, outline: "none", minWidth: 200 }} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ height: 34, padding: "0 12px", borderRadius: 9, border: "1px solid var(--bd)", background: "var(--surface)", color: "var(--text-2)", fontSize: 13, fontFamily: "inherit" }}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={exportCSV}
            style={{ display: "flex", alignItems: "center", gap: 6, height: 34, padding: "0 12px", borderRadius: 9, border: "1px solid var(--bd)", background: exportMsg ? "var(--ok)" : "var(--surface)", color: exportMsg ? "#fff" : "var(--text-3)", fontWeight: 600, fontSize: 13, transition: "all .2s" }}>
            {exportMsg || "Exportar CSV"}
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Acima da meta",  count: rows.filter((r) => r.status === "Acima da meta").length,  color: "var(--ok)" },
          { label: "Meta atingida",  count: rows.filter((r) => r.status === "Meta atingida").length,  color: "var(--accent)" },
          { label: "Abaixo da meta", count: rows.filter((r) => r.status === "Abaixo da meta").length, color: "var(--crit)" },
          { label: "Atingimento geral", count: fmtPct(totalMeta, totalRealizado), color: totalRealizado >= totalMeta ? "var(--ok)" : "var(--crit)" },
        ].map((kpi) => (
          <div key={kpi.label} className="card" style={{ padding: "14px 18px" }}>
            <div style={{ fontSize: 11, color: "var(--text-4)", fontWeight: 600, marginBottom: 4 }}>{kpi.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: kpi.color, letterSpacing: "-0.03em" }}>{kpi.count}</div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="card">
        <div className="body" style={{ padding: 0, overflowX: "auto" }}>
          <table className="pipe-table">
            <thead>
              <tr>
                <Th k="marca">Marca</Th>
                <Th k="cust">CUST</Th>
                <Th k="lojaOficial">ID Loja Oficial</Th>
                <Th k="periodoRef">Período</Th>
                <Th k="gmvMeta" align="right">GMV Meta</Th>
                <Th k="gmvRealizado" align="right">GMV Realizado</Th>
                <th>Atingimento</th>
                <Th k="pedidos" align="right">Pedidos</Th>
                <Th k="ticketMedio" align="right">Ticket Médio</Th>
                <Th k="status">Status</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={10} style={{ textAlign: "center", padding: "32px 0", color: "var(--text-4)" }}>Nenhum resultado encontrado.</td></tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, minWidth: 160 }}>
                    <input value={r.marca} onChange={(e) => updateRow(r.id, { marca: e.target.value })}
                      style={{ border: "none", background: "transparent", fontFamily: "inherit", fontSize: "inherit", fontWeight: 700, color: "var(--text)", width: "100%", outline: "none" }} />
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-3)", whiteSpace: "nowrap" }}>
                    <input value={r.cust} onChange={(e) => updateRow(r.id, { cust: e.target.value })}
                      style={{ border: "none", background: "transparent", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-3)", width: "100%", outline: "none" }} />
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-3)", whiteSpace: "nowrap" }}>
                    <input value={r.lojaOficial} onChange={(e) => updateRow(r.id, { lojaOficial: e.target.value })}
                      style={{ border: "none", background: "transparent", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-3)", width: "100%", outline: "none" }} />
                  </td>
                  <td style={{ fontSize: 12, color: "var(--text-3)", whiteSpace: "nowrap" }}>
                    <input value={r.periodoRef} onChange={(e) => updateRow(r.id, { periodoRef: e.target.value })}
                      style={{ border: "none", background: "transparent", fontFamily: "inherit", fontSize: 12, color: "var(--text-3)", width: 80, outline: "none" }} />
                  </td>
                  <td className="mono" style={{ textAlign: "right", whiteSpace: "nowrap" }}>{fmtBRL(r.gmvMeta)}</td>
                  <td className="mono" style={{ textAlign: "right", whiteSpace: "nowrap", fontWeight: 700, color: r.gmvRealizado >= r.gmvMeta ? "var(--ok)" : "var(--crit)" }}>
                    {fmtBRL(r.gmvRealizado)}
                  </td>
                  <td style={{ minWidth: 160 }}>
                    <ProgressBar meta={r.gmvMeta} realizado={r.gmvRealizado} />
                  </td>
                  <td className="mono" style={{ textAlign: "right" }}>{r.pedidos.toLocaleString("pt-BR")}</td>
                  <td className="mono" style={{ textAlign: "right" }}>{fmtBRL(r.ticketMedio)}</td>
                  <td><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
