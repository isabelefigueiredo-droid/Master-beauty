import { useState, useEffect } from "react";

const db = {
  get: (k, d = null) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const today = () => new Date().toISOString().split("T")[0];
const fmtDate = (d) => d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR") : "";
const fmtMoney = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const TABS = [
  { id: "home",     label: "Home",     emoji: "✦",  color: "#E63946", bg: "#FFF0F2" },
  { id: "estudos",  label: "Estudos",  emoji: "📚", color: "#4361EE", bg: "#EEF1FF" },
  { id: "trabalho", label: "Trabalho", emoji: "💼", color: "#52B788", bg: "#EDFBF0" },
  { id: "vida",     label: "Vida",     emoji: "🌸", color: "#FF6B9D", bg: "#FFF0F7" },
  { id: "casa",     label: "Casa",     emoji: "🏡", color: "#B45309", bg: "#FFFAEE" },
  { id: "financas", label: "Finanças", emoji: "💰", color: "#9B5DE5", bg: "#F5EEFF" },
];

/* ─── UI Components ─────────────────────────────────────────────────────────── */
function Btn({ children, onClick, color = "#E63946", small, ghost, danger, className = "" }) {
  const base = "font-bold rounded-xl transition-all active:scale-95 cursor-pointer border-2 border-black";
  const size = small ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm";
  const style = ghost ? { backgroundColor: "white", color: "#1a1a1a" }
    : danger ? { backgroundColor: "#fee2e2", color: "#dc2626" }
    : { backgroundColor: color, color: "white" };
  return <button onClick={onClick} className={`${base} ${size} ${className}`} style={style}>{children}</button>;
}

function Card({ children, className = "", accentColor }) {
  return (
    <div className={`bg-white rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4 ${className}`}
      style={accentColor ? { borderLeft: `5px solid ${accentColor}` } : {}}>
      {children}
    </div>
  );
}

function Badge({ children, color = "#E63946" }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded-lg text-xs font-bold border border-black"
      style={{ backgroundColor: color + "33", color }}>
      {children}
    </span>
  );
}

