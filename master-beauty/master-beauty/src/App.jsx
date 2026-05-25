import { useState } from 'react'

// ─── Data Layer ───────────────────────────────────────────────────────────────
const db = {
  get: (k, d = null) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
}
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36)
const today = () => new Date().toISOString().split('T')[0]

const KEYS = ['avt_books','avt_courses','avt_brands','avt_pipeline','avt_tasks','avt_goals_career','avt_ideas','avt_habits','avt_habit_logs','avt_life_goals','avt_moods','avt_appointments','avt_cleaning','avt_shopping','avt_expenses','avt_accounts','avt_cards','avt_fin_goals','avt_notes']

function exportData() {
  const obj = {}
  KEYS.forEach(k => { const v = localStorage.getItem(k); if (v) obj[k] = v })
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj))))
}
function importData(code) {
  try {
    const obj = JSON.parse(decodeURIComponent(escape(atob(code))))
    Object.entries(obj).forEach(([k, v]) => localStorage.setItem(k, v))
    window.location.reload()
  } catch { alert('Código inválido') }
}

// ─── Design Tokens ───────────────────────────────────────────────────────────
const P = {
  cream: '#FFF9F5', red: '#C1121F', navy: '#1B3A6B',
  forest: '#2A5C45', rose: '#C94070', amber: '#B84A2A',
  plum: '#6B2D8B', teal: '#0F7173', dark: '#1A1A1A',
}
const stripe = `repeating-linear-gradient(-45deg,transparent,transparent 8px,rgba(255,255,255,0.07) 8px,rgba(255,255,255,0.07) 16px)`

// ─── Helpers ─────────────────────────────────────────────────────────────────
const money = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtDate = (d) => { try { return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR') } catch { return d } }
const fmtFollowers = (n) => {
  const num = Number(n || 0)
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return String(num)
}

// ─── ScallopBorder ────────────────────────────────────────────────────────────
function ScallopBorder({ fill = '#FFF9F5' }) {
  return (
    <svg viewBox="0 0 390 24" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 24, marginTop: -1 }}>
      <path fill={fill} d="M0,24 L0,12 Q9.75,0 19.5,12 Q29.25,24 39,12 Q48.75,0 58.5,12 Q68.25,24 78,12 Q87.75,0 97.5,12 Q107.25,24 117,12 Q126.75,0 136.5,12 Q146.25,24 156,12 Q165.75,0 175.5,12 Q185.25,24 195,12 Q204.75,0 214.5,12 Q224.25,24 234,12 Q243.75,0 253.5,12 Q263.25,24 273,12 Q282.75,0 292.5,12 Q302.25,24 312,12 Q321.75,0 331.5,12 Q341.25,24 351,12 Q360.75,0 370.5,12 Q380.25,24 390,12 L390,24 Z" />
    </svg>
  )
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────
const inp = 'w-full border-2 border-black rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white'
function Inp({ label, ...p }) { return <div className="flex flex-col gap-1"><label className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</label><input className={inp} {...p} /></div> }
function Sel({ label, children, ...p }) { return <div className="flex flex-col gap-1"><label className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</label><select className={inp} {...p}>{children}</select></div> }
function Tex({ label, ...p }) { return <div className="flex flex-col gap-1"><label className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</label><textarea className={inp + ' resize-none'} rows={3} {...p} /></div> }

function Btn({ children, onClick, color = P.red, ghost, small, full, className = '' }) {
  const base = 'font-bold rounded-xl border-2 border-black transition-all active:scale-95 cursor-pointer select-none'
  const sz = small ? 'px-3 py-1 text-xs' : 'px-5 py-2.5 text-sm'
  return <button onClick={onClick} className={`${base} ${sz} ${full ? 'w-full' : ''} ${className}`} style={ghost ? { background: 'white', color: P.dark } : { background: color, color: 'white' }}>{children}</button>
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-end' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '24px 24px 0 0', border: '2.5px solid black', width: '100%', maxHeight: '92vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 800, fontSize: 18 }}>{title}</h3>
            <button onClick={onClose} style={{ fontSize: 24, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
          </div>
        </div>
        <div style={{ padding: '0 20px 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
      </div>
    </div>
  )
}

function TabHeader({ color, emoji, title, action }) {
  return (
    <div style={{ marginBottom: 0 }}>
      <div style={{ background: color, backgroundImage: stripe, padding: '20px 16px 4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>{emoji} seção</p>
            <h2 className="font-display" style={{ color: 'white', fontSize: 34, lineHeight: 1.05, marginTop: 2 }}>{title}</h2>
          </div>
          {action}
        </div>
      </div>
      <ScallopBorder />
    </div>
  )
}

function SubTabs({ tabs, active, onChange, color }) {
  return (
    <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid black', background: 'white', overflowX: 'auto' }}>
      {tabs.map(t => (
        <button key={t} onClick={() => onChange(t)} style={{
          flex: '0 0 auto', padding: '10px 16px', fontSize: 13, fontWeight: 700,
          color: active === t ? color : P.dark, background: 'none', border: 'none',
          borderBottom: active === t ? `3px solid ${color}` : '3px solid transparent',
          cursor: 'pointer', whiteSpace: 'nowrap'
        }}>{t}</button>
      ))}
    </div>
  )
}

function Badge({ label, color, textColor = 'white' }) {
  return <span style={{ background: color, color: textColor, fontSize: 10, fontWeight: 700, borderRadius: 8, padding: '2px 8px', border: '1.5px solid black', letterSpacing: 0.5 }}>{label}</span>
}

function ProgressBar({ value, color = P.navy }) {
  const pct = Math.min(100, Math.max(0, Number(value) || 0))
  return (
    <div style={{ background: '#E5E7EB', borderRadius: 99, height: 6, overflow: 'hidden', marginTop: 6 }}>
      <div style={{ background: color, height: '100%', width: `${pct}%`, borderRadius: 99, transition: 'width 0.3s' }} />
    </div>
  )
}

// ─── HOME TAB ────────────────────────────────────────────────────────────────
function HomeTile({ color, emoji, label, metric, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: color, backgroundImage: stripe,
      borderRadius: 20, border: '2.5px solid black', boxShadow: '4px 4px 0 black',
      padding: '18px 14px 16px', cursor: 'pointer', minHeight: 150,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
    }}>
      <div>
        <span style={{ fontSize: 30 }}>{emoji}</span>
        <p className="font-display" style={{ color: 'white', fontSize: 24, lineHeight: 1.05, marginTop: 6 }}>{label}</p>
      </div>
      <p className="font-numbers" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 700, marginTop: 8 }}>{metric}</p>
    </div>
  )
}

