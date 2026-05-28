import { useState, useCallback } from 'react';
import {
  useLocalState, Card, CardHeader, Sticker, Chip,
  InlineEdit, AddRow, DeleteBtn,
} from './shared.jsx';

const uploadPhoto = (callback) => {
  const input = document.createElement("input");
  input.type = "file"; input.accept = "image/*";
  input.onchange = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => callback(ev.target.result);
    reader.readAsDataURL(file);
  };
  input.click();
};

const fetchOgImage = async (url, onSuccess) => {
  try {
    const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    const img = data?.data?.image?.url || data?.data?.screenshot?.url;
    if (img) onSuccess(img);
  } catch {}
};

export function TabCasa() {
  const [shopping, setShopping] = useLocalState("isa.casa.shopping", [
    { id:"s1", label:"Café em grãos", qty:"1 pacote", c:"mercearia", done:false },
    { id:"s2", label:"Tomate cereja", qty:"2 caixas", c:"hortifruti", done:false },
    { id:"s3", label:"Iogurte natural", qty:"4", c:"frios", done:true },
    { id:"s4", label:"Ração filhote — Luna", qty:"7kg", c:"pets", done:false },
    { id:"s5", label:"Vinho rosé", qty:"1", c:"bebidas", done:false },
    { id:"s6", label:"Azeite extra-virgem", qty:"1", c:"mercearia", done:true },
    { id:"s7", label:"Manjericão fresco", qty:"1 maço", c:"hortifruti", done:false },
  ]);
  const [newItem, setNewItem] = useState("");
  const cats = ["mercearia","hortifruti","frios","pets","bebidas","limpeza","outros"];
  const [cat, setCat] = useState("mercearia");
  const toggleS = (id) => setShopping(shopping.map(s => s.id === id ? { ...s, done: !s.done } : s));
  const updateS = (id, patch) => setShopping(shopping.map(s => s.id === id ? { ...s, ...patch } : s));
  const removeS = (id) => setShopping(shopping.filter(s => s.id !== id));
  const addS = () => {
    if (!newItem.trim()) return;
    setShopping([...shopping, { id: `s${Date.now()}`, label: newItem.trim(), qty: "1", c: cat, done: false }]);
    setNewItem("");
  };
  const catColors = {
    mercearia: "var(--mustard)",
    hortifruti: "var(--olive)",
    frios: "var(--sky)",
    pets: "var(--rose)",
    bebidas: "var(--terracotta)",
    limpeza: "var(--cream-deep)",
    outros: "var(--ink-mute)",
  };

  const [menu, setMenu] = useLocalState("isa.casa.menu", [
    { d: "SEG", almoco: "Salada caesar + frango grelhado", janta: "Sopa de mandioquinha" },
    { d: "TER", almoco: "Macarrão com pesto", janta: "Wrap de atum + salada" },
    { d: "QUA", almoco: "Bowl de quinoa", janta: "Pizza congelada da boa" },
    { d: "QUI", almoco: "Strogonoff de cogumelos", janta: "Omelete + torrada" },
    { d: "SEX", almoco: "Sushi delivery 🍣", janta: "Drinks com Lu" },
    { d: "SÁB", almoco: "Brunch em casa", janta: "Hambúrguer artesanal" },
    { d: "DOM", almoco: "Almoço na mãe", janta: "Sobras / petiscos" },
  ]);
  const updateMenu = (d, field, v) => setMenu(menu.map(m => m.d === d ? { ...m, [field]: v } : m));

  const [recipes, setRecipes] = useLocalState("isa.casa.recipes", [
    { id:"r1", name: "Nhoque de batata-doce", dur: "45min", tag: "italiana", c: "var(--mustard)", link:"", body:"" },
    { id:"r2", name: "Curry tailandês de grão-de-bico", dur: "30min", tag: "vegetariana", c: "var(--olive)", link:"", body:"" },
    { id:"r3", name: "Risoto de limão siciliano", dur: "40min", tag: "italiana", c: "var(--rose)", link:"", body:"" },
    { id:"r4", name: "Salmão com crosta de gergelim", dur: "25min", tag: "asiática", c: "var(--blue)", link:"", body:"" },
  ]);
  const updateRecipe = (id, patch) => setRecipes(recipes.map(r => r.id === id ? { ...r, ...patch } : r));
  const removeRecipe = (id) => setRecipes(recipes.filter(r => r.id !== id));
  const addRecipe = (name) => {
    const colors = ["var(--mustard)","var(--olive)","var(--rose)","var(--blue)","var(--terracotta)","var(--plum)"];
    setRecipes([...recipes, { id:`r${Date.now()}`, name, dur:"30min", tag:"nova", c: colors[recipes.length % colors.length], link:"", body:"" }]);
  };
  const [expandedRecipes, setExpandedRecipes] = useState({});
  const toggleRecipe = (id) => setExpandedRecipes(p => ({ ...p, [id]: !p[id] }));

  const [pets, setPets] = useLocalState("isa.casa.pets", [
    { id:"p1", name: "Luna", kind: "🐱", age: "2 anos", color: "var(--terracotta)", next: "Vacina V4 · sáb" },
    { id:"p2", name: "Pingo", kind: "🐶", age: "5 anos", color: "var(--mustard)", next: "Banho · qui" },
    { id:"p3", name: "Sol", kind: "🐱", age: "7 anos", color: "var(--olive)", next: "Vermífugo · dom" },
  ]);
  const updatePet = (id, patch) => setPets(pets.map(p => p.id === id ? { ...p, ...patch } : p));
  const removePet = (id) => setPets(pets.filter(p => p.id !== id));
  const addPet = (name) => {
    const colors = ["var(--terracotta)","var(--olive)","var(--mustard)","var(--rose)","var(--blue)"];
    setPets([...pets, { id:`p${Date.now()}`, name, kind:"🐾", age:"? anos", color: colors[pets.length % colors.length], next:"—" }]);
  };

  const [wishlist, setWishlist] = useLocalState("isa.casa.wishlist", [
    { id:"w1", item:"Poltrona de leitura cor terracota", price:"R$ 1.890", priority:"alta", c:"terracotta", link:"", imgUrl:"" },
    { id:"w2", item:"Tapete kilim sala", price:"R$ 740", priority:"média", c:"olive", link:"", imgUrl:"" },
    { id:"w3", item:"Luminária de chão de palha", price:"R$ 420", priority:"baixa", c:"mustard", link:"", imgUrl:"" },
    { id:"w4", item:"Espelho redondo grande", price:"R$ 320", priority:"média", c:"rose", link:"", imgUrl:"" },
  ]);
  const updateWish = (id, patch) => setWishlist(wishlist.map(w => w.id === id ? { ...w, ...patch } : w));
  const removeWish = (id) => setWishlist(wishlist.filter(w => w.id !== id));
  const addWish = (item) => {
    const colors = ["terracotta","olive","mustard","rose","blue"];
    setWishlist([...wishlist, { id:`w${Date.now()}`, item, price:"R$ ?", priority:"média", c: colors[wishlist.length % colors.length] }]);
  };

  return (
    <div>
      <div className="row between" style={{ marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="section-title">Casa <span className="hand">em ordem</span></h1>
          <div className="section-sub">o lar que você construiu pra você e pros pets</div>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <Chip color="rose">3 pets felizes</Chip>
          <Chip color="olive">próximo mercado: sáb</Chip>
        </div>
      </div>

      <div className="grid cols-12 mb-3">
        <Card className="span-5" tilt="l">
          <CardHeader title="Lista de compras" hand={`${shopping.filter(s=>!s.done).length} pendentes`} />
          <div style={{ maxHeight: 280, overflowY: "auto", marginBottom: 12 }}>
            {shopping.map(s => (
              <div key={s.id} className={`task ${s.done ? "done" : ""}`} style={{ display:"flex", alignItems:"center", gap:8 }}>
                <input type="checkbox" className="check" checked={s.done} onChange={() => toggleS(s.id)} />
                <span className="label" style={{ flex:1 }}>
                  <InlineEdit value={s.label} onChange={(v) => updateS(s.id, { label: v })} />
                </span>
                <span className="hand" style={{ fontSize: 16 }}>
                  <InlineEdit value={s.qty} onChange={(v) => updateS(s.id, { qty: v })} />
                </span>
                <select value={s.c} onChange={(e) => updateS(s.id, { c: e.target.value })}
                  className="chip" style={{ background: catColors[s.c], fontSize: 10, color: s.c === "limpeza" ? "var(--ink)" : "var(--paper)", appearance:"none", cursor:"pointer", padding:"3px 8px" }}>
                  {cats.map(c => <option key={c} value={c} style={{ background:"var(--paper)", color:"var(--ink)" }}>{c}</option>)}
                </select>
                <DeleteBtn onClick={() => removeS(s.id)} />
              </div>
            ))}
          </div>
          <div className="row" style={{ gap: 6 }}>
            <input className="input" placeholder="+ item" value={newItem}
              onChange={e => setNewItem(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addS()} />
            <select className="input" style={{ width: 130 }} value={cat} onChange={e => setCat(e.target.value)}>
              {cats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="btn olive sm" onClick={addS}>add</button>
          </div>
        </Card>

        <Card className="span-7">
          <CardHeader title="Cardápio da semana" hand="o que vai pra mesa" />
          <div className="col" style={{ gap: 6 }}>
            {menu.map(m => (
              <div key={m.d} className="row" style={{
                padding: "8px 12px",
                background: "var(--paper)",
                border: "2px solid var(--ink)",
                borderRadius: 10,
                gap: 12,
              }}>
                <div className="hand" style={{ width: 40, fontSize: 18, color: "var(--terracotta)" }}>{m.d}</div>
                <div className="flex1" style={{ fontSize: 13 }}>
                  <span className="bold">almoço</span>{" · "}
                  <InlineEdit value={m.almoco} onChange={(v) => updateMenu(m.d, "almoco", v)} placeholder="o que vai comer?" />
                </div>
                <div className="flex1" style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                  <span className="bold">janta</span>{" · "}
                  <InlineEdit value={m.janta} onChange={(v) => updateMenu(m.d, "janta", v)} placeholder="o que vai comer?" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid cols-12 mb-3">
        <Card className="span-7">
          <CardHeader title="Receitas pra testar" hand="seu caderno culinário" />
          <div className="grid cols-2" style={{ gap: 12 }}>
            {recipes.map((r) => (
              <div key={r.id} style={{
                border: "2px solid var(--ink)",
                borderRadius: 14,
                padding: 12,
                background: "var(--paper)",
                position: "relative",
                overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute",
                  top: -8, right: -8,
                  width: 50, height: 50,
                  borderRadius: "50%",
                  background: r.c,
                  border: "2px solid var(--ink)",
                }}></div>
                <div className="bold" style={{ fontSize: 15, marginBottom: 4, paddingRight: 40 }}>
                  <InlineEdit value={r.name} onChange={(v) => updateRecipe(r.id, { name: v })} />
                </div>
                <div className="row" style={{ gap: 6 }}>
                  <span className="chip" style={{ fontSize: 10 }}>
                    <InlineEdit value={r.dur} onChange={(v) => updateRecipe(r.id, { dur: v })} />
                  </span>
                  <span className="chip" style={{ fontSize: 10 }}>
                    <InlineEdit value={r.tag} onChange={(v) => updateRecipe(r.id, { tag: v })} />
                  </span>
                  <div className="flex1"></div>
                  <button className="btn ghost sm" style={{ fontSize:9, padding:"1px 6px" }}
                    onClick={() => toggleRecipe(r.id)}>
                    {expandedRecipes[r.id] ? "▲" : "▼ receita"}
                  </button>
                  <DeleteBtn onClick={() => removeRecipe(r.id)} />
                </div>
                {/* Link da receita */}
                <div className="row" style={{ gap:4, marginTop:6 }}>
                  <input value={r.link || ""} onChange={e => updateRecipe(r.id, { link: e.target.value })}
                    placeholder="↗ cole um link..."
                    style={{ flex:1, fontSize:10, border:"1px dashed var(--ink)", borderRadius:6, padding:"3px 7px", background:"var(--paper)", minWidth:0 }} />
                  {r.link && (
                    <a href={r.link} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize:12, color:"var(--blue)", textDecoration:"none", flexShrink:0 }}>↗</a>
                  )}
                </div>
                {expandedRecipes[r.id] && (
                  <textarea value={r.body || ""} onChange={e => updateRecipe(r.id, { body: e.target.value })}
                    placeholder="ingredientes e modo de preparo..."
                    style={{ width:"100%", marginTop:6, minHeight:90, border:"1.5px dashed var(--ink)", background:"var(--paper)", borderRadius:8, padding:"6px 8px", fontSize:11, fontFamily:"var(--font-body)", lineHeight:1.5, resize:"vertical" }} />
                )}
              </div>
            ))}
          </div>
          <AddRow onAdd={addRecipe} placeholder="+ nova receita..." buttonClass="terracotta" />
        </Card>

        <Card className="span-5" style={{ position: "relative" }}>
          <Sticker color="rose" rotate={4} top={-12} right={-6}>família 🐾</Sticker>
          <CardHeader title="Pets" hand={`${pets.length} patinhas em casa`} />
          <div className="grid cols-3" style={{ gap: 10 }}>
            {pets.map((p) => (
              <div key={p.id} className="pet-card" style={{ position:"relative" }}>
                <div style={{ position:"absolute", top:-4, right:-4 }}>
                  <DeleteBtn onClick={() => removePet(p.id)} />
                </div>
                <div className="pet-avatar"
                  title="clique para trocar foto"
                  onClick={() => uploadPhoto(photo => updatePet(p.id, { photo }))}
                  style={{ background: p.photo ? "transparent" : p.color, color:"var(--paper)", cursor:"pointer", overflow:"hidden", padding:0, display:"grid", placeItems:"center" }}>
                  {p.photo
                    ? <img src={p.photo} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"50%", display:"block" }} />
                    : p.kind}
                </div>
                <div className="bold" style={{ fontSize: 14 }}>
                  <InlineEdit value={p.name} onChange={(v) => updatePet(p.id, { name: v })} />
                </div>
                <div className="hand" style={{ fontSize: 15 }}>
                  <InlineEdit value={p.age} onChange={(v) => updatePet(p.id, { age: v })} />
                </div>
                <div className="small muted mt-2" style={{ fontSize: 11 }}>
                  <InlineEdit value={p.next} onChange={(v) => updatePet(p.id, { next: v })} placeholder="próximo evento" />
                </div>
              </div>
            ))}
          </div>
          <AddRow onAdd={addPet} placeholder="+ novo pet..." buttonClass="olive" />
        </Card>
      </div>

      <Card>
        <CardHeader title="Lista de desejos pra casa" hand={`${wishlist.length} itens em mira`} />
        <div className="grid cols-4" style={{ gap: 14 }}>
          {wishlist.map(w => (
            <div key={w.id} style={{
              border: "2px solid var(--ink)",
              borderRadius: 14,
              padding: 14,
              background: "var(--paper)",
              boxShadow: "2px 2px 0 var(--ink)",
              position:"relative",
            }}>
              <div style={{ position:"absolute", top:6, right:6 }}>
                <DeleteBtn onClick={() => removeWish(w.id)} />
              </div>
              {/* Imagem do produto */}
              {w.imgUrl
                ? <img src={w.imgUrl} alt={w.item}
                    style={{ width:"100%", height:90, objectFit:"cover", borderRadius:8, marginBottom:10, border:"1.5px solid var(--ink)", display:"block" }} />
                : <div className="imgph" style={{ minHeight:80, marginBottom:10, background:`linear-gradient(135deg,${w.c==="terracotta"?"var(--terracotta)":w.c==="olive"?"var(--olive)":w.c==="mustard"?"var(--mustard)":w.c==="blue"?"var(--blue)":"var(--rose)"} 0%,transparent 100%),repeating-linear-gradient(135deg,rgba(42,31,23,.08) 0 6px,transparent 6px 12px),var(--cream)` }}>
                    <span style={{ fontFamily:"var(--font-hand)", fontSize:18, color:"var(--paper)", textShadow:"1px 1px 0 var(--ink)" }}>{(w.item||"?").split(" ")[0]}</span>
                  </div>
              }
              <div className="bold" style={{ fontSize: 13, lineHeight: 1.3 }}>
                <InlineEdit value={w.item} onChange={(v) => updateWish(w.id, { item: v })} />
              </div>
              {/* Link do produto */}
              <div className="row" style={{ gap:4, marginTop:6, marginBottom:4 }}>
                <input value={w.link || ""} placeholder="cole o link do produto..."
                  style={{ flex:1, fontSize:10, border:"1px dashed var(--ink)", borderRadius:6, padding:"3px 7px", background:"var(--paper)", minWidth:0 }}
                  onChange={e => updateWish(w.id, { link: e.target.value, imgUrl: "" })}
                  onBlur={e => {
                    const url = e.target.value.trim();
                    if (url) fetchOgImage(url, img => updateWish(w.id, { imgUrl: img }));
                  }} />
                {w.link && (
                  <a href={w.link} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize:12, color:"var(--blue)", textDecoration:"none", flexShrink:0 }}>↗</a>
                )}
              </div>
              <div className="row between mt-2">
                <span className="bignum" style={{ fontSize: 18 }}>
                  <InlineEdit value={w.price} onChange={(v) => updateWish(w.id, { price: v })} />
                </span>
                <select value={w.priority} onChange={(e) => updateWish(w.id, { priority: e.target.value })}
                  className={`chip ${w.c}`} style={{ fontSize: 10, appearance:"none", cursor:"pointer" }}>
                  {["alta","média","baixa"].map(p => <option key={p} value={p} style={{ background:"var(--paper)", color:"var(--ink)" }}>{p}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
        <AddRow onAdd={addWish} placeholder="+ item da wishlist..." buttonClass="mustard" />
      </Card>
    </div>
  );
}
