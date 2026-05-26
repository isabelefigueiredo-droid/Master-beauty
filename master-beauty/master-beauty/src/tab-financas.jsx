import {
  useLocalState, formatBRL, Card, CardHeader, Chip,
  InlineEdit, AddRow, DeleteBtn,
} from './shared.jsx';

export function TabFinancas() {
  const [overview, setOverview] = useLocalState("isa.fin.overview", { in: 18420, spent: 11280, savingsPct: 68 });
  const free = overview.in - overview.spent;

  const [categories, setCategories] = useLocalState("isa.fin.categories", [
    { id:"c1", name: "Moradia",        v: 3800, c: "var(--terracotta)" },
    { id:"c2", name: "Mercado/casa",   v: 1620, c: "var(--olive)" },
    { id:"c3", name: "Pets",           v: 480,  c: "var(--rose)" },
    { id:"c4", name: "Lazer & social", v: 1240, c: "var(--mustard)" },
    { id:"c5", name: "Saúde",          v: 720,  c: "var(--blue)" },
    { id:"c6", name: "Assinaturas",    v: 320,  c: "var(--plum)" },
    { id:"c7", name: "Transporte",     v: 540,  c: "var(--sky)" },
    { id:"c8", name: "Educação",       v: 380,  c: "var(--sage)" },
    { id:"c9", name: "Outros",         v: 2180, c: "var(--ink-mute)" },
  ]);
  const totalSpent = categories.reduce((s, c) => s + c.v, 0);
  const updateCat = (id, patch) => setCategories(categories.map(c => c.id === id ? { ...c, ...patch } : c));
  const removeCat = (id) => setCategories(categories.filter(c => c.id !== id));
  const addCat = (name) => {
    const cols = ["var(--terracotta)","var(--olive)","var(--mustard)","var(--blue)","var(--rose)","var(--plum)","var(--sage)","var(--sky)"];
    setCategories([...categories, { id:`c${Date.now()}`, name, v: 0, c: cols[categories.length % cols.length] }]);
  };

  const [piggies, setPiggies] = useLocalState("isa.fin.piggies", [
    { id:"pg1", name: "Viagem Lisboa", current: 6800, goal: 9000, c: "var(--blue)", emoji: "✈️" },
    { id:"pg2", name: "Reserva emergência", current: 22400, goal: 30000, c: "var(--olive)", emoji: "🛟" },
    { id:"pg3", name: "Reforma quarto", current: 1200, goal: 5000, c: "var(--terracotta)", emoji: "🛋️" },
    { id:"pg4", name: "Curso de cerâmica", current: 850, goal: 1200, c: "var(--rose-deep)", emoji: "🏺" },
  ]);
  const updatePiggy = (id, patch) => setPiggies(piggies.map(p => p.id === id ? { ...p, ...patch } : p));
  const removePiggy = (id) => setPiggies(piggies.filter(p => p.id !== id));
  const addPiggy = (name) => {
    const cols = ["var(--blue)","var(--olive)","var(--terracotta)","var(--rose-deep)","var(--mustard)","var(--plum)"];
    setPiggies([...piggies, { id:`pg${Date.now()}`, name, current:0, goal:1000, c: cols[piggies.length % cols.length], emoji:"💰" }]);
  };

  const [invests, setInvests] = useLocalState("isa.fin.invests", [
    { id:"i1", name: "Tesouro Selic 2030",    v: 18200, c: "var(--olive)" },
    { id:"i2", name: "CDB Banco Inter",        v: 12400, c: "var(--blue)" },
    { id:"i3", name: "Fundo Multimercado",     v: 9200,  c: "var(--mustard)" },
    { id:"i4", name: "Ações + BDRs",           v: 5400,  c: "var(--terracotta)" },
    { id:"i5", name: "Cripto (BTC + ETH)",     v: 2800,  c: "var(--plum)" },
  ]);
  const totalInvest = invests.reduce((s, i) => s + i.v, 0);
  const invWithPct = invests.map(i => ({ ...i, pct: totalInvest ? (i.v/totalInvest)*100 : 0 }));
  const updateInv = (id, patch) => setInvests(invests.map(i => i.id === id ? { ...i, ...patch } : i));
  const removeInv = (id) => setInvests(invests.filter(i => i.id !== id));
  const addInv = (name) => {
    const cols = ["var(--olive)","var(--blue)","var(--mustard)","var(--terracotta)","var(--plum)","var(--rose-deep)"];
    setInvests([...invests, { id:`i${Date.now()}`, name, v: 0, c: cols[invests.length % cols.length] }]);
  };

  const [bills, setBills] = useLocalState("isa.fin.bills", [
    { id:"b1", name:"Conta de luz", v: 187.40, d: "hoje", paid: false, emoji:"💡" },
    { id:"b2", name:"Internet", v: 110.00, d: "28/05", paid: false, emoji:"📡" },
    { id:"b3", name:"Aluguel", v: 2800.00, d: "05/06", paid: false, emoji:"🏠" },
    { id:"b4", name:"Cartão Nubank", v: 1240.50, d: "10/06", paid: false, emoji:"💳" },
    { id:"b5", name:"Plano de saúde", v: 540.00, d: "12/06", paid: true, emoji:"⚕️" },
  ]);
  const toggleBill = (id) => setBills(bills.map(b => b.id === id ? { ...b, paid: !b.paid } : b));
  const updateBill = (id, patch) => setBills(bills.map(b => b.id === id ? { ...b, ...patch } : b));
  const removeBill = (id) => setBills(bills.filter(b => b.id !== id));
  const addBill = (name) => setBills([...bills, { id:`b${Date.now()}`, name, v: 0, d: "—", paid: false, emoji: "💸" }]);

  const [subs, setSubs] = useLocalState("isa.fin.subs", [
    { id:"sb1", name: "Spotify Premium", v: 21.90, c: "var(--olive)", emoji:"🎵" },
    { id:"sb2", name: "Netflix", v: 55.90, c: "var(--terracotta)", emoji:"🎬" },
    { id:"sb3", name: "iCloud 200GB", v: 14.90, c: "var(--sky)", emoji:"☁️" },
    { id:"sb4", name: "Notion Plus", v: 49.00, c: "var(--ink-soft)", emoji:"📒" },
    { id:"sb5", name: "Kindle Unlimited", v: 19.90, c: "var(--mustard)", emoji:"📚" },
    { id:"sb6", name: "Academia", v: 159.00, c: "var(--rose-deep)", emoji:"🏋️‍♀️" },
  ]);
  const totalSubs = subs.reduce((s, x) => s + x.v, 0);
  const updateSub = (id, patch) => setSubs(subs.map(s => s.id === id ? { ...s, ...patch } : s));
  const removeSub = (id) => setSubs(subs.filter(s => s.id !== id));
  const addSub = (name) => {
    const cols = ["var(--olive)","var(--terracotta)","var(--sky)","var(--mustard)","var(--rose-deep)","var(--blue)"];
    setSubs([...subs, { id:`sb${Date.now()}`, name, v: 0, c: cols[subs.length % cols.length], emoji:"🔁" }]);
  };

  const [extrato, setExtrato] = useLocalState("isa.fin.extrato", [
    { id:"x1", d:"26/05", desc:"Salário ML", v: 14200 },
    { id:"x2", d:"25/05", desc:"Mercado — Pão de Açúcar", v: -287.40 },
    { id:"x3", d:"25/05", desc:"Pix da mãe — partilha", v: 200 },
    { id:"x4", d:"24/05", desc:"Uber", v: -34.50 },
    { id:"x5", d:"24/05", desc:"Cafeteria Coffee Lab", v: -28.00 },
    { id:"x6", d:"23/05", desc:"Veterinário (Sol)", v: -240.00 },
    { id:"x7", d:"22/05", desc:"Freelance design", v: 1800 },
  ]);
  const updateX = (id, patch) => setExtrato(extrato.map(x => x.id === id ? { ...x, ...patch } : x));
  const removeX = (id) => setExtrato(extrato.filter(x => x.id !== id));
  const addX = (desc) => {
    const today = new Date();
    const d = `${String(today.getDate()).padStart(2,"0")}/${String(today.getMonth()+1).padStart(2,"0")}`;
    setExtrato([{ id:`x${Date.now()}`, d, desc, v: 0 }, ...extrato]);
  };

  return (
    <div>
      <div className="row between" style={{ marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="section-title">Finanças <span className="hand">em ordem</span></h1>
          <div className="section-sub">mai/2026 · pra você dormir tranquila</div>
        </div>
        <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
          <Chip color="olive">+12% vs mês anterior</Chip>
          <Chip color="terracotta">1 conta vence hoje</Chip>
        </div>
      </div>

      <div className="grid cols-4 mb-3">
        <Card>
          <div className="hand">entrou em maio</div>
          <div className="bignum olive">
            R$ <input type="number" value={overview.in} onChange={(e) => setOverview({ ...overview, in: +e.target.value })}
              style={{ width: 110, font:"inherit", color:"inherit", border:"1.5px dashed var(--ink)", background:"var(--paper)", borderRadius:6, padding:"0 4px" }} />
          </div>
          <div className="small muted mt-2">salário + freela + extras</div>
        </Card>
        <Card>
          <div className="hand">saiu em maio</div>
          <div className="bignum terracotta">
            R$ <input type="number" value={overview.spent} onChange={(e) => setOverview({ ...overview, spent: +e.target.value })}
              style={{ width: 110, font:"inherit", color:"inherit", border:"1.5px dashed var(--ink)", background:"var(--paper)", borderRadius:6, padding:"0 4px" }} />
          </div>
          <div className="small muted mt-2">{Math.round(overview.spent/overview.in*100) || 0}% da receita</div>
        </Card>
        <Card>
          <div className="hand">livre pra alocar</div>
          <div className="bignum blue">{formatBRL(free)}</div>
          <div className="small muted mt-2">depois das contas fixas</div>
        </Card>
        <Card>
          <div className="hand">meta de poupança</div>
          <div className="bignum">
            <input type="number" min={0} max={100} value={overview.savingsPct}
              onChange={(e) => setOverview({ ...overview, savingsPct: +e.target.value })}
              style={{ width: 70, font:"inherit", color:"inherit", border:"1.5px dashed var(--ink)", background:"var(--paper)", borderRadius:6, padding:"0 4px" }} />%
          </div>
          <div className="bar-track mt-2"><div className="bar-fill" style={{ width: `${overview.savingsPct}%`, background: "var(--olive)" }}></div></div>
        </Card>
      </div>

      <div className="grid cols-12 mb-3">
        <Card className="span-7">
          <CardHeader title="Para onde foi o dinheiro" hand="por categoria · mai/26" />
          <div style={{
            height: 28, display: "flex",
            border: "2px solid var(--ink)", borderRadius: 6,
            overflow: "hidden", marginBottom: 18,
          }}>
            {categories.map((c, i) => (
              <div key={c.id} title={`${c.name}: ${formatBRL(c.v)}`} style={{
                width: `${(c.v/totalSpent)*100}%`,
                background: c.c,
                borderRight: i < categories.length - 1 ? "1.5px solid var(--ink)" : "none",
              }}></div>
            ))}
          </div>
          <div className="col" style={{ gap: 4 }}>
            {categories.map((c) => (
              <div key={c.id} className="row between" style={{ fontSize: 13, padding: "2px 0", gap:6 }}>
                <span className="row" style={{ gap: 8, flex:1 }}>
                  <span style={{ width: 12, height: 12, background: c.c, border: "1.5px solid var(--ink)", borderRadius: 3, flexShrink:0 }}></span>
                  <InlineEdit value={c.name} onChange={(v) => updateCat(c.id, { name: v })} />
                </span>
                <span style={{ fontFamily: "var(--font-mono)" }}>
                  R$ <input type="number" value={c.v} onChange={(e) => updateCat(c.id, { v: +e.target.value })}
                    style={{ width:80, font:"inherit", color:"inherit", border:"1.5px dashed var(--ink)", background:"var(--paper)", borderRadius:4, padding:"0 4px", textAlign:"right" }} />
                </span>
                <DeleteBtn onClick={() => removeCat(c.id)} />
              </div>
            ))}
          </div>
          <AddRow onAdd={addCat} placeholder="+ nova categoria..." buttonClass="olive" />
        </Card>

        <Card className="span-5">
          <CardHeader title="Extrato recente" hand={`${extrato.length} lançamentos`} />
          <div className="receipt">
            {extrato.map((e) => (
              <div key={e.id} className="row" style={{ gap:6 }}>
                <div style={{ width: 50, color: "var(--ink-mute)" }}>
                  <InlineEdit value={e.d} onChange={(v) => updateX(e.id, { d: v })} placeholder="dd/mm" />
                </div>
                <div className="flex1">
                  <InlineEdit value={e.desc} onChange={(v) => updateX(e.id, { desc: v })} />
                </div>
                <div style={{ color: e.v >= 0 ? "var(--olive)" : "var(--terracotta)", fontWeight: 600 }}>
                  <input type="number" value={e.v} onChange={(ev) => updateX(e.id, { v: +ev.target.value })}
                    style={{ width:75, font:"inherit", color:"inherit", border:"1.5px dashed var(--ink)", background:"transparent", borderRadius:4, padding:"0 2px", textAlign:"right" }} />
                </div>
                <DeleteBtn onClick={() => removeX(e.id)} />
              </div>
            ))}
            <div className="row total">
              <div>saldo do período</div>
              <div style={{ color: extrato.reduce((s,e)=>s+e.v,0) >= 0 ? "var(--olive)" : "var(--terracotta)" }}>{formatBRL(extrato.reduce((s,e)=>s+e.v,0))}</div>
            </div>
          </div>
          <AddRow onAdd={addX} placeholder="+ novo lançamento..." buttonClass="terracotta" />
        </Card>
      </div>

      <Card className="mb-3">
        <CardHeader title="Cofrinhos & metas" hand="o que você está construindo" />
        <div className="grid cols-4" style={{ gap: 14 }}>
          {piggies.map((p) => {
            const pct = Math.round((p.current/p.goal)*100) || 0;
            return (
              <div key={p.id} style={{
                border: "2px solid var(--ink)",
                borderRadius: 16,
                padding: 14,
                background: "var(--paper)",
                boxShadow: "2px 2px 0 var(--ink)",
                position: "relative",
              }}>
                <div style={{ position:"absolute", top:8, right:8 }}>
                  <DeleteBtn onClick={() => removePiggy(p.id)} />
                </div>
                <div style={{ fontSize: 28, marginBottom: 4 }}>
                  <InlineEdit value={p.emoji} onChange={(v) => updatePiggy(p.id, { emoji: v })} />
                </div>
                <div className="bold" style={{ fontSize: 14, paddingRight: 24 }}>
                  <InlineEdit value={p.name} onChange={(v) => updatePiggy(p.id, { name: v })} />
                </div>
                <div className="hand mt-2" style={{ fontSize:15 }}>
                  R$ <input type="number" value={p.current} onChange={(e) => updatePiggy(p.id, { current: +e.target.value })}
                    style={{ width:70, font:"inherit", color:"inherit", border:"1.5px dashed var(--ink)", background:"var(--paper)", borderRadius:4, padding:"0 4px" }} />
                  {" / "}R$ <input type="number" value={p.goal} onChange={(e) => updatePiggy(p.id, { goal: +e.target.value })}
                    style={{ width:70, font:"inherit", color:"inherit", border:"1.5px dashed var(--ink)", background:"var(--paper)", borderRadius:4, padding:"0 4px" }} />
                </div>
                <div className="bar-track mt-2"><div className="bar-fill" style={{ width: `${Math.min(100,pct)}%`, background: p.c }}></div></div>
                <div className="row between mt-2">
                  <span className="small muted">{pct}%</span>
                  <span className="hand" style={{ fontSize: 15 }}>faltam {formatBRL(Math.max(0, p.goal - p.current))}</span>
                </div>
              </div>
            );
          })}
        </div>
        <AddRow onAdd={addPiggy} placeholder="+ novo cofrinho..." buttonClass="olive" />
      </Card>

      <div className="grid cols-12 mb-3">
        <Card className="span-6">
          <CardHeader title="Investimentos" hand={formatBRL(totalInvest)} />
          <div className="row" style={{ alignItems: "flex-start", gap: 18 }}>
            <svg width="140" height="140" viewBox="0 0 140 140" style={{ flexShrink: 0 }}>
              {(() => {
                let cum = 0;
                const r = 50, c = 70;
                return invWithPct.map((inv) => {
                  const start = (cum/100) * Math.PI * 2 - Math.PI/2;
                  cum += inv.pct;
                  const end = (cum/100) * Math.PI * 2 - Math.PI/2;
                  const large = inv.pct > 50 ? 1 : 0;
                  const x1 = c + r * Math.cos(start);
                  const y1 = c + r * Math.sin(start);
                  const x2 = c + r * Math.cos(end);
                  const y2 = c + r * Math.sin(end);
                  return <path key={inv.id}
                    d={`M ${c} ${c} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
                    fill={inv.c} stroke="var(--ink)" strokeWidth="2" />;
                });
              })()}
              <circle cx="70" cy="70" r="26" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2" />
              <text x="70" y="68" textAnchor="middle" fontFamily="var(--font-display)" fontSize="14">total</text>
              <text x="70" y="84" textAnchor="middle" fontFamily="var(--font-display)" fontSize="11">{`R$ ${Math.round(totalInvest/1000)}k`}</text>
            </svg>
            <div className="flex1">
              {invWithPct.map((inv) => (
                <div key={inv.id} className="row between" style={{ padding: "5px 0", fontSize: 13, borderBottom: "1px dashed rgba(42,31,23,0.18)", gap:6 }}>
                  <span className="row" style={{ gap: 8, flex:1 }}>
                    <span style={{ width: 12, height: 12, background: inv.c, border: "1.5px solid var(--ink)", borderRadius: 3, flexShrink:0 }}></span>
                    <InlineEdit value={inv.name} onChange={(v) => updateInv(inv.id, { name: v })} />
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize:11 }}>
                    R$ <input type="number" value={inv.v} onChange={(e) => updateInv(inv.id, { v: +e.target.value })}
                      style={{ width:70, font:"inherit", color:"inherit", border:"1.5px dashed var(--ink)", background:"var(--paper)", borderRadius:4, padding:"0 4px", textAlign:"right" }} />
                  </span>
                  <DeleteBtn onClick={() => removeInv(inv.id)} />
                </div>
              ))}
              <AddRow onAdd={addInv} placeholder="+ novo investimento..." buttonClass="olive" />
            </div>
          </div>
        </Card>

        <Card className="span-6">
          <CardHeader title="Contas a pagar" hand={`${bills.filter(b=>!b.paid).length} pendentes`} />
          <div className="col" style={{ gap: 6 }}>
            {bills.map(b => (
              <div key={b.id} className="row" style={{
                padding: "10px 12px",
                background: b.paid ? "var(--cream)" : "var(--paper)",
                border: "2px solid var(--ink)",
                borderRadius: 10,
                opacity: b.paid ? 0.6 : 1,
                gap: 8,
              }}>
                <div style={{ fontSize: 22 }}>
                  <InlineEdit value={b.emoji} onChange={(v) => updateBill(b.id, { emoji: v })} />
                </div>
                <div className="flex1">
                  <div className="bold" style={{ fontSize: 14, textDecoration: b.paid ? "line-through" : "none" }}>
                    <InlineEdit value={b.name} onChange={(v) => updateBill(b.id, { name: v })} />
                  </div>
                  <div className="hand" style={{ fontSize: 16 }}>
                    vence <InlineEdit value={b.d} onChange={(v) => updateBill(b.id, { d: v })} placeholder="dd/mm" />
                  </div>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 13 }}>
                  R$ <input type="number" step="0.01" value={b.v} onChange={(e) => updateBill(b.id, { v: +e.target.value })}
                    style={{ width:70, font:"inherit", color:"inherit", border:"1.5px dashed var(--ink)", background:"transparent", borderRadius:4, padding:"0 4px", textAlign:"right" }} />
                </div>
                <button className={`btn sm ${b.paid ? "ghost" : "olive"}`} onClick={() => toggleBill(b.id)}>
                  {b.paid ? "✓" : "pagar"}
                </button>
                <DeleteBtn onClick={() => removeBill(b.id)} />
              </div>
            ))}
          </div>
          <AddRow onAdd={addBill} placeholder="+ nova conta..." buttonClass="terracotta" />
        </Card>
      </div>

      <Card>
        <CardHeader title="Assinaturas" hand={`${formatBRL(totalSubs)}/mês recorrentes`} />
        <div className="grid cols-3" style={{ gap: 10 }}>
          {subs.map((s) => (
            <div key={s.id} className="row" style={{
              padding: "10px 14px",
              background: "var(--paper)",
              border: "2px solid var(--ink)",
              borderRadius: 12,
              gap: 10,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: s.c, border: "2px solid var(--ink)",
                display: "grid", placeItems: "center", fontSize: 18,
                flexShrink: 0,
              }}>
                <InlineEdit value={s.emoji} onChange={(v) => updateSub(s.id, { emoji: v })} />
              </div>
              <div className="flex1">
                <div className="bold" style={{ fontSize: 14 }}>
                  <InlineEdit value={s.name} onChange={(v) => updateSub(s.id, { name: v })} />
                </div>
                <div className="hand" style={{ fontSize: 16 }}>
                  R$ <input type="number" step="0.01" value={s.v} onChange={(e) => updateSub(s.id, { v: +e.target.value })}
                    style={{ width:60, font:"inherit", color:"inherit", border:"1.5px dashed var(--ink)", background:"var(--paper)", borderRadius:4, padding:"0 4px" }} />
                  /mês
                </div>
              </div>
              <DeleteBtn onClick={() => removeSub(s.id)} />
            </div>
          ))}
        </div>
        <AddRow onAdd={addSub} placeholder="+ nova assinatura..." buttonClass="terracotta" />
      </Card>
    </div>
  );
}