function HomeTab({ setTab, onNotes, onSettings }) {
  const books = db.get('avt_books', [])
  const courses = db.get('avt_courses', [])
  const brands = db.get('avt_brands', [])
  const pipeline = db.get('avt_pipeline', [])
  const habits = db.get('avt_habits', [])
  const habitLogs = db.get('avt_habit_logs', {})
  const todayLog = habitLogs[today()] || []
  const expenses = db.get('avt_expenses', [])
  const cleaning = db.get('avt_cleaning', [])
  const notes = db.get('avt_notes', [])

  const thisMonth = new Date().toISOString().slice(0, 7)
  const monthSpend = expenses.filter(e => e.type === 'saída' && e.date && e.date.startsWith(thisMonth)).reduce((s, e) => s + Number(e.amount || 0), 0)

  const pendingCleaning = cleaning.filter(t => {
    if (!t.lastDone) return true
    const diff = Math.floor((Date.now() - new Date(t.lastDone + 'T12:00:00').getTime()) / 86400000)
    return diff >= Number(t.frequency || 1)
  }).length

  const activeReminders = notes.filter(n => !n.done && n.reminder).length

  const d = new Date()
  const weekdays = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado']
  const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
  const weekdayDate = `${weekdays[d.getDay()]}, ${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`

  const tiles = [
    { color: P.navy, emoji: '📚', label: 'Estudos', metric: `${books.length} livros, ${courses.length} cursos`, tab: 'estudos' },
    { color: P.forest, emoji: '💼', label: 'Trabalho', metric: `${brands.length} marcas, ${pipeline.length} no pipe`, tab: 'trabalho' },
    { color: P.rose, emoji: '🌸', label: 'Vida', metric: `${todayLog.length}/${habits.length} hábitos hoje`, tab: 'vida' },
    { color: P.plum, emoji: '💰', label: 'Finanças', metric: `${money(monthSpend)} gastos`, tab: 'financas' },
    { color: P.amber, emoji: '🏡', label: 'Casa', metric: `${pendingCleaning} tarefas pendentes`, tab: 'casa' },
    { color: P.teal, emoji: '📝', label: 'Notas', metric: `${activeReminders} lembretes`, onClick: onNotes },
  ]

  return (
    <div style={{ paddingBottom: 88 }}>
      <div style={{ background: P.red, backgroundImage: stripe, padding: '20px 16px 4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="font-display" style={{ color: 'white', fontSize: 38, lineHeight: 1 }}>A Vida Toda</h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 }}>{weekdayDate}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button onClick={onNotes} style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.5)', borderRadius: 12, padding: '6px 10px', fontSize: 18, cursor: 'pointer' }}>📝</button>
            <button onClick={onSettings} style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.5)', borderRadius: 12, padding: '6px 10px', fontSize: 18, cursor: 'pointer' }}>⚙️</button>
          </div>
        </div>
      </div>
      <ScallopBorder />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '16px 12px 0' }}>
        {tiles.map(t => (
          <HomeTile key={t.tab || t.label} color={t.color} emoji={t.emoji} label={t.label} metric={t.metric} onClick={t.onClick || (() => setTab(t.tab))} />
        ))}
      </div>
    </div>
  )
}

// ─── ESTUDOS TAB ─────────────────────────────────────────────────────────────
function EstudosTab() {
  const [sub, setSub] = useState('Livros')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [refresh, setRefresh] = useState(0)

  const books = db.get('avt_books', [])
  const courses = db.get('avt_courses', [])

  const statusColorBook = { 'Lendo': P.navy, 'Lido': P.forest, 'Quero Ler': '#6B7280' }
  const statusColorCourse = { 'Em andamento': P.navy, 'Concluído': P.forest, 'Pausado': '#6B7280' }

  function openAdd() {
    if (sub === 'Livros') setForm({ status: 'Quero Ler', progress: 0 })
    else setForm({ status: 'Em andamento', progress: 0 })
    setModal('add')
  }

  function openEdit(item) {
    setForm({ ...item })
    setModal('edit')
  }

  function save() {
    if (sub === 'Livros') {
      const list = db.get('avt_books', [])
      if (modal === 'add') db.set('avt_books', [...list, { ...form, id: uid() }])
      else db.set('avt_books', list.map(b => b.id === form.id ? form : b))
    } else {
      const list = db.get('avt_courses', [])
      if (modal === 'add') db.set('avt_courses', [...list, { ...form, id: uid() }])
      else db.set('avt_courses', list.map(c => c.id === form.id ? form : c))
    }
    setModal(null)
    setRefresh(r => r + 1)
  }

  function del() {
    if (!window.confirm('Excluir?')) return
    if (sub === 'Livros') db.set('avt_books', db.get('avt_books', []).filter(b => b.id !== form.id))
    else db.set('avt_courses', db.get('avt_courses', []).filter(c => c.id !== form.id))
    setModal(null)
    setRefresh(r => r + 1)
  }

  const bookList = db.get('avt_books', [])
  const courseList = db.get('avt_courses', [])

  return (
    <div style={{ paddingBottom: 88 }}>
      <TabHeader color={P.navy} emoji="📚" title="Estudos" action={
        <Btn small onClick={openAdd} color="rgba(255,255,255,0.25)" className="border-white border-opacity-50">+ Add</Btn>
      } />
      <SubTabs tabs={['Livros', 'Cursos']} active={sub} onChange={setSub} color={P.navy} />

      <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sub === 'Livros' && bookList.map(b => (
          <div key={b.id} onClick={() => openEdit(b)} style={{ background: 'white', border: '2px solid black', borderRadius: 16, padding: '14px 16px', cursor: 'pointer', boxShadow: '3px 3px 0 black' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 15 }}>{b.title}</p>
                <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{b.author}</p>
              </div>
              <Badge label={b.status} color={statusColorBook[b.status] || '#6B7280'} />
            </div>
            {b.status === 'Lendo' && <ProgressBar value={b.progress} color={P.navy} />}
            {b.notes && <p style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>{b.notes}</p>}
          </div>
        ))}
        {sub === 'Cursos' && courseList.map(c => (
          <div key={c.id} onClick={() => openEdit(c)} style={{ background: 'white', border: '2px solid black', borderRadius: 16, padding: '14px 16px', cursor: 'pointer', boxShadow: '3px 3px 0 black' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</p>
                <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{c.platform}</p>
              </div>
              <Badge label={c.status} color={statusColorCourse[c.status] || '#6B7280'} />
            </div>
            <ProgressBar value={c.progress} color={P.navy} />
            <p style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>{c.progress || 0}% concluído</p>
            {c.notes && <p style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{c.notes}</p>}
          </div>
        ))}
        {sub === 'Livros' && bookList.length === 0 && <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 32 }}>Nenhum livro cadastrado</p>}
        {sub === 'Cursos' && courseList.length === 0 && <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 32 }}>Nenhum curso cadastrado</p>}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? `Novo ${sub === 'Livros' ? 'Livro' : 'Curso'}` : `Editar ${sub === 'Livros' ? 'Livro' : 'Curso'}`}>
        {sub === 'Livros' ? (
          <>
            <Inp label="Título" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <Inp label="Autor" value={form.author || ''} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} />
            <Sel label="Status" value={form.status || 'Quero Ler'} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option>Quero Ler</option><option>Lendo</option><option>Lido</option>
            </Sel>
            <Inp label="Progresso (0-100)" type="number" min={0} max={100} value={form.progress || 0} onChange={e => setForm(f => ({ ...f, progress: e.target.value }))} />
            <Tex label="Notas" value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </>
        ) : (
          <>
            <Inp label="Nome do Curso" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Inp label="Plataforma" value={form.platform || ''} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))} />
            <Sel label="Status" value={form.status || 'Em andamento'} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option>Em andamento</option><option>Concluído</option><option>Pausado</option>
            </Sel>
            <Inp label="Progresso (0-100)" type="number" min={0} max={100} value={form.progress || 0} onChange={e => setForm(f => ({ ...f, progress: e.target.value }))} />
            <Tex label="Notas" value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </>
        )}
        <Btn onClick={save} full color={P.navy}>Salvar</Btn>
        {modal === 'edit' && <Btn onClick={del} full ghost>Excluir</Btn>}
      </Modal>
    </div>
  )
}

