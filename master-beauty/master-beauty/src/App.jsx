import { useState, useEffect, useRef } from "react";

/* ─── Utils ─────────────────────────────────────────────────────────────────── */
const db = {
  get: (k, d = null) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const today = () => new Date().toISOString().split("T")[0];
const fmtDate = (d) => d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR") : "";
const fmtMoney = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const getMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
};

const fmtDateHeader = (dateStr) => {
  const td = today();
  const yest = new Date(); yest.setDate(yest.getDate() - 1);
  const yStr = yest.toISOString().split("T")[0];
  if (dateStr === td) return "Hoje";
  if (dateStr === yStr) return "Ontem";
  return new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
};

/* ─── Design Tokens ──────────────────────────────────────────────────────────── */
const P = {
  cream: "#FFF9F5",
  red:    "#C1121F",
  navy:   "#1B3A6B",
  forest: "#2A5C45",
  rose:   "#C94070",
  amber:  "#B84A2A",
  plum:   "#6B2D8B",
  dark:   "#1A1A1A",
};

const TABS = [
  { id: "home",     label: "Home",     emoji: "✦",  color: P.red,    bg: "#FFF0F2", light: "#FFE0E4" },
  { id: "estudos",  label: "Estudos",  emoji: "📚", color: P.navy,   bg: "#EEF2FF", light: "#D8E0FF" },
  { id: "trabalho", label: "Trabalho", emoji: "💼", color: P.forest, bg: "#EAFAF0", light: "#C8F0D8" },
  { id: "vida",     label: "Vida",     emoji: "🌸", color: P.rose,   bg: "#FFF0F5", light: "#FFD6E5" },
  { id: "casa",     label: "Casa",     emoji: "🏡", color: P.amber,  bg: "#FFF4EE", light: "#FFE0D0" },
  { id: "financas", label: "Finanças", emoji: "💰", color: P.plum,   bg: "#F5EEFF", light: "#E8D4FF" },
];

/* ─── Notifications ──────────────────────────────────────────────────────────── */
const Notif = {
  supported: () => "Notification" in window,
  granted: () => Notification.permission === "granted",
  request: async () => {
    if (!Notif.supported()) return false;
    const p = await Notification.requestPermission();
    return p === "granted";
  },
  send: (title, body) => {
    if (Notif.granted()) new Notification(title, { body, icon: "/favicon.ico" });
  },
  checkOnOpen: () => {
    if (!Notif.granted()) return;
    const td = today();
    const lastKey = "orbit_notif_last_" + td;
    if (db.get(lastKey)) return;
    db.set(lastKey, true);

    const habits = db.get("orbit_habits", []);
    const logs = db.get("orbit_habit_logs", {})[td] || [];
    const pending = habits.filter(h => !logs.includes(h.id));
    const hour = new Date().getHours();
    if (hour >= 19 && pending.length > 0)
      Notif.send("A Vida Toda ✦", `${pending.length} hábito${pending.length > 1 ? "s" : ""} pendente${pending.length > 1 ? "s" : ""} hoje.`);

    const bills = db.get("orbit_bills", []);
    const dayN = new Date().getDate();
    const dueSoon = bills.filter(b => !b.paid && [dayN, dayN + 1, dayN + 2].includes(b.dueDay));
    if (dueSoon.length > 0)
      Notif.send("Conta a pagar — A Vida Toda", `${dueSoon[0].name} vence em breve!`);

    const reminders = db.get("orbit_notes", []);
    const now = new Date();
    let changed = false;
    const updated = reminders.map(r => {
      if (r.reminder && !r.notified && new Date(r.reminder) <= now) {
        Notif.send("📝 Lembrete — A Vida Toda", r.title);
        changed = true;
        return { ...r, notified: true };
      }
      return r;
    });
    if (changed) db.set("orbit_notes", updated);
  },
};

/* ─── UI Primitives ──────────────────────────────────────────────────────────── */
function Btn({ children, onClick, color = P.red, small, ghost, className = "" }) {
  const base = "font-bold rounded-xl border-2 border-black transition-all active:scale-95 cursor-pointer select-none";
  const size = small ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm";
  const style = ghost ? { backgroundColor: "white", color: P.dark } : { backgroundColor: color, color: "white" };
  return <button onClick={onClick} className={`${base} ${size} ${className}`} style={style}>{children}</button>;
}

function Card({ children, className = "", accent }) {
  return (
    <div className={`bg-white rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${className}`}
      style={accent ? { borderLeft: `5px solid ${accent}` } : {}}>
      {children}
    </div>
  );
}

function Badge({ children, color = P.red }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold border border-black/10"
      style={{ backgroundColor: color + "22", color }}>
      {children}
    </span>
  );
}

function Modal({ open, onClose, title, children, color = P.red }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl border-2 border-black w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b-2 border-black flex items-center justify-between rounded-t-3xl"
          style={{ backgroundImage: `repeating-linear-gradient(-45deg,transparent,transparent 8px,rgba(0,0,0,0.03) 8px,rgba(0,0,0,0.03) 16px)`, backgroundColor: color + "18" }}>
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center font-black text-lg hover:bg-black hover:text-white transition-colors">×</button>
        </div>
        <div className="p-5 space-y-3">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <div className="flex flex-col gap-1.5">{label && <label className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</label>}{children}</div>;
}
const inp = "border-2 border-black rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 bg-white w-full transition-shadow";
const Inp = ({ label, ...p }) => <Field label={label}><input className={inp} {...p} /></Field>;
const Sel = ({ label, children, ...p }) => <Field label={label}><select className={inp} {...p}>{children}</select></Field>;
const Tex = ({ label, ...p }) => <Field label={label}><textarea className={inp + " resize-none"} rows={3} {...p} /></Field>;

/* ─── Stripe Header ──────────────────────────────────────────────────────────── */
function ScallopBorder({ color }) {
  return (
    <svg viewBox="0 0 390 28" preserveAspectRatio="none" className="w-full block" style={{ height: 28, marginTop: -1, display: "block" }}>
      <path fill={P.cream}
        d="M0,28 L0,14 Q9.75,0 19.5,14 Q29.25,28 39,14 Q48.75,0 58.5,14 Q68.25,28 78,14 Q87.75,0 97.5,14 Q107.25,28 117,14 Q126.75,0 136.5,14 Q146.25,28 156,14 Q165.75,0 175.5,14 Q185.25,28 195,14 Q204.75,0 214.5,14 Q224.25,28 234,14 Q243.75,0 253.5,14 Q263.25,28 273,14 Q282.75,0 292.5,14 Q302.25,28 312,14 Q321.75,0 331.5,14 Q341.25,28 351,14 Q360.75,0 370.5,14 Q380.25,28 390,14 L390,28 Z" />
    </svg>
  );
}

function TabHeader({ tab, subtitle, children }) {
  return (
    <div>
      <div className="relative px-5 pt-10 pb-6 overflow-hidden"
        style={{
          backgroundColor: tab.color,
          backgroundImage: `repeating-linear-gradient(-45deg,transparent,transparent 14px,rgba(255,255,255,0.1) 14px,rgba(255,255,255,0.1) 28px)`,
        }}>
        <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">A Vida Toda</p>
        <h1 className="font-display text-white leading-none" style={{ fontSize: "clamp(30px,9vw,40px)" }}>
          {tab.label} em Ordem
        </h1>
        {subtitle && <p className="text-white/65 text-xs mt-1.5 font-medium">{subtitle}</p>}
        {children}
      </div>
      <ScallopBorder color={tab.color} />
    </div>
  );
}

function SubTabs({ tabs, active, setActive, color }) {
  return (
    <div className="flex border-b-2 border-black bg-white overflow-x-auto scrollbar-hide">
      {tabs.map(([id, label]) => (
        <button key={id} onClick={() => setActive(id)}
          className={`py-3 text-xs font-bold whitespace-nowrap px-4 flex-shrink-0 transition-all ${active === id ? "border-b-[3px]" : "text-gray-400"}`}
          style={active === id ? { borderBottomColor: color, color } : {}}>
          {label}
        </button>
      ))}
    </div>
  );
}

function EmptyState({ emoji, text }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3">
      <span className="text-4xl">{emoji}</span>
      <p className="text-sm text-gray-400 font-medium text-center max-w-xs">{text}</p>
    </div>
  );
}

