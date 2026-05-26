import {
  useLocalState, DAYS_PT_SHORT, Card, CardHeader, Sticker, Chip,
  InlineEdit, AddRow, DeleteBtn,
} from './shared.jsx';

export function TabVida() {
  const defaultHabits = [
    { id:"h1", name: "💧 Beber 2L água", d: [1,1,1,0,1,1,0] },
    { id:"h2", name: "🧘‍♀️ Meditar 10min", d: [1,1,0,1,1,1,0] },
    { id:"h3", name: "🚶‍♀️ Caminhar", d: [1,0,1,1,1,1,0] },
    { id:"h4", name: "📖 Ler 30min", d: [1,1,1,1,1,1,1] },
    { id:"h5", name: "💤 Dormir 23h", d: [0,1,0,1,1,0,0] },
    { id:"h6", name: "🌱 Sem rede social manhã", d: [1,1,1,0,1,1,0] },
  ];
  const [hStore, setHStore] = useLocalState("isa.vida.habits", defaultHabits);
  const today = new Date().getDay();

  const toggleCell = (rowI, colI) => {
    const copy = hStore.map((h, i) => i !== rowI ? h : { ...h, d: h.d.map((v, j) => j === colI ? (v ? 0 : 1) : v) });
    setHStore(copy);
  };
  const editHabit = (id, name) => setHStore(hStore.map(h => h.id === id ? { ...h, name } : h));
  const removeHabit = (id) => setHStore(hStore.filter(h => h.id !== id));
  const addHabit = (name) => setHStore([...hStore, { id:`h${Date.now()}`, name, d:[0,0,0,0,0,0,0] }]);

  const moodHistory = [4,3,4,4,2,3,4,5,4,4,3,4,5,4];
  const moodColors = { 1: "var(--ink-mute)", 2:"var(--blue)", 3:"var(--mustard)", 4:"var(--olive)", 5:"var(--terracotta)" };

  const [journal, setJournal] = useLocalState("isa.vida.journal", "Hoje foi um dia bom. A reunião com o fornecedor fluiu, e ainda consegui terminar o capítulo antes de dormir. A Luna roeu o tapete de novo, mas tá tudo bem. ☕✨");

  const [hobbies, setHobbies] = useLocalState("isa.vida.hobbies", [
    { id:"hb1", name: "Cerâmica", c: "var(--terracotta)", p: 40, hand: "aula de quinta" },
    { id:"hb2", name: "Aquarela", c: "var(--rose)", p: 60, hand: "diário visual" },
    { id:"hb3", name: "Cozinhar receitas novas", c: "var(--olive)", p: 75, hand: "experimentando italianas" },
    { id:"hb4", name: "Corrida", c: "var(--blue)", p: 25, hand: "voltando devagar" },
  ]);
  const updateHobby = (id, patch) => setHobbies(hobbies.map(h => h.id === id ? { ...h, ...patch } : h));
  const removeHobby = (id) => setHobbies(hobbies.filter(h => h.id !== id));
  const addHobby = (name) => {
    const colors = ["var(--terracotta)","var(--olive)","var(--blue)","var(--mustard)","var(--rose)","var(--plum)"];
    setHobbies([...hobbies, { id:`hb${Date.now()}`, name, c: colors[hobbies.length % colors.length], p: 0, hand: "comecei agora" }]);
  };

  const [birthdays, setBirthdays] = useLocalState("isa.vida.birthdays", [
    { id:"b1", name: "Bia (irmã)", d: "30/05", age: 32, when: "em 4 dias", c: "var(--rose)" },
    { id:"b2", name: "Mãe", d: "12/06", age: 61, when: "em 17 dias", c: "var(--terracotta)" },
    { id:"b3", name: "Lu (BFF)", d: "22/06", age: 31, when: "em 27 dias", c: "var(--mustard)" },
    { id:"b4", name: "André", d: "08/07", age: 33, when: "em 43 dias", c: "var(--olive)" },
    { id:"b5", name: "Tia Marcia", d: "19/08", age: 58, when: "em 85 dias", c: "var(--blue)" },
  ]);
  const updateBday = (id, patch) => setBirthdays(birthdays.map(b => b.id === id ? { ...b, ...patch } : b));
  const removeBday = (id) => setBirthdays(birthdays.filter(b => b.id !== id));
  const addBday = (name) => {
    const colors = ["var(--rose)","var(--terracotta)","var(--mustard)","var(--olive)","var(--blue)","var(--plum)"];
    setBirthdays([...birthdays, { id:`b${Date.now()}`, name, d:"--/--", age:"?", when:"—", c: colors[birthdays.length % colors.length] }]);
  };

  const [trips, setTrips] = useLocalState("isa.vida.trips", [
    { id:"t1", p: "Lisboa", d: "Jul 2026", c: "var(--blue)", st: "Reservada", em: "38 dias" },
    { id:"t2", p: "Fernando de Noronha", d: "Out 2026", c: "var(--olive)", st: "Pesquisando", em: "150 dias" },
    { id:"t3", p: "Buenos Aires", d: "Mar 2027", c: "var(--terracotta)", st: "Wishlist", em: "—" },
  ]);
  const updateTrip = (id, patch) => setTrips(trips.map(t => t.id === id ? { ...t, ...patch } : t));
  const removeTrip = (id) => setTrips(trips.filter(t => t.id !== id));
  const addTrip = (p) => {
    const colors = ["var(--blue)","var(--olive)","var(--terracotta)","var(--mustard)","var(--rose)"];
    setTrips([...trips, { id:`t${Date.now()}`, p, d:"data?", c: colors[trips.length % colors.length], st:"Wishlist", em:"—" }]);
  };

  return (
    <div>
      <div className="row between" style={{ marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="section-title">Vida <span className="hand">em ordem</span></h1>
          <div className="section-sub">os pedacinhos que constroem o tipo de pessoa que você é</div>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <Chip color="rose">streak: 8 dias</Chip>
          <Chip color="olive">humor médio: alto</Chip>
        </div>
      </div>

      <Card className="mb-3">
        <CardHeader title="Hábitos da semana" hand="clique pra marcar" />
        <div style={{ overflowX: "auto" }}>
          <div className="habit-row" style={{ fontFamily: "var(--font-hand)", fontSize: 18, color: "var(--ink-soft)" }}>
            <div></div>
            {DAYS_PT_SHORT.map((d, i) => (
              <div key={i} className="tcenter" style={{ color: i === today ? "var(--terracotta)" : "inherit" }}>
                {d}
              </div>
            ))}
          </div>
          {hStore.map((h, rowI) => (
            <div key={h.id} className="habit-row" style={{ gridTemplateColumns:"1.5fr repeat(7, 1fr) auto", gap:6 }}>
              <div className="h-name">
                <InlineEdit value={h.name} onChange={(v) => editHabit(h.id, v)} />
              </div>
              {h.d.map((v, colI) => (
                <div key={colI}
                  className={`habit-cell ${v ? "done" : ""} ${colI === today ? "today" : ""}`}
                  onClick={() => toggleCell(rowI, colI)}
                ></div>
              ))}
              <DeleteBtn onClick={() => removeHabit(h.id)} />
            </div>
          ))}
        </div>
        <AddRow onAdd={addHabit} placeholder="+ novo hábito (ex: 🌿 Yoga 20min)" buttonClass="olive" />
      </Card>

      <div className="grid cols-12 mb-3">
        <Card className="span-5">
          <CardHeader title="Humor — últimos 14 dias" hand="seu mapa emocional" />
          <div className="row" style={{ gap: 4, alignItems: "flex-end", height: 110, padding: "10px 0" }}>
            {moodHistory.map((m, i) => (
              <div key={i} style={{
                flex: 1,
                height: `${m * 20}%`,
                background: moodColors[m],
                border: "1.5px solid var(--ink)",
                borderRadius: "4px 4px 0 0",
                minHeight: 20,
              }}></div>
            ))}
          </div>
          <div className="row between" style={{ fontFamily: "var(--font-hand)", fontSize: 16, color: "var(--ink-soft)" }}>
            <span>13/mai</span><span>hoje</span>
          </div>
          <div className="hand mt-2">
            ↑ tendência de alta · sua melhor sequência desde fevereiro
          </div>
        </Card>

        <Card className="span-7" tilt="r">
          <CardHeader title="Diário de hoje" hand={new Date().toLocaleDateString("pt-BR")} />
          <textarea
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            placeholder="Como foi o seu dia?"
            style={{
              width: "100%",
              minHeight: 130,
              border: "2px dashed var(--ink)",
              borderRadius: 12,
              padding: 14,
              background: "var(--paper)",
              fontFamily: "var(--font-hand)",
              fontSize: 20,
              lineHeight: 1.4,
              color: "var(--ink-soft)",
              resize: "vertical",
            }}
          />
          <div className="row between mt-2">
            <div className="hand">{journal.length} caracteres</div>
            <button className="btn sm olive">salvar entrada</button>
          </div>
        </Card>
      </div>

      <div className="grid cols-3 mb-3">
        <Card>
          <CardHeader title="Hobbies & projetos" hand="o que te dá tesão" />
          <div className="col" style={{ gap: 12 }}>
            {hobbies.map(h => (
              <div key={h.id}>
                <div className="row between mb-1" style={{ gap:6 }}>
                  <span className="bold" style={{ fontSize: 14, flex:1 }}>
                    <InlineEdit value={h.name} onChange={(v) => updateHobby(h.id, { name: v })} />
                  </span>
                  <span className="hand" style={{ fontSize: 15 }}>
                    <InlineEdit value={h.hand} onChange={(v) => updateHobby(h.id, { hand: v })} />
                  </span>
                  <DeleteBtn onClick={() => removeHobby(h.id)} />
                </div>
                <div className="row" style={{ gap:6 }}>
                  <input type="range" min={0} max={100} value={h.p}
                    onChange={(e) => updateHobby(h.id, { p: +e.target.value })}
                    style={{ flex:1, accentColor: h.c }} />
                  <span className="small muted" style={{ minWidth:32, textAlign:"right" }}>{h.p}%</span>
                </div>
              </div>
            ))}
          </div>
          <AddRow onAdd={addHobby} placeholder="+ novo hobby..." buttonClass="terracotta" />
        </Card>

        <Card style={{ position: "relative" }}>
          <Sticker color="rose" rotate={-4} top={-12} right={-6}>🎂 {birthdays.length}</Sticker>
          <CardHeader title="Aniversários" hand="ninguém esquecido" />
          <div className="col" style={{ gap: 6 }}>
            {birthdays.map((b) => (
              <div key={b.id} className="row" style={{ padding: "6px 0", borderBottom: "1px dashed rgba(42,31,23,0.18)", gap:8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: b.c, border: "2px solid var(--ink)",
                  display: "grid", placeItems: "center",
                  fontFamily: "var(--font-display)", fontSize: 14, color: "var(--paper)", flexShrink:0,
                }}>{(b.name || "?")[0]}</div>
                <div className="flex1">
                  <div className="bold" style={{ fontSize: 13 }}>
                    <InlineEdit value={b.name} onChange={(v) => updateBday(b.id, { name: v })} />
                  </div>
                  <div className="hand" style={{ fontSize: 15 }}>
                    <InlineEdit value={b.d} onChange={(v) => updateBday(b.id, { d: v })} placeholder="dd/mm" />
                    {" · faz "}
                    <InlineEdit value={String(b.age)} onChange={(v) => updateBday(b.id, { age: v })} placeholder="?" />
                  </div>
                </div>
                <DeleteBtn onClick={() => removeBday(b.id)} />
              </div>
            ))}
          </div>
          <AddRow onAdd={addBday} placeholder="+ aniversariante..." buttonClass="terracotta" />
        </Card>

        <Card>
          <CardHeader title="Viagens" hand="próximos destinos" />
          <div className="col" style={{ gap: 10 }}>
            {trips.map((t) => (
              <div key={t.id} style={{
                background: "var(--paper)",
                border: "2px solid var(--ink)",
                borderRadius: 12,
                padding: "10px 12px",
              }}>
                <div className="row between mb-1" style={{ gap:6 }}>
                  <div className="bold" style={{ fontSize: 15, flex:1 }}>
                    ✈️ <InlineEdit value={t.p} onChange={(v) => updateTrip(t.id, { p: v })} />
                  </div>
                  <select value={t.st} onChange={(e) => updateTrip(t.id, { st: e.target.value })}
                    className="chip" style={{ background: t.c, color: "var(--paper)", fontSize: 10, appearance:"none", cursor:"pointer", padding:"3px 8px" }}>
                    {["Wishlist","Pesquisando","Reservada","Confirmada","Concluída"].map(s => <option key={s} value={s} style={{ background:"var(--paper)", color:"var(--ink)" }}>{s}</option>)}
                  </select>
                  <DeleteBtn onClick={() => removeTrip(t.id)} />
                </div>
                <div className="hand" style={{ fontSize: 16 }}>
                  <InlineEdit value={t.d} onChange={(v) => updateTrip(t.id, { d: v })} placeholder="quando" />
                  {" · "}
                  <InlineEdit value={t.em} onChange={(v) => updateTrip(t.id, { em: v })} placeholder="faltam X dias" />
                </div>
              </div>
            ))}
          </div>
          <AddRow onAdd={addTrip} placeholder="+ destino..." buttonClass="olive" />
        </Card>
      </div>
    </div>
  );
}