// ─── TRABALHO TAB ─────────────────────────────────────────────────────────────
function TrabalhoTab() {
  const [sub, setSub] = useState('Marcas')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [refresh, setRefresh] = useState(0)

  const brandStatusColor = { 'Prospectando': P.amber, 'Em Onboarding': P.navy, 'Live': P.forest, 'Pausado': '#6B7280' }
  const pipeStatusColor = { 'Lead': '#6B7280', 'Contato Feito': P.amber, 'Proposta Enviada': P.navy, 'Negociando': P.plum, 'Ganho': P.forest, 'Perdido': P.red }
  const prioColor = { 'Alta': P.red, 'Média': P.amber, 'Baixa': '#6B7280' }

  function openAdd() {
    const defaults = {
      'Marcas': { status: 'Prospectando', sector: 'Skincare' },
      'Pipeline': { status: 'Lead', sector: 'Skincare' },
      'Tarefas': { priority: 'Média', done: false },
      'Metas': { done: false },
      'Ideias': {},
    }
    setForm(defaults[sub] || {})
    setModal('add')
  }

  function openEdit(item) { setForm({ ...item }); setModal('edit') }

  function getKey() {
    return { 'Marcas': 'avt_brands', 'Pipeline': 'avt_pipeline', 'Tarefas': 'avt_tasks', 'Metas': 'avt_goals_career', 'Ideias': 'avt_ideas' }[sub]
  }

  function save() {
    const key = getKey()
    const list = db.get(key, [])
    if (modal === 'add') db.set(key, [...list, { ...form, id: uid() }])
    else db.set(key, list.map(i => i.id === form.id ? form : i))
    setModal(null); setRefresh(r => r + 1)
  }

  function del() {
    if (!window.confirm('Excluir?')) return
    const key = getKey()
    db.set(key, db.get(key, []).filter(i => i.id !== form.id))
    setModal(null); setRefresh(r => r + 1)
  }

  function toggleTask(item, key) {
    const list = db.get(key, [])
    db.set(key, list.map(i => i.id === item.id ? { ...i, done: !i.done } : i))
    setRefresh(r => r + 1)
  }

  const brands = db.get('avt_brands', [])
  const pipeline = db.get('avt_pipeline', [])
  const tasks = db.get('avt_tasks', []).sort((a, b) => { const o = { Alta: 0, Média: 1, Baixa: 2 }; return (o[a.priority] ?? 1) - (o[b.priority] ?? 1) })
  const goals = db.get('avt_goals_career', [])
  const ideas = db.get('avt_ideas', [])

  return (
    <div style={{ paddingBottom: 88 }}>
      <TabHeader color={P.forest} emoji="💼" title="Trabalho" action={
        <Btn small onClick={openAdd} color="rgba(255,255,255,0.25)" className="border-white border-opacity-50">+ Add</Btn>
      } />
      <SubTabs tabs={['Marcas', 'Pipeline', 'Tarefas', 'Metas', 'Ideias']} active={sub} onChange={setSub} color={P.forest} />

      <div style={{ padding: '16px 12px' }}>
        {sub === 'Marcas' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {brands.map(b => (
              <div key={b.id} onClick={() => openEdit(b)} style={{ background: 'white', border: '2px solid black', borderRadius: 16, padding: '14px 12px', cursor: 'pointer', boxShadow: '3px 3px 0 black' }}>
                <p style={{ fontWeight: 800, fontSize: 14, marginBottom: 6 }}>{b.name}</p>
                <Badge label={b.status} color={brandStatusColor[b.status] || '#6B7280'} />
                <p style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>{b.sector}</p>
                {b.gmv ? <p style={{ fontSize: 12, fontWeight: 700, color: P.forest, marginTop: 4 }}>GMV: {money(b.gmv)}</p> : null}
              </div>
            ))}
            {brands.length === 0 && <p style={{ color: '#9CA3AF', gridColumn: 'span 2', textAlign: 'center', padding: 32 }}>Nenhuma marca cadastrada</p>}
          </div>
        )}
        {sub === 'Pipeline' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pipeline.map(p => (
              <div key={p.id} onClick={() => openEdit(p)} style={{ background: 'white', border: '2px solid black', borderRadius: 16, padding: '14px 16px', cursor: 'pointer', boxShadow: '3px 3px 0 black' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: 15 }}>{p.brandName}</p>
                    {p.instagram && <p style={{ fontSize: 12, color: P.plum, marginTop: 2 }}>@{p.instagram}</p>}
                    {p.followers && <p style={{ fontSize: 11, color: '#6B7280' }}>{fmtFollowers(p.followers)} seguidores</p>}
                    {p.gmvPotential ? <p style={{ fontSize: 12, fontWeight: 700, color: P.forest, marginTop: 4 }}>Potencial: {money(p.gmvPotential)}</p> : null}
                  </div>
                  <Badge label={p.status} color={pipeStatusColor[p.status] || '#6B7280'} />
                </div>
              </div>
            ))}
            {pipeline.length === 0 && <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 32 }}>Pipeline vazio</p>}
          </div>
        )}
        {sub === 'Tarefas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tasks.map(t => (
              <div key={t.id} style={{ background: 'white', border: '2px solid black', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '2px 2px 0 black' }}>
                <input type="checkbox" checked={!!t.done} onChange={() => toggleTask(t, 'avt_tasks')} style={{ width: 18, height: 18, cursor: 'pointer', flexShrink: 0 }} />
                <div style={{ flex: 1 }} onClick={() => openEdit(t)}>
                  <p style={{ fontSize: 14, fontWeight: 600, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? '#9CA3AF' : P.dark }}>{t.text}</p>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center' }}>
                    <Badge label={t.priority} color={prioColor[t.priority] || '#6B7280'} />
                    {t.dueDate && <span style={{ fontSize: 11, color: '#6B7280' }}>{fmtDate(t.dueDate)}</span>}
                  </div>
                </div>
              </div>
            ))}
            {tasks.length === 0 && <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 32 }}>Nenhuma tarefa</p>}
          </div>
        )}
        {sub === 'Metas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {goals.map(g => (
              <div key={g.id} style={{ background: 'white', border: '2px solid black', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '2px 2px 0 black' }}>
                <input type="checkbox" checked={!!g.done} onChange={() => toggleTask(g, 'avt_goals_career')} style={{ width: 18, height: 18, cursor: 'pointer', flexShrink: 0 }} />
                <div style={{ flex: 1 }} onClick={() => openEdit(g)}>
                  <p style={{ fontSize: 14, fontWeight: 600, textDecoration: g.done ? 'line-through' : 'none', color: g.done ? '#9CA3AF' : P.dark }}>{g.text}</p>
                  {g.deadline && <p style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>Prazo: {fmtDate(g.deadline)}</p>}
                </div>
              </div>
            ))}
            {goals.length === 0 && <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 32 }}>Nenhuma meta de carreira</p>}
          </div>
        )}
        {sub === 'Ideias' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {ideas.map(i => (
              <div key={i.id} onClick={() => openEdit(i)} style={{ background: P.cream, border: '2px solid black', borderRadius: 14, padding: '12px 12px', cursor: 'pointer', boxShadow: '2px 2px 0 black' }}>
                <p style={{ fontSize: 13, color: P.dark }}>{i.text}</p>
              </div>
            ))}
            {ideas.length === 0 && <p style={{ color: '#9CA3AF', gridColumn: 'span 2', textAlign: 'center', padding: 32 }}>Nenhuma ideia</p>}
          </div>
        )}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'Novo item' : 'Editar'}>
        {sub === 'Marcas' && <>
          <Inp label="Nome da marca" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Sel label="Setor" value={form.sector || 'Skincare'} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}>
            <option>Skincare</option><option>Makeup</option><option>Haircare</option><option>Fragrance</option><option>Wellness</option><option>Outro</option>
          </Sel>
          <Sel label="Status" value={form.status || 'Prospectando'} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option>Prospectando</option><option>Em Onboarding</option><option>Live</option><option>Pausado</option>
          </Sel>
          <Inp label="Contato" value={form.contact || ''} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} />
          <Inp label="GMV (R$)" type="number" value={form.gmv || ''} onChange={e => setForm(f => ({ ...f, gmv: e.target.value }))} />
          <Tex label="Notas" value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </>}
        {sub === 'Pipeline' && <>
          <Inp label="Nome da marca" value={form.brandName || ''} onChange={e => setForm(f => ({ ...f, brandName: e.target.value }))} />
          <Inp label="Instagram (sem @)" value={form.instagram || ''} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} />
          <Inp label="Seguidores" type="number" value={form.followers || ''} onChange={e => setForm(f => ({ ...f, followers: e.target.value }))} />
          <Inp label="GMV Potencial (R$)" type="number" value={form.gmvPotential || ''} onChange={e => setForm(f => ({ ...f, gmvPotential: e.target.value }))} />
          <Sel label="Setor" value={form.sector || 'Skincare'} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}>
            <option>Skincare</option><option>Makeup</option><option>Haircare</option><option>Fragrance</option><option>Wellness</option><option>Outro</option>
          </Sel>
          <Sel label="Status" value={form.status || 'Lead'} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option>Lead</option><option>Contato Feito</option><option>Proposta Enviada</option><option>Negociando</option><option>Ganho</option><option>Perdido</option>
          </Sel>
          <Tex label="Notas" value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </>}
        {sub === 'Tarefas' && <>
          <Inp label="Tarefa" value={form.text || ''} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} />
          <Sel label="Prioridade" value={form.priority || 'Média'} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
            <option>Alta</option><option>Média</option><option>Baixa</option>
          </Sel>
          <Inp label="Prazo" type="date" value={form.dueDate || ''} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
        </>}
        {sub === 'Metas' && <>
          <Inp label="Meta" value={form.text || ''} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} />
          <Inp label="Prazo" type="date" value={form.deadline || ''} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
        </>}
        {sub === 'Ideias' && <>
          <Tex label="Ideia" value={form.text || ''} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} />
        </>}
        <Btn onClick={save} full color={P.forest}>Salvar</Btn>
        {modal === 'edit' && <Btn onClick={del} full ghost>Excluir</Btn>}
      </Modal>
    </div>
  )
}

