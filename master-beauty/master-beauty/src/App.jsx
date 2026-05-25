import { useState, useEffect, useCallback } from 'react'
import { db, auth, googleProvider } from './firebase.js'
import {
  collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp
} from 'firebase/firestore'
import {
  signInWithPopup, signOut, onAuthStateChanged
} from 'firebase/auth'

// ─── Design Tokens ───────────────────────────────────────────────────────────
const P = {
  cream: '#FFF9F5', red: '#C1121F', navy: '#1B3A6B',
  forest: '#2A5C45', rose: '#C94070', amber: '#B84A2A',
  plum: '#6B2D8B', teal: '#0F7173', dark: '#1A1A1A',
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────
const stripe = (color, opacity = 0.08) =>
  `repeating-linear-gradient(-45deg, transparent, transparent 8px, ${
    color === 'light'
      ? `rgba(255,255,255,${opacity})`
      : `rgba(0,0,0,${opacity})`
  } 8px, ${
    color === 'light'
      ? `rgba(255,255,255,${opacity})`
      : `rgba(0,0,0,${opacity})`
  } 16px)`

function ScallopBorder({ fill = P.cream }) {
  return (
    <svg viewBox="0 0 390 24" preserveAspectRatio="none"
      style={{ display: 'block', width: '100%', height: 24, marginTop: -1 }}>
      <path fill={fill} d="M0,24 L0,12 Q9.75,0 19.5,12 Q29.25,24 39,12 Q48.75,0 58.5,12 Q68.25,24 78,12 Q87.75,0 97.5,12 Q107.25,24 117,12 Q126.75,0 136.5,12 Q146.25,24 156,12 Q165.75,0 175.5,12 Q185.25,24 195,12 Q204.75,0 214.5,12 Q224.25,24 234,12 Q243.75,0 253.5,12 Q263.25,24 273,12 Q282.75,0 292.5,12 Q302.25,24 312,12 Q321.75,0 331.5,12 Q341.25,24 351,12 Q360.75,0 370.5,12 Q380.25,24 390,12 L390,24 Z" />
    </svg>
  )
}

function TabHeader({ color, emoji, title, subtitle, children }) {
  return (
    <div>
      <div style={{ background: color, backgroundImage: stripe('light'), padding: '20px 16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
              {emoji} {subtitle}
            </p>
            <h2 className="font-display" style={{ color: 'white', fontSize: 32, lineHeight: 1 }}>{title}</h2>
          </div>
          {children}
        </div>
      </div>
      <ScallopBorder />
    </div>
  )
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}
      onClick={onClose}
    >
      <div
        style={{ background: 'white', borderRadius: '24px 24px 0 0', border: '2.5px solid black', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontWeight: 800, fontSize: 18 }}>{title}</h3>
          <button onClick={onClose} style={{ fontSize: 22, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── Shared Input Styles ──────────────────────────────────────────────────────
const inputStyle = {
  width: '100%', border: '2px solid #1A1A1A', borderRadius: 10, padding: '8px 12px',
  fontSize: 14, fontFamily: 'Inter, system-ui, sans-serif', background: P.cream,
  marginBottom: 10, outline: 'none', boxSizing: 'border-box',
}
const btnPrimary = (color = P.red) => ({
  background: color, color: 'white', border: '2.5px solid black', borderRadius: 12,
  padding: '10px 20px', fontWeight: 800, fontSize: 14, cursor: 'pointer',
  boxShadow: '3px 3px 0 black', width: '100%', marginTop: 4,
})
const btnSecondary = {
  background: 'white', color: P.dark, border: '2px solid #ccc', borderRadius: 10,
  padding: '6px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
}

// ─── Data Hook ────────────────────────────────────────────────────────────────
function useCol(userId, name) {
  const [data, setData] = useState([])
  useEffect(() => {
    if (!userId) { setData([]); return }
    const ref = collection(db, 'users', userId, name)
    return onSnapshot(ref, snap => setData(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
  }, [userId, name])
  const add    = d => addDoc(collection(db, 'users', userId, name), { ...d, _t: serverTimestamp() })
  const upd    = (id, d) => updateDoc(doc(db, 'users', userId, name, id), d)
  const remove = id => deleteDoc(doc(db, 'users', userId, name, id))
  return { data, add, upd, remove }
}

// ─── Utility ──────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0]
const fmtBRL = n => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const diffDays = (d1, d2) => Math.floor((new Date(d1) - new Date(d2)) / 86400000)

function SubTabs({ tabs, active, setActive, color }) {
  return (
    <div style={{ display: 'flex', gap: 6, padding: '12px 12px 0', overflowX: 'auto' }} className="scrollbar-hide">
      {tabs.map(t => (
        <button
          key={t}
          onClick={() => setActive(t)}
          style={{
            flexShrink: 0, padding: '6px 14px', borderRadius: 20, fontWeight: 700, fontSize: 13,
            border: '2px solid black', cursor: 'pointer',
            background: active === t ? color : 'white',
            color: active === t ? 'white' : P.dark,
            boxShadow: active === t ? '2px 2px 0 black' : 'none',
          }}
        >{t}</button>
      ))}
    </div>
  )
}

// ─── HOME TAB ─────────────────────────────────────────────────────────────────
const TILES = [
  { id: 'estudos',  emoji: '📚', label: 'Estudos',  color: P.navy   },
  { id: 'trabalho', emoji: '💼', label: 'Trabalho', color: P.forest },
  { id: 'vida',     emoji: '🌸', label: 'Vida',     color: P.rose   },
  { id: 'financas', emoji: '💰', label: 'Finanças', color: P.plum   },
  { id: 'casa',     emoji: '🏡', label: 'Casa',     color: P.amber  },
  { id: 'notas',    emoji: '📝', label: 'Notas',    color: P.teal   },
]

function HomeTile({ tile, metric, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: tile.color, backgroundImage: stripe('dark', 0.06),
        borderRadius: 20, border: '2.5px solid black', boxShadow: '4px 4px 0 black',
        padding: '20px 16px 16px', cursor: 'pointer', minHeight: 140,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}
    >
      <div>
        <span style={{ fontSize: 32 }}>{tile.emoji}</span>
        <p className="font-display" style={{ color: 'white', fontSize: 22, marginTop: 4, lineHeight: 1.1 }}>{tile.label}</p>
      </div>
      <p className="font-numbers" style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 700 }}>{metric}</p>
    </div>
  )
}

function HomeTab({ userId, setActiveTab, data }) {
  const dateStr = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  const metrics = {
    estudos:  (() => {
      const lendo = (data.books || []).filter(b => b.status === 'lendo').length
      const cursos = (data.courses || []).filter(c => c.status !== 'Concluído').length
      return `${lendo} lendo · ${cursos} cursos`
    })(),
    trabalho: (() => {
      const brands = (data.brands || []).filter(b => b.status === 'Live').length
      const tasks = (data.tasks || []).filter(t => !t.done).length
      return `${brands} marcas live · ${tasks} tarefas`
    })(),
    vida: (() => {
      const habits = (data.habits || []).length
      const logs = (data.habitLogs || []).filter(l => l.date === today() && l.done).length
      return `${logs}/${habits} hábitos hoje`
    })(),
    financas: (() => {
      const saldo = (data.accounts || []).reduce((s, a) => s + (Number(a.balance) || 0), 0)
      return fmtBRL(saldo)
    })(),
    casa: (() => {
      const pending = (data.shopping || []).filter(s => !s.done).length
      const overdue = (data.cleaningTasks || []).filter(t => {
        if (!t.lastDone || !t.frequency) return false
        return diffDays(today(), t.lastDone) >= Number(t.frequency)
      }).length
      return `${pending} compras · ${overdue} atrasadas`
    })(),
    notas: (() => {
      const total = (data.notes || []).length
      const overdue = (data.notes || []).filter(n => n.reminder && !n.done && n.reminder < new Date().toISOString()).length
      return `${total} notas · ${overdue} lembretes`
    })(),
  }

  return (
    <div>
      <div style={{ background: P.red, backgroundImage: stripe('light'), padding: '20px 16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="font-display" style={{ fontSize: 36, color: 'white', lineHeight: 1 }}>A Vida Toda</h1>
          <button
            onClick={() => signOut(auth)}
            style={{ color: 'white', fontSize: 12, opacity: 0.7, background: 'none', border: 'none', cursor: 'pointer' }}
          >Sair</button>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 }}>{dateStr}</p>
        <ScallopBorder />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '16px 12px', paddingBottom: 80 }}>
        {TILES.map(tile => (
          <HomeTile
            key={tile.id}
            tile={tile}
            metric={metrics[tile.id]}
            onClick={() => setActiveTab(tile.id === 'notas' ? 'notas' : tile.id)}
          />
        ))}
      </div>
    </div>
  )
}

// ─── ESTUDOS TAB ──────────────────────────────────────────────────────────────
function EstudosTab({ userId }) {
  const [sub, setSub] = useState('Livros')
  const books   = useCol(userId, 'books')
  const courses = useCol(userId, 'courses')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})

  const statusColors = { 'lendo': P.navy, 'quero ler': P.teal, 'lido': P.forest }
  const statusBg     = { 'lendo': '#e8eef7', 'quero ler': '#e0f4f4', 'lido': '#e6f2ec' }

  function openAdd() { setForm({}); setModal(sub === 'Livros' ? 'add-book' : 'add-course') }
  function openEdit(item) { setForm(item); setModal(sub === 'Livros' ? 'edit-book' : 'edit-course') }

  async function saveBook() {
    if (!form.title) return
    const d = { title: form.title, author: form.author || '', status: form.status || 'quero ler', progress: Number(form.progress || 0), notes: form.notes || '' }
    if (form.id) await books.upd(form.id, d)
    else await books.add(d)
    setModal(null)
  }

  async function saveCourse() {
    if (!form.name) return
    const d = { name: form.name, platform: form.platform || '', status: form.status || 'Em andamento', progress: Number(form.progress || 0), notes: form.notes || '' }
    if (form.id) await courses.upd(form.id, d)
    else await courses.add(d)
    setModal(null)
  }

  return (
    <div>
      <TabHeader color={P.navy} emoji="📚" title="Estudos" subtitle="sua biblioteca">
        <button onClick={openAdd} style={{ background: 'white', border: '2px solid black', borderRadius: 12, padding: '6px 14px', fontWeight: 800, fontSize: 20, cursor: 'pointer', boxShadow: '2px 2px 0 black' }}>+</button>
      </TabHeader>
      <SubTabs tabs={['Livros', 'Cursos']} active={sub} setActive={setSub} color={P.navy} />

      <div style={{ padding: '12px 12px 80px' }}>
        {sub === 'Livros' && (
          <>
            {books.data.length === 0 && <p style={{ color: '#888', textAlign: 'center', marginTop: 24 }}>Nenhum livro ainda. Adicione um!</p>}
            {books.data.map(b => (
              <div key={b.id} style={{ background: 'white', border: '2px solid black', borderRadius: 16, padding: 14, marginBottom: 10, boxShadow: '3px 3px 0 black' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 800, fontSize: 15 }}>{b.title}</p>
                    {b.author && <p style={{ fontSize: 13, color: '#666', marginTop: 2 }}>{b.author}</p>}
                  </div>
                  <span style={{ background: statusBg[b.status] || '#eee', color: statusColors[b.status] || P.dark, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, border: `1.5px solid ${statusColors[b.status] || '#ccc'}`, whiteSpace: 'nowrap', marginLeft: 8 }}>
                    {b.status}
                  </span>
                </div>
                {b.status === 'lendo' && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span>Progresso</span><span className="font-numbers">{b.progress || 0}%</span>
                    </div>
                    <div style={{ background: '#eee', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                      <div style={{ background: P.navy, height: '100%', width: `${b.progress || 0}%`, borderRadius: 999, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                )}
                {b.notes && <p style={{ fontSize: 12, color: '#666', marginTop: 8, fontStyle: 'italic' }}>{b.notes}</p>}
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button onClick={() => openEdit(b)} style={btnSecondary}>✏️ Editar</button>
                  <button onClick={() => { if (window.confirm('Remover livro?')) books.remove(b.id) }} style={{ ...btnSecondary, color: P.red }}>🗑️</button>
                </div>
              </div>
            ))}
          </>
        )}
        {sub === 'Cursos' && (
          <>
            {courses.data.length === 0 && <p style={{ color: '#888', textAlign: 'center', marginTop: 24 }}>Nenhum curso ainda. Adicione um!</p>}
            {courses.data.map(c => (
              <div key={c.id} style={{ background: 'white', border: '2px solid black', borderRadius: 16, padding: 14, marginBottom: 10, boxShadow: '3px 3px 0 black' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 800, fontSize: 15 }}>{c.name}</p>
                    {c.platform && <p style={{ fontSize: 13, color: '#666', marginTop: 2 }}>{c.platform}</p>}
                  </div>
                  <span style={{ background: c.status === 'Concluído' ? '#e6f2ec' : '#e8eef7', color: c.status === 'Concluído' ? P.forest : P.navy, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, border: `1.5px solid ${c.status === 'Concluído' ? P.forest : P.navy}`, whiteSpace: 'nowrap', marginLeft: 8 }}>
                    {c.status}
                  </span>
                </div>
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span>Progresso</span><span className="font-numbers">{c.progress || 0}%</span>
                  </div>
                  <div style={{ background: '#eee', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                    <div style={{ background: P.navy, height: '100%', width: `${c.progress || 0}%`, borderRadius: 999, transition: 'width 0.5s' }} />
                  </div>
                </div>
                {c.notes && <p style={{ fontSize: 12, color: '#666', marginTop: 8, fontStyle: 'italic' }}>{c.notes}</p>}
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button onClick={() => openEdit(c)} style={btnSecondary}>✏️ Editar</button>
                  <button onClick={() => { if (window.confirm('Remover curso?')) courses.remove(c.id) }} style={{ ...btnSecondary, color: P.red }}>🗑️</button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <Modal open={modal === 'add-book' || modal === 'edit-book'} onClose={() => setModal(null)} title={modal === 'edit-book' ? 'Editar Livro' : 'Novo Livro'}>
        <input style={inputStyle} placeholder="Título *" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        <input style={inputStyle} placeholder="Autor" value={form.author || ''} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} />
        <select style={inputStyle} value={form.status || 'quero ler'} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
          <option value="quero ler">Quero ler</option>
          <option value="lendo">Lendo</option>
          <option value="lido">Lido</option>
        </select>
        <input style={inputStyle} type="number" min="0" max="100" placeholder="Progresso (%)" value={form.progress || ''} onChange={e => setForm(f => ({ ...f, progress: e.target.value }))} />
        <textarea style={{ ...inputStyle, minHeight: 60 }} placeholder="Notas" value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        <button style={btnPrimary(P.navy)} onClick={saveBook}>Salvar</button>
      </Modal>

      <Modal open={modal === 'add-course' || modal === 'edit-course'} onClose={() => setModal(null)} title={modal === 'edit-course' ? 'Editar Curso' : 'Novo Curso'}>
        <input style={inputStyle} placeholder="Nome do curso *" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <input style={inputStyle} placeholder="Plataforma (ex: Udemy)" value={form.platform || ''} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))} />
        <select style={inputStyle} value={form.status || 'Em andamento'} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
          <option value="Não iniciado">Não iniciado</option>
          <option value="Em andamento">Em andamento</option>
          <option value="Concluído">Concluído</option>
        </select>
        <input style={inputStyle} type="number" min="0" max="100" placeholder="Progresso (%)" value={form.progress || ''} onChange={e => setForm(f => ({ ...f, progress: e.target.value }))} />
        <textarea style={{ ...inputStyle, minHeight: 60 }} placeholder="Notas" value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        <button style={btnPrimary(P.navy)} onClick={saveCourse}>Salvar</button>
      </Modal>
    </div>
  )
}

// ─── TRABALHO TAB ─────────────────────────────────────────────────────────────
const BRAND_STATUS_COLORS = {
  'Prospectando':    { bg: '#fef3e2', color: '#B84A2A', border: '#B84A2A' },
  'Em Onboarding':   { bg: '#e8eef7', color: P.navy, border: P.navy },
  'Live':            { bg: '#e6f2ec', color: P.forest, border: P.forest },
  'Pausado':         { bg: '#f2e8ee', color: P.rose, border: P.rose },
}
const PIPELINE_STATUS_COLORS = {
  'Lead':             { bg: '#f5f5f5', color: '#555' },
  'Contato Feito':    { bg: '#e8eef7', color: P.navy },
  'Proposta Enviada': { bg: '#fef3e2', color: '#B84A2A' },
  'Negociando':       { bg: '#f4e8f4', color: P.plum },
  'Ganho':            { bg: '#e6f2ec', color: P.forest },
  'Perdido':          { bg: '#fee', color: P.red },
}

function TrabalhoTab({ userId }) {
  const [sub, setSub] = useState('Marcas')
  const brands      = useCol(userId, 'brands')
  const pipeline    = useCol(userId, 'pipeline')
  const tasks       = useCol(userId, 'tasks')
  const careerGoals = useCol(userId, 'careerGoals')
  const ideas       = useCol(userId, 'ideas')

  const [modal, setModal] = useState(null)
  const [form, setForm]   = useState({})
  const [expanded, setExpanded] = useState(null)

  function openAdd(type) { setForm({}); setModal('add-' + type) }
  function openEdit(type, item) { setForm(item); setModal('edit-' + type) }

  async function saveBrand() {
    if (!form.name) return
    const d = { name: form.name, sector: form.sector || 'Skincare', status: form.status || 'Prospectando', contact: form.contact || '', gmv: Number(form.gmv || 0), notes: form.notes || '' }
    if (form.id) await brands.upd(form.id, d)
    else await brands.add(d)
    setModal(null)
  }

  async function savePipeline() {
    if (!form.brandName) return
    const d = { brandName: form.brandName, instagram: form.instagram || '', followers: form.followers || '', gmvPotential: Number(form.gmvPotential || 0), status: form.status || 'Lead', notes: form.notes || '', sector: form.sector || '' }
    if (form.id) await pipeline.upd(form.id, d)
    else await pipeline.add(d)
    setModal(null)
  }

  async function saveTask() {
    if (!form.text) return
    const d = { text: form.text, done: false, priority: form.priority || 'média', dueDate: form.dueDate || '' }
    if (form.id) await tasks.upd(form.id, d)
    else await tasks.add(d)
    setModal(null)
  }

  async function saveGoal() {
    if (!form.text) return
    const d = { text: form.text, done: form.done || false, deadline: form.deadline || '' }
    if (form.id) await careerGoals.upd(form.id, d)
    else await careerGoals.add(d)
    setModal(null)
  }

  async function saveIdea() {
    if (!form.text) return
    const d = { text: form.text }
    if (form.id) await ideas.upd(form.id, d)
    else await ideas.add(d)
    setModal(null)
  }

  const priorityOrder = { 'alta': 0, 'média': 1, 'baixa': 2 }
  const sortedTasks = [...tasks.data].sort((a, b) => (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1))
  const priorityColor = { 'alta': P.red, 'média': P.amber, 'baixa': P.forest }

  const subAddMap = { Marcas: 'brand', Pipeline: 'pipe', Tarefas: 'task', Metas: 'goal', Ideias: 'idea' }

  return (
    <div>
      <TabHeader color={P.forest} emoji="💼" title="Trabalho" subtitle="sua carreira">
        <button onClick={() => openAdd(subAddMap[sub])} style={{ background: 'white', border: '2px solid black', borderRadius: 12, padding: '6px 14px', fontWeight: 800, fontSize: 20, cursor: 'pointer', boxShadow: '2px 2px 0 black' }}>+</button>
      </TabHeader>
      <SubTabs tabs={['Marcas', 'Pipeline', 'Tarefas', 'Metas', 'Ideias']} active={sub} setActive={setSub} color={P.forest} />

      <div style={{ padding: '12px 12px 80px' }}>

        {sub === 'Marcas' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {brands.data.length === 0 && <p style={{ color: '#888', gridColumn: '1/-1', textAlign: 'center', marginTop: 24 }}>Nenhuma marca. Adicione uma!</p>}
            {brands.data.map(b => {
              const sc = BRAND_STATUS_COLORS[b.status] || { bg: '#eee', color: '#555', border: '#ccc' }
              return (
                <div key={b.id} style={{ background: 'white', border: '2px solid black', borderRadius: 16, padding: 12, boxShadow: '3px 3px 0 black', cursor: 'pointer' }} onClick={() => setExpanded(expanded === b.id ? null : b.id)}>
                  <p style={{ fontWeight: 800, fontSize: 14 }}>{b.name}</p>
                  <p style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{b.sector}</p>
                  <span style={{ display: 'inline-block', marginTop: 6, background: sc.bg, color: sc.color, border: `1.5px solid ${sc.border}`, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{b.status}</span>
                  {expanded === b.id && (
                    <div style={{ marginTop: 10 }}>
                      {b.contact && <p style={{ fontSize: 12, color: '#555' }}>📞 {b.contact}</p>}
                      {b.gmv > 0 && <p style={{ fontSize: 12, color: P.forest, fontWeight: 700, marginTop: 4 }}>GMV: {fmtBRL(b.gmv)}</p>}
                      {b.notes && <p style={{ fontSize: 12, color: '#666', marginTop: 4, fontStyle: 'italic' }}>{b.notes}</p>}
                      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                        <button onClick={e => { e.stopPropagation(); openEdit('brand', b) }} style={btnSecondary}>✏️</button>
                        <button onClick={e => { e.stopPropagation(); if (window.confirm('Remover marca?')) brands.remove(b.id) }} style={{ ...btnSecondary, color: P.red }}>🗑️</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {sub === 'Pipeline' && (
          <>
            {pipeline.data.length === 0 && <p style={{ color: '#888', textAlign: 'center', marginTop: 24 }}>Pipeline vazio. Adicione um lead!</p>}
            {pipeline.data.map(p => {
              const sc = PIPELINE_STATUS_COLORS[p.status] || { bg: '#eee', color: '#555' }
              return (
                <div key={p.id} style={{ background: 'white', border: '2px solid black', borderRadius: 16, padding: 14, marginBottom: 10, boxShadow: '3px 3px 0 black' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: 15 }}>{p.brandName}</p>
                      {p.instagram && <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>@{p.instagram}</p>}
                    </div>
                    <span style={{ background: sc.bg, color: sc.color, fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, border: `1.5px solid ${sc.color}`, whiteSpace: 'nowrap', marginLeft: 8 }}>{p.status}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    {p.followers && <span style={{ fontSize: 12, color: '#555' }}>👥 {p.followers}</span>}
                    {p.gmvPotential > 0 && <span style={{ fontSize: 12, color: P.forest, fontWeight: 700 }}>{fmtBRL(p.gmvPotential)}</span>}
                    {p.sector && <span style={{ fontSize: 12, color: '#555' }}>{p.sector}</span>}
                  </div>
                  {p.notes && <p style={{ fontSize: 12, color: '#666', marginTop: 6, fontStyle: 'italic' }}>{p.notes}</p>}
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button onClick={() => openEdit('pipe', p)} style={btnSecondary}>✏️ Editar</button>
                    <button onClick={() => { if (window.confirm('Remover?')) pipeline.remove(p.id) }} style={{ ...btnSecondary, color: P.red }}>🗑️</button>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {sub === 'Tarefas' && (
          <>
            {sortedTasks.length === 0 && <p style={{ color: '#888', textAlign: 'center', marginTop: 24 }}>Nenhuma tarefa. Adicione uma!</p>}
            {sortedTasks.map(t => (
              <div key={t.id} style={{ background: 'white', border: '2px solid black', borderRadius: 14, padding: '10px 14px', marginBottom: 8, boxShadow: '2px 2px 0 black', display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" checked={!!t.done} onChange={e => tasks.upd(t.id, { done: e.target.checked })} style={{ width: 18, height: 18, accentColor: P.forest, cursor: 'pointer', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? '#aaa' : P.dark }}>{t.text}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: priorityColor[t.priority] || P.dark, fontWeight: 700 }}>● {t.priority}</span>
                    {t.dueDate && <span style={{ fontSize: 11, color: '#888' }}>📅 {t.dueDate}</span>}
                  </div>
                </div>
                <button onClick={() => openEdit('task', t)} style={{ ...btnSecondary, padding: '4px 8px' }}>✏️</button>
                <button onClick={() => { if (window.confirm('Remover?')) tasks.remove(t.id) }} style={{ ...btnSecondary, padding: '4px 8px', color: P.red }}>🗑️</button>
              </div>
            ))}
          </>
        )}

        {sub === 'Metas' && (
          <>
            {careerGoals.data.length === 0 && <p style={{ color: '#888', textAlign: 'center', marginTop: 24 }}>Nenhuma meta. Adicione uma!</p>}
            {careerGoals.data.map(g => (
              <div key={g.id} style={{ background: 'white', border: '2px solid black', borderRadius: 14, padding: '10px 14px', marginBottom: 8, boxShadow: '2px 2px 0 black', display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" checked={!!g.done} onChange={e => careerGoals.upd(g.id, { done: e.target.checked })} style={{ width: 18, height: 18, accentColor: P.forest, cursor: 'pointer', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, textDecoration: g.done ? 'line-through' : 'none', color: g.done ? '#aaa' : P.dark }}>{g.text}</p>
                  {g.deadline && <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Prazo: {g.deadline}</p>}
                </div>
                <button onClick={() => openEdit('goal', g)} style={{ ...btnSecondary, padding: '4px 8px' }}>✏️</button>
                <button onClick={() => { if (window.confirm('Remover?')) careerGoals.remove(g.id) }} style={{ ...btnSecondary, padding: '4px 8px', color: P.red }}>🗑️</button>
              </div>
            ))}
          </>
        )}

        {sub === 'Ideias' && (
          <>
            {ideas.data.length === 0 && <p style={{ color: '#888', textAlign: 'center', marginTop: 24 }}>Nenhuma ideia. Adicione uma!</p>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {ideas.data.map(i => (
                <div key={i.id} style={{ background: '#fffde7', border: '2px solid #f0c040', borderRadius: 14, padding: 12, boxShadow: '3px 3px 0 #f0c040' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>{i.text}</p>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <button onClick={() => openEdit('idea', i)} style={{ ...btnSecondary, padding: '3px 8px', fontSize: 12 }}>✏️</button>
                    <button onClick={() => { if (window.confirm('Remover?')) ideas.remove(i.id) }} style={{ ...btnSecondary, padding: '3px 8px', fontSize: 12, color: P.red }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Modal open={modal === 'add-brand' || modal === 'edit-brand'} onClose={() => setModal(null)} title={modal === 'edit-brand' ? 'Editar Marca' : 'Nova Marca'}>
        <input style={inputStyle} placeholder="Nome da marca *" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <select style={inputStyle} value={form.sector || 'Skincare'} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}>
          {['Skincare','Makeup','Haircare','Fragrance','Wellness','Outro'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select style={inputStyle} value={form.status || 'Prospectando'} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
          {['Prospectando','Em Onboarding','Live','Pausado'].map(s => <option key={s}>{s}</option>)}
        </select>
        <input style={inputStyle} placeholder="Contato (email/tel)" value={form.contact || ''} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} />
        <input style={inputStyle} type="number" placeholder="GMV (R$)" value={form.gmv || ''} onChange={e => setForm(f => ({ ...f, gmv: e.target.value }))} />
        <textarea style={{ ...inputStyle, minHeight: 60 }} placeholder="Notas" value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        <button style={btnPrimary(P.forest)} onClick={saveBrand}>Salvar</button>
      </Modal>

      <Modal open={modal === 'add-pipe' || modal === 'edit-pipe'} onClose={() => setModal(null)} title={modal === 'edit-pipe' ? 'Editar Lead' : 'Novo Lead'}>
        <input style={inputStyle} placeholder="Nome da marca *" value={form.brandName || ''} onChange={e => setForm(f => ({ ...f, brandName: e.target.value }))} />
        <input style={inputStyle} placeholder="Instagram (sem @)" value={form.instagram || ''} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} />
        <input style={inputStyle} placeholder="Seguidores (ex: 50k)" value={form.followers || ''} onChange={e => setForm(f => ({ ...f, followers: e.target.value }))} />
        <input style={inputStyle} type="number" placeholder="GMV Potencial (R$)" value={form.gmvPotential || ''} onChange={e => setForm(f => ({ ...f, gmvPotential: e.target.value }))} />
        <select style={inputStyle} value={form.status || 'Lead'} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
          {Object.keys(PIPELINE_STATUS_COLORS).map(s => <option key={s}>{s}</option>)}
        </select>
        <input style={inputStyle} placeholder="Setor" value={form.sector || ''} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))} />
        <textarea style={{ ...inputStyle, minHeight: 60 }} placeholder="Notas" value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        <button style={btnPrimary(P.forest)} onClick={savePipeline}>Salvar</button>
      </Modal>

      <Modal open={modal === 'add-task' || modal === 'edit-task'} onClose={() => setModal(null)} title={modal === 'edit-task' ? 'Editar Tarefa' : 'Nova Tarefa'}>
        <input style={inputStyle} placeholder="Tarefa *" value={form.text || ''} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} />
        <select style={inputStyle} value={form.priority || 'média'} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
          <option value="alta">Alta</option>
          <option value="média">Média</option>
          <option value="baixa">Baixa</option>
        </select>
        <input style={inputStyle} type="date" placeholder="Prazo" value={form.dueDate || ''} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
        <button style={btnPrimary(P.forest)} onClick={saveTask}>Salvar</button>
      </Modal>

      <Modal open={modal === 'add-goal' || modal === 'edit-goal'} onClose={() => setModal(null)} title={modal === 'edit-goal' ? 'Editar Meta' : 'Nova Meta'}>
        <input style={inputStyle} placeholder="Meta de carreira *" value={form.text || ''} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} />
        <input style={inputStyle} type="date" placeholder="Prazo" value={form.deadline || ''} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
        <button style={btnPrimary(P.forest)} onClick={saveGoal}>Salvar</button>
      </Modal>

      <Modal open={modal === 'add-idea' || modal === 'edit-idea'} onClose={() => setModal(null)} title={modal === 'edit-idea' ? 'Editar Ideia' : 'Nova Ideia'}>
        <textarea style={{ ...inputStyle, minHeight: 80 }} placeholder="Sua ideia..." value={form.text || ''} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} />
        <button style={btnPrimary(P.forest)} onClick={saveIdea}>Salvar</button>
      </Modal>
    </div>
  )
}

// ─── VIDA TAB ─────────────────────────────────────────────────────────────────
const LIFE_GOAL_CATEGORIES = ['Carreira', 'Saúde', 'Relacionamentos', 'Finanças', 'Pessoal', 'Viagens']
const CATEGORY_COLORS = {
  'Carreira':        P.forest,
  'Saúde':           P.teal,
  'Relacionamentos': P.rose,
  'Finanças':        P.plum,
  'Pessoal':         P.navy,
  'Viagens':         P.amber,
}
const MOOD_EMOJIS = ['😄', '😊', '😐', '😔', '😠']

function VidaTab({ userId }) {
  const [sub, setSub] = useState('Hábitos')
  const habits       = useCol(userId, 'habits')
  const habitLogs    = useCol(userId, 'habitLogs')
  const lifeGoals    = useCol(userId, 'lifeGoals')
  const moods        = useCol(userId, 'moods')
  const appointments = useCol(userId, 'appointments')

  const [modal, setModal]         = useState(null)
  const [form, setForm]           = useState({})
  const [animating, setAnimating] = useState(null)

  const todayStr = today()

  function streak(habitId) {
    let s = 0
    const d = new Date()
    while (true) {
      const ds = d.toISOString().split('T')[0]
      const done = habitLogs.data.find(l => l.habitId === habitId && l.date === ds && l.done)
      if (!done) break
      s++
      d.setDate(d.getDate() - 1)
    }
    return s
  }

  function isHabitDoneToday(habitId) {
    return habitLogs.data.some(l => l.habitId === habitId && l.date === todayStr && l.done)
  }

  async function toggleHabit(habitId) {
    const done = isHabitDoneToday(habitId)
    const existing = habitLogs.data.find(l => l.habitId === habitId && l.date === todayStr)
    setAnimating(habitId)
    setTimeout(() => setAnimating(null), 300)
    if (existing) {
      await habitLogs.upd(existing.id, { done: !done })
    } else {
      await habitLogs.add({ habitId, date: todayStr, done: true })
    }
  }

  async function saveHabit() {
    if (!form.name) return
    const d = { name: form.name, emoji: form.emoji || '✅', frequency: form.frequency || 'daily' }
    if (form.id) await habits.upd(form.id, d)
    else await habits.add(d)
    setModal(null)
  }

  async function saveLifeGoal() {
    if (!form.text) return
    const d = { text: form.text, done: form.done || false, category: form.category || 'Pessoal' }
    if (form.id) await lifeGoals.upd(form.id, d)
    else await lifeGoals.add(d)
    setModal(null)
  }

  async function saveMood() {
    if (!form.emoji) return
    const d = { date: form.date || todayStr, emoji: form.emoji, note: form.note || '' }
    if (form.id) await moods.upd(form.id, d)
    else await moods.add(d)
    setModal(null)
  }

  async function saveAppointment() {
    if (!form.title) return
    const d = { title: form.title, doctor: form.doctor || '', date: form.date || '', notes: form.notes || '' }
    if (form.id) await appointments.upd(form.id, d)
    else await appointments.add(d)
    setModal(null)
  }

  const groupedGoals = LIFE_GOAL_CATEGORIES.reduce((acc, cat) => {
    const items = lifeGoals.data.filter(g => g.category === cat)
    if (items.length) acc[cat] = items
    return acc
  }, {})

  const sortedAppointments = [...appointments.data].sort((a, b) => (a.date || '').localeCompare(b.date || ''))

  const subAddMap = { 'Hábitos': 'habit', 'Metas': 'lifegoal', 'Humor': 'mood', 'Consultas': 'appt' }

  return (
    <div>
      <TabHeader color={P.rose} emoji="🌸" title="Vida" subtitle="seu bem-estar">
        <button onClick={() => { setForm({}); setModal('add-' + subAddMap[sub]) }} style={{ background: 'white', border: '2px solid black', borderRadius: 12, padding: '6px 14px', fontWeight: 800, fontSize: 20, cursor: 'pointer', boxShadow: '2px 2px 0 black' }}>+</button>
      </TabHeader>
      <SubTabs tabs={['Hábitos', 'Metas', 'Humor', 'Consultas']} active={sub} setActive={setSub} color={P.rose} />

      <div style={{ padding: '12px 12px 80px' }}>

        {sub === 'Hábitos' && (
          <>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#888', marginBottom: 10 }}>HOJE — {todayStr}</p>
            {habits.data.length === 0 && <p style={{ color: '#888', textAlign: 'center', marginTop: 24 }}>Nenhum hábito. Adicione um!</p>}
            {habits.data.map(h => {
              const done = isHabitDoneToday(h.id)
              const s = streak(h.id)
              return (
                <div key={h.id} style={{ background: 'white', border: '2px solid black', borderRadius: 14, padding: '12px 14px', marginBottom: 8, boxShadow: '2px 2px 0 black', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    className={animating === h.id ? 'pop' : ''}
                    onClick={() => toggleHabit(h.id)}
                    style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: done ? P.rose : 'white',
                      border: `2.5px solid ${done ? P.rose : '#ccc'}`,
                      fontSize: 18, cursor: 'pointer', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    {done ? '✓' : (h.emoji || '○')}
                  </button>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, textDecoration: done ? 'line-through' : 'none', color: done ? '#aaa' : P.dark }}>{h.name}</p>
                    <p style={{ fontSize: 12, color: P.rose, marginTop: 2 }}>🔥 {s} dia{s !== 1 ? 's' : ''} seguidos · {h.frequency === 'daily' ? 'diário' : 'semanal'}</p>
                  </div>
                  <button onClick={() => { setForm(h); setModal('edit-habit') }} style={{ ...btnSecondary, padding: '4px 8px' }}>✏️</button>
                  <button onClick={() => { if (window.confirm('Remover hábito?')) habits.remove(h.id) }} style={{ ...btnSecondary, padding: '4px 8px', color: P.red }}>🗑️</button>
                </div>
              )
            })}
          </>
        )}

        {sub === 'Metas' && (
          <>
            {Object.keys(groupedGoals).length === 0 && lifeGoals.data.length === 0 && (
              <p style={{ color: '#888', textAlign: 'center', marginTop: 24 }}>Nenhuma meta. Adicione uma!</p>
            )}
            {Object.entries(groupedGoals).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: 16 }}>
                <span style={{ display: 'inline-block', background: CATEGORY_COLORS[cat] || P.navy, color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, marginBottom: 8 }}>{cat}</span>
                {items.map(g => (
                  <div key={g.id} style={{ background: 'white', border: '2px solid black', borderRadius: 14, padding: '10px 14px', marginBottom: 8, boxShadow: '2px 2px 0 black', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="checkbox" checked={!!g.done} onChange={e => lifeGoals.upd(g.id, { done: e.target.checked })} style={{ width: 18, height: 18, accentColor: CATEGORY_COLORS[cat] || P.navy, cursor: 'pointer', flexShrink: 0 }} />
                    <p style={{ flex: 1, fontWeight: 600, fontSize: 14, textDecoration: g.done ? 'line-through' : 'none', color: g.done ? '#aaa' : P.dark }}>{g.text}</p>
                    <button onClick={() => { setForm(g); setModal('edit-lifegoal') }} style={{ ...btnSecondary, padding: '4px 8px' }}>✏️</button>
                    <button onClick={() => { if (window.confirm('Remover?')) lifeGoals.remove(g.id) }} style={{ ...btnSecondary, padding: '4px 8px', color: P.red }}>🗑️</button>
                  </div>
                ))}
              </div>
            ))}
            {lifeGoals.data.filter(g => !LIFE_GOAL_CATEGORIES.includes(g.category)).map(g => (
              <div key={g.id} style={{ background: 'white', border: '2px solid black', borderRadius: 14, padding: '10px 14px', marginBottom: 8, boxShadow: '2px 2px 0 black', display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" checked={!!g.done} onChange={e => lifeGoals.upd(g.id, { done: e.target.checked })} style={{ width: 18, height: 18, accentColor: P.navy, cursor: 'pointer', flexShrink: 0 }} />
                <p style={{ flex: 1, fontWeight: 600, fontSize: 14, textDecoration: g.done ? 'line-through' : 'none', color: g.done ? '#aaa' : P.dark }}>{g.text}</p>
                <button onClick={() => { setForm(g); setModal('edit-lifegoal') }} style={{ ...btnSecondary, padding: '4px 8px' }}>✏️</button>
                <button onClick={() => { if (window.confirm('Remover?')) lifeGoals.remove(g.id) }} style={{ ...btnSecondary, padding: '4px 8px', color: P.red }}>🗑️</button>
              </div>
            ))}
          </>
        )}

        {sub === 'Humor' && (
          <>
            {moods.data.length === 0 && <p style={{ color: '#888', textAlign: 'center', marginTop: 24 }}>Nenhum registro. Como está se sentindo?</p>}
            {[...moods.data].sort((a, b) => (b.date || '').localeCompare(a.date || '')).map(m => (
              <div key={m.id} style={{ background: 'white', border: '2px solid black', borderRadius: 14, padding: '12px 14px', marginBottom: 8, boxShadow: '2px 2px 0 black', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 32 }}>{m.emoji}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 14 }}>{m.date}</p>
                  {m.note && <p style={{ fontSize: 13, color: '#666', marginTop: 2 }}>{m.note}</p>}
                </div>
                <button onClick={() => { if (window.confirm('Remover?')) moods.remove(m.id) }} style={{ ...btnSecondary, padding: '4px 8px', color: P.red }}>🗑️</button>
              </div>
            ))}
          </>
        )}

        {sub === 'Consultas' && (
          <>
            {sortedAppointments.length === 0 && <p style={{ color: '#888', textAlign: 'center', marginTop: 24 }}>Nenhuma consulta. Adicione uma!</p>}
            {sortedAppointments.map(a => {
              const upcoming = a.date && a.date >= todayStr
              return (
                <div key={a.id} style={{ background: upcoming ? '#e8eef7' : 'white', border: `2px solid ${upcoming ? P.navy : '#ccc'}`, borderRadius: 14, padding: '12px 14px', marginBottom: 8, boxShadow: '2px 2px 0 black' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: 15 }}>{a.title}</p>
                      {a.doctor && <p style={{ fontSize: 13, color: '#666', marginTop: 2 }}>Dr(a). {a.doctor}</p>}
                    </div>
                    {a.date && <span style={{ fontSize: 13, fontWeight: 700, color: upcoming ? P.navy : '#aaa' }}>📅 {a.date}</span>}
                  </div>
                  {a.notes && <p style={{ fontSize: 12, color: '#666', marginTop: 6, fontStyle: 'italic' }}>{a.notes}</p>}
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button onClick={() => { setForm(a); setModal('edit-appt') }} style={btnSecondary}>✏️ Editar</button>
                    <button onClick={() => { if (window.confirm('Remover?')) appointments.remove(a.id) }} style={{ ...btnSecondary, color: P.red }}>🗑️</button>
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>

      <Modal open={modal === 'add-habit' || modal === 'edit-habit'} onClose={() => setModal(null)} title={modal === 'edit-habit' ? 'Editar Hábito' : 'Novo Hábito'}>
        <input style={inputStyle} placeholder="Nome do hábito *" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <input style={inputStyle} placeholder="Emoji (ex: 💪)" value={form.emoji || ''} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} />
        <select style={inputStyle} value={form.frequency || 'daily'} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
          <option value="daily">Diário</option>
          <option value="weekly">Semanal</option>
        </select>
        <button style={btnPrimary(P.rose)} onClick={saveHabit}>Salvar</button>
      </Modal>

      <Modal open={modal === 'add-lifegoal' || modal === 'edit-lifegoal'} onClose={() => setModal(null)} title={modal === 'edit-lifegoal' ? 'Editar Meta' : 'Nova Meta de Vida'}>
        <input style={inputStyle} placeholder="Meta *" value={form.text || ''} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} />
        <select style={inputStyle} value={form.category || 'Pessoal'} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
          {LIFE_GOAL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <button style={btnPrimary(P.rose)} onClick={saveLifeGoal}>Salvar</button>
      </Modal>

      <Modal open={modal === 'add-mood' || modal === 'edit-mood'} onClose={() => setModal(null)} title="Registrar Humor">
        <input style={inputStyle} type="date" value={form.date || todayStr} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 12 }}>
          {MOOD_EMOJIS.map(e => (
            <button
              key={e}
              onClick={() => setForm(f => ({ ...f, emoji: e }))}
              style={{ fontSize: 32, background: form.emoji === e ? '#fce4ec' : 'transparent', border: `2px solid ${form.emoji === e ? P.rose : '#eee'}`, borderRadius: 12, padding: '4px 8px', cursor: 'pointer' }}
            >{e}</button>
          ))}
        </div>
        <textarea style={{ ...inputStyle, minHeight: 60 }} placeholder="Como foi seu dia?" value={form.note || ''} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
        <button style={btnPrimary(P.rose)} onClick={saveMood}>Salvar</button>
      </Modal>

      <Modal open={modal === 'add-appt' || modal === 'edit-appt'} onClose={() => setModal(null)} title={modal === 'edit-appt' ? 'Editar Consulta' : 'Nova Consulta'}>
        <input style={inputStyle} placeholder="Tipo de consulta *" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        <input style={inputStyle} placeholder="Médico/Profissional" value={form.doctor || ''} onChange={e => setForm(f => ({ ...f, doctor: e.target.value }))} />
        <input style={inputStyle} type="date" value={form.date || ''} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        <textarea style={{ ...inputStyle, minHeight: 60 }} placeholder="Notas" value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        <button style={btnPrimary(P.rose)} onClick={saveAppointment}>Salvar</button>
      </Modal>
    </div>
  )
}

// ─── CASA TAB ─────────────────────────────────────────────────────────────────
function CasaTab({ userId }) {
  const [sub, setSub] = useState('Tarefas')
  const cleaningTasks = useCol(userId, 'cleaningTasks')
  const shopping      = useCol(userId, 'shopping')

  const [modal, setModal] = useState(null)
  const [form, setForm]   = useState({})

  const todayStr = today()

  async function saveCleanTask() {
    if (!form.task) return
    const d = { task: form.task, lastDone: form.lastDone || '', frequency: Number(form.frequency || 7), done: false }
    if (form.id) await cleaningTasks.upd(form.id, d)
    else await cleaningTasks.add(d)
    setModal(null)
  }

  async function saveShopItem() {
    if (!form.item) return
    const d = { item: form.item, qty: form.qty || '1', category: form.category || 'Outros', done: false }
    if (form.id) await shopping.upd(form.id, d)
    else await shopping.add(d)
    setModal(null)
  }

  function daysSince(lastDone) {
    if (!lastDone) return null
    return diffDays(todayStr, lastDone)
  }

  function isOverdue(t) {
    if (!t.lastDone || !t.frequency) return false
    return daysSince(t.lastDone) >= Number(t.frequency)
  }

  const shopByCategory = shopping.data.reduce((acc, s) => {
    const cat = s.category || 'Outros'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(s)
    return acc
  }, {})

  return (
    <div>
      <TabHeader color={P.amber} emoji="🏡" title="Casa" subtitle="organização doméstica">
        <button onClick={() => { setForm({}); setModal(sub === 'Tarefas' ? 'add-clean' : 'add-shop') }} style={{ background: 'white', border: '2px solid black', borderRadius: 12, padding: '6px 14px', fontWeight: 800, fontSize: 20, cursor: 'pointer', boxShadow: '2px 2px 0 black' }}>+</button>
      </TabHeader>
      <SubTabs tabs={['Tarefas', 'Compras']} active={sub} setActive={setSub} color={P.amber} />

      <div style={{ padding: '12px 12px 80px' }}>

        {sub === 'Tarefas' && (
          <>
            {cleaningTasks.data.length === 0 && <p style={{ color: '#888', textAlign: 'center', marginTop: 24 }}>Nenhuma tarefa. Adicione uma!</p>}
            {cleaningTasks.data.map(t => {
              const days = daysSince(t.lastDone)
              const overdue = isOverdue(t)
              return (
                <div key={t.id} style={{ background: overdue ? '#fff3f3' : 'white', border: `2px solid ${overdue ? P.red : 'black'}`, borderRadius: 14, padding: '12px 14px', marginBottom: 8, boxShadow: '2px 2px 0 black' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="checkbox"
                      checked={!!t.done}
                      onChange={async e => {
                        await cleaningTasks.upd(t.id, { done: e.target.checked, lastDone: e.target.checked ? todayStr : t.lastDone })
                      }}
                      style={{ width: 18, height: 18, accentColor: P.amber, cursor: 'pointer', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? '#aaa' : P.dark }}>{t.task}</p>
                      <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                        {days !== null && <span style={{ fontSize: 12, color: overdue ? P.red : '#888', fontWeight: overdue ? 700 : 400 }}>há {days} dia{days !== 1 ? 's' : ''}</span>}
                        <span style={{ fontSize: 12, color: '#999' }}>a cada {t.frequency} dias</span>
                      </div>
                    </div>
                    <button onClick={() => { setForm(t); setModal('edit-clean') }} style={{ ...btnSecondary, padding: '4px 8px' }}>✏️</button>
                    <button onClick={() => { if (window.confirm('Remover?')) cleaningTasks.remove(t.id) }} style={{ ...btnSecondary, padding: '4px 8px', color: P.red }}>🗑️</button>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {sub === 'Compras' && (
          <>
            {shopping.data.length === 0 && <p style={{ color: '#888', textAlign: 'center', marginTop: 24 }}>Lista vazia. Adicione um item!</p>}
            {Object.entries(shopByCategory).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: 16 }}>
                <p style={{ fontWeight: 700, fontSize: 12, color: '#888', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{cat}</p>
                {items.map(s => (
                  <div key={s.id} style={{ background: s.done ? '#f5f5f5' : 'white', border: '2px solid black', borderRadius: 14, padding: '10px 14px', marginBottom: 6, boxShadow: '2px 2px 0 black', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="checkbox" checked={!!s.done} onChange={e => shopping.upd(s.id, { done: e.target.checked })} style={{ width: 18, height: 18, accentColor: P.amber, cursor: 'pointer', flexShrink: 0 }} />
                    <p style={{ flex: 1, fontWeight: 600, fontSize: 14, textDecoration: s.done ? 'line-through' : 'none', color: s.done ? '#aaa' : P.dark }}>{s.item}</p>
                    {s.qty && s.qty !== '1' && <span style={{ fontSize: 12, color: '#888' }}>x{s.qty}</span>}
                    <button onClick={() => { if (window.confirm('Remover?')) shopping.remove(s.id) }} style={{ ...btnSecondary, padding: '4px 8px', color: P.red }}>🗑️</button>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
      </div>

      <Modal open={modal === 'add-clean' || modal === 'edit-clean'} onClose={() => setModal(null)} title={modal === 'edit-clean' ? 'Editar Tarefa' : 'Nova Tarefa de Casa'}>
        <input style={inputStyle} placeholder="Tarefa (ex: Limpar banheiro) *" value={form.task || ''} onChange={e => setForm(f => ({ ...f, task: e.target.value }))} />
        <input style={inputStyle} type="date" placeholder="Última vez feita" value={form.lastDone || ''} onChange={e => setForm(f => ({ ...f, lastDone: e.target.value }))} />
        <input style={inputStyle} type="number" placeholder="Frequência (dias, ex: 7)" value={form.frequency || ''} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} />
        <button style={btnPrimary(P.amber)} onClick={saveCleanTask}>Salvar</button>
      </Modal>

      <Modal open={modal === 'add-shop' || modal === 'edit-shop'} onClose={() => setModal(null)} title={modal === 'edit-shop' ? 'Editar Item' : 'Novo Item'}>
        <input style={inputStyle} placeholder="Item *" value={form.item || ''} onChange={e => setForm(f => ({ ...f, item: e.target.value }))} />
        <input style={inputStyle} placeholder="Quantidade (ex: 2)" value={form.qty || ''} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} />
        <input style={inputStyle} placeholder="Categoria (ex: Alimentos)" value={form.category || ''} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
        <button style={btnPrimary(P.amber)} onClick={saveShopItem}>Salvar</button>
      </Modal>
    </div>
  )
}

// ─── FINANÇAS TAB ─────────────────────────────────────────────────────────────
const CATEGORY_EMOJIS = {
  'Alimentação':  '🍔',
  'Transporte':   '🚗',
  'Compras':      '🛍️',
  'Saúde':        '🏥',
  'Casa':         '🏠',
  'Beleza':       '💄',
  'Educação':     '📚',
  'Salário':      '💰',
  'Lazer':        '🎉',
  'Outros':       '📦',
}

function FinancasTab({ userId }) {
  const [sub, setSub] = useState('Extrato')
  const expenses = useCol(userId, 'expenses')
  const accounts = useCol(userId, 'accounts')
  const cards    = useCol(userId, 'cards')
  const finGoals = useCol(userId, 'finGoals')

  const [modal, setModal] = useState(null)
  const [form, setForm]   = useState({})

  const todayStr = today()
  const yestDate = new Date(); yestDate.setDate(yestDate.getDate() - 1)
  const yesterdayStr = yestDate.toISOString().split('T')[0]

  async function saveExpense() {
    if (!form.description || !form.amount) return
    const d = { date: form.date || todayStr, description: form.description, amount: Number(form.amount), category: form.category || 'Outros', account: form.account || '', type: form.type || 'saída' }
    if (form.id) await expenses.upd(form.id, d)
    else await expenses.add(d)
    setModal(null)
  }

  async function saveAccount() {
    if (!form.name) return
    const d = { name: form.name, type: form.type || 'corrente', balance: Number(form.balance || 0) }
    if (form.id) await accounts.upd(form.id, d)
    else await accounts.add(d)
    setModal(null)
  }

  async function saveCard() {
    if (!form.name) return
    const d = { name: form.name, limit: Number(form.limit || 0), spent: Number(form.spent || 0), dueDay: Number(form.dueDay || 1) }
    if (form.id) await cards.upd(form.id, d)
    else await cards.add(d)
    setModal(null)
  }

  async function saveFinGoal() {
    if (!form.name) return
    const d = { name: form.name, target: Number(form.target || 0), current: Number(form.current || 0) }
    if (form.id) await finGoals.upd(form.id, d)
    else await finGoals.add(d)
    setModal(null)
  }

  const grouped = expenses.data.reduce((acc, e) => {
    const d = e.date || todayStr
    if (!acc[d]) acc[d] = []
    acc[d].push(e)
    return acc
  }, {})
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  function dateLabel(d) {
    if (d === todayStr) return 'Hoje'
    if (d === yesterdayStr) return 'Ontem'
    return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  }

  function daysUntilDue(dueDay) {
    const now = new Date()
    let due = new Date(now.getFullYear(), now.getMonth(), dueDay)
    if (due <= now) due = new Date(now.getFullYear(), now.getMonth() + 1, dueDay)
    return Math.ceil((due - now) / 86400000)
  }

  const totalBalance = accounts.data.reduce((s, a) => s + (Number(a.balance) || 0), 0)

  const subAddMap = { 'Extrato': 'expense', 'Contas': 'account', 'Cartões': 'card', 'Metas': 'fingoal' }

  return (
    <div>
      <TabHeader color={P.plum} emoji="💰" title="Finanças" subtitle="seu dinheiro">
        <button onClick={() => { setForm({}); setModal('add-' + subAddMap[sub]) }} style={{ background: 'white', border: '2px solid black', borderRadius: 12, padding: '6px 14px', fontWeight: 800, fontSize: 20, cursor: 'pointer', boxShadow: '2px 2px 0 black' }}>+</button>
      </TabHeader>
      <SubTabs tabs={['Extrato', 'Contas', 'Cartões', 'Metas']} active={sub} setActive={setSub} color={P.plum} />

      <div style={{ padding: '12px 12px 80px' }}>

        {sub === 'Extrato' && (
          <>
            {expenses.data.length === 0 && <p style={{ color: '#888', textAlign: 'center', marginTop: 24 }}>Nenhuma transação. Adicione uma!</p>}
            {sortedDates.map(date => (
              <div key={date} style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#888', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{dateLabel(date)}</p>
                {grouped[date].map(e => (
                  <div key={e.id} style={{ background: 'white', border: '2px solid black', borderRadius: 14, padding: '10px 14px', marginBottom: 6, boxShadow: '2px 2px 0 black', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{CATEGORY_EMOJIS[e.category] || '📦'}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, fontSize: 14 }}>{e.description}</p>
                      <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{e.category}{e.account ? ` · ${e.account}` : ''}</p>
                    </div>
                    <span className="font-numbers" style={{ fontWeight: 800, fontSize: 15, color: e.type === 'entrada' ? P.forest : P.red, whiteSpace: 'nowrap' }}>
                      {e.type === 'entrada' ? '+' : '-'}{fmtBRL(e.amount)}
                    </span>
                    <button onClick={() => { if (window.confirm('Remover?')) expenses.remove(e.id) }} style={{ ...btnSecondary, padding: '4px 8px', color: P.red }}>🗑️</button>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

        {sub === 'Contas' && (
          <>
            <div style={{ background: P.plum, backgroundImage: stripe('dark', 0.06), borderRadius: 16, border: '2px solid black', padding: '16px 20px', marginBottom: 14, boxShadow: '4px 4px 0 black' }}>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700 }}>SALDO TOTAL</p>
              <p className="font-numbers" style={{ color: 'white', fontSize: 28, fontWeight: 800, marginTop: 4 }}>{fmtBRL(totalBalance)}</p>
            </div>
            {accounts.data.length === 0 && <p style={{ color: '#888', textAlign: 'center', marginTop: 24 }}>Nenhuma conta. Adicione uma!</p>}
            {accounts.data.map(a => (
              <div key={a.id} style={{ background: 'white', border: '2px solid black', borderRadius: 14, padding: '12px 16px', marginBottom: 8, boxShadow: '3px 3px 0 black', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 800, fontSize: 15 }}>{a.name}</p>
                  <p style={{ fontSize: 12, color: '#888', marginTop: 2, textTransform: 'capitalize' }}>{a.type}</p>
                </div>
                <p className="font-numbers" style={{ fontWeight: 800, fontSize: 18, color: Number(a.balance) >= 0 ? P.forest : P.red }}>{fmtBRL(a.balance)}</p>
                <button onClick={() => { setForm(a); setModal('edit-account') }} style={{ ...btnSecondary, padding: '4px 8px' }}>✏️</button>
                <button onClick={() => { if (window.confirm('Remover?')) accounts.remove(a.id) }} style={{ ...btnSecondary, padding: '4px 8px', color: P.red }}>🗑️</button>
              </div>
            ))}
          </>
        )}

        {sub === 'Cartões' && (
          <>
            {cards.data.length === 0 && <p style={{ color: '#888', textAlign: 'center', marginTop: 24 }}>Nenhum cartão. Adicione um!</p>}
            {cards.data.map(c => {
              const pct = c.limit > 0 ? Math.min(100, (Number(c.spent) / Number(c.limit)) * 100) : 0
              const daysLeft = daysUntilDue(c.dueDay)
              const isWarning = pct > 80
              return (
                <div key={c.id} style={{ background: P.dark, backgroundImage: stripe('light', 0.05), borderRadius: 18, border: '2px solid black', padding: '18px 20px', marginBottom: 12, boxShadow: '4px 4px 0 black' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <p style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>{c.name}</p>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Vence em {daysLeft} dia{daysLeft !== 1 ? 's' : ''}</span>
                  </div>
                  <p className="font-numbers" style={{ color: 'white', fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
                    {fmtBRL(c.spent)} <span style={{ fontSize: 14, opacity: 0.6 }}>/ {fmtBRL(c.limit)}</span>
                  </p>
                  <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 999, height: 8, overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{ background: isWarning ? P.red : P.teal, height: '100%', width: `${pct}%`, borderRadius: 999, transition: 'width 0.5s' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: isWarning ? '#ff9999' : 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700 }}>{pct.toFixed(0)}% usado</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => { setForm(c); setModal('edit-card') }} style={{ ...btnSecondary, padding: '4px 10px', fontSize: 12 }}>✏️</button>
                      <button onClick={() => { if (window.confirm('Remover?')) cards.remove(c.id) }} style={{ ...btnSecondary, padding: '4px 10px', fontSize: 12, color: P.red }}>🗑️</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {sub === 'Metas' && (
          <>
            {finGoals.data.length === 0 && <p style={{ color: '#888', textAlign: 'center', marginTop: 24 }}>Nenhuma meta. Adicione uma!</p>}
            {finGoals.data.map(g => {
              const pct = g.target > 0 ? Math.min(100, (Number(g.current) / Number(g.target)) * 100) : 0
              return (
                <div key={g.id} style={{ background: 'white', border: '2px solid black', borderRadius: 16, padding: '14px 16px', marginBottom: 10, boxShadow: '3px 3px 0 black' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <p style={{ fontWeight: 800, fontSize: 15 }}>{g.name}</p>
                    <span className="font-numbers" style={{ fontSize: 13, fontWeight: 700, color: P.plum }}>{pct.toFixed(0)}%</span>
                  </div>
                  <div style={{ background: '#eee', borderRadius: 999, height: 10, overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{ background: pct >= 100 ? P.forest : P.plum, height: '100%', width: `${pct}%`, borderRadius: 999, transition: 'width 0.5s' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#666' }}>{fmtBRL(g.current)} <span style={{ color: '#aaa' }}>de {fmtBRL(g.target)}</span></span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => { setForm(g); setModal('edit-fingoal') }} style={{ ...btnSecondary, padding: '4px 8px' }}>✏️</button>
                      <button onClick={() => { if (window.confirm('Remover?')) finGoals.remove(g.id) }} style={{ ...btnSecondary, padding: '4px 8px', color: P.red }}>🗑️</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>

      <Modal open={modal === 'add-expense' || modal === 'edit-expense'} onClose={() => setModal(null)} title={modal === 'edit-expense' ? 'Editar Transação' : 'Nova Transação'}>
        <input style={inputStyle} type="date" value={form.date || todayStr} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        <input style={inputStyle} placeholder="Descrição *" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        <input style={inputStyle} type="number" step="0.01" placeholder="Valor (R$) *" value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
        <select style={inputStyle} value={form.type || 'saída'} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
          <option value="saída">Saída</option>
          <option value="entrada">Entrada</option>
        </select>
        <select style={inputStyle} value={form.category || 'Outros'} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
          {Object.keys(CATEGORY_EMOJIS).map(c => <option key={c}>{c}</option>)}
        </select>
        <input style={inputStyle} placeholder="Conta (ex: Nubank)" value={form.account || ''} onChange={e => setForm(f => ({ ...f, account: e.target.value }))} />
        <button style={btnPrimary(P.plum)} onClick={saveExpense}>Salvar</button>
      </Modal>

      <Modal open={modal === 'add-account' || modal === 'edit-account'} onClose={() => setModal(null)} title={modal === 'edit-account' ? 'Editar Conta' : 'Nova Conta'}>
        <input style={inputStyle} placeholder="Nome (ex: Nubank) *" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <select style={inputStyle} value={form.type || 'corrente'} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
          <option value="corrente">Conta Corrente</option>
          <option value="poupança">Poupança</option>
          <option value="investimento">Investimento</option>
        </select>
        <input style={inputStyle} type="number" step="0.01" placeholder="Saldo atual (R$)" value={form.balance || ''} onChange={e => setForm(f => ({ ...f, balance: e.target.value }))} />
        <button style={btnPrimary(P.plum)} onClick={saveAccount}>Salvar</button>
      </Modal>

      <Modal open={modal === 'add-card' || modal === 'edit-card'} onClose={() => setModal(null)} title={modal === 'edit-card' ? 'Editar Cartão' : 'Novo Cartão'}>
        <input style={inputStyle} placeholder="Nome do cartão *" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <input style={inputStyle} type="number" step="0.01" placeholder="Limite (R$)" value={form.limit || ''} onChange={e => setForm(f => ({ ...f, limit: e.target.value }))} />
        <input style={inputStyle} type="number" step="0.01" placeholder="Fatura atual (R$)" value={form.spent || ''} onChange={e => setForm(f => ({ ...f, spent: e.target.value }))} />
        <input style={inputStyle} type="number" min="1" max="31" placeholder="Dia de vencimento" value={form.dueDay || ''} onChange={e => setForm(f => ({ ...f, dueDay: e.target.value }))} />
        <button style={btnPrimary(P.plum)} onClick={saveCard}>Salvar</button>
      </Modal>

      <Modal open={modal === 'add-fingoal' || modal === 'edit-fingoal'} onClose={() => setModal(null)} title={modal === 'edit-fingoal' ? 'Editar Meta' : 'Nova Meta Financeira'}>
        <input style={inputStyle} placeholder="Nome da meta *" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <input style={inputStyle} type="number" step="0.01" placeholder="Valor alvo (R$)" value={form.target || ''} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} />
        <input style={inputStyle} type="number" step="0.01" placeholder="Valor atual (R$)" value={form.current || ''} onChange={e => setForm(f => ({ ...f, current: e.target.value }))} />
        <button style={btnPrimary(P.plum)} onClick={saveFinGoal}>Salvar</button>
      </Modal>
    </div>
  )
}

// ─── NOTAS TAB ────────────────────────────────────────────────────────────────
function NotasTab({ userId }) {
  const notes = useCol(userId, 'notes')
  const [modal, setModal] = useState(null)
  const [form, setForm]   = useState({})

  const nowIso = new Date().toISOString()

  async function saveNote() {
    if (!form.title) return
    const d = { title: form.title, text: form.text || '', reminder: form.reminder || '', done: form.done || false }
    if (form.id) await notes.upd(form.id, d)
    else await notes.add(d)
    setModal(null)
  }

  function isOverdue(n) {
    return n.reminder && !n.done && n.reminder < nowIso
  }

  const sorted = [...notes.data].sort((a, b) => {
    if (isOverdue(a) && !isOverdue(b)) return -1
    if (!isOverdue(a) && isOverdue(b)) return 1
    return 0
  })

  return (
    <div>
      <TabHeader color={P.teal} emoji="📝" title="Notas" subtitle="lembretes & ideias">
        <button onClick={() => { setForm({}); setModal('add') }} style={{ background: 'white', border: '2px solid black', borderRadius: 12, padding: '6px 14px', fontWeight: 800, fontSize: 20, cursor: 'pointer', boxShadow: '2px 2px 0 black' }}>+</button>
      </TabHeader>

      <div style={{ padding: '12px 12px 80px' }}>
        {sorted.length === 0 && <p style={{ color: '#888', textAlign: 'center', marginTop: 24 }}>Nenhuma nota. Adicione uma!</p>}
        {sorted.map(n => {
          const overdue = isOverdue(n)
          return (
            <div key={n.id} style={{ background: overdue ? '#fff3f3' : 'white', border: `2px solid ${overdue ? P.red : 'black'}`, borderRadius: 16, padding: 14, marginBottom: 10, boxShadow: '3px 3px 0 black' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <input type="checkbox" checked={!!n.done} onChange={e => notes.upd(n.id, { done: e.target.checked })} style={{ width: 18, height: 18, accentColor: P.teal, cursor: 'pointer', marginTop: 2, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 800, fontSize: 15, textDecoration: n.done ? 'line-through' : 'none', color: n.done ? '#aaa' : P.dark }}>{n.title}</p>
                  {n.text && <p style={{ fontSize: 13, color: '#555', marginTop: 4, lineHeight: 1.5 }}>{n.text}</p>}
                  {n.reminder && (
                    <p style={{ fontSize: 12, color: overdue ? P.red : P.teal, fontWeight: 700, marginTop: 4 }}>
                      {overdue ? '⚠️' : '🔔'} {new Date(n.reminder).toLocaleString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button onClick={() => { setForm(n); setModal('edit') }} style={btnSecondary}>✏️ Editar</button>
                <button onClick={() => { if (window.confirm('Remover nota?')) notes.remove(n.id) }} style={{ ...btnSecondary, color: P.red }}>🗑️</button>
              </div>
            </div>
          )
        })}
      </div>

      <Modal open={modal === 'add' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'edit' ? 'Editar Nota' : 'Nova Nota'}>
        <input style={inputStyle} placeholder="Título *" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        <textarea style={{ ...inputStyle, minHeight: 80 }} placeholder="Texto" value={form.text || ''} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} />
        <label style={{ fontSize: 13, fontWeight: 700, color: '#555', display: 'block', marginBottom: 4 }}>Lembrete (opcional)</label>
        <input style={inputStyle} type="datetime-local" value={form.reminder || ''} onChange={e => setForm(f => ({ ...f, reminder: e.target.value }))} />
        <button style={btnPrimary(P.teal)} onClick={saveNote}>Salvar</button>
      </Modal>
    </div>
  )
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
const NAV_TABS = [
  { id: 'home',     emoji: '✦',  label: 'Home',     color: P.red    },
  { id: 'estudos',  emoji: '📚', label: 'Estudos',  color: P.navy   },
  { id: 'trabalho', emoji: '💼', label: 'Trabalho', color: P.forest },
  { id: 'vida',     emoji: '🌸', label: 'Vida',     color: P.rose   },
  { id: 'casa',     emoji: '🏡', label: 'Casa',     color: P.amber  },
  { id: 'financas', emoji: '💰', label: 'Finanças', color: P.plum   },
]

function BottomNav({ active, setActive }) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 480, background: 'white', borderTop: '2px solid black',
      display: 'flex', zIndex: 40, paddingBottom: 'env(safe-area-inset-bottom, 4px)',
    }}>
      {NAV_TABS.map(t => (
        <button
          key={t.id}
          onClick={() => setActive(t.id)}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '8px 2px 4px', background: 'none', border: 'none', cursor: 'pointer',
            position: 'relative',
          }}
        >
          {active === t.id && (
            <span style={{ position: 'absolute', top: 4, width: 6, height: 6, borderRadius: '50%', background: t.color }} />
          )}
          <span style={{ fontSize: 20, lineHeight: 1 }}>{t.emoji}</span>
          <span style={{ fontSize: 9, fontWeight: 700, marginTop: 2, color: active === t.id ? t.color : '#888', letterSpacing: 0.5 }}>
            {t.label}
          </span>
        </button>
      ))}
    </div>
  )
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  async function handleLogin() {
    setLoading(true)
    setError(null)
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (e) {
      setError('Não foi possível entrar. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: P.cream, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: P.red, backgroundImage: stripe('light'), paddingTop: 40, paddingBottom: 0 }}>
        <div style={{ padding: '0 24px 20px' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>✦ seu painel de vida</p>
          <h1 className="font-display" style={{ fontSize: 56, color: 'white', lineHeight: 1, marginBottom: 8 }}>A Vida<br />Toda ✦</h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, fontStyle: 'italic' }}>tudo da sua vida, num só lugar</p>
        </div>
        <ScallopBorder />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 32px', gap: 24 }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          {[
            { emoji: '📚', text: 'Acompanhe livros e cursos' },
            { emoji: '💼', text: 'Gerencie marcas e pipeline' },
            { emoji: '🌸', text: 'Hábitos, metas e humor' },
            { emoji: '🏡', text: 'Organize sua casa e compras' },
            { emoji: '💰', text: 'Controle financeiro completo' },
            { emoji: '📝', text: 'Notas e lembretes' },
          ].map(f => (
            <div key={f.emoji} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{f.emoji}</span>
              <p style={{ fontSize: 15, fontWeight: 600, color: P.dark }}>{f.text}</p>
            </div>
          ))}
        </div>

        {error && <p style={{ color: P.red, fontSize: 14, fontWeight: 600 }}>{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            background: P.dark, color: 'white', border: '2.5px solid black',
            borderRadius: 16, padding: '14px 32px', fontWeight: 800, fontSize: 16,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            boxShadow: '4px 4px 0 black', width: '100%', maxWidth: 360,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {loading ? 'Entrando...' : 'Entrar com Google'}
        </button>

        <p style={{ fontSize: 12, color: '#aaa', textAlign: 'center', maxWidth: 280 }}>
          Seus dados são salvos com segurança no Firebase e acessíveis apenas por você.
        </p>
      </div>
    </div>
  )
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
function Dashboard({ user }) {
  const [activeTab, setActiveTab] = useState('home')

  const books         = useCol(user.uid, 'books')
  const courses       = useCol(user.uid, 'courses')
  const brands        = useCol(user.uid, 'brands')
  const tasks         = useCol(user.uid, 'tasks')
  const habits        = useCol(user.uid, 'habits')
  const habitLogs     = useCol(user.uid, 'habitLogs')
  const accounts      = useCol(user.uid, 'accounts')
  const shopping      = useCol(user.uid, 'shopping')
  const cleaningTasks = useCol(user.uid, 'cleaningTasks')
  const notes         = useCol(user.uid, 'notes')

  const homeData = {
    books:         books.data,
    courses:       courses.data,
    brands:        brands.data,
    tasks:         tasks.data,
    habits:        habits.data,
    habitLogs:     habitLogs.data,
    accounts:      accounts.data,
    shopping:      shopping.data,
    cleaningTasks: cleaningTasks.data,
    notes:         notes.data,
  }

  return (
    <div style={{ background: P.cream, minHeight: '100vh', maxWidth: 480, margin: '0 auto', position: 'relative' }}>
      <div className="slide-in" key={activeTab}>
        {activeTab === 'home'     && <HomeTab     userId={user.uid} setActiveTab={setActiveTab} data={homeData} />}
        {activeTab === 'estudos'  && <EstudosTab  userId={user.uid} />}
        {activeTab === 'trabalho' && <TrabalhoTab userId={user.uid} />}
        {activeTab === 'vida'     && <VidaTab     userId={user.uid} />}
        {activeTab === 'casa'     && <CasaTab     userId={user.uid} />}
        {activeTab === 'financas' && <FinancasTab userId={user.uid} />}
        {activeTab === 'notas'    && <NotasTab    userId={user.uid} />}
      </div>
      <BottomNav active={activeTab} setActive={setActiveTab} />
    </div>
  )
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user,    setUser]    = useState(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, u => {
      setUser(u || null)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: P.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <h1 className="font-display" style={{ fontSize: 40, color: P.red }}>A Vida Toda ✦</h1>
        <p style={{ color: '#888', fontSize: 14 }}>carregando...</p>
      </div>
    )
  }

  if (!user) return <LoginScreen />

  return <Dashboard user={user} />
}