function Modal({ open, onClose, title, children, color = "#E63946" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl border-2 border-black w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b-2 border-black flex items-center justify-between" style={{ backgroundColor: color + "22" }}>
          <h3 className="font-black text-lg">{title}</h3>
          <button onClick={onClose} className="text-2xl leading-none font-bold hover:opacity-70 w-8 h-8 flex items-center justify-center">×</button>
        </div>
        <div className="p-4 space-y-3">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <div className="flex flex-col gap-1">{label && <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</label>}{children}</div>;
}

const inputCls = "border-2 border-black rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 bg-white w-full";

function Inp({ label, ...p }) {
  return <Field label={label}><input className={inputCls} {...p} /></Field>;
}
function Sel({ label, children, ...p }) {
  return <Field label={label}><select className={inputCls} {...p}>{children}</select></Field>;
}
function Tex({ label, ...p }) {
  return <Field label={label}><textarea className={inputCls + " resize-none"} rows={3} {...p} /></Field>;
}

function SubTabs({ tabs, active, setActive, color }) {
  return (
    <div className="flex border-b-2 border-black bg-white overflow-x-auto scrollbar-hide">
      {tabs.map(([id, label]) => (
        <button key={id} onClick={() => setActive(id)}
          className={`py-3 text-xs font-bold whitespace-nowrap px-3 flex-shrink-0 transition-colors ${active === id ? "border-b-4" : "text-gray-400"}`}
          style={active === id ? { borderBottomColor: color, color } : {}}>
          {label}
        </button>
      ))}
    </div>
  );
}

function TabHeader({ tab, subtitle }) {
  return (
    <div className="px-4 pt-6 pb-4" style={{ backgroundColor: tab.bg }}>
      <div className="flex items-center gap-3">
        <span className="text-3xl">{tab.emoji}</span>
        <div>
          <h1 className="font-black text-2xl leading-tight" style={{ color: tab.color }}>{tab.label} em Ordem</h1>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ emoji, text }) {
  return <p className="text-center text-gray-400 py-10 text-sm">{emoji} {text}</p>;
}

/* ─── ESTUDOS ───────────────────────────────────────────────────────────────── */
const BOOK_STATUS = {
  "Não Iniciado": "#FFD166",
  "Em Andamento": "#9B5DE5",
  "Concluído":    "#52B788",
  "Desisti":      "#E63946",
};

function EstudosTab() {
  const [sub, setSub] = useState("livros");
  const [books, setBooks] = useState(() => db.get("orbit_books", []));
  const [courses, setCourses] = useState(() => db.get("orbit_courses", []));
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [modInput, setModInput] = useState({});
  const color = "#4361EE";
  const tab = TABS.find(t => t.id === "estudos");

  const saveBooks = b => { setBooks(b); db.set("orbit_books", b); };
  const saveCourses = c => { setCourses(c); db.set("orbit_courses", c); };
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

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
    const title = modInput[cid] || "";
    if (!title.trim()) return;
    saveCourses(courses.map(c => c.id === cid ? { ...c, modules: [...c.modules, { id: uid(), title, notes: "", done: false }] } : c));
    setModInput(p => ({ ...p, [cid]: "" }));
  };

  return (
    <div>
      <TabHeader tab={tab} subtitle={`${books.filter(b => b.status === "Concluído").length} lidos · ${courses.length} cursos`} />
      <SubTabs tabs={[["livros","📖 Livros"],["cursos","🎓 Cursos"]]} active={sub} setActive={setSub} color={color} />

      <div className="p-4 space-y-3">
        {sub === "livros" && (
          <>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex gap-1 flex-wrap">
                {Object.entries(BOOK_STATUS).map(([s, c]) => (
                  <span key={s} className="text-xs font-bold px-2 py-0.5 rounded-lg border border-black" style={{ backgroundColor: c + "33", color: c }}>
                    {books.filter(b => b.status === s).length} {s.split(" ")[0]}
                  </span>
                ))}
              </div>
              <Btn small color={color} onClick={() => { setForm({}); setModal("book"); }}>+ Livro</Btn>
            </div>
            {books.length === 0 && <EmptyState emoji="📚" text="Nenhum livro ainda. Adicione um!" />}
            {books.map(book => (
              <Card key={book.id} accentColor={BOOK_STATUS[book.status]}>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm leading-tight">{book.title}</p>
                    {book.author && <p className="text-xs text-gray-500">{book.author}</p>}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <select value={book.status} onChange={e => saveBooks(books.map(b => b.id === book.id ? { ...b, status: e.target.value } : b))}
                        className="text-xs border border-gray-300 rounded-lg px-1.5 py-0.5 bg-white">
                        {Object.keys(BOOK_STATUS).map(s => <option key={s}>{s}</option>)}
                      </select>
                      <div className="flex">
                        {[1,2,3,4,5].map(star => (
                          <button key={star} onClick={() => saveBooks(books.map(b => b.id === book.id ? { ...b, rating: star } : b))}
                            className={`text-base ${star <= book.rating ? "text-yellow-400" : "text-gray-200"}`}>★</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => saveBooks(books.filter(b => b.id !== book.id))} className="text-gray-300 hover:text-red-500 text-xl leading-none mt-0.5">×</button>
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
            {courses.length === 0 && <EmptyState emoji="🎓" text="Nenhum curso ainda." />}
            {courses.map(course => {
              const done = course.modules.filter(m => m.done).length;
              const pct = course.modules.length ? Math.round(done / course.modules.length * 100) : 0;
              return (
                <Card key={course.id} accentColor={color}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="font-bold">{course.title}</p>
                      {course.platform && <p className="text-xs text-gray-500">{course.platform}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black" style={{ color }}>{pct}%</span>
                      <button onClick={() => saveCourses(courses.filter(c => c.id !== course.id))} className="text-gray-300 hover:text-red-500 text-xl leading-none">×</button>
                    </div>
                  </div>
                  {course.modules.length > 0 && (
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-3 overflow-hidden">
                      <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                  )}
                  <div className="space-y-2 mb-3">
                    {course.modules.map(mod => (
                      <div key={mod.id} className="border border-gray-200 rounded-xl p-2">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked={mod.done}
                            onChange={() => saveCourses(courses.map(c => c.id === course.id ? { ...c, modules: c.modules.map(m => m.id === mod.id ? { ...m, done: !m.done } : m) } : c))}
                            className="rounded cursor-pointer" />
                          <span className={`text-sm flex-1 ${mod.done ? "line-through text-gray-400" : "font-medium"}`}>{mod.title}</span>
                          <button onClick={() => saveCourses(courses.map(c => c.id === course.id ? { ...c, modules: c.modules.filter(m => m.id !== mod.id) } : c))}
                            className="text-gray-200 hover:text-red-400 text-lg leading-none">×</button>
                        </div>
                        <textarea className="mt-1 w-full text-xs border border-gray-100 rounded-lg px-2 py-1 resize-none focus:outline-none focus:border-gray-300"
                          placeholder="Notas..." rows={mod.notes ? 2 : 1} value={mod.notes}
                          onChange={e => saveCourses(courses.map(c => c.id === course.id ? { ...c, modules: c.modules.map(m => m.id === mod.id ? { ...m, notes: e.target.value } : m) } : c))} />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input className="flex-1 border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                      placeholder="Nova aula/módulo..."
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
        <Inp label="Título *" value={form.title || ""} onChange={f("title")} placeholder="Ex: Sapiens" />
        <Inp label="Autor" value={form.author || ""} onChange={f("author")} placeholder="Ex: Yuval Noah Harari" />
        <Btn color={color} className="w-full" onClick={addBook}>Adicionar livro</Btn>
      </Modal>

      <Modal open={modal === "course"} onClose={() => setModal(null)} title="🎓 Novo Curso" color={color}>
        <Inp label="Nome do curso *" value={form.title || ""} onChange={f("title")} placeholder="Ex: UX Design na prática" />
        <Inp label="Plataforma" value={form.platform || ""} onChange={f("platform")} placeholder="Ex: Udemy, YouTube, Alura" />
        <Btn color={color} className="w-full" onClick={addCourse}>Adicionar curso</Btn>
      </Modal>
    </div>
  );
}

/* ─── TRABALHO ──────────────────────────────────────────────────────────────── */
const TASK_STATUS_COLOR = { "Pendente": "#FFD166", "Em andamento": "#4361EE", "Concluído": "#52B788" };
const PRIORITY_COLOR = { "Alta": "#E63946", "Média": "#FF9500", "Baixa": "#52B788" };

function TrabalhoTab() {
  const [sub, setSub] = useState("tarefas");
  const [tasks, setTasks] = useState(() => db.get("orbit_tasks", []));
  const [goals, setGoals] = useState(() => db.get("orbit_career", []));
  const [ideas, setIdeas] = useState(() => db.get("orbit_ideas", []));
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const color = "#52B788";
  const tab = TABS.find(t => t.id === "trabalho");
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const saveTasks = t => { setTasks(t); db.set("orbit_tasks", t); };
  const saveGoals = g => { setGoals(g); db.set("orbit_career", g); };
  const saveIdeas = i => { setIdeas(i); db.set("orbit_ideas", i); };

  return (
    <div>
      <TabHeader tab={tab} subtitle={`${tasks.filter(t => t.status !== "Concluído").length} tarefas abertas`} />
      <SubTabs tabs={[["tarefas","✅ Tarefas"],["metas","🎯 Metas"],["ideias","💡 Ideias"]]} active={sub} setActive={setSub} color={color} />

      <div className="p-4 space-y-3">
        {sub === "tarefas" && (
          <>
            <div className="flex justify-end">
              <Btn small color={color} onClick={() => { setForm({ priority: "Média", status: "Pendente" }); setModal("task"); }}>+ Tarefa</Btn>
            </div>
            {tasks.length === 0 && <EmptyState emoji="✅" text="Nenhuma tarefa! Que luxo." />}
            {tasks.map(task => (
              <Card key={task.id} accentColor={TASK_STATUS_COLOR[task.status]}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm ${task.status === "Concluído" ? "line-through text-gray-400" : ""}`}>{task.title}</p>
                    {task.project && <p className="text-xs text-gray-500">📁 {task.project}</p>}
                    <div className="flex gap-2 mt-1.5 flex-wrap items-center">
                      <select value={task.status} onChange={e => saveTasks(tasks.map(t => t.id === task.id ? { ...t, status: e.target.value } : t))}
                        className="text-xs border border-gray-300 rounded-lg px-1.5 py-0.5 bg-white">
                        {Object.keys(TASK_STATUS_COLOR).map(s => <option key={s}>{s}</option>)}
                      </select>
                      <Badge color={PRIORITY_COLOR[task.priority]}>{task.priority}</Badge>
                      {task.dueDate && <span className="text-xs text-gray-400">📅 {fmtDate(task.dueDate)}</span>}
                    </div>
                  </div>
                  <button onClick={() => saveTasks(tasks.filter(t => t.id !== task.id))} className="text-gray-300 hover:text-red-500 text-xl leading-none">×</button>
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
            {goals.length === 0 && <EmptyState emoji="🎯" text="Nenhuma meta de carreira ainda." />}
            {goals.map(g => (
              <Card key={g.id} accentColor={color}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-bold text-sm">{g.title}</p>
                    {g.timeframe && <p className="text-xs text-gray-500 mt-0.5">⏱ {g.timeframe}</p>}
                    {g.notes && <p className="text-xs text-gray-600 mt-1">{g.notes}</p>}
                    <div className="mt-1.5">
                      <select value={g.status} onChange={e => saveGoals(goals.map(x => x.id === g.id ? { ...x, status: e.target.value } : x))}
                        className="text-xs border border-gray-300 rounded-lg px-1.5 py-0.5 bg-white">
                        <option>Em andamento</option><option>Concluído</option><option>Pausado</option>
                      </select>
                    </div>
                  </div>
                  <button onClick={() => saveGoals(goals.filter(x => x.id !== g.id))} className="text-gray-300 hover:text-red-500 text-xl leading-none">×</button>
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
            {ideas.length === 0 && <EmptyState emoji="💡" text="Nenhuma ideia registrada ainda." />}
            {ideas.map(idea => (
              <Card key={idea.id} accentColor={color}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-sm">{idea.title}</p>
                    {idea.content && <p className="text-xs text-gray-600 mt-1">{idea.content}</p>}
                    <p className="text-xs text-gray-400 mt-1">{fmtDate(idea.date)}</p>
                  </div>
                  <button onClick={() => saveIdeas(ideas.filter(i => i.id !== idea.id))} className="text-gray-300 hover:text-red-500 text-xl leading-none">×</button>
                </div>
              </Card>
            ))}
          </>
        )}
      </div>

      <Modal open={modal === "task"} onClose={() => setModal(null)} title="✅ Nova Tarefa" color={color}>
        <Inp label="Tarefa *" value={form.title || ""} onChange={f("title")} placeholder="O que precisa ser feito?" />
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

      <Modal open={modal === "goal"} onClose={() => setModal(null)} title="🎯 Nova Meta de Carreira" color={color}>
        <Inp label="Meta *" value={form.title || ""} onChange={f("title")} placeholder="Ex: Ser promovida até dez/25" />
        <Inp label="Prazo" value={form.timeframe || ""} onChange={f("timeframe")} placeholder="Ex: 6 meses, Q4 2025" />
        <Tex label="Notas" value={form.notes || ""} onChange={f("notes")} placeholder="Detalhes..." />
        <Btn color={color} className="w-full" onClick={() => {
          if (!form.title) return;
          saveGoals([...goals, { id: uid(), title: form.title, timeframe: form.timeframe || "", status: "Em andamento", notes: form.notes || "" }]);
          setModal(null); setForm({});
        }}>Adicionar meta</Btn>
      </Modal>

      <Modal open={modal === "idea"} onClose={() => setModal(null)} title="💡 Nova Ideia" color={color}>
        <Inp label="Título *" value={form.title || ""} onChange={f("title")} placeholder="Nome da ideia" />
        <Tex label="Detalhe" value={form.content || ""} onChange={f("content")} placeholder="Descreva a ideia..." />
        <Btn color={color} className="w-full" onClick={() => {
          if (!form.title) return;
          saveIdeas([...ideas, { id: uid(), title: form.title, content: form.content || "", date: today() }]);
          setModal(null); setForm({});
        }}>Salvar ideia</Btn>
      </Modal>
    </div>
  );
}

/* ─── VIDA ──────────────────────────────────────────────────────────────────── */
const MOOD_EMOJIS = ["😢","😟","😐","🙂","😄"];
const MOOD_LABELS = ["Muito ruim","Ruim","Ok","Bom","Ótimo"];
const TRAVEL_STATUS_COLOR = { "Sonho": "#9B5DE5", "Planejando": "#4361EE", "Confirmado": "#52B788", "Feito": "#FFD166" };

function VidaTab() {
  const [sub, setSub] = useState("habitos");
  const [habits, setHabits] = useState(() => db.get("orbit_habits", []));
  const [habitLogs, setHabitLogs] = useState(() => db.get("orbit_habit_logs", {}));
  const [lifeGoals, setLifeGoals] = useState(() => db.get("orbit_life_goals", []));
  const [travels, setTravels] = useState(() => db.get("orbit_travels", []));
  const [moods, setMoods] = useState(() => db.get("orbit_moods", []));
  const [appointments, setAppointments] = useState(() => db.get("orbit_appointments", []));
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const color = "#FF6B9D";
  const tab = TABS.find(t => t.id === "vida");
  const td = today();
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const saveHabits = h => { setHabits(h); db.set("orbit_habits", h); };
  const saveHabitLogs = l => { setHabitLogs(l); db.set("orbit_habit_logs", l); };
  const saveLifeGoals = g => { setLifeGoals(g); db.set("orbit_life_goals", g); };
  const saveTravels = t => { setTravels(t); db.set("orbit_travels", t); };
  const saveMoods = m => { setMoods(m); db.set("orbit_moods", m); };
  const saveAppointments = a => { setAppointments(a); db.set("orbit_appointments", a); };

  const todayDone = habitLogs[td] || [];
  const habitPct = habits.length ? Math.round(todayDone.length / habits.length * 100) : 0;
  const todayMood = moods.find(m => m.date === td);

  const toggleHabit = id => {
    const logs = { ...habitLogs };
    if (!logs[td]) logs[td] = [];
    logs[td] = logs[td].includes(id) ? logs[td].filter(h => h !== id) : [...logs[td], id];
    saveHabitLogs(logs);
  };

  return (
    <div>
      <TabHeader tab={tab} subtitle={habits.length ? `${habitPct}% dos hábitos hoje` : "Vida & bem-estar"} />
      <SubTabs
        tabs={[["habitos","🌱 Hábitos"],["objetivos","🌟 Objetivos"],["viagens","✈️ Viagens"],["bemestar","💆 Bem-estar"],["consultas","🩺 Consultas"]]}
        active={sub} setActive={setSub} color={color} />

      <div className="p-4 space-y-3">
        {sub === "habitos" && (
          <>
            {habits.length > 0 && (
              <Card>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-sm">{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>
                  <span className="font-black text-2xl" style={{ color }}>{habitPct}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className="h-3 rounded-full transition-all duration-500" style={{ width: `${habitPct}%`, backgroundColor: color }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">{todayDone.length} de {habits.length} concluídos</p>
              </Card>
            )}
            <div className="flex justify-end">
              <Btn small color={color} onClick={() => { setForm({ emoji: "" }); setModal("habit"); }}>+ Hábito</Btn>
            </div>
            {habits.length === 0 && <EmptyState emoji="🌱" text="Adicione seus hábitos diários!" />}
            {habits.map(h => {
              const done = todayDone.includes(h.id);
              return (
                <button key={h.id} onClick={() => toggleHabit(h.id)} className="w-full text-left">
                  <Card accentColor={done ? color : "#e5e7eb"} className="transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl border-2 border-black flex items-center justify-center text-lg flex-shrink-0"
                        style={{ backgroundColor: done ? color : "white" }}>
                        {done ? <span className="text-white font-black text-base">✓</span> : <span>{h.emoji || "✦"}</span>}
                      </div>
                      <span className={`font-bold text-sm flex-1 ${done ? "line-through text-gray-400" : ""}`}>{h.name}</span>
                      <button onClick={e => { e.stopPropagation(); saveHabits(habits.filter(x => x.id !== h.id)); }}
                        className="text-gray-300 hover:text-red-500 text-xl leading-none">×</button>
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
            {lifeGoals.length === 0 && <EmptyState emoji="🌟" text="Nenhum objetivo ainda." />}
            {lifeGoals.map(g => (
              <Card key={g.id} accentColor={color}>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <p className="font-bold text-sm">{g.title}</p>
                    <div className="flex gap-2 mt-1 flex-wrap items-center">
                      {g.category && <Badge color={color}>{g.category}</Badge>}
                      {g.timeframe && <span className="text-xs text-gray-500">{g.timeframe}</span>}
                    </div>
                    <select value={g.status} onChange={e => saveLifeGoals(lifeGoals.map(x => x.id === g.id ? { ...x, status: e.target.value } : x))}
                      className="mt-1.5 text-xs border border-gray-300 rounded-lg px-1.5 py-0.5 bg-white">
                      <option>Em andamento</option><option>Concluído</option><option>Pausado</option>
                    </select>
                  </div>
                  <button onClick={() => saveLifeGoals(lifeGoals.filter(x => x.id !== g.id))} className="text-gray-300 hover:text-red-500 text-xl leading-none">×</button>
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
            {travels.length === 0 && <EmptyState emoji="✈️" text="Sua bucket list de viagens!" />}
            {travels.map(t => (
              <Card key={t.id} accentColor={TRAVEL_STATUS_COLOR[t.status]}>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <p className="font-bold">{t.destination}</p>
                    <div className="flex gap-2 mt-1 flex-wrap items-center">
                      <select value={t.status} onChange={e => saveTravels(travels.map(x => x.id === t.id ? { ...x, status: e.target.value } : x))}
                        className="text-xs border border-gray-300 rounded-lg px-1.5 py-0.5 bg-white">
                        {Object.keys(TRAVEL_STATUS_COLOR).map(s => <option key={s}>{s}</option>)}
                      </select>
                      {t.date && <span className="text-xs text-gray-500">{fmtDate(t.date)}</span>}
                    </div>
                    {t.notes && <p className="text-xs text-gray-500 mt-1">{t.notes}</p>}
                  </div>
                  <button onClick={() => saveTravels(travels.filter(x => x.id !== t.id))} className="text-gray-300 hover:text-red-500 text-xl leading-none">×</button>
                </div>
              </Card>
            ))}
          </>
        )}

        {sub === "bemestar" && (
          <>
            <div className="flex justify-end">
              <Btn small color={color} onClick={() => { setForm({ mood: todayMood?.mood || 3, notes: todayMood?.notes || "" }); setModal("mood"); }}>
                {todayMood ? "✏️ Editar humor" : "+ Humor hoje"}
              </Btn>
            </div>
            {todayMood && (
              <Card accentColor={color}>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Hoje</p>
                <p className="text-3xl">{MOOD_EMOJIS[todayMood.mood - 1]}</p>
                <p className="font-bold" style={{ color }}>{MOOD_LABELS[todayMood.mood - 1]}</p>
                {todayMood.notes && <p className="text-xs text-gray-600 mt-1">{todayMood.notes}</p>}
              </Card>
            )}
            {!todayMood && <EmptyState emoji="💆" text="Como você está hoje?" />}
            <div className="space-y-2">
              {moods.filter(m => m.date !== td).slice(0, 14).map(m => (
                <div key={m.id} className="flex items-center gap-3 px-3 py-2 bg-white rounded-xl border-2 border-gray-100">
                  <span className="text-xs text-gray-400 w-20 flex-shrink-0">{fmtDate(m.date)}</span>
                  <span className="text-lg">{MOOD_EMOJIS[m.mood - 1]}</span>
                  <span className="text-xs font-medium">{MOOD_LABELS[m.mood - 1]}</span>
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
            {appointments.length === 0 && <EmptyState emoji="🩺" text="Nenhuma consulta registrada." />}
            {[...appointments].sort((a, b) => (a.date || "").localeCompare(b.date || "")).map(a => (
              <Card key={a.id} accentColor={color}>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-bold text-sm">{a.doctor}</p>
                    {a.specialty && <Badge color={color}>{a.specialty}</Badge>}
                    {a.date && <p className="text-xs text-gray-500 mt-1">📅 {fmtDate(a.date)}</p>}
                    {a.notes && <p className="text-xs text-gray-600 mt-1">{a.notes}</p>}
                  </div>
                  <button onClick={() => saveAppointments(appointments.filter(x => x.id !== a.id))} className="text-gray-300 hover:text-red-500 text-xl leading-none">×</button>
                </div>
              </Card>
            ))}
          </>
        )}
      </div>

      <Modal open={modal === "habit"} onClose={() => setModal(null)} title="🌱 Novo Hábito" color={color}>
        <Inp label="Nome *" value={form.name || ""} onChange={f("name")} placeholder="Ex: Beber 2L de água" />
        <Inp label="Emoji" value={form.emoji || ""} onChange={f("emoji")} placeholder="💧" maxLength={2} />
        <Btn color={color} className="w-full" onClick={() => {
          if (!form.name) return;
          saveHabits([...habits, { id: uid(), name: form.name, emoji: form.emoji || "✦" }]);
          setModal(null); setForm({});
        }}>Adicionar hábito</Btn>
      </Modal>

      <Modal open={modal === "lifegoal"} onClose={() => setModal(null)} title="🌟 Novo Objetivo" color={color}>
        <Inp label="Objetivo *" value={form.title || ""} onChange={f("title")} placeholder="Ex: Morar no exterior" />
        <Inp label="Categoria" value={form.category || ""} onChange={f("category")} placeholder="Ex: Carreira, Pessoal, Família" />
        <Inp label="Prazo" value={form.timeframe || ""} onChange={f("timeframe")} placeholder="Ex: 2026, próximos 5 anos" />
        <Btn color={color} className="w-full" onClick={() => {
          if (!form.title) return;
          saveLifeGoals([...lifeGoals, { id: uid(), title: form.title, category: form.category || "Pessoal", timeframe: form.timeframe || "", status: "Em andamento" }]);
          setModal(null); setForm({});
        }}>Adicionar objetivo</Btn>
      </Modal>

      <Modal open={modal === "travel"} onClose={() => setModal(null)} title="✈️ Novo Destino" color={color}>
        <Inp label="Destino *" value={form.destination || ""} onChange={f("destination")} placeholder="Ex: Tóquio, Japão" />
        <Sel label="Status" value={form.status || "Sonho"} onChange={f("status")}>
          {Object.keys(TRAVEL_STATUS_COLOR).map(s => <option key={s}>{s}</option>)}
        </Sel>
        <Inp label="Data prevista" type="date" value={form.date || ""} onChange={f("date")} />
        <Tex label="Notas" value={form.notes || ""} onChange={f("notes")} placeholder="Planos, observações..." />
        <Btn color={color} className="w-full" onClick={() => {
          if (!form.destination) return;
          saveTravels([...travels, { id: uid(), destination: form.destination, status: form.status || "Sonho", date: form.date || "", notes: form.notes || "" }]);
          setModal(null); setForm({});
        }}>Adicionar destino</Btn>
      </Modal>

      <Modal open={modal === "mood"} onClose={() => setModal(null)} title="💆 Como você está?" color={color}>
        <div className="flex justify-between gap-1">
          {MOOD_EMOJIS.map((em, i) => (
            <button key={i} onClick={() => setForm(p => ({ ...p, mood: i + 1 }))}
              className={`flex-1 py-3 rounded-xl border-2 text-2xl transition-all ${form.mood === i + 1 ? "border-black scale-110 bg-pink-50" : "border-gray-200"}`}>
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
        <Inp label="Médico/Profissional *" value={form.doctor || ""} onChange={f("doctor")} placeholder="Ex: Dra. Ana Lima" />
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

/* ─── CASA ──────────────────────────────────────────────────────────────────── */
const CLEAN_FREQ_COLOR = { "Diário": "#E63946", "Semanal": "#4361EE", "Quinzenal": "#9B5DE5", "Mensal": "#52B788" };

function CasaTab() {
  const [sub, setSub] = useState("limpeza");
  const [cleaning, setCleaning] = useState(() => db.get("orbit_cleaning", []));
  const [shopping, setShopping] = useState(() => db.get("orbit_shopping", []));
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [newItem, setNewItem] = useState("");
  const color = "#B45309";
  const tab = TABS.find(t => t.id === "casa");
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const saveCleaning = c => { setCleaning(c); db.set("orbit_cleaning", c); };
  const saveShopping = s => { setShopping(s); db.set("orbit_shopping", s); };

  const addShoppingItem = () => {
    if (!newItem.trim()) return;
    saveShopping([...shopping, { id: uid(), name: newItem.trim(), done: false }]);
    setNewItem("");
  };

  return (
    <div>
      <TabHeader tab={tab} subtitle={`${shopping.filter(s => !s.done).length} itens na lista`} />
      <SubTabs tabs={[["limpeza","🧹 Limpeza"],["compras","🛒 Compras"]]} active={sub} setActive={setSub} color={color} />

      <div className="p-4 space-y-3">
        {sub === "limpeza" && (
          <>
            <div className="flex justify-end">
              <Btn small color={color} onClick={() => { setForm({ frequency: "Semanal" }); setModal("clean"); }}>+ Tarefa</Btn>
            </div>
            {cleaning.length === 0 && <EmptyState emoji="🧹" text="Nenhuma tarefa de limpeza cadastrada." />}
            {cleaning.map(task => (
              <Card key={task.id} accentColor={CLEAN_FREQ_COLOR[task.frequency]}>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm">{task.name}</p>
                    <div className="flex gap-2 mt-1 items-center">
                      <Badge color={CLEAN_FREQ_COLOR[task.frequency]}>{task.frequency}</Badge>
                      {task.lastDone && <span className="text-xs text-gray-400">Última: {fmtDate(task.lastDone)}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center flex-shrink-0">
                    <Btn small color={color} onClick={() => saveCleaning(cleaning.map(c => c.id === task.id ? { ...c, lastDone: today() } : c))}>✓ Feito</Btn>
                    <button onClick={() => saveCleaning(cleaning.filter(c => c.id !== task.id))} className="text-gray-300 hover:text-red-500 text-xl leading-none">×</button>
                  </div>
                </div>
              </Card>
            ))}
          </>
        )}

        {sub === "compras" && (
          <>
            <div className="flex gap-2">
              <input className="flex-1 border-2 border-black rounded-xl px-3 py-2 text-sm focus:outline-none"
                placeholder="Adicionar item..." value={newItem}
                onChange={e => setNewItem(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addShoppingItem()} />
              <Btn color={color} onClick={addShoppingItem}>+</Btn>
            </div>
            {shopping.some(s => s.done) && (
              <button onClick={() => saveShopping(shopping.filter(s => !s.done))}
                className="text-xs text-gray-400 hover:text-red-600 font-medium transition-colors">
                Limpar itens comprados ({shopping.filter(s => s.done).length})
              </button>
            )}
            {shopping.length === 0 && <EmptyState emoji="🛒" text="Lista vazia!" />}
            {shopping.filter(s => !s.done).map(item => (
              <div key={item.id} onClick={() => saveShopping(shopping.map(s => s.id === item.id ? { ...s, done: true } : s))}
                className="flex items-center gap-3 bg-white rounded-xl border-2 border-black px-3 py-3 cursor-pointer active:scale-[0.99] transition-transform">
                <div className="w-5 h-5 rounded-md border-2 border-black flex-shrink-0" />
                <span className="text-sm font-medium flex-1">{item.name}</span>
                <button onClick={e => { e.stopPropagation(); saveShopping(shopping.filter(s => s.id !== item.id)); }}
                  className="text-gray-300 hover:text-red-500 text-xl leading-none">×</button>
              </div>
            ))}
            {shopping.filter(s => s.done).map(item => (
              <div key={item.id} onClick={() => saveShopping(shopping.map(s => s.id === item.id ? { ...s, done: false } : s))}
                className="flex items-center gap-3 bg-gray-50 rounded-xl border border-gray-200 px-3 py-3 cursor-pointer opacity-60">
                <div className="w-5 h-5 rounded-md border-2 border-gray-400 bg-gray-300 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-black">✓</span>
                </div>
                <span className="text-sm line-through text-gray-400 flex-1">{item.name}</span>
              </div>
            ))}
          </>
        )}
      </div>

      <Modal open={modal === "clean"} onClose={() => setModal(null)} title="🧹 Nova Tarefa de Limpeza" color={color}>
        <Inp label="Tarefa *" value={form.name || ""} onChange={f("name")} placeholder="Ex: Limpar banheiro" />
        <Sel label="Frequência" value={form.frequency || "Semanal"} onChange={f("frequency")}>
          {Object.keys(CLEAN_FREQ_COLOR).map(fr => <option key={fr}>{fr}</option>)}
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

/* ─── FINANÇAS ──────────────────────────────────────────────────────────────── */
const EXPENSE_CATS = ["Alimentação","Transporte","Lazer","Saúde","Casa","Roupa","Beleza","Assinaturas","Outro"];
const INVEST_TYPES = ["Renda Fixa","Renda Variável","FIIs","Tesouro Direto","Cripto","Outro"];

function FinancasTab() {
  const [sub, setSub] = useState("gastos");
  const [expenses, setExpenses] = useState(() => db.get("orbit_expenses", []));
  const [investments, setInvestments] = useState(() => db.get("orbit_investments", []));
  const [bills, setBills] = useState(() => db.get("orbit_bills", []));
  const [finGoals, setFinGoals] = useState(() => db.get("orbit_fin_goals", []));
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [filterMonth, setFilterMonth] = useState(today().slice(0, 7));
  const color = "#9B5DE5";
  const tab = TABS.find(t => t.id === "financas");
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const saveExpenses = e => { setExpenses(e); db.set("orbit_expenses", e); };
  const saveInvestments = i => { setInvestments(i); db.set("orbit_investments", i); };
  const saveBills = b => { setBills(b); db.set("orbit_bills", b); };
  const saveFinGoals = g => { setFinGoals(g); db.set("orbit_fin_goals", g); };

  const monthExp = expenses.filter(e => e.date.startsWith(filterMonth));
  const monthTotal = monthExp.reduce((s, e) => s + e.amount, 0);
  const byCategory = EXPENSE_CATS
    .map(cat => ({ cat, total: monthExp.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0) }))
    .filter(c => c.total > 0).sort((a, b) => b.total - a.total);
  const totalInvested = investments.reduce((s, i) => s + i.amount, 0);

  return (
    <div>
      <TabHeader tab={tab} subtitle={`${fmtMoney(monthTotal)} gastos este mês`} />
      <SubTabs tabs={[["gastos","💸 Gastos"],["contas","📋 Contas"],["investimentos","📈 Aportes"],["metas","🎯 Metas"]]} active={sub} setActive={setSub} color={color} />

      <div className="p-4 space-y-3">
        {sub === "gastos" && (
          <>
            <div className="flex items-center gap-2">
              <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
                className="flex-1 border-2 border-black rounded-xl px-3 py-2 text-sm focus:outline-none" />
              <Btn small color={color} onClick={() => { setForm({ date: today(), category: "Alimentação" }); setModal("expense"); }}>+ Gasto</Btn>
            </div>
            {byCategory.length > 0 && (
              <Card>
                <div className="flex items-baseline justify-between mb-3">
                  <p className="font-black text-2xl">{fmtMoney(monthTotal)}</p>
                  <p className="text-xs text-gray-400">total no mês</p>
                </div>
                <div className="space-y-2">
                  {byCategory.map(({ cat, total }) => (
                    <div key={cat}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="font-medium">{cat}</span>
                        <span className="font-bold">{fmtMoney(total)}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="h-2 rounded-full" style={{ width: `${(total / monthTotal) * 100}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            {monthExp.length === 0 && <EmptyState emoji="💸" text="Nenhum gasto neste mês." />}
            {[...monthExp].sort((a, b) => b.date.localeCompare(a.date)).map(exp => (
              <Card key={exp.id} accentColor={color}>
                <div className="flex justify-between items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{exp.description}</p>
                    <div className="flex gap-2 mt-0.5 items-center">
                      <Badge color={color}>{exp.category}</Badge>
                      <span className="text-xs text-gray-400">{fmtDate(exp.date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-black text-sm">{fmtMoney(exp.amount)}</span>
                    <button onClick={() => saveExpenses(expenses.filter(e => e.id !== exp.id))} className="text-gray-300 hover:text-red-500 text-xl leading-none">×</button>
                  </div>
                </div>
              </Card>
            ))}
          </>
        )}

        {sub === "contas" && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500">{bills.filter(b => !b.paid).length} pendentes · </span>
                <span className="text-xs font-bold">{fmtMoney(bills.filter(b => !b.paid).reduce((s, b) => s + b.amount, 0))}</span>
              </div>
              <Btn small color={color} onClick={() => { setForm({}); setModal("bill"); }}>+ Conta</Btn>
            </div>
            {bills.length === 0 && <EmptyState emoji="📋" text="Nenhuma conta cadastrada." />}
            {[...bills].sort((a, b) => a.dueDay - b.dueDay).map(bill => (
              <Card key={bill.id} accentColor={bill.paid ? "#52B788" : color}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${bill.paid ? "line-through text-gray-400" : ""}`}>{bill.name}</p>
                    <div className="flex gap-2 mt-0.5 items-center">
                      <span className="text-xs text-gray-500">Vence dia {bill.dueDay}</span>
                      <Badge color={bill.paid ? "#52B788" : color}>{bill.paid ? "Pago" : "Pendente"}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-black text-sm">{fmtMoney(bill.amount)}</span>
                    <button onClick={() => saveBills(bills.map(b => b.id === bill.id ? { ...b, paid: !b.paid } : b))}
                      className={`w-7 h-7 rounded-full border-2 border-black text-sm flex items-center justify-center transition-colors ${bill.paid ? "bg-green-400 text-white" : "bg-white"}`}>
                      {bill.paid ? "✓" : ""}
                    </button>
                    <button onClick={() => saveBills(bills.filter(b => b.id !== bill.id))} className="text-gray-300 hover:text-red-500 text-xl leading-none">×</button>
                  </div>
                </div>
              </Card>
            ))}
          </>
        )}

        {sub === "investimentos" && (
          <>
            {investments.length > 0 && (
              <Card accentColor={color}>
                <p className="text-xs text-gray-500">Total registrado</p>
                <p className="font-black text-2xl">{fmtMoney(totalInvested)}</p>
              </Card>
            )}
            <div className="flex justify-end">
              <Btn small color={color} onClick={() => { setForm({ date: today(), type: "Renda Fixa" }); setModal("investment"); }}>+ Aporte</Btn>
            </div>
            {investments.length === 0 && <EmptyState emoji="📈" text="Nenhum investimento registrado." />}
            {[...investments].sort((a, b) => b.date.localeCompare(a.date)).map(inv => (
              <Card key={inv.id} accentColor={color}>
                <div className="flex justify-between items-center gap-2">
                  <div className="flex-1">
                    <p className="font-bold text-sm">{inv.name}</p>
                    <div className="flex gap-2 mt-0.5 items-center">
                      <Badge color={color}>{inv.type}</Badge>
                      <span className="text-xs text-gray-400">{fmtDate(inv.date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-black text-sm">{fmtMoney(inv.amount)}</span>
                    <button onClick={() => saveInvestments(investments.filter(i => i.id !== inv.id))} className="text-gray-300 hover:text-red-500 text-xl leading-none">×</button>
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
            {finGoals.length === 0 && <EmptyState emoji="🎯" text="Nenhuma meta financeira ainda." />}
            {finGoals.map(g => {
              const pct = g.target > 0 ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0;
              return (
                <Card key={g.id} accentColor={color}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-sm">{g.name}</p>
                      {g.deadline && <p className="text-xs text-gray-400">📅 {fmtDate(g.deadline)}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm" style={{ color }}>{pct}%</span>
                      <button onClick={() => saveFinGoals(finGoals.filter(x => x.id !== g.id))} className="text-gray-300 hover:text-red-500 text-xl leading-none">×</button>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden mb-1">
                    <div className="h-3 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>{fmtMoney(g.current)}</span>
                    <span>{fmtMoney(g.target)}</span>
                  </div>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Atualizar valor atual..."
                      className="flex-1 border border-gray-200 rounded-xl px-2 py-1.5 text-xs focus:outline-none"
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
        <Inp label="Descrição *" value={form.description || ""} onChange={f("description")} placeholder="Ex: Almoço" />
        <Inp label="Valor (R$) *" type="number" step="0.01" value={form.amount || ""} onChange={f("amount")} placeholder="0,00" />
        <Sel label="Categoria" value={form.category || "Outro"} onChange={f("category")}>
          {EXPENSE_CATS.map(c => <option key={c}>{c}</option>)}
        </Sel>
        <Inp label="Data" type="date" value={form.date || today()} onChange={f("date")} />
        <Btn color={color} className="w-full" onClick={() => {
          if (!form.amount || !form.description) return;
          saveExpenses([...expenses, { id: uid(), date: form.date || today(), amount: Number(form.amount), category: form.category || "Outro", description: form.description }]);
          setModal(null); setForm({});
        }}>Registrar gasto</Btn>
      </Modal>

      <Modal open={modal === "bill"} onClose={() => setModal(null)} title="📋 Nova Conta" color={color}>
        <Inp label="Nome *" value={form.name || ""} onChange={f("name")} placeholder="Ex: Aluguel, Netflix" />
        <Inp label="Valor (R$) *" type="number" step="0.01" value={form.amount || ""} onChange={f("amount")} />
        <Inp label="Dia do vencimento" type="number" min="1" max="31" value={form.dueDay || ""} onChange={f("dueDay")} placeholder="Ex: 15" />
        <Btn color={color} className="w-full" onClick={() => {
          if (!form.name || !form.amount) return;
          saveBills([...bills, { id: uid(), name: form.name, amount: Number(form.amount), dueDay: Number(form.dueDay) || 1, paid: false }]);
          setModal(null); setForm({});
        }}>Adicionar conta</Btn>
      </Modal>

      <Modal open={modal === "investment"} onClose={() => setModal(null)} title="📈 Novo Aporte" color={color}>
        <Inp label="Nome *" value={form.name || ""} onChange={f("name")} placeholder="Ex: CDB Nubank, IVVB11" />
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
        <Inp label="Meta *" value={form.name || ""} onChange={f("name")} placeholder="Ex: Reserva de emergência" />
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

/* ─── HOME ──────────────────────────────────────────────────────────────────── */
function HomeTab({ setActiveTab }) {
  const books = db.get("orbit_books", []);
  const courses = db.get("orbit_courses", []);
  const tasks = db.get("orbit_tasks", []);
  const habits = db.get("orbit_habits", []);
  const habitLogs = db.get("orbit_habit_logs", {});
  const bills = db.get("orbit_bills", []);
  const expenses = db.get("orbit_expenses", []);
  const travels = db.get("orbit_travels", []);
  const investments = db.get("orbit_investments", []);
  const shopping = db.get("orbit_shopping", []);

  const td = today();
  const todayDone = habitLogs[td] || [];
  const habitPct = habits.length ? Math.round(todayDone.length / habits.length * 100) : 0;
  const currentBook = books.find(b => b.status === "Em Andamento");
  const monthTotal = expenses.filter(e => e.date.startsWith(td.slice(0, 7))).reduce((s, e) => s + e.amount, 0);
  const openTasks = tasks.filter(t => t.status !== "Concluído").length;
  const pendingBills = bills.filter(b => !b.paid).length;

  const sections = [
    {
      id: "estudos", color: "#4361EE", bg: "#EEF1FF", emoji: "📚", title: "Estudos",
      lines: [
        currentBook ? `Lendo: ${currentBook.title}` : `${books.filter(b => b.status === "Concluído").length} livros concluídos`,
        `${courses.length} curso${courses.length !== 1 ? "s" : ""}`,
      ]
    },
    {
      id: "trabalho", color: "#52B788", bg: "#EDFBF0", emoji: "💼", title: "Trabalho",
      lines: [`${openTasks} tarefa${openTasks !== 1 ? "s" : ""} em aberto`]
    },
    {
      id: "vida", color: "#FF6B9D", bg: "#FFF0F7", emoji: "🌸", title: "Vida",
      lines: [
        habits.length ? `${habitPct}% dos hábitos hoje` : "Nenhum hábito cadastrado",
        `${travels.filter(t => ["Planejando","Confirmado"].includes(t.status)).length} viagens planejadas`,
      ]
    },
    {
      id: "casa", color: "#B45309", bg: "#FFFAEE", emoji: "🏡", title: "Casa",
      lines: [`${shopping.filter(s => !s.done).length} itens na lista de compras`]
    },
    {
      id: "financas", color: "#9B5DE5", bg: "#F5EEFF", emoji: "💰", title: "Finanças",
      lines: [
        `${fmtMoney(monthTotal)} gastos este mês`,
        `${pendingBills} conta${pendingBills !== 1 ? "s" : ""} a pagar`,
      ]
    },
  ];

  return (
    <div className="p-4 space-y-4 pt-8">
      {/* Brand header */}
      <div className="mb-2">
        <div className="flex items-center gap-2">
          <h1 className="font-black text-4xl tracking-tight" style={{ color: "#E63946" }}>My Orbit</h1>
          <span className="text-3xl">✦</span>
        </div>
        <p className="text-sm text-gray-500 mt-0.5 capitalize">
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* Habit progress bar */}
      {habits.length > 0 && (
        <div className="rounded-2xl border-2 border-black p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          style={{ background: "linear-gradient(135deg, #FFF0F2, #FFE0E8)" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="font-black text-sm">🌱 Hábitos de hoje</p>
            <span className="font-black text-2xl" style={{ color: "#FF6B9D" }}>{habitPct}%</span>
          </div>
          <div className="w-full bg-white/60 rounded-full h-3 overflow-hidden">
            <div className="h-3 rounded-full transition-all duration-500" style={{ width: `${habitPct}%`, backgroundColor: "#FF6B9D" }} />
          </div>
          <p className="text-xs text-gray-600 mt-1">{todayDone.length} de {habits.length} concluídos</p>
        </div>
      )}

      {/* Section cards */}
      {sections.map(s => (
        <button key={s.id} onClick={() => setActiveTab(s.id)} className="w-full text-left">
          <div className="rounded-2xl border-2 border-black p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
            style={{ backgroundColor: s.bg }}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xl">{s.emoji}</span>
                <span className="font-black text-base" style={{ color: s.color }}>{s.title} em Ordem</span>
              </div>
              <span className="text-gray-400 text-lg">›</span>
            </div>
            {s.lines.map((line, i) => (
              <p key={i} className="text-xs text-gray-600 leading-relaxed">• {line}</p>
            ))}
          </div>
        </button>
      ))}

      <div className="h-4" />
    </div>
  );
}

/* ─── APP ───────────────────────────────────────────────────────────────────── */
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
    <div className="min-h-screen max-w-lg mx-auto flex flex-col relative" style={{ backgroundColor: "#FFF8F0" }}>
      <div className="flex-1 pb-20 overflow-y-auto">
        {activeTab === "home"     && <HomeTab setActiveTab={setActiveTab} />}
        {activeTab === "estudos"  && <EstudosTab />}
        {activeTab === "trabalho" && <TrabalhoTab />}
        {activeTab === "vida"     && <VidaTab />}
        {activeTab === "casa"     && <CasaTab />}
        {activeTab === "financas" && <FinancasTab />}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t-2 border-black z-40 safe-bottom">
        <div className="flex">
          {navItems.map(item => {
            const tab = TABS.find(t => t.id === item.id);
            const active = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className="flex-1 flex flex-col items-center py-2 gap-0.5 transition-all">
                <span className={`text-xl transition-transform duration-150 ${active ? "scale-125" : ""}`}>{item.emoji}</span>
                <span className="text-[9px] font-bold transition-colors"
                  style={{ color: active ? (tab?.color || "#E63946") : "#9ca3af" }}>
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