// ─── VIDA TAB ─────────────────────────────────────────────────────────────────
function VidaTab() {
  const [sub, setSub] = useState('Hábitos')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [refresh, setRefresh] = useState(0)

  const catColor = { 'Carreira': P.navy, 'Saúde': P.forest, 'Relacionamentos': P.rose, 'Finanças': P.plum, 'Pessoal': P.amber, 'Viagens': P.teal }
  const moodEmojis = ['😄', '😊', '😐', '😔', '😠']

  function openAdd() {
    const defaults = {
      'Hábitos': { frequency: 'Diário', emoji: '✨' },
      'Metas': { done: false, category: 'Pessoal' },
      'Humor': { emoji: '😊', date: today() },
      'Consultas': { date: today() },
    }
    setForm(defaults[sub] || {})
    setModal('add')
  }

  function openEdit(item) { setForm({ ...item }); setModal('edit') }

  function getKey() {
    return { 'Hábitos': 'avt_habits', 'Metas': 'avt_life_goals', 'Humor': 'avt_moods', 'Consultas': 'avt_appointments' }[sub]
  }

  function save() {
    const key = getKey()
    const list = db.get(key, [])
    if (modal === 'add') db.set(key, [...list, { ...form, id: uid() }])
    else db.set(key, list.map(i => i.id === form.id ? form : i))
    setModal(null); setRefresh(r => r + 1)
  }

  function del() {
    if (!window.confirm('Excluir?')) return
    const key = getKey()
    db.set(key, db.get(key, []).filter(i => i.id !== form.id))
    setModal(null); setRefresh(r => r + 1)
  }

  function toggleHabit(habitId) {
    const logs = db.get('avt_habit_logs', {})
    const todayLogs = logs[today()] || []
    const updated = todayLogs.includes(habitId) ? todayLogs.filter(id => id !== habitId) : [...todayLogs, habitId]
    db.set('avt_habit_logs', { ...logs, [today()]: updated })
    setRefresh(r => r + 1)
  }

  function getStreak(habitId) {
    const logs = db.get('avt_habit_logs', {})
    let streak = 0
    let d = new Date()
    for (let i = 0; i < 365; i++) {
      const key = d.toISOString().split('T')[0]
      if ((logs[key] || []).includes(habitId)) { streak++; d.setDate(d.getDate() - 1) }
      else break
    }
    return streak
  }

  function toggleGoal(item) {
    const list = db.get('avt_life_goals', [])
    db.set('avt_life_goals', list.map(i => i.id === item.id ? { ...i, done: !i.done } : i))
    setRefresh(r => r + 1)
  }

  const habits = db.get('avt_habits', [])
  const habitLogs = db.get('avt_habit_logs', {})
  const todayLog = habitLogs[today()] || []
  const lifeGoals = db.get('avt_life_goals', [])
  const moods = db.get('avt_moods', []).sort((a, b) => b.date > a.date ? 1 : -1)
  const appointments = db.get('avt_appointments', []).sort((a, b) => a.date > b.date ? 1 : -1)

  const goalsByCategory = {}
  lifeGoals.forEach(g => { if (!goalsByCategory[g.category]) goalsByCategory[g.category] = []; goalsByCategory[g.category].push(g) })

  const now = today()
  const upcomingApps = appointments.filter(a => a.date >= now)
  const pastApps = appointments.filter(a => a.date < now)

  return (
    <div style={{ paddingBottom: 88 }}>
      <TabHeader color={P.rose} emoji="🌸" title="Vida" action={
        <Btn small onClick={openAdd} color="rgba(255,255,255,0.25)" className="border-white border-opacity-50">+ Add</Btn>
      } />
      <SubTabs tabs={['Hábitos', 'Metas', 'Humor', 'Consultas']} active={sub} onChange={setSub} color={P.rose} />

      <div style={{ padding: '16px 12px' }}>
        {sub === 'Hábitos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {habits.map(h => {
              const done = todayLog.includes(h.id)
              const streak = getStreak(h.id)
              return (
                <div key={h.id} style={{ background: 'white', border: '2px solid black', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '2px 2px 0 black' }}>
                  <input type="checkbox" checked={done} onChange={() => toggleHabit(h.id)} style={{ width: 20, height: 20, cursor: 'pointer', flexShrink: 0 }} />
                  <div style={{ flex: 1 }} onClick={() => openEdit(h)}>
                    <p style={{ fontSize: 15, fontWeight: 600 }}>{h.emoji} {h.name}</p>
                    <p style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{h.frequency} · 🔥 {streak} dias</p>
                  </div>
                </div>
              )
            })}
            {habits.length === 0 && <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 32 }}>Nenhum hábito cadastrado</p>}
          </div>
        )}
        {sub === 'Metas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {Object.entries(goalsByCategory).map(([cat, items]) => (
              <div key={cat}>
                <p style={{ fontWeight: 800, fontSize: 13, color: catColor[cat] || P.dark, marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>{cat}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {items.map(g => (
                    <div key={g.id} style={{ background: 'white', border: '2px solid black', borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '2px 2px 0 black' }}>
                      <input type="checkbox" checked={!!g.done} onChange={() => toggleGoal(g)} style={{ width: 18, height: 18, cursor: 'pointer', flexShrink: 0 }} />
                      <p style={{ fontSize: 14, flex: 1, textDecoration: g.done ? 'line-through' : 'none', color: g.done ? '#9CA3AF' : P.dark, cursor: 'pointer' }} onClick={() => openEdit(g)}>{g.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {lifeGoals.length === 0 && <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 32 }}>Nenhuma meta de vida</p>}
          </div>
        )}
        {sub === 'Humor' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {moods.map(m => (
              <div key={m.id} onClick={() => openEdit(m)} style={{ background: 'white', border: '2px solid black', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '2px 2px 0 black', cursor: 'pointer' }}>
                <span style={{ fontSize: 28 }}>{m.emoji}</span>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#6B7280' }}>{fmtDate(m.date)}</p>
                  {m.note && <p style={{ fontSize: 13, marginTop: 2 }}>{m.note}</p>}
                </div>
              </div>
            ))}
            {moods.length === 0 && <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 32 }}>Nenhum registro de humor</p>}
          </div>
        )}
        {sub === 'Consultas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {upcomingApps.length > 0 && (
              <div>
                <p style={{ fontWeight: 800, fontSize: 12, color: P.navy, marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>Próximas</p>
                {upcomingApps.map(a => (
                  <div key={a.id} onClick={() => openEdit(a)} style={{ background: 'white', border: `2px solid ${P.navy}`, borderRadius: 14, padding: '12px 14px', marginBottom: 8, cursor: 'pointer', boxShadow: '2px 2px 0 black' }}>
                    <p style={{ fontWeight: 700, fontSize: 15 }}>{a.title}</p>
                    {a.doctor && <p style={{ fontSize: 12, color: '#6B7280' }}>{a.doctor}</p>}
                    <p style={{ fontSize: 12, color: P.navy, fontWeight: 700, marginTop: 4 }}>{fmtDate(a.date)}</p>
                    {a.notes && <p style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{a.notes}</p>}
                  </div>
                ))}
              </div>
            )}
            {pastApps.length > 0 && (
              <div>
                <p style={{ fontWeight: 800, fontSize: 12, color: '#6B7280', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>Passadas</p>
                {pastApps.map(a => (
                  <div key={a.id} onClick={() => openEdit(a)} style={{ background: '#F9FAFB', border: '2px solid #E5E7EB', borderRadius: 14, padding: '12px 14px', marginBottom: 8, cursor: 'pointer' }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: '#6B7280' }}>{a.title}</p>
                    {a.doctor && <p style={{ fontSize: 12, color: '#9CA3AF' }}>{a.doctor}</p>}
                    <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{fmtDate(a.date)}</p>
                  </div>
                ))}
              </div>
            )}
            {appointments.length === 0 && <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 32 }}>Nenhuma consulta</p>}
          </div>
        )}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'Novo item' : 'Editar'}>
        {sub === 'Hábitos' && <>
          <Inp label="Nome do hábito" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Inp label="Emoji" value={form.emoji || '✨'} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} />
          <Sel label="Frequência" value={form.frequency || 'Diário'} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
            <option>Diário</option><option>Semanal</option>
          </Sel>
        </>}
        {sub === 'Metas' && <>
          <Inp label="Meta" value={form.text || ''} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} />
          <Sel label="Categoria" value={form.category || 'Pessoal'} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            <option>Carreira</option><option>Saúde</option><option>Relacionamentos</option><option>Finanças</option><option>Pessoal</option><option>Viagens</option>
          </Sel>
        </>}
        {sub === 'Humor' && <>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 4 }}>
            {moodEmojis.map(e => (
              <button key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))} style={{ fontSize: 32, background: form.emoji === e ? '#F3F4F6' : 'transparent', border: form.emoji === e ? '2px solid black' : '2px solid transparent', borderRadius: 12, padding: 4, cursor: 'pointer' }}>{e}</button>
            ))}
          </div>
          <Inp label="Data" type="date" value={form.date || today()} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          <Tex label="Nota" value={form.note || ''} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
        </>}
        {sub === 'Consultas' && <>
          <Inp label="Título / Especialidade" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <Inp label="Médico / Profissional" value={form.doctor || ''} onChange={e => setForm(f => ({ ...f, doctor: e.target.value }))} />
          <Inp label="Data" type="date" value={form.date || today()} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          <Tex label="Notas" value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </>}
        <Btn onClick={save} full color={P.rose}>Salvar</Btn>
        {modal === 'edit' && <Btn onClick={del} full ghost>Excluir</Btn>}
      </Modal>
    </div>
  )
}