/* ─── Notes Panel ────────────────────────────────────────────────────────────── */
function NotesPanel({ onClose }) {
  const [notes, setNotes]   = useState(() => db.get("orbit_notes", []));
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState({});
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const saveNotes = n => { setNotes(n); db.set("orbit_notes", n); };

  const addNote = () => {
    if (!form.title) return;
    saveNotes([{ id: uid(), title: form.title, content: form.content || "", reminder: form.reminder || "", notified: false, createdAt: today() }, ...notes]);
    setModal(false); setForm({});
  };

  const now = new Date();
  const pending  = notes.filter(n => n.reminder && !n.notified && new Date(n.reminder) > now);
  const overdue  = notes.filter(n => n.reminder && !n.notified && new Date(n.reminder) <= now);
  const noRemind = notes.filter(n => !n.reminder);

  return (
    <Modal open onClose={onClose} title="📝 Notas & Lembretes" color={P.red}>
      <div className="flex items-center justify-between -mt-1 mb-1">
        <p className="text-xs text-gray-400">{notes.length} nota{notes.length !== 1 ? "s" : ""}</p>
        <Btn small color={P.red} onClick={() => { setForm({}); setModal(true); }}>+ Nota</Btn>
      </div>

      {overdue.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-1.5">⏰ Vencidos</p>
          {overdue.map(n => (
            <div key={n.id} className="bg-red-50 border-2 border-red-200 rounded-xl p-3 mb-2">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="font-semibold text-sm">{n.title}</p>
                  {n.content && <p className="text-xs text-gray-500 mt-0.5">{n.content}</p>}
                  <p className="text-xs text-red-400 mt-1">⏰ {new Date(n.reminder).toLocaleString("pt-BR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <button onClick={() => saveNotes(notes.filter(x => x.id !== n.id))} className="text-gray-300 hover:text-red-500 text-xl leading-none">×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pending.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">📌 Com lembrete</p>
          {pending.map(n => (
            <div key={n.id} className="bg-white border-2 border-black rounded-xl p-3 mb-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="font-semibold text-sm">{n.title}</p>
                  {n.content && <p className="text-xs text-gray-500 mt-0.5">{n.content}</p>}
                  <p className="text-xs mt-1" style={{ color: P.plum }}>⏰ {new Date(n.reminder).toLocaleString("pt-BR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <button onClick={() => saveNotes(notes.filter(x => x.id !== n.id))} className="text-gray-300 hover:text-red-500 text-xl leading-none">×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {noRemind.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">📋 Notas livres</p>
          {noRemind.map(n => (
            <div key={n.id} className="bg-white border border-gray-200 rounded-xl p-3 mb-2">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="font-semibold text-sm">{n.title}</p>
                  {n.content && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.content}</p>}
                  <p className="text-xs text-gray-300 mt-1">{fmtDate(n.createdAt)}</p>
                </div>
                <button onClick={() => saveNotes(notes.filter(x => x.id !== n.id))} className="text-gray-300 hover:text-red-500 text-xl leading-none">×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {notes.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-3xl mb-2">📝</p>
          <p className="text-sm text-gray-400">Nenhuma nota ainda.</p>
          <p className="text-xs text-gray-300 mt-1">Adicione uma nota com ou sem lembrete.</p>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="📝 Nova Nota" color={P.red}>
        <Inp label="Título *" value={form.title || ""} onChange={f("title")} placeholder="Ex: Ligar para o médico" autoFocus />
        <Field label="Conteúdo">
          <textarea className={`border-2 border-black rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none w-full`}
            rows={3} placeholder="Detalhes..." value={form.content || ""} onChange={f("content")} />
        </Field>
        <Inp label="Lembrete (opcional)" type="datetime-local" value={form.reminder || ""} onChange={f("reminder")} />
        {form.reminder && !Notif.granted() && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2 border border-amber-200">
            ⚠️ Ative as notificações em Configurações para receber o lembrete.
          </p>
        )}
        <Btn color={P.red} className="w-full" onClick={addNote}>Salvar nota</Btn>
      </Modal>
    </Modal>
  );
}

/* ─── Weekly Review ──────────────────────────────────────────────────────────── */
function WeeklyReview({ onClose }) {
  const td = today();
  const monday = getMonday(new Date());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split("T")[0];
  });
  const pastDays = weekDays.filter(d => d <= td);

  const habits    = db.get("orbit_habits", []);
  const habitLogs = db.get("orbit_habit_logs", {});
  const expenses  = db.get("orbit_expenses", []);
  const tasks     = db.get("orbit_tasks", []);
  const moods     = db.get("orbit_moods", []);
  const books     = db.get("orbit_books", []);

  const habitPcts = pastDays.map(d => {
    const done = (habitLogs[d] || []).length;
    return habits.length ? done / habits.length : 0;
  });
  const avgHabit = habitPcts.length ? Math.round(habitPcts.reduce((s, v) => s + v, 0) / habitPcts.length * 100) : 0;

  const weekExp   = expenses.filter(e => weekDays.includes(e.date));
  const weekTotal = weekExp.reduce((s, e) => s + e.amount, 0);
  const weekCats  = [...new Set(weekExp.map(e => e.category))].slice(0, 3);

  const doneTasks = tasks.filter(t => t.status === "Concluído").length;
  const openTasks = tasks.filter(t => t.status !== "Concluído").length;

  const weekMoods = moods.filter(m => weekDays.includes(m.date));
  const avgMood   = weekMoods.length ? weekMoods.reduce((s, m) => s + m.mood, 0) / weekMoods.length : 0;
  const moodEmoji = avgMood >= 4.5 ? "😄" : avgMood >= 3.5 ? "🙂" : avgMood >= 2.5 ? "😐" : avgMood >= 1.5 ? "😟" : "😢";

  const readThisWeek = books.filter(b => b.status === "Concluído").length;

  const DAYS_PT = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];

  return (
    <Modal open onClose={onClose} title="📊 Revisão da Semana" color={P.red}>
      <p className="text-xs text-gray-400 -mt-1 mb-1">
        {monday.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })} — {new Date(weekDays[6]).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
      </p>

      {/* Habit grid */}
      {habits.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Hábitos</p>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS_PT.map((d, i) => (
              <div key={d} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-400 font-bold">{d}</span>
                <div className="w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center text-xs font-black"
                  style={{
                    backgroundColor: weekDays[i] > td ? "#f3f4f6" : (habitLogs[weekDays[i]] || []).length >= habits.length ? P.rose : (habitLogs[weekDays[i]] || []).length > 0 ? P.rose + "66" : "#f3f4f6",
                    color: weekDays[i] > td ? "#d1d5db" : "white"
                  }}>
                  {weekDays[i] <= td && (habitLogs[weekDays[i]] || []).length > 0 ? (habitLogs[weekDays[i]] || []).length : weekDays[i] <= td ? "0" : "·"}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">Média semanal</span>
            <span className="font-numbers font-black text-lg" style={{ color: P.rose }}>{avgHabit}%</span>
          </div>
        </div>
      )}

      <div className="h-px bg-gray-100 my-1" />

      {/* Financeiro */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Finanças da semana</p>
        <div className="flex items-baseline justify-between">
          <span className="font-numbers font-black text-2xl" style={{ color: P.plum }}>{fmtMoney(weekTotal)}</span>
          <span className="text-xs text-gray-400">{weekExp.length} transações</span>
        </div>
        {weekCats.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {weekCats.map(c => <Badge key={c} color={P.plum}>{c}</Badge>)}
          </div>
        )}
      </div>

      <div className="h-px bg-gray-100 my-1" />

      {/* Trabalho + Vida */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Tarefas</p>
          <p className="font-numbers font-black text-2xl" style={{ color: P.forest }}>{doneTasks}</p>
          <p className="text-xs text-gray-500">concluídas · {openTasks} abertas</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Humor médio</p>
          <p className="font-numbers font-black text-2xl">{weekMoods.length ? moodEmoji : "—"}</p>
          <p className="text-xs text-gray-500">{weekMoods.length} registros</p>
        </div>
      </div>

      {/* Message */}
      {avgHabit > 0 && (
        <div className="rounded-2xl p-4 border-2 border-black text-sm"
          style={{ background: `repeating-linear-gradient(-45deg,transparent,transparent 8px,rgba(193,18,31,0.04) 8px,rgba(193,18,31,0.04) 16px)` }}>
          {avgHabit >= 80
            ? "🔥 Semana incrível! Você manteve seus hábitos com consistência."
            : avgHabit >= 50
            ? "💪 Boa semana! Metade do caminho feito. Continua!"
            : avgHabit > 0
            ? "🌱 Semana desafiadora. Cada dia é um recomeço."
            : "Registre seus hábitos para ver o resumo da semana."}
        </div>
      )}

      <Btn color={P.red} className="w-full" onClick={onClose}>Fechar</Btn>
    </Modal>
  );
}

/* ─── ESTUDOS ────────────────────────────────────────────────────────────────── */
const BOOK_STATUS = {
  "Não Iniciado": P.amber,
  "Em Andamento": P.plum,
  "Concluído":    P.forest,
  "Desisti":      "#9ca3af",
};

function EstudosTab() {
  const [sub, setSub] = useState("livros");
  const [books, setBooks] = useState(() => db.get("orbit_books", []));
  const [courses, setCourses] = useState(() => db.get("orbit_courses", []));
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [modInput, setModInput] = useState({});
  const color = P.navy;
  const tab = TABS.find(t => t.id === "estudos");
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const saveBooks   = b => { setBooks(b);   db.set("orbit_books", b); };
  const saveCourses = c => { setCourses(c); db.set("orbit_courses", c); };

  const addBook = () => {
    if (!form.title) return;
    saveBooks([...books, { id: uid(), title: form.title, author: form.author || "", status: "Não Iniciado", rating: 0 }]);
    setModal(null); setForm({});
  };
  const addCourse = () => {
    if (!form.title) return;
    saveCourses([...courses, { id: uid(), title: form.title, platform: form.platform || "", modules: [] }]);
    setModal(null); setForm({});
  };
  const addModule = (cid) => {
    const title = (modInput[cid] || "").trim();
    if (!title) return;
    saveCourses(courses.map(c => c.id === cid ? { ...c, modules: [...c.modules, { id: uid(), title, notes: "", done: false }] } : c));
    setModInput(p => ({ ...p, [cid]: "" }));
  };

  return (
    <div className="slide-in">
      <TabHeader tab={tab} subtitle={`${books.filter(b => b.status === "Concluído").length} lidos · ${courses.length} cursos`} />
      <SubTabs tabs={[["livros","📖 Livros"],["cursos","🎓 Cursos"]]} active={sub} setActive={setSub} color={color} />

      <div className="p-4 space-y-3">
        {sub === "livros" && (
          <>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex gap-1 flex-wrap">
                {Object.entries(BOOK_STATUS).map(([s, c]) => (
                  <span key={s} className="text-xs font-semibold px-2 py-0.5 rounded-full border border-black/10"
                    style={{ backgroundColor: c + "22", color: c }}>
                    {books.filter(b => b.status === s).length} {s.split(" ")[0]}
                  </span>
                ))}
              </div>
              <Btn small color={color} onClick={() => { setForm({}); setModal("book"); }}>+ Livro</Btn>
            </div>
            {books.length === 0 && <EmptyState emoji="📚" text="Sua biblioteca pessoal começa aqui." />}
            {books.map(book => (
              <Card key={book.id} accent={BOOK_STATUS[book.status]} className="p-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-snug">{book.title}</p>
                    {book.author && <p className="text-xs text-gray-400 mt-0.5">{book.author}</p>}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <select value={book.status}
                        onChange={e => saveBooks(books.map(b => b.id === book.id ? { ...b, status: e.target.value } : b))}
                        className="text-xs border border-gray-200 rounded-lg px-1.5 py-1 bg-white focus:outline-none">
                        {Object.keys(BOOK_STATUS).map(s => <option key={s}>{s}</option>)}
                      </select>
                      <div className="flex">
                        {[1,2,3,4,5].map(star => (
                          <button key={star} onClick={() => saveBooks(books.map(b => b.id === book.id ? { ...b, rating: star } : b))}
                            className="text-base leading-none" style={{ color: star <= book.rating ? "#F59E0B" : "#E5E7EB" }}>★</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => saveBooks(books.filter(b => b.id !== book.id))}
                    className="text-gray-200 hover:text-red-400 text-xl leading-none transition-colors mt-0.5 flex-shrink-0">×</button>
                </div>
              </Card>
            ))}
          </>
        )}

        {sub === "cursos" && (
          <>
            <div className="flex justify-end">
              <Btn small color={color} onClick={() => { setForm({}); setModal("course"); }}>+ Curso</Btn>
            </div>
            {courses.length === 0 && <EmptyState emoji="🎓" text="Adicione cursos e acompanhe seu progresso aula a aula." />}
            {courses.map(course => {
              const done = course.modules.filter(m => m.done).length;
              const pct  = course.modules.length ? Math.round(done / course.modules.length * 100) : 0;
              return (
                <Card key={course.id} accent={color} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{course.title}</p>
                      {course.platform && <p className="text-xs text-gray-400 mt-0.5">{course.platform}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-numbers font-black text-base" style={{ color }}>{pct}%</span>
                      <button onClick={() => saveCourses(courses.filter(c => c.id !== course.id))}
                        className="text-gray-200 hover:text-red-400 text-xl leading-none transition-colors">×</button>
                    </div>
                  </div>
                  {course.modules.length > 0 && (
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-3 overflow-hidden">
                      <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                  )}
                  <div className="space-y-2 mb-3">
                    {course.modules.map(mod => (
                      <div key={mod.id} className="border border-gray-100 rounded-xl p-2.5 bg-gray-50/50">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked={mod.done}
                            onChange={() => saveCourses(courses.map(c => c.id === course.id
                              ? { ...c, modules: c.modules.map(m => m.id === mod.id ? { ...m, done: !m.done } : m) }
                              : c))}
                            className="w-4 h-4 rounded cursor-pointer accent-navy" style={{ accentColor: color }} />
                          <span className={`text-sm flex-1 ${mod.done ? "line-through text-gray-400" : "font-medium"}`}>{mod.title}</span>
                          <button onClick={() => saveCourses(courses.map(c => c.id === course.id
                            ? { ...c, modules: c.modules.filter(m => m.id !== mod.id) }
                            : c))} className="text-gray-200 hover:text-red-400 text-lg leading-none transition-colors">×</button>
                        </div>
                        <textarea
                          className="mt-1.5 w-full text-xs border border-gray-100 rounded-lg px-2 py-1 resize-none focus:outline-none focus:border-gray-300 bg-white transition-colors"
                          placeholder="Notas desta aula..." rows={mod.notes ? 2 : 1} value={mod.notes}
                          onChange={e => saveCourses(courses.map(c => c.id === course.id
                            ? { ...c, modules: c.modules.map(m => m.id === mod.id ? { ...m, notes: e.target.value } : m) }
                            : c))} />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      placeholder="Adicionar aula/módulo..."
                      value={modInput[course.id] || ""}
                      onChange={e => setModInput(p => ({ ...p, [course.id]: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && addModule(course.id)} />
                    <Btn small color={color} onClick={() => addModule(course.id)}>+</Btn>
                  </div>
                </Card>
              );
            })}
          </>
        )}
      </div>

      <Modal open={modal === "book"} onClose={() => setModal(null)} title="📖 Novo Livro" color={color}>
        <Inp label="Título *" value={form.title || ""} onChange={f("title")} placeholder="Ex: Sapiens" autoFocus />
        <Inp label="Autor" value={form.author || ""} onChange={f("author")} placeholder="Ex: Yuval Noah Harari" />
        <Btn color={color} className="w-full" onClick={addBook}>Adicionar livro</Btn>
      </Modal>
      <Modal open={modal === "course"} onClose={() => setModal(null)} title="🎓 Novo Curso" color={color}>
        <Inp label="Nome do curso *" value={form.title || ""} onChange={f("title")} placeholder="Ex: UX Design na prática" autoFocus />
        <Inp label="Plataforma" value={form.platform || ""} onChange={f("platform")} placeholder="Ex: Udemy, Alura, YouTube" />
        <Btn color={color} className="w-full" onClick={addCourse}>Adicionar curso</Btn>
      </Modal>
    </div>
  );
}

/* ─── TRABALHO ───────────────────────────────────────────────────────────────── */
const TASK_S_COLOR   = { "Pendente": P.amber, "Em andamento": P.navy, "Concluído": P.forest };
const PRIORITY_COLOR = { "Alta": P.red, "Média": P.amber, "Baixa": P.forest };

function TrabalhoTab() {
  const [sub, setSub] = useState("tarefas");
  const [tasks, setTasks] = useState(() => db.get("orbit_tasks", []));
  const [goals, setGoals] = useState(() => db.get("orbit_career", []));
  const [ideas, setIdeas] = useState(() => db.get("orbit_ideas", []));
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const color = P.forest;
  const tab   = TABS.find(t => t.id === "trabalho");
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const saveTasks = t => { setTasks(t); db.set("orbit_tasks", t); };
  const saveGoals = g => { setGoals(g); db.set("orbit_career", g); };
  const saveIdeas = i => { setIdeas(i); db.set("orbit_ideas", i); };

  return (
    <div className="slide-in">
      <TabHeader tab={tab} subtitle={`${tasks.filter(t => t.status !== "Concluído").length} tarefas abertas`} />
      <SubTabs tabs={[["tarefas","✅ Tarefas"],["metas","🎯 Metas"],["ideias","💡 Ideias"]]} active={sub} setActive={setSub} color={color} />

      <div className="p-4 space-y-3">
        {sub === "tarefas" && (
          <>
            <div className="flex justify-end">
              <Btn small color={color} onClick={() => { setForm({ priority: "Média", status: "Pendente" }); setModal("task"); }}>+ Tarefa</Btn>
            </div>
            {tasks.length === 0 && <EmptyState emoji="✅" text="Sem tarefas! Aproveita." />}
            {tasks.map(task => (
              <Card key={task.id} accent={TASK_S_COLOR[task.status]} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm leading-snug ${task.status === "Concluído" ? "line-through text-gray-400" : ""}`}>{task.title}</p>
                    {task.project && <p className="text-xs text-gray-400 mt-0.5">📁 {task.project}</p>}
                    <div className="flex gap-2 mt-2 flex-wrap items-center">
                      <select value={task.status}
                        onChange={e => saveTasks(tasks.map(t => t.id === task.id ? { ...t, status: e.target.value } : t))}
                        className="text-xs border border-gray-200 rounded-lg px-1.5 py-1 bg-white focus:outline-none">
                        {Object.keys(TASK_S_COLOR).map(s => <option key={s}>{s}</option>)}
                      </select>
                      <Badge color={PRIORITY_COLOR[task.priority]}>{task.priority}</Badge>
                      {task.dueDate && <span className="text-xs text-gray-400">📅 {fmtDate(task.dueDate)}</span>}
                    </div>
                  </div>
                  <button onClick={() => saveTasks(tasks.filter(t => t.id !== task.id))}
                    className="text-gray-200 hover:text-red-400 text-xl leading-none transition-colors flex-shrink-0">×</button>
                </div>
              </Card>
            ))}
          </>
        )}

        {sub === "metas" && (
          <>
            <div className="flex justify-end">
              <Btn small color={color} onClick={() => { setForm({}); setModal("goal"); }}>+ Meta</Btn>
            </div>
            {goals.length === 0 && <EmptyState emoji="🎯" text="Defina seus objetivos profissionais." />}
            {goals.map(g => (
              <Card key={g.id} accent={color} className="p-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{g.title}</p>
                    {g.timeframe && <p className="text-xs text-gray-400 mt-0.5">⏱ {g.timeframe}</p>}
                    {g.notes && <p className="text-xs text-gray-600 mt-1 leading-relaxed">{g.notes}</p>}
                    <select value={g.status} onChange={e => saveGoals(goals.map(x => x.id === g.id ? { ...x, status: e.target.value } : x))}
                      className="mt-2 text-xs border border-gray-200 rounded-lg px-1.5 py-1 bg-white focus:outline-none">
                      <option>Em andamento</option><option>Concluído</option><option>Pausado</option>
                    </select>
                  </div>
                  <button onClick={() => saveGoals(goals.filter(x => x.id !== g.id))}
                    className="text-gray-200 hover:text-red-400 text-xl leading-none transition-colors flex-shrink-0">×</button>
                </div>
              </Card>
            ))}
          </>
        )}

        {sub === "ideias" && (
          <>
            <div className="flex justify-end">
              <Btn small color={color} onClick={() => { setForm({}); setModal("idea"); }}>+ Ideia</Btn>
            </div>
            {ideas.length === 0 && <EmptyState emoji="💡" text="Capture suas ideias antes que sumam." />}
            {ideas.map(idea => (
              <Card key={idea.id} accent={color} className="p-4">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <p className="font-semibold text-sm">{idea.title}</p>
                    {idea.content && <p className="text-xs text-gray-600 mt-1 leading-relaxed">{idea.content}</p>}
                    <p className="text-xs text-gray-400 mt-1.5">{fmtDate(idea.date)}</p>
                  </div>
                  <button onClick={() => saveIdeas(ideas.filter(i => i.id !== idea.id))}
                    className="text-gray-200 hover:text-red-400 text-xl leading-none transition-colors flex-shrink-0">×</button>
                </div>
              </Card>
            ))}
          </>
        )}
      </div>

      <Modal open={modal === "task"} onClose={() => setModal(null)} title="✅ Nova Tarefa" color={color}>
        <Inp label="Tarefa *" value={form.title || ""} onChange={f("title")} placeholder="O que precisa ser feito?" autoFocus />
        <Inp label="Projeto" value={form.project || ""} onChange={f("project")} placeholder="Ex: Redesign do app" />
        <Sel label="Prioridade" value={form.priority || "Média"} onChange={f("priority")}>
          <option>Alta</option><option>Média</option><option>Baixa</option>
        </Sel>
        <Inp label="Prazo" type="date" value={form.dueDate || ""} onChange={f("dueDate")} />
        <Btn color={color} className="w-full" onClick={() => {
          if (!form.title) return;
          saveTasks([...tasks, { id: uid(), title: form.title, project: form.project || "", status: "Pendente", priority: form.priority || "Média", dueDate: form.dueDate || "" }]);
          setModal(null); setForm({});
        }}>Adicionar tarefa</Btn>
      </Modal>

      <Modal open={modal === "goal"} onClose={() => setModal(null)} title="🎯 Nova Meta" color={color}>
        <Inp label="Meta *" value={form.title || ""} onChange={f("title")} placeholder="Ex: Ser promovida até dez/25" autoFocus />
        <Inp label="Prazo" value={form.timeframe || ""} onChange={f("timeframe")} placeholder="Ex: 6 meses, Q4 2025" />
        <Tex label="Notas" value={form.notes || ""} onChange={f("notes")} placeholder="Detalhes..." />
        <Btn color={color} className="w-full" onClick={() => {
          if (!form.title) return;
          saveGoals([...goals, { id: uid(), title: form.title, timeframe: form.timeframe || "", status: "Em andamento", notes: form.notes || "" }]);
          setModal(null); setForm({});
        }}>Adicionar meta</Btn>
      </Modal>

      <Modal open={modal === "idea"} onClose={() => setModal(null)} title="💡 Nova Ideia" color={color}>
        <Inp label="Título *" value={form.title || ""} onChange={f("title")} placeholder="Nome da ideia" autoFocus />
        <Tex label="Detalhe" value={form.content || ""} onChange={f("content")} placeholder="Desenvolva a ideia..." />
        <Btn color={color} className="w-full" onClick={() => {
          if (!form.title) return;
          saveIdeas([...ideas, { id: uid(), title: form.title, content: form.content || "", date: today() }]);
          setModal(null); setForm({});
        }}>Salvar ideia</Btn>
      </Modal>
    </div>
  );
}

/* ─── VIDA ───────────────────────────────────────────────────────────────────── */
const MOOD_EMOJIS = ["😢","😟","😐","🙂","😄"];
const MOOD_LABELS = ["Muito ruim","Ruim","Ok","Bom","Ótimo"];
const TRAVEL_SC   = { "Sonho": P.plum, "Planejando": P.navy, "Confirmado": P.forest, "Feito": P.amber };

function VidaTab() {
  const [sub, setSub] = useState("habitos");
  const [habits, setHabits]           = useState(() => db.get("orbit_habits", []));
  const [habitLogs, setHabitLogs]     = useState(() => db.get("orbit_habit_logs", {}));
  const [lifeGoals, setLifeGoals]     = useState(() => db.get("orbit_life_goals", []));
  const [travels, setTravels]         = useState(() => db.get("orbit_travels", []));
  const [moods, setMoods]             = useState(() => db.get("orbit_moods", []));
  const [appointments, setAppointments] = useState(() => db.get("orbit_appointments", []));
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState({});
  const [popId, setPopId]   = useState(null);
  const color = P.rose;
  const tab   = TABS.find(t => t.id === "vida");
  const td    = today();
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const saveHabits       = h => { setHabits(h);        db.set("orbit_habits", h); };
  const saveHabitLogs    = l => { setHabitLogs(l);     db.set("orbit_habit_logs", l); };
  const saveLifeGoals    = g => { setLifeGoals(g);     db.set("orbit_life_goals", g); };
  const saveTravels      = t => { setTravels(t);       db.set("orbit_travels", t); };
  const saveMoods        = m => { setMoods(m);         db.set("orbit_moods", m); };
  const saveAppointments = a => { setAppointments(a);  db.set("orbit_appointments", a); };

  const todayDone = habitLogs[td] || [];
  const habitPct  = habits.length ? Math.round(todayDone.length / habits.length * 100) : 0;
  const todayMood = moods.find(m => m.date === td);

  const toggleHabit = id => {
    const logs = { ...habitLogs };
    if (!logs[td]) logs[td] = [];
    logs[td] = logs[td].includes(id) ? logs[td].filter(h => h !== id) : [...logs[td], id];
    saveHabitLogs(logs);
    setPopId(id);
    setTimeout(() => setPopId(null), 300);
  };

  return (
    <div className="slide-in">
      <TabHeader tab={tab} subtitle={habits.length ? `${habitPct}% dos hábitos hoje` : "Vida & bem-estar"} />
      <SubTabs
        tabs={[["habitos","🌱 Hábitos"],["objetivos","🌟 Objetivos"],["viagens","✈️ Viagens"],["bemestar","💆 Bem-estar"],["consultas","🩺 Consultas"]]}
        active={sub} setActive={setSub} color={color} />

      <div className="p-4 space-y-3">
        {sub === "habitos" && (
          <>
            {habits.length > 0 && (
              <div className="rounded-2xl border-2 border-black p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                style={{ background: `linear-gradient(135deg,${color}18,${color}30)` }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm">
                    {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                  <span className="font-numbers font-black text-2xl" style={{ color }}>{habitPct}%</span>
                </div>
                <div className="w-full bg-white/60 rounded-full h-3 overflow-hidden">
                  <div className="h-3 rounded-full progress-bar" style={{ "--target-width": `${habitPct}%`, backgroundColor: color, width: `${habitPct}%` }} />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">{todayDone.length} de {habits.length} concluídos</p>
              </div>
            )}
            <div className="flex justify-end">
              <Btn small color={color} onClick={() => { setForm({ emoji: "" }); setModal("habit"); }}>+ Hábito</Btn>
            </div>
            {habits.length === 0 && <EmptyState emoji="🌱" text="Quais hábitos você quer cultivar?" />}
            {habits.map(h => {
              const done = todayDone.includes(h.id);
              return (
                <button key={h.id} onClick={() => toggleHabit(h.id)} className="w-full text-left">
                  <Card accent={done ? color : "#e5e7eb"} className={`p-4 transition-all duration-200 ${done ? "opacity-100" : "opacity-75"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center text-xl flex-shrink-0 transition-all duration-200 ${popId === h.id ? "pop" : ""}`}
                        style={{ backgroundColor: done ? color : "white" }}>
                        {done ? <span className="text-white font-black text-lg">✓</span> : <span>{h.emoji || "✦"}</span>}
                      </div>
                      <span className={`font-semibold text-sm flex-1 transition-all ${done ? "line-through text-gray-400" : ""}`}>{h.name}</span>
                      <button onClick={e => { e.stopPropagation(); saveHabits(habits.filter(x => x.id !== h.id)); }}
                        className="text-gray-200 hover:text-red-400 text-xl leading-none transition-colors flex-shrink-0">×</button>
                    </div>
                  </Card>
                </button>
              );
            })}
          </>
        )}

        {sub === "objetivos" && (
          <>
            <div className="flex justify-end">
              <Btn small color={color} onClick={() => { setForm({}); setModal("lifegoal"); }}>+ Objetivo</Btn>
            </div>
            {lifeGoals.length === 0 && <EmptyState emoji="🌟" text="O que você quer conquistar na vida?" />}
            {lifeGoals.map(g => (
              <Card key={g.id} accent={color} className="p-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{g.title}</p>
                    <div className="flex gap-2 mt-1.5 flex-wrap items-center">
                      {g.category && <Badge color={color}>{g.category}</Badge>}
                      {g.timeframe && <span className="text-xs text-gray-400">{g.timeframe}</span>}
                    </div>
                    <select value={g.status} onChange={e => saveLifeGoals(lifeGoals.map(x => x.id === g.id ? { ...x, status: e.target.value } : x))}
                      className="mt-2 text-xs border border-gray-200 rounded-lg px-1.5 py-1 bg-white focus:outline-none">
                      <option>Em andamento</option><option>Concluído</option><option>Pausado</option>
                    </select>
                  </div>
                  <button onClick={() => saveLifeGoals(lifeGoals.filter(x => x.id !== g.id))}
                    className="text-gray-200 hover:text-red-400 text-xl leading-none transition-colors flex-shrink-0">×</button>
                </div>
              </Card>
            ))}
          </>
        )}

        {sub === "viagens" && (
          <>
            <div className="flex justify-end">
              <Btn small color={color} onClick={() => { setForm({ status: "Sonho" }); setModal("travel"); }}>+ Destino</Btn>
            </div>
            {travels.length === 0 && <EmptyState emoji="✈️" text="Sua bucket list começa aqui." />}
            {travels.map(t => (
              <Card key={t.id} accent={TRAVEL_SC[t.status]} className="p-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <p className="font-semibold">{t.destination}</p>
                    <div className="flex gap-2 mt-1.5 flex-wrap items-center">
                      <select value={t.status} onChange={e => saveTravels(travels.map(x => x.id === t.id ? { ...x, status: e.target.value } : x))}
                        className="text-xs border border-gray-200 rounded-lg px-1.5 py-1 bg-white focus:outline-none">
                        {Object.keys(TRAVEL_SC).map(s => <option key={s}>{s}</option>)}
                      </select>
                      {t.date && <span className="text-xs text-gray-400">{fmtDate(t.date)}</span>}
                    </div>
                    {t.notes && <p className="text-xs text-gray-500 mt-1">{t.notes}</p>}
                  </div>
                  <button onClick={() => saveTravels(travels.filter(x => x.id !== t.id))}
                    className="text-gray-200 hover:text-red-400 text-xl leading-none transition-colors flex-shrink-0">×</button>
                </div>
              </Card>
            ))}
          </>
        )}

        {sub === "bemestar" && (
          <>
            <div className="flex justify-end">
              <Btn small color={color} onClick={() => { setForm({ mood: todayMood?.mood || 3, notes: todayMood?.notes || "" }); setModal("mood"); }}>
                {todayMood ? "✏️ Editar" : "+ Humor hoje"}
              </Btn>
            </div>
            {todayMood ? (
              <Card accent={color} className="p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Hoje</p>
                <div className="flex items-center gap-3">
                  <span className="text-5xl">{MOOD_EMOJIS[todayMood.mood - 1]}</span>
                  <div>
                    <p className="font-display text-2xl" style={{ color }}>{MOOD_LABELS[todayMood.mood - 1]}</p>
                    {todayMood.notes && <p className="text-xs text-gray-500 mt-0.5">{todayMood.notes}</p>}
                  </div>
                </div>
              </Card>
            ) : (
              <EmptyState emoji="💆" text="Como você está hoje?" />
            )}
            <div className="space-y-1.5">
              {moods.filter(m => m.date !== td).slice(0, 10).map(m => (
                <div key={m.id} className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-gray-100">
                  <span className="text-xs text-gray-400 w-20 flex-shrink-0">{fmtDate(m.date)}</span>
                  <span className="text-lg">{MOOD_EMOJIS[m.mood - 1]}</span>
                  <span className="text-xs font-medium text-gray-600">{MOOD_LABELS[m.mood - 1]}</span>
                  {m.notes && <span className="text-xs text-gray-400 truncate flex-1">{m.notes}</span>}
                </div>
              ))}
            </div>
          </>
        )}

        {sub === "consultas" && (
          <>
            <div className="flex justify-end">
              <Btn small color={color} onClick={() => { setForm({}); setModal("appt"); }}>+ Consulta</Btn>
            </div>
            {appointments.length === 0 && <EmptyState emoji="🩺" text="Registre suas consultas médicas." />}
            {[...appointments].sort((a, b) => (a.date || "").localeCompare(b.date || "")).map(a => (
              <Card key={a.id} accent={color} className="p-4">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <p className="font-semibold text-sm">{a.doctor}</p>
                    {a.specialty && <Badge color={color}>{a.specialty}</Badge>}
                    {a.date && <p className="text-xs text-gray-400 mt-1">📅 {fmtDate(a.date)}</p>}
                    {a.notes && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{a.notes}</p>}
                  </div>
                  <button onClick={() => saveAppointments(appointments.filter(x => x.id !== a.id))}
                    className="text-gray-200 hover:text-red-400 text-xl leading-none transition-colors flex-shrink-0">×</button>
                </div>
              </Card>
            ))}
          </>
        )}
      </div>

      <Modal open={modal === "habit"} onClose={() => setModal(null)} title="🌱 Novo Hábito" color={color}>
        <Inp label="Hábito *" value={form.name || ""} onChange={f("name")} placeholder="Ex: Beber 2L de água" autoFocus />
        <Inp label="Emoji" value={form.emoji || ""} onChange={f("emoji")} placeholder="💧" maxLength={2} />
        <Btn color={color} className="w-full" onClick={() => {
          if (!form.name) return;
          saveHabits([...habits, { id: uid(), name: form.name, emoji: form.emoji || "✦" }]);
          setModal(null); setForm({});
        }}>Adicionar hábito</Btn>
      </Modal>

      <Modal open={modal === "lifegoal"} onClose={() => setModal(null)} title="🌟 Novo Objetivo" color={color}>
        <Inp label="Objetivo *" value={form.title || ""} onChange={f("title")} placeholder="Ex: Morar no exterior" autoFocus />
        <Inp label="Categoria" value={form.category || ""} onChange={f("category")} placeholder="Ex: Carreira, Família, Pessoal" />
        <Inp label="Prazo" value={form.timeframe || ""} onChange={f("timeframe")} placeholder="Ex: 2026, próximos 5 anos" />
        <Btn color={color} className="w-full" onClick={() => {
          if (!form.title) return;
          saveLifeGoals([...lifeGoals, { id: uid(), title: form.title, category: form.category || "Pessoal", timeframe: form.timeframe || "", status: "Em andamento" }]);
          setModal(null); setForm({});
        }}>Adicionar objetivo</Btn>
      </Modal>

      <Modal open={modal === "travel"} onClose={() => setModal(null)} title="✈️ Novo Destino" color={color}>
        <Inp label="Destino *" value={form.destination || ""} onChange={f("destination")} placeholder="Ex: Tóquio, Japão" autoFocus />
        <Sel label="Status" value={form.status || "Sonho"} onChange={f("status")}>
          {Object.keys(TRAVEL_SC).map(s => <option key={s}>{s}</option>)}
        </Sel>
        <Inp label="Data prevista" type="date" value={form.date || ""} onChange={f("date")} />
        <Tex label="Notas" value={form.notes || ""} onChange={f("notes")} placeholder="Planos, sonhos..." />
        <Btn color={color} className="w-full" onClick={() => {
          if (!form.destination) return;
          saveTravels([...travels, { id: uid(), destination: form.destination, status: form.status || "Sonho", date: form.date || "", notes: form.notes || "" }]);
          setModal(null); setForm({});
        }}>Adicionar destino</Btn>
      </Modal>

      <Modal open={modal === "mood"} onClose={() => setModal(null)} title="💆 Como você está?" color={color}>
        <div className="flex justify-between gap-2">
          {MOOD_EMOJIS.map((em, i) => (
            <button key={i} onClick={() => setForm(p => ({ ...p, mood: i + 1 }))}
              className={`flex-1 py-3 rounded-2xl border-2 text-2xl transition-all ${form.mood === i + 1 ? "border-black scale-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "border-gray-200"}`}
              style={form.mood === i + 1 ? { backgroundColor: color + "22" } : {}}>
              {em}
            </button>
          ))}
        </div>
        {form.mood && <p className="text-center text-sm font-bold" style={{ color }}>{MOOD_LABELS[form.mood - 1]}</p>}
        <Tex label="Notas (opcional)" value={form.notes || ""} onChange={f("notes")} placeholder="Como foi seu dia..." />
        <Btn color={color} className="w-full" onClick={() => {
          if (!form.mood) return;
          saveMoods([{ id: uid(), date: td, mood: Number(form.mood), notes: form.notes || "" }, ...moods.filter(m => m.date !== td)]);
          setModal(null); setForm({});
        }}>Registrar humor</Btn>
      </Modal>

      <Modal open={modal === "appt"} onClose={() => setModal(null)} title="🩺 Nova Consulta" color={color}>
        <Inp label="Médico/Profissional *" value={form.doctor || ""} onChange={f("doctor")} placeholder="Ex: Dra. Ana Lima" autoFocus />
        <Inp label="Especialidade" value={form.specialty || ""} onChange={f("specialty")} placeholder="Ex: Ginecologista" />
        <Inp label="Data" type="date" value={form.date || ""} onChange={f("date")} />
        <Tex label="Notas" value={form.notes || ""} onChange={f("notes")} placeholder="Observações, resultados..." />
        <Btn color={color} className="w-full" onClick={() => {
          if (!form.doctor) return;
          saveAppointments([...appointments, { id: uid(), doctor: form.doctor, specialty: form.specialty || "", date: form.date || "", notes: form.notes || "" }]);
          setModal(null); setForm({});
        }}>Adicionar consulta</Btn>
      </Modal>
    </div>
  );
}

/* ─── CASA ───────────────────────────────────────────────────────────────────── */
const CLEAN_FC = { "Diário": P.red, "Semanal": P.navy, "Quinzenal": P.plum, "Mensal": P.forest };

function CasaTab() {
  const [sub, setSub] = useState("limpeza");
  const [cleaning, setCleaning] = useState(() => db.get("orbit_cleaning", []));
  const [shopping, setShopping] = useState(() => db.get("orbit_shopping", []));
  const [modal, setModal] = useState(null);
  const [form, setForm]   = useState({});
  const [newItem, setNewItem] = useState("");
  const color = P.amber;
  const tab   = TABS.find(t => t.id === "casa");
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const saveCleaning = c => { setCleaning(c); db.set("orbit_cleaning", c); };
  const saveShopping = s => { setShopping(s); db.set("orbit_shopping", s); };

  const addItem = () => {
    if (!newItem.trim()) return;
    saveShopping([...shopping, { id: uid(), name: newItem.trim(), done: false }]);
    setNewItem("");
  };

  return (
    <div className="slide-in">
      <TabHeader tab={tab} subtitle={`${shopping.filter(s => !s.done).length} itens na lista`} />
      <SubTabs tabs={[["limpeza","🧹 Limpeza"],["compras","🛒 Compras"]]} active={sub} setActive={setSub} color={color} />

      <div className="p-4 space-y-3">
        {sub === "limpeza" && (
          <>
            <div className="flex justify-end">
              <Btn small color={color} onClick={() => { setForm({ frequency: "Semanal" }); setModal("clean"); }}>+ Tarefa</Btn>
            </div>
            {cleaning.length === 0 && <EmptyState emoji="🧹" text="Organize as tarefas de limpeza da casa." />}
            {cleaning.map(task => (
              <Card key={task.id} accent={CLEAN_FC[task.frequency]} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">{task.name}</p>
                    <div className="flex gap-2 mt-1.5 items-center">
                      <Badge color={CLEAN_FC[task.frequency]}>{task.frequency}</Badge>
                      {task.lastDone && <span className="text-xs text-gray-400">Última: {fmtDate(task.lastDone)}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center flex-shrink-0">
                    <Btn small color={color} onClick={() => saveCleaning(cleaning.map(c => c.id === task.id ? { ...c, lastDone: today() } : c))}>✓ Feito</Btn>
                    <button onClick={() => saveCleaning(cleaning.filter(c => c.id !== task.id))}
                      className="text-gray-200 hover:text-red-400 text-xl leading-none transition-colors">×</button>
                  </div>
                </div>
              </Card>
            ))}
          </>
        )}

        {sub === "compras" && (
          <>
            <div className="flex gap-2">
              <input className="flex-1 border-2 border-black rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                placeholder="Adicionar item à lista..."
                value={newItem} onChange={e => setNewItem(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addItem()} />
              <Btn color={color} onClick={addItem}>+</Btn>
            </div>
            {shopping.some(s => s.done) && (
              <button onClick={() => saveShopping(shopping.filter(s => !s.done))}
                className="text-xs text-gray-400 hover:text-red-500 font-medium transition-colors">
                Limpar comprados ({shopping.filter(s => s.done).length})
              </button>
            )}
            {shopping.length === 0 && <EmptyState emoji="🛒" text="Lista de compras vazia!" />}
            {shopping.filter(s => !s.done).map(item => (
              <div key={item.id} onClick={() => saveShopping(shopping.map(s => s.id === item.id ? { ...s, done: true } : s))}
                className="flex items-center gap-3 bg-white rounded-xl border-2 border-black px-4 py-3 cursor-pointer active:scale-[0.99] transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="w-5 h-5 rounded-md border-2 border-black flex-shrink-0" />
                <span className="text-sm font-medium flex-1">{item.name}</span>
                <button onClick={e => { e.stopPropagation(); saveShopping(shopping.filter(s => s.id !== item.id)); }}
                  className="text-gray-200 hover:text-red-400 text-xl leading-none transition-colors">×</button>
              </div>
            ))}
            {shopping.filter(s => s.done).map(item => (
              <div key={item.id} onClick={() => saveShopping(shopping.map(s => s.id === item.id ? { ...s, done: false } : s))}
                className="flex items-center gap-3 bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 cursor-pointer opacity-55">
                <div className="w-5 h-5 rounded-md border-2 border-gray-300 bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-black">✓</span>
                </div>
                <span className="text-sm line-through text-gray-400 flex-1">{item.name}</span>
              </div>
            ))}
          </>
        )}
      </div>

      <Modal open={modal === "clean"} onClose={() => setModal(null)} title="🧹 Nova Tarefa" color={color}>
        <Inp label="Tarefa *" value={form.name || ""} onChange={f("name")} placeholder="Ex: Limpar banheiro" autoFocus />
        <Sel label="Frequência" value={form.frequency || "Semanal"} onChange={f("frequency")}>
          {Object.keys(CLEAN_FC).map(fr => <option key={fr}>{fr}</option>)}
        </Sel>
        <Btn color={color} className="w-full" onClick={() => {
          if (!form.name) return;
          saveCleaning([...cleaning, { id: uid(), name: form.name, frequency: form.frequency || "Semanal", lastDone: null }]);
          setModal(null); setForm({});
        }}>Adicionar</Btn>
      </Modal>
    </div>
  );
}

/* ─── FINANÇAS ───────────────────────────────────────────────────────────────── */
const EXP_CATS    = ["Alimentação","Transporte","Lazer","Saúde","Casa","Roupa","Beleza","Assinaturas","Outro"];
const INVEST_TYPES = ["Renda Fixa","Renda Variável","FIIs","Tesouro Direto","Cripto","Outro"];

function FinancasTab() {
  const [sub, setSub]               = useState("gastos");
  const [expenses, setExpenses]     = useState(() => db.get("orbit_expenses", []));
  const [investments, setInvestments] = useState(() => db.get("orbit_investments", []));
  const [bills, setBills]           = useState(() => db.get("orbit_bills", []));
  const [finGoals, setFinGoals]     = useState(() => db.get("orbit_fin_goals", []));
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState({});
  const [filterMonth, setFilterMonth] = useState(today().slice(0, 7));
  const color = P.plum;
  const tab   = TABS.find(t => t.id === "financas");
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const saveExpenses    = e => { setExpenses(e);    db.set("orbit_expenses", e); };
  const saveInvestments = i => { setInvestments(i); db.set("orbit_investments", i); };
  const saveBills       = b => { setBills(b);       db.set("orbit_bills", b); };
  const saveFinGoals    = g => { setFinGoals(g);    db.set("orbit_fin_goals", g); };

  const monthExp   = expenses.filter(e => e.date.startsWith(filterMonth));
  const monthTotal = monthExp.reduce((s, e) => s + e.amount, 0);
  const byCategory = EXP_CATS
    .map(cat => ({ cat, total: monthExp.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0) }))
    .filter(c => c.total > 0).sort((a, b) => b.total - a.total);
  const totalInvested = investments.reduce((s, i) => s + i.amount, 0);
  const pendingBills  = bills.filter(b => !b.paid);

  return (
    <div className="slide-in">
      <TabHeader tab={tab} subtitle={`${fmtMoney(monthTotal)} gastos este mês`} />
      <SubTabs tabs={[["gastos","💸 Gastos"],["extrato","🧾 Extrato"],["contas","📋 Contas"],["investimentos","📈 Aportes"],["metas","🎯 Metas"]]} active={sub} setActive={setSub} color={color} />

      <div className="p-4 space-y-3">
        {sub === "gastos" && (
          <>
            <div className="flex items-center gap-2">
              <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
                className="flex-1 border-2 border-black rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
              <Btn small color={color} onClick={() => { setForm({ date: today(), category: "Alimentação" }); setModal("expense"); }}>+ Gasto</Btn>
            </div>
            {byCategory.length > 0 && (
              <Card className="p-4">
                <div className="flex items-baseline justify-between mb-3">
                  <p className="font-numbers font-black text-2xl">{fmtMoney(monthTotal)}</p>
                  <p className="text-xs text-gray-400">total no mês</p>
                </div>
                <div className="space-y-2.5">
                  {byCategory.map(({ cat, total }) => (
                    <div key={cat}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium">{cat}</span>
                        <span className="font-bold font-numbers">{fmtMoney(total)}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="h-2 rounded-full transition-all duration-700"
                          style={{ width: `${(total / monthTotal) * 100}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            {monthExp.length === 0 && <EmptyState emoji="💸" text="Nenhum gasto registrado neste mês." />}
            {[...monthExp].sort((a, b) => b.date.localeCompare(a.date)).map(exp => (
              <Card key={exp.id} accent={color} className="p-4">
                <div className="flex justify-between items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{exp.description}</p>
                    <div className="flex gap-2 mt-1 items-center">
                      <Badge color={color}>{exp.category}</Badge>
                      <span className="text-xs text-gray-400">{fmtDate(exp.date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-numbers font-black text-sm">{fmtMoney(exp.amount)}</span>
                    <button onClick={() => saveExpenses(expenses.filter(e => e.id !== exp.id))}
                      className="text-gray-200 hover:text-red-400 text-xl leading-none transition-colors">×</button>
                  </div>
                </div>
              </Card>
            ))}
          </>
        )}

        {sub === "extrato" && (() => {
          const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));
          const groups = sorted.reduce((acc, exp) => {
            if (!acc[exp.date]) acc[exp.date] = [];
            acc[exp.date].push(exp);
            return acc;
          }, {});
          const CAT_EMOJI = { "Alimentação":"🍽️","Transporte":"🚗","Lazer":"🎉","Saúde":"💊","Casa":"🏡","Roupa":"👗","Beleza":"💅","Assinaturas":"📱","Outro":"💸" };
          return (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Total registrado</p>
                  <p className="font-numbers font-black text-xl" style={{ color }}>{fmtMoney(expenses.reduce((s, e) => s + e.amount, 0))}</p>
                </div>
                <Btn small color={color} onClick={() => { setForm({ date: today(), category: "Alimentação" }); setModal("expense"); }}>+ Gasto</Btn>
              </div>
              {expenses.length === 0 && <EmptyState emoji="🧾" text="Nenhum gasto registrado ainda." />}
              {Object.entries(groups).map(([date, items]) => {
                const dayTotal = items.reduce((s, e) => s + e.amount, 0);
                return (
                  <div key={date}>
                    <div className="flex items-center justify-between px-1 mb-1.5 mt-3">
                      <p className="text-xs font-bold text-gray-500 capitalize">{fmtDateHeader(date)}</p>
                      <p className="text-xs font-numbers font-bold" style={{ color }}>{fmtMoney(dayTotal)}</p>
                    </div>
                    <div className="bg-white rounded-2xl border-2 border-black overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {items.map((exp, i) => (
                        <div key={exp.id} className={`flex items-center gap-3 px-4 py-3 ${i < items.length - 1 ? "border-b border-gray-100" : ""}`}>
                          <span className="text-xl flex-shrink-0">{CAT_EMOJI[exp.category] || "💸"}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{exp.description}</p>
                            <p className="text-xs text-gray-400">{exp.category}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <p className="font-numbers font-bold text-sm" style={{ color: P.red }}>-{fmtMoney(exp.amount)}</p>
                            <button onClick={() => saveExpenses(expenses.filter(e => e.id !== exp.id))} className="text-gray-200 hover:text-red-400 text-lg leading-none transition-colors">×</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          );
        })()}

        {sub === "contas" && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400">{pendingBills.length} pendente{pendingBills.length !== 1 ? "s" : ""} · </span>
                <span className="text-xs font-bold font-numbers">{fmtMoney(pendingBills.reduce((s, b) => s + b.amount, 0))}</span>
              </div>
              <Btn small color={color} onClick={() => { setForm({}); setModal("bill"); }}>+ Conta</Btn>
            </div>
            {bills.length === 0 && <EmptyState emoji="📋" text="Cadastre suas contas mensais." />}
            {[...bills].sort((a, b) => a.dueDay - b.dueDay).map(bill => (
              <Card key={bill.id} accent={bill.paid ? P.forest : color} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${bill.paid ? "line-through text-gray-400" : ""}`}>{bill.name}</p>
                    <div className="flex gap-2 mt-1 items-center">
                      <span className="text-xs text-gray-400">Vence dia {bill.dueDay}</span>
                      <Badge color={bill.paid ? P.forest : color}>{bill.paid ? "Pago" : "Pendente"}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-numbers font-black text-sm">{fmtMoney(bill.amount)}</span>
                    <button onClick={() => saveBills(bills.map(b => b.id === bill.id ? { ...b, paid: !b.paid } : b))}
                      className={`w-7 h-7 rounded-full border-2 border-black flex items-center justify-center text-sm transition-all ${bill.paid ? "text-white" : "bg-white"}`}
                      style={bill.paid ? { backgroundColor: P.forest } : {}}>
                      {bill.paid ? "✓" : ""}
                    </button>
                    <button onClick={() => saveBills(bills.filter(b => b.id !== bill.id))}
                      className="text-gray-200 hover:text-red-400 text-xl leading-none transition-colors">×</button>
                  </div>
                </div>
              </Card>
            ))}
          </>
        )}

        {sub === "investimentos" && (
          <>
            {investments.length > 0 && (
              <Card accent={color} className="p-4">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Total registrado</p>
                <p className="font-numbers font-black text-3xl mt-0.5" style={{ color }}>{fmtMoney(totalInvested)}</p>
              </Card>
            )}
            <div className="flex justify-end">
              <Btn small color={color} onClick={() => { setForm({ date: today(), type: "Renda Fixa" }); setModal("investment"); }}>+ Aporte</Btn>
            </div>
            {investments.length === 0 && <EmptyState emoji="📈" text="Registre seus investimentos." />}
            {[...investments].sort((a, b) => b.date.localeCompare(a.date)).map(inv => (
              <Card key={inv.id} accent={color} className="p-4">
                <div className="flex justify-between items-center gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{inv.name}</p>
                    <div className="flex gap-2 mt-1 items-center">
                      <Badge color={color}>{inv.type}</Badge>
                      <span className="text-xs text-gray-400">{fmtDate(inv.date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-numbers font-black text-sm">{fmtMoney(inv.amount)}</span>
                    <button onClick={() => saveInvestments(investments.filter(i => i.id !== inv.id))}
                      className="text-gray-200 hover:text-red-400 text-xl leading-none transition-colors">×</button>
                  </div>
                </div>
              </Card>
            ))}
          </>
        )}

        {sub === "metas" && (
          <>
            <div className="flex justify-end">
              <Btn small color={color} onClick={() => { setForm({}); setModal("fingoal"); }}>+ Meta</Btn>
            </div>
            {finGoals.length === 0 && <EmptyState emoji="🎯" text="Defina suas metas financeiras." />}
            {finGoals.map(g => {
              const pct = g.target > 0 ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0;
              return (
                <Card key={g.id} accent={color} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-sm">{g.name}</p>
                      {g.deadline && <p className="text-xs text-gray-400 mt-0.5">📅 {fmtDate(g.deadline)}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-numbers font-black text-lg" style={{ color }}>{pct}%</span>
                      <button onClick={() => saveFinGoals(finGoals.filter(x => x.id !== g.id))}
                        className="text-gray-200 hover:text-red-400 text-xl leading-none transition-colors">×</button>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden mb-1.5">
                    <div className="h-3 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mb-3">
                    <span>{fmtMoney(g.current)}</span><span>{fmtMoney(g.target)}</span>
                  </div>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Atualizar valor atual..."
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                      value={form[`cur_${g.id}`] || ""}
                      onChange={e => setForm(p => ({ ...p, [`cur_${g.id}`]: e.target.value }))} />
                    <Btn small color={color} onClick={() => {
                      const val = Number(form[`cur_${g.id}`]);
                      if (!isNaN(val) && val >= 0) {
                        saveFinGoals(finGoals.map(x => x.id === g.id ? { ...x, current: val } : x));
                        setForm(p => ({ ...p, [`cur_${g.id}`]: "" }));
                      }
                    }}>✓</Btn>
                  </div>
                </Card>
              );
            })}
          </>
        )}
      </div>

      <Modal open={modal === "expense"} onClose={() => setModal(null)} title="💸 Novo Gasto" color={color}>
        <Inp label="Descrição *" value={form.description || ""} onChange={f("description")} placeholder="Ex: Almoço" autoFocus />
        <Inp label="Valor (R$) *" type="number" step="0.01" value={form.amount || ""} onChange={f("amount")} placeholder="0,00" />
        <Sel label="Categoria" value={form.category || "Outro"} onChange={f("category")}>
          {EXP_CATS.map(c => <option key={c}>{c}</option>)}
        </Sel>
        <Inp label="Data" type="date" value={form.date || today()} onChange={f("date")} />
        <Btn color={color} className="w-full" onClick={() => {
          if (!form.amount || !form.description) return;
          saveExpenses([...expenses, { id: uid(), date: form.date || today(), amount: Number(form.amount), category: form.category || "Outro", description: form.description }]);
          setModal(null); setForm({});
        }}>Registrar gasto</Btn>
      </Modal>

      <Modal open={modal === "bill"} onClose={() => setModal(null)} title="📋 Nova Conta" color={color}>
        <Inp label="Nome *" value={form.name || ""} onChange={f("name")} placeholder="Ex: Aluguel, Netflix" autoFocus />
        <Inp label="Valor (R$) *" type="number" step="0.01" value={form.amount || ""} onChange={f("amount")} />
        <Inp label="Dia do vencimento" type="number" min="1" max="31" value={form.dueDay || ""} onChange={f("dueDay")} placeholder="Ex: 15" />
        <Btn color={color} className="w-full" onClick={() => {
          if (!form.name || !form.amount) return;
          saveBills([...bills, { id: uid(), name: form.name, amount: Number(form.amount), dueDay: Number(form.dueDay) || 1, paid: false }]);
          setModal(null); setForm({});
        }}>Adicionar conta</Btn>
      </Modal>

      <Modal open={modal === "investment"} onClose={() => setModal(null)} title="📈 Novo Aporte" color={color}>
        <Inp label="Nome *" value={form.name || ""} onChange={f("name")} placeholder="Ex: CDB Nubank, IVVB11" autoFocus />
        <Inp label="Valor (R$) *" type="number" step="0.01" value={form.amount || ""} onChange={f("amount")} />
        <Sel label="Tipo" value={form.type || "Renda Fixa"} onChange={f("type")}>
          {INVEST_TYPES.map(t => <option key={t}>{t}</option>)}
        </Sel>
        <Inp label="Data" type="date" value={form.date || today()} onChange={f("date")} />
        <Btn color={color} className="w-full" onClick={() => {
          if (!form.name || !form.amount) return;
          saveInvestments([...investments, { id: uid(), name: form.name, type: form.type || "Renda Fixa", amount: Number(form.amount), date: form.date || today() }]);
          setModal(null); setForm({});
        }}>Registrar aporte</Btn>
      </Modal>

      <Modal open={modal === "fingoal"} onClose={() => setModal(null)} title="🎯 Nova Meta Financeira" color={color}>
        <Inp label="Meta *" value={form.name || ""} onChange={f("name")} placeholder="Ex: Reserva de emergência" autoFocus />
        <Inp label="Valor alvo (R$) *" type="number" step="0.01" value={form.target || ""} onChange={f("target")} placeholder="Ex: 10000" />
        <Inp label="Valor atual (R$)" type="number" step="0.01" value={form.current || ""} onChange={f("current")} placeholder="0" />
        <Inp label="Prazo" type="date" value={form.deadline || ""} onChange={f("deadline")} />
        <Btn color={color} className="w-full" onClick={() => {
          if (!form.name || !form.target) return;
          saveFinGoals([...finGoals, { id: uid(), name: form.name, target: Number(form.target), current: Number(form.current) || 0, deadline: form.deadline || "" }]);
          setModal(null); setForm({});
        }}>Criar meta</Btn>
      </Modal>
    </div>
  );
}

/* ─── HOME ───────────────────────────────────────────────────────────────────── */
function HomeTab({ setActiveTab }) {
  const [showReview, setShowReview]     = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotes, setShowNotes]       = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(Notif.granted());
  const noteCount = db.get("orbit_notes", []).filter(n => n.reminder && !n.notified && new Date(n.reminder) <= new Date()).length;

  useEffect(() => { Notif.checkOnOpen(); }, []);

  const books       = db.get("orbit_books", []);
  const courses     = db.get("orbit_courses", []);
  const tasks       = db.get("orbit_tasks", []);
  const habits      = db.get("orbit_habits", []);
  const habitLogs   = db.get("orbit_habit_logs", {});
  const bills       = db.get("orbit_bills", []);
  const expenses    = db.get("orbit_expenses", []);
  const travels     = db.get("orbit_travels", []);
  const investments = db.get("orbit_investments", []);
  const shopping    = db.get("orbit_shopping", []);

  const td         = today();
  const todayDone  = habitLogs[td] || [];
  const habitPct   = habits.length ? Math.round(todayDone.length / habits.length * 100) : 0;
  const currentBook = books.find(b => b.status === "Em Andamento");
  const monthTotal  = expenses.filter(e => e.date.startsWith(td.slice(0, 7))).reduce((s, e) => s + e.amount, 0);
  const openTasks   = tasks.filter(t => t.status !== "Concluído").length;
  const pendingBills = bills.filter(b => !b.paid).length;

  const sections = [
    {
      id: "estudos", color: P.navy, emoji: "📚", label: "Estudos",
      metric: books.filter(b => b.status === "Concluído").length,
      metricLabel: "lidos",
      lines: [currentBook ? `📖 ${currentBook.title}` : "Nenhum livro em andamento", `${courses.length} curso${courses.length !== 1 ? "s" : ""}`],
    },
    {
      id: "trabalho", color: P.forest, emoji: "💼", label: "Trabalho",
      metric: openTasks,
      metricLabel: "abertas",
      lines: [`tarefa${openTasks !== 1 ? "s" : ""} em aberto`],
    },
    {
      id: "vida", color: P.rose, emoji: "🌸", label: "Vida",
      metric: habitPct,
      metricLabel: "%",
      lines: [`hábitos hoje`, `${travels.filter(t => ["Planejando","Confirmado"].includes(t.status)).length} viagens planejadas`],
    },
    {
      id: "casa", color: P.amber, emoji: "🏡", label: "Casa",
      metric: shopping.filter(s => !s.done).length,
      metricLabel: "itens",
      lines: [`na lista de compras`],
    },
    {
      id: "financas", color: P.plum, emoji: "💰", label: "Finanças",
      metric: pendingBills,
      metricLabel: "conta" + (pendingBills !== 1 ? "s" : ""),
      lines: [`a pagar · ${fmtMoney(monthTotal)} este mês`],
    },
  ];

  return (
    <div className="fade-up">
      {/* Header with dot grid */}
      <div className="relative px-5 pt-14 pb-8 overflow-hidden"
        style={{
          backgroundColor: P.red,
          backgroundImage: `repeating-linear-gradient(-45deg,transparent,transparent 14px,rgba(255,255,255,0.08) 14px,rgba(255,255,255,0.08) 28px)`,
        }}>
        <div className="absolute top-5 right-5 flex gap-2">
          <button onClick={() => setShowReview(true)}
            className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30 transition-colors">
            📊 Semana
          </button>
          <button onClick={() => setShowNotes(true)} className="relative bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30 transition-colors">
            📝
            {noteCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-400 border border-black text-black text-[9px] font-black flex items-center justify-center">{noteCount}</span>}
          </button>
          <button onClick={() => setShowSettings(true)}
            className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30 transition-colors">
            ⚙️
          </button>
        </div>
        <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">A Vida Toda</p>
        <h1 className="font-display text-white leading-none" style={{ fontSize: "clamp(36px,11vw,52px)" }}>
          A Vida Toda
        </h1>
        <p className="text-white/65 text-xs mt-2 font-medium capitalize">
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>
      <ScallopBorder color={P.red} />

      <div className="px-4 pb-6 space-y-3 -mt-1">
        {/* Habit highlight */}
        {habits.length > 0 && (
          <button onClick={() => setActiveTab("vida")} className="w-full text-left">
            <div className="rounded-2xl border-2 border-black p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              style={{ background: `linear-gradient(135deg,${P.rose}15,${P.rose}28)` }}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm">🌱 Hábitos de hoje</p>
                <span className="font-numbers font-black text-3xl" style={{ color: P.rose }}>{habitPct}%</span>
              </div>
              <div className="w-full bg-white/70 rounded-full h-3 overflow-hidden">
                <div className="h-3 rounded-full progress-bar"
                  style={{ "--target-width": `${habitPct}%`, width: `${habitPct}%`, backgroundColor: P.rose }} />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">{todayDone.length} de {habits.length} concluídos · toca para ver</p>
            </div>
          </button>
        )}

        {/* Section tiles */}
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveTab(s.id)} className="w-full text-left">
            <div className="rounded-2xl border-2 border-black overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all">
              {/* Colored top with stripe */}
              <div className="px-4 py-3 overflow-hidden relative"
                style={{
                  backgroundColor: s.color,
                  backgroundImage: `repeating-linear-gradient(-45deg,transparent,transparent 10px,rgba(255,255,255,0.09) 10px,rgba(255,255,255,0.09) 20px)`,
                }}>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-white/60 text-xs font-bold uppercase tracking-widest">{s.emoji} {s.id}</span>
                    <p className="font-display text-white leading-tight" style={{ fontSize: 26 }}>{s.label}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-numbers font-black text-white leading-none" style={{ fontSize: 36 }}>{s.metric}</p>
                    <p className="text-white/60 text-xs">{s.metricLabel}</p>
                  </div>
                </div>
              </div>
              {/* White body */}
              <div className="bg-white px-4 py-2.5 flex items-center justify-between gap-2">
                <div className="flex-1">
                  {s.lines.map((line, i) => (
                    <p key={i} className="text-xs text-gray-500 leading-relaxed">{line}</p>
                  ))}
                </div>
                <span className="text-gray-300 text-xl flex-shrink-0">›</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {showNotes  && <NotesPanel  onClose={() => setShowNotes(false)} />}
      {showReview && <WeeklyReview onClose={() => setShowReview(false)} />}

      <Modal open={showSettings} onClose={() => setShowSettings(false)} title="⚙️ Configurações" color={P.red}>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
            <div>
              <p className="font-semibold text-sm">🔔 Lembretes</p>
              <p className="text-xs text-gray-400 mt-0.5">Notificação de hábitos e contas a pagar</p>
            </div>
            {notifEnabled ? (
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">Ativo</span>
            ) : (
              <Btn small color={P.red} onClick={async () => {
                const ok = await Notif.request();
                setNotifEnabled(ok);
              }}>Ativar</Btn>
            )}
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
            <p className="font-semibold text-sm">✦ A Vida Toda</p>
            <p className="text-xs text-gray-400 mt-1">Seu dashboard pessoal. Dados salvos localmente neste dispositivo.</p>
          </div>
        </div>
        <Btn ghost className="w-full border-2 border-black" onClick={() => setShowSettings(false)}>Fechar</Btn>
      </Modal>
    </div>
  );
}

/* ─── APP ────────────────────────────────────────────────────────────────────── */
export default function App() {
  const [activeTab, setActiveTab] = useState("home");

  const navItems = [
    { id: "home",     emoji: "✦",  label: "Home" },
    { id: "estudos",  emoji: "📚", label: "Estudos" },
    { id: "trabalho", emoji: "💼", label: "Trabalho" },
    { id: "vida",     emoji: "🌸", label: "Vida" },
    { id: "casa",     emoji: "🏡", label: "Casa" },
    { id: "financas", emoji: "💰", label: "Finanças" },
  ];

  return (
    <div className="min-h-screen max-w-lg mx-auto flex flex-col" style={{ backgroundColor: P.cream }}>
      <div className="flex-1 pb-[72px] overflow-y-auto">
        {activeTab === "home"     && <HomeTab setActiveTab={setActiveTab} />}
        {activeTab === "estudos"  && <EstudosTab />}
        {activeTab === "trabalho" && <TrabalhoTab />}
        {activeTab === "vida"     && <VidaTab />}
        {activeTab === "casa"     && <CasaTab />}
        {activeTab === "financas" && <FinancasTab />}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto z-40"
        style={{ backgroundColor: "white", borderTop: "2px solid #1A1A1A" }}>
        <div className="flex">
          {navItems.map(item => {
            const tab    = TABS.find(t => t.id === item.id);
            const active = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className="flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-all relative">
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                    style={{ backgroundColor: tab?.color || P.red }} />
                )}
                <span className={`text-xl transition-all duration-200 ${active ? "scale-125" : "grayscale opacity-60"}`}>{item.emoji}</span>
                <span className="text-[9px] font-bold transition-colors"
                  style={{ color: active ? (tab?.color || P.red) : "#9ca3af" }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