// ─── CASA TAB ─────────────────────────────────────────────────────────────────
function CasaTab() {
  const [sub, setSub] = useState('Tarefas')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [refresh, setRefresh] = useState(0)

  function openAdd() {
    if (sub === 'Tarefas') setForm({ frequency: 7 })
    else setForm({ done: false, category: 'Outros' })
    setModal('add')
  }

  function openEdit(item) { setForm({ ...item }); setModal('edit') }

  function save() {
    const key = sub === 'Tarefas' ? 'avt_cleaning' : 'avt_shopping'
    const list = db.get(key, [])
    if (modal === 'add') db.set(key, [...list, { ...form, id: uid() }])
    else db.set(key, list.map(i => i.id === form.id ? form : i))
    setModal(null); setRefresh(r => r + 1)
  }

  function del() {
    if (!window.confirm('Excluir?')) return
    const key = sub === 'Tarefas' ? 'avt_cleaning' : 'avt_shopping'
    db.set(key, db.get(key, []).filter(i => i.id !== form.id))
    setModal(null); setRefresh(r => r + 1)
  }

  function markDone(item) {
    const list = db.get('avt_cleaning', [])
    db.set('avt_cleaning', list.map(i => i.id === item.id ? { ...i, lastDone: today() } : i))
    setRefresh(r => r + 1)
  }

  function toggleShop(item) {
    const list = db.get('avt_shopping', [])
    db.set('avt_shopping', list.map(i => i.id === item.id ? { ...i, done: !i.done } : i))
    setRefresh(r => r + 1)
  }

  function daysSince(dateStr) {
    if (!dateStr) return null
    return Math.floor((Date.now() - new Date(dateStr + 'T12:00:00').getTime()) / 86400000)
  }

  const cleaning = db.get('avt_cleaning', [])
  const shopping = db.get('avt_shopping', [])

  const shopByCategory = {}
  shopping.forEach(s => { if (!shopByCategory[s.category]) shopByCategory[s.category] = []; shopByCategory[s.category].push(s) })

  return (
    <div style={{ paddingBottom: 88 }}>
      <TabHeader color={P.amber} emoji="🏡" title="Casa" action={
        <Btn small onClick={openAdd} color="rgba(255,255,255,0.25)" className="border-white border-opacity-50">+ Add</Btn>
      } />
      <SubTabs tabs={['Tarefas', 'Compras']} active={sub} onChange={setSub} color={P.amber} />

      <div style={{ padding: '16px 12px' }}>
        {sub === 'Tarefas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {cleaning.map(t => {
              const days = daysSince(t.lastDone)
              const overdue = days !== null && days >= Number(t.frequency || 1)
              const neverDone = t.lastDone === null || t.lastDone === undefined
              const isOverdue = overdue || neverDone
              return (
                <div key={t.id} style={{ background: isOverdue ? '#FEF2F2' : 'white', border: `2px solid ${isOverdue ? P.red : 'black'}`, borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '2px 2px 0 black' }}>
                  <input type="checkbox" onChange={() => markDone(t)} style={{ width: 20, height: 20, cursor: 'pointer', flexShrink: 0 }} />
                  <div style={{ flex: 1 }} onClick={() => openEdit(t)}>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>{t.task}</p>
                    <p style={{ fontSize: 11, color: isOverdue ? P.red : '#6B7280', marginTop: 2 }}>
                      {neverDone ? 'Nunca feito' : `há ${days} dias`} · a cada {t.frequency} dias
                    </p>
                  </div>
                </div>
              )
            })}
            {cleaning.length === 0 && <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 32 }}>Nenhuma tarefa de casa</p>}
          </div>
        )}
        {sub === 'Compras' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {Object.entries(shopByCategory).map(([cat, items]) => (
              <div key={cat}>
                <p style={{ fontWeight: 800, fontSize: 12, color: P.amber, marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>{cat}</p>
                {items.map(s => (
                  <div key={s.id} style={{ background: 'white', border: '2px solid black', borderRadius: 12, padding: '10px 14px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="checkbox" checked={!!s.done} onChange={() => toggleShop(s)} style={{ width: 18, height: 18, cursor: 'pointer', flexShrink: 0 }} />
                    <p style={{ flex: 1, fontSize: 14, textDecoration: s.done ? 'line-through' : 'none', color: s.done ? '#9CA3AF' : P.dark, cursor: 'pointer' }} onClick={() => openEdit(s)}>
                      {s.item}{s.qty ? ` (${s.qty})` : ''}
                    </p>
                  </div>
                ))}
              </div>
            ))}
            {shopping.length === 0 && <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 32 }}>Lista de compras vazia</p>}
          </div>
        )}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'Novo item' : 'Editar'}>
        {sub === 'Tarefas' && <>
          <Inp label="Tarefa" value={form.task || ''} onChange={e => setForm(f => ({ ...f, task: e.target.value }))} />
          <Inp label="Frequência (dias)" type="number" min={1} value={form.frequency || 7} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} />
        </>}
        {sub === 'Compras' && <>
          <Inp label="Item" value={form.item || ''} onChange={e => setForm(f => ({ ...f, item: e.target.value }))} />
          <Inp label="Quantidade" value={form.qty || ''} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} />
          <Sel label="Categoria" value={form.category || 'Outros'} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            <option>Mercado</option><option>Farmácia</option><option>Limpeza</option><option>Higiene</option><option>Outros</option>
          </Sel>
        </>}
        <Btn onClick={save} full color={P.amber}>Salvar</Btn>
        {modal === 'edit' && <Btn onClick={del} full ghost>Excluir</Btn>}
      </Modal>
    </div>
  )
}

// ─── FINANÇAS TAB ─────────────────────────────────────────────────────────────
function FinancasTab() {
  const [sub, setSub] = useState('Extrato')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [refresh, setRefresh] = useState(0)

  const catEmoji = { Alimentação: '🍔', Transporte: '🚗', Compras: '🛍️', Saúde: '🏥', Casa: '🏠', Beleza: '💄', Educação: '📚', Salário: '💰', Outros: '📋' }

  function openAdd() {
    const defaults = {
      'Extrato': { type: 'saída', date: today(), category: 'Outros' },
      'Contas': { type: 'Corrente', balance: 0 },
      'Cartões': { limit: 0, spent: 0, dueDay: 1 },
      'Metas': { target: 0, current: 0 },
    }
    setForm(defaults[sub] || {})
    setModal('add')
  }

  function openEdit(item) { setForm({ ...item }); setModal('edit') }

  function getKey() {
    return { 'Extrato': 'avt_expenses', 'Contas': 'avt_accounts', 'Cartões': 'avt_cards', 'Metas': 'avt_fin_goals' }[sub]
  }

  function save() {
    const key = getKey()
    const list = db.get(key, [])
    if (modal === 'add') db.set(key, [...list, { ...form, id: uid() }])
    else db.set(key, list.map(i => i.id === form.id ? form : i))
    setModal(null); setRefresh(r => r + 1)
  }

  function del() {
    if (!window.confirm('Excluir?')) return
    const key = getKey()
    db.set(key, db.get(key, []).filter(i => i.id !== form.id))
    setModal(null); setRefresh(r => r + 1)
  }

  const expenses = db.get('avt_expenses', []).sort((a, b) => b.date > a.date ? 1 : -1)
  const accounts = db.get('avt_accounts', [])
  const cards = db.get('avt_cards', [])
  const finGoals = db.get('avt_fin_goals', [])

  const thisMonth = new Date().toISOString().slice(0, 7)
  const monthSpend = expenses.filter(e => e.type === 'saída' && e.date && e.date.startsWith(thisMonth)).reduce((s, e) => s + Number(e.amount || 0), 0)
  const totalBalance = accounts.reduce((s, a) => s + Number(a.balance || 0), 0)

  function groupExpenses() {
    const groups = {}
    const td = today()
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    expenses.forEach(e => {
      let label = e.date === td ? 'Hoje' : e.date === yesterday ? 'Ontem' : fmtDate(e.date)
      if (!groups[label]) groups[label] = []
      groups[label].push(e)
    })
    return groups
  }

  function daysUntilDue(dueDay) {
    const now = new Date()
    let due = new Date(now.getFullYear(), now.getMonth(), dueDay)
    if (due <= now) due = new Date(now.getFullYear(), now.getMonth() + 1, dueDay)
    return Math.ceil((due - now) / 86400000)
  }

  const expGroups = groupExpenses()

  return (
    <div style={{ paddingBottom: 88 }}>
      <TabHeader color={P.plum} emoji="💰" title="Finanças" action={
        <Btn small onClick={openAdd} color="rgba(255,255,255,0.25)" className="border-white border-opacity-50">+ Add</Btn>
      } />
      <SubTabs tabs={['Extrato', 'Contas', 'Cartões', 'Metas']} active={sub} onChange={setSub} color={P.plum} />

      <div style={{ padding: '16px 12px' }}>
        {sub === 'Extrato' && (
          <>
            <div style={{ background: P.plum, backgroundImage: stripe, borderRadius: 16, padding: '14px 16px', marginBottom: 16, border: '2px solid black', boxShadow: '3px 3px 0 black' }}>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Gastos este mês</p>
              <p className="font-numbers" style={{ color: 'white', fontSize: 28, fontWeight: 800, marginTop: 4 }}>{money(monthSpend)}</p>
            </div>
            {Object.entries(expGroups).map(([date, items]) => (
              <div key={date} style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: '#6B7280', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{date}</p>
                {items.map(e => (
                  <div key={e.id} onClick={() => openEdit(e)} style={{ background: 'white', border: '2px solid black', borderRadius: 12, padding: '10px 14px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{catEmoji[e.category] || '📋'}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 600 }}>{e.description}</p>
                      <p style={{ fontSize: 11, color: '#6B7280' }}>{e.category}{e.account ? ` · ${e.account}` : ''}</p>
                    </div>
                    <p style={{ fontWeight: 800, fontSize: 14, color: e.type === 'entrada' ? P.forest : P.red, whiteSpace: 'nowrap' }}>
                      {e.type === 'entrada' ? '+' : '-'}{money(e.amount)}
                    </p>
                  </div>
                ))}
              </div>
            ))}
            {expenses.length === 0 && <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 32 }}>Nenhuma transação</p>}
          </>
        )}
        {sub === 'Contas' && (
          <>
            <div style={{ background: P.plum, backgroundImage: stripe, borderRadius: 16, padding: '14px 16px', marginBottom: 16, border: '2px solid black', boxShadow: '3px 3px 0 black' }}>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Total em contas</p>
              <p className="font-numbers" style={{ color: 'white', fontSize: 28, fontWeight: 800, marginTop: 4 }}>{money(totalBalance)}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {accounts.map(a => (
                <div key={a.id} onClick={() => openEdit(a)} style={{ background: 'white', border: '2px solid black', borderRadius: 16, padding: '14px 16px', cursor: 'pointer', boxShadow: '3px 3px 0 black' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 15 }}>{a.name}</p>
                      <p style={{ fontSize: 12, color: '#6B7280' }}>{a.type}</p>
                    </div>
                    <p className="font-numbers" style={{ fontWeight: 800, fontSize: 18, color: Number(a.balance) >= 0 ? P.forest : P.red }}>{money(a.balance)}</p>
                  </div>
                </div>
              ))}
              {accounts.length === 0 && <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 32 }}>Nenhuma conta</p>}
            </div>
          </>
        )}
        {sub === 'Cartões' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cards.map(c => {
              const pct = Number(c.limit) > 0 ? Math.min(100, (Number(c.spent) / Number(c.limit)) * 100) : 0
              const days = daysUntilDue(Number(c.dueDay))
              return (
                <div key={c.id} onClick={() => openEdit(c)} style={{ background: P.dark, backgroundImage: stripe, border: '2px solid black', borderRadius: 18, padding: '18px 16px', cursor: 'pointer', boxShadow: '4px 4px 0 black' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <p style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>{c.name}</p>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>vence em {days}d</p>
                  </div>
                  <p className="font-numbers" style={{ color: 'white', fontSize: 22, fontWeight: 800 }}>{money(c.spent)}</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 }}>de {money(c.limit)} disponíveis</p>
                  <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 99, height: 6, overflow: 'hidden', marginTop: 10 }}>
                    <div style={{ background: pct > 80 ? P.red : P.forest, height: '100%', width: `${pct}%`, borderRadius: 99 }} />
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 4 }}>{pct.toFixed(0)}% utilizado</p>
                </div>
              )
            })}
            {cards.length === 0 && <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 32 }}>Nenhum cartão</p>}
          </div>
        )}
        {sub === 'Metas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {finGoals.map(g => {
              const pct = Number(g.target) > 0 ? Math.min(100, (Number(g.current) / Number(g.target)) * 100) : 0
              return (
                <div key={g.id} onClick={() => openEdit(g)} style={{ background: 'white', border: '2px solid black', borderRadius: 16, padding: '14px 16px', cursor: 'pointer', boxShadow: '3px 3px 0 black' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <p style={{ fontWeight: 700, fontSize: 15 }}>{g.name}</p>
                    <p style={{ fontWeight: 800, fontSize: 13, color: P.plum }}>{pct.toFixed(0)}%</p>
                  </div>
                  <ProgressBar value={pct} color={P.plum} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <p style={{ fontSize: 12, color: '#6B7280' }}>{money(g.current)}</p>
                    <p style={{ fontSize: 12, color: '#6B7280' }}>{money(g.target)}</p>
                  </div>
                </div>
              )
            })}
            {finGoals.length === 0 && <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 32 }}>Nenhuma meta financeira</p>}
          </div>
        )}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'Novo item' : 'Editar'}>
        {sub === 'Extrato' && <>
          <Inp label="Descrição" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <Inp label="Valor (R$)" type="number" step="0.01" value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
          <Sel label="Tipo" value={form.type || 'saída'} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            <option value="saída">Saída</option><option value="entrada">Entrada</option>
          </Sel>
          <Sel label="Categoria" value={form.category || 'Outros'} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            <option>Alimentação</option><option>Transporte</option><option>Compras</option><option>Saúde</option><option>Casa</option><option>Beleza</option><option>Educação</option><option>Salário</option><option>Outros</option>
          </Sel>
          <Inp label="Conta" value={form.account || ''} onChange={e => setForm(f => ({ ...f, account: e.target.value }))} />
          <Inp label="Data" type="date" value={form.date || today()} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        </>}
        {sub === 'Contas' && <>
          <Inp label="Nome da conta" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Sel label="Tipo" value={form.type || 'Corrente'} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            <option>Corrente</option><option>Poupança</option><option>Investimento</option>
          </Sel>
          <Inp label="Saldo (R$)" type="number" step="0.01" value={form.balance || ''} onChange={e => setForm(f => ({ ...f, balance: e.target.value }))} />
        </>}
        {sub === 'Cartões' && <>
          <Inp label="Nome do cartão" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Inp label="Limite (R$)" type="number" step="0.01" value={form.limit || ''} onChange={e => setForm(f => ({ ...f, limit: e.target.value }))} />
          <Inp label="Fatura atual (R$)" type="number" step="0.01" value={form.spent || ''} onChange={e => setForm(f => ({ ...f, spent: e.target.value }))} />
          <Inp label="Dia de vencimento" type="number" min={1} max={31} value={form.dueDay || ''} onChange={e => setForm(f => ({ ...f, dueDay: e.target.value }))} />
        </>}
        {sub === 'Metas' && <>
          <Inp label="Nome da meta" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Inp label="Meta (R$)" type="number" step="0.01" value={form.target || ''} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} />
          <Inp label="Economizado (R$)" type="number" step="0.01" value={form.current || ''} onChange={e => setForm(f => ({ ...f, current: e.target.value }))} />
        </>}
        <Btn onClick={save} full color={P.plum}>Salvar</Btn>
        {modal === 'edit' && <Btn onClick={del} full ghost>Excluir</Btn>}
      </Modal>
    </div>
  )
}

// ─── NOTAS PANEL ─────────────────────────────────────────────────────────────
function NotasPanel({ onClose }) {
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [refresh, setRefresh] = useState(0)

  const notes = db.get('avt_notes', [])

  function openAdd() { setForm({}); setModal('add') }
  function openEdit(n) { setForm({ ...n }); setModal('edit') }

  function save() {
    const list = db.get('avt_notes', [])
    if (modal === 'add') db.set('avt_notes', [...list, { ...form, id: uid() }])
    else db.set('avt_notes', list.map(i => i.id === form.id ? form : i))
    setModal(null); setRefresh(r => r + 1)
  }

  function del() {
    if (!window.confirm('Excluir?')) return
    db.set('avt_notes', db.get('avt_notes', []).filter(i => i.id !== form.id))
    setModal(null); setRefresh(r => r + 1)
  }

  function toggleDone(note) {
    const list = db.get('avt_notes', [])
    db.set('avt_notes', list.map(i => i.id === note.id ? { ...i, done: !i.done } : i))
    setRefresh(r => r + 1)
  }

  const noteList = db.get('avt_notes', [])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-end' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '24px 24px 0 0', border: '2.5px solid black', width: '100%', maxHeight: '92vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ background: P.teal, backgroundImage: stripe, padding: '20px 16px 4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="font-display" style={{ color: 'white', fontSize: 30 }}>📝 Notas</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn small onClick={openAdd} color="rgba(255,255,255,0.25)" className="border-white border-opacity-50">+ Add</Btn>
              <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.5)', borderRadius: 10, padding: '4px 10px', fontSize: 18, cursor: 'pointer', color: 'white' }}>×</button>
            </div>
          </div>
        </div>
        <ScallopBorder fill="white" />
        <div style={{ padding: '8px 12px 32px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {noteList.map(n => (
            <div key={n.id} style={{ background: n.done ? '#F9FAFB' : P.cream, border: `2px solid ${n.done ? '#E5E7EB' : 'black'}`, borderRadius: 14, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start', boxShadow: n.done ? 'none' : '2px 2px 0 black' }}>
              <input type="checkbox" checked={!!n.done} onChange={() => toggleDone(n)} style={{ width: 18, height: 18, cursor: 'pointer', flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1 }} onClick={() => openEdit(n)}>
                {n.title && <p style={{ fontWeight: 700, fontSize: 14, textDecoration: n.done ? 'line-through' : 'none', color: n.done ? '#9CA3AF' : P.dark }}>{n.title}</p>}
                {n.text && <p style={{ fontSize: 13, color: n.done ? '#9CA3AF' : '#374151', marginTop: n.title ? 2 : 0, textDecoration: n.done ? 'line-through' : 'none' }}>{n.text}</p>}
                {n.reminder && <p style={{ fontSize: 11, color: P.teal, fontWeight: 700, marginTop: 4 }}>⏰ {new Date(n.reminder).toLocaleString('pt-BR')}</p>}
              </div>
            </div>
          ))}
          {noteList.length === 0 && <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 32 }}>Nenhuma nota</p>}
        </div>
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'Nova Nota' : 'Editar Nota'}>
        <Inp label="Título" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        <Tex label="Texto" value={form.text || ''} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} />
        <Inp label="Lembrete" type="datetime-local" value={form.reminder || ''} onChange={e => setForm(f => ({ ...f, reminder: e.target.value }))} />
        <Btn onClick={save} full color={P.teal}>Salvar</Btn>
        {modal === 'edit' && <Btn onClick={del} full ghost>Excluir</Btn>}
      </Modal>
    </div>
  )
}

// ─── SETTINGS MODAL ───────────────────────────────────────────────────────────
function SettingsModal({ onClose }) {
  const [exportCode, setExportCode] = useState('')
  const [importCode, setImportCode] = useState('')

  function doExport() {
    setExportCode(exportData())
  }

  function doImport() {
    if (!importCode.trim()) return
    importData(importCode.trim())
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-end' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '24px 24px 0 0', border: '2.5px solid black', width: '100%', maxHeight: '92vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 800, fontSize: 18 }}>⚙️ Configurações</h3>
            <button onClick={onClose} style={{ fontSize: 24, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
          </div>
        </div>
        <div style={{ padding: '0 20px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <p style={{ fontWeight: 800, fontSize: 15, marginBottom: 8 }}>Exportar dados</p>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 10 }}>Copie o código abaixo para guardar todos os seus dados.</p>
            <Btn onClick={doExport} full color={P.navy}>Gerar código</Btn>
            {exportCode && (
              <div style={{ marginTop: 10 }}>
                <textarea
                  readOnly
                  value={exportCode}
                  style={{ width: '100%', border: '2px solid black', borderRadius: 12, padding: 10, fontSize: 12, fontFamily: 'monospace', resize: 'none', height: 100, boxSizing: 'border-box' }}
                  onClick={e => e.target.select()}
                />
                <p style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>Toque no código para selecionar e copie.</p>
              </div>
            )}
          </div>
          <div style={{ borderTop: '2px solid #E5E7EB', paddingTop: 16 }}>
            <p style={{ fontWeight: 800, fontSize: 15, marginBottom: 8 }}>Importar dados</p>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 10 }}>Cole o código de backup para restaurar seus dados. Isso substituirá todos os dados atuais.</p>
            <textarea
              value={importCode}
              onChange={e => setImportCode(e.target.value)}
              placeholder="Cole o código aqui..."
              style={{ width: '100%', border: '2px solid black', borderRadius: 12, padding: 10, fontSize: 12, fontFamily: 'monospace', resize: 'none', height: 100, boxSizing: 'border-box', marginBottom: 10 }}
            />
            <Btn onClick={doImport} full color={P.red}>Restaurar dados</Btn>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
const navItems = [
  { key: 'home', emoji: '✦', label: 'Home', color: P.red },
  { key: 'estudos', emoji: '📚', label: 'Estudos', color: P.navy },
  { key: 'trabalho', emoji: '💼', label: 'Trabalho', color: P.forest },
  { key: 'vida', emoji: '🌸', label: 'Vida', color: P.rose },
  { key: 'casa', emoji: '🏡', label: 'Casa', color: P.amber },
  { key: 'financas', emoji: '💰', label: 'Finanças', color: P.plum },
]

function BottomNav({ tab, setTab }) {
  return (
    <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'white', borderTop: '2px solid black', display: 'flex', zIndex: 30, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {navItems.map(n => (
        <button key={n.key} onClick={() => setTab(n.key)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0 6px', background: 'none', border: 'none', cursor: 'pointer', gap: 2 }}>
          {tab === n.key && <div style={{ width: 6, height: 6, borderRadius: 99, background: n.color, marginBottom: 2 }} />}
          {tab !== n.key && <div style={{ width: 6, height: 6, marginBottom: 2 }} />}
          <span style={{ fontSize: 18 }}>{n.emoji}</span>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5, color: tab === n.key ? n.color : '#9CA3AF', textTransform: 'uppercase' }}>{n.label}</span>
        </button>
      ))}
    </div>
  )
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('home')
  const [showNotes, setShowNotes] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div style={{ background: P.cream, minHeight: '100vh', maxWidth: 480, margin: '0 auto', position: 'relative', fontFamily: 'Inter,system-ui,sans-serif' }}>
      {tab === 'home' && <HomeTab setTab={setTab} onNotes={() => setShowNotes(true)} onSettings={() => setShowSettings(true)} />}
      {tab === 'estudos' && <EstudosTab />}
      {tab === 'trabalho' && <TrabalhoTab />}
      {tab === 'vida' && <VidaTab />}
      {tab === 'casa' && <CasaTab />}
      {tab === 'financas' && <FinancasTab />}
      {showNotes && <NotasPanel onClose={() => setShowNotes(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  )
}
