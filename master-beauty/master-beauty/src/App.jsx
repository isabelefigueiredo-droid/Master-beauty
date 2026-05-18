import { useState, useEffect, useRef } from "react";

/* ─── Storage ─────────────────────────────────────────── */
const db = {
  get: (k, d = null) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

const todayStr = () => new Date().toISOString().split("T")[0];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

/* ─── Treinos ABCDE ────────────────────────────────────── */
const TREINOS = {
  A: {
    letra: "A", nome: "Peito + Tríceps", tag: "Seg", cor: "#e879a0",
    cardio: "20 min caminhada rápida ou elíptico",
    exercicios: [
      { id: "a1", nome: "Supino Reto (barra ou halteres)", series: 4, reps: "12", descanso: 60 },
      { id: "a2", nome: "Crucifixo com Halteres", series: 3, reps: "15", descanso: 45 },
      { id: "a3", nome: "Supino Inclinado", series: 3, reps: "12", descanso: 60 },
      { id: "a4", nome: "Tríceps Corda (polia)", series: 4, reps: "12", descanso: 45 },
      { id: "a5", nome: "Tríceps Francês", series: 3, reps: "15", descanso: 45 },
      { id: "a6", nome: "Tríceps Testa (barra W)", series: 3, reps: "12", descanso: 45 },
    ],
  },
  B: {
    letra: "B", nome: "Costas + Bíceps", tag: "Ter", cor: "#a78bfa",
    cardio: "20 min bike ou escada",
    exercicios: [
      { id: "b1", nome: "Puxada Frontal (polia alta)", series: 4, reps: "12", descanso: 60 },
      { id: "b2", nome: "Remada Curvada com Barra", series: 4, reps: "12", descanso: 60 },
      { id: "b3", nome: "Remada Unilateral Halter", series: 3, reps: "12", descanso: 45 },
      { id: "b4", nome: "Pulldown na Polia (triângulo)", series: 3, reps: "15", descanso: 45 },
      { id: "b5", nome: "Rosca Direta com Barra", series: 4, reps: "12", descanso: 45 },
      { id: "b6", nome: "Rosca Martelo com Halteres", series: 3, reps: "15", descanso: 45 },
    ],
  },
  C: {
    letra: "C", nome: "Pernas", tag: "Qua", cor: "#34d399",
    cardio: "10 min aquecimento + 5 min alongamento",
    exercicios: [
      { id: "c1", nome: "Agachamento Livre", series: 4, reps: "12", descanso: 90 },
      { id: "c2", nome: "Leg Press 45°", series: 4, reps: "15", descanso: 90 },
      { id: "c3", nome: "Avanço com Halteres", series: 3, reps: "12/lado", descanso: 60 },
      { id: "c4", nome: "Cadeira Extensora", series: 3, reps: "15", descanso: 45 },
      { id: "c5", nome: "Cadeira Flexora", series: 3, reps: "15", descanso: 45 },
      { id: "c6", nome: "Panturrilha na Máquina", series: 4, reps: "20", descanso: 30 },
    ],
  },
  D: {
    letra: "D", nome: "Glúteos + Abdômen", tag: "Qui", cor: "#fb923c",
    cardio: "15 min cardio leve ao final",
    exercicios: [
      { id: "d1", nome: "Hip Thrust com Barra", series: 4, reps: "15", descanso: 60 },
      { id: "d2", nome: "Stiff com Halteres", series: 4, reps: "12", descanso: 60 },
      { id: "d3", nome: "Abdução de Quadril (máquina)", series: 3, reps: "20", descanso: 30 },
      { id: "d4", nome: "Agachamento Sumô", series: 3, reps: "15", descanso: 45 },
      { id: "d5", nome: "Abdominal Crunch", series: 3, reps: "20", descanso: 30 },
      { id: "d6", nome: "Prancha (isometria)", series: 3, reps: "30s", descanso: 30 },
      { id: "d7", nome: "Abdominal Bicicleta", series: 3, reps: "20", descanso: 30 },
    ],
  },
  E: {
    letra: "E", nome: "Ombros + HIIT", tag: "Sex", cor: "#38bdf8",
    cardio: "15 min HIIT: 30s forte / 30s leve",
    exercicios: [
      { id: "e1", nome: "Desenvolvimento com Halteres", series: 4, reps: "12", descanso: 60 },
      { id: "e2", nome: "Elevação Lateral", series: 4, reps: "15", descanso: 45 },
      { id: "e3", nome: "Elevação Frontal", series: 3, reps: "15", descanso: 45 },
      { id: "e4", nome: "Encolhimento de Ombros", series: 3, reps: "15", descanso: 30 },
      { id: "e5", nome: "Crucifixo Invertido (posterior)", series: 3, reps: "15", descanso: 45 },
      { id: "e6", nome: "Abdominal Prancha Lateral", series: 3, reps: "20s/lado", descanso: 30 },
    ],
  },
};

// Dia da semana → treino (0=Dom, 1=Seg, ... 6=Sab)
const DIA_TREINO = { 1: "A", 2: "B", 3: "C", 4: "D", 5: "E" };
const getTreinoHoje = () => DIA_TREINO[new Date().getDay()] || null;

/* ─── Dieta ─────────────────────────────────────────────── */
const DIETA = [
  {
    id: "ref1", nome: "☀️ Café da Manhã", hora: "07:00",
    kcal: 350, prot: 22, carb: 35, gord: 10,
    alimentos: [
      "2 ovos mexidos ou omelete com vegetais (tomate, espinafre)",
      "1 fatia de pão integral com pasta de amendoim (1 col de chá)",
      "1 copo de café preto ou chá verde sem açúcar",
    ],
    dica: "Os ovos no café garantem saciedade e proteína logo cedo.",
  },
  {
    id: "ref2", nome: "🍎 Lanche da Manhã", hora: "10:00",
    kcal: 180, prot: 12, carb: 20, gord: 5,
    alimentos: [
      "1 fruta (maçã, pera ou laranja)",
      "10 castanhas-do-pará ou amêndoas",
    ],
    dica: "Mantenha o lanche leve para não ultrapassar as calorias.",
  },
  {
    id: "ref3", nome: "🍽️ Almoço", hora: "12:30",
    kcal: 520, prot: 45, carb: 50, gord: 12,
    alimentos: [
      "150g de frango grelhado ou peixe (tilápia, atum)",
      "3 col de sopa de arroz integral",
      "2 col de sopa de feijão ou lentilha",
      "Salada à vontade: alface, rúcula, tomate, pepino",
      "1 fio de azeite na salada",
    ],
    dica: "Proteína + fibras no almoço = menos fome à tarde.",
  },
  {
    id: "ref4", nome: "🥛 Lanche da Tarde", hora: "16:00",
    kcal: 200, prot: 18, carb: 22, gord: 3,
    alimentos: [
      "1 iogurte grego natural (sem açúcar, 170g)",
      "1 col de sopa de granola sem açúcar ou 1 fruta picada",
    ],
    dica: "Ideal antes do treino para ter energia.",
  },
  {
    id: "ref5", nome: "🌙 Jantar", hora: "19:30",
    kcal: 420, prot: 38, carb: 35, gord: 10,
    alimentos: [
      "150g de filé de peixe, frango ou 3 ovos",
      "150g de batata doce cozida ou 1/2 xíc de arroz integral",
      "Legumes salteados: abobrinha, brócolis, cenoura",
    ],
    dica: "Carboidrato + proteína à noite ajuda na recuperação muscular.",
  },
  {
    id: "ref6", nome: "🌛 Ceia (opcional)", hora: "21:30",
    kcal: 120, prot: 15, carb: 8, gord: 3,
    alimentos: [
      "100g de cottage ou ricota",
      "1 col de chá de mel OU canela em pó",
    ],
    dica: "Proteína de absorção lenta para nutrir os músculos durante o sono.",
  },
];

const TOTAL_KCAL = DIETA.reduce((s, r) => s + r.kcal, 0);
const TOTAL_PROT = DIETA.reduce((s, r) => s + r.prot, 0);
const TOTAL_CARB = DIETA.reduce((s, r) => s + r.carb, 0);
const TOTAL_GORD = DIETA.reduce((s, r) => s + r.gord, 0);

/* ─── Timer hook ─────────────────────────────────────────── */
function useTimer() {
  const [secs, setSecs] = useState(0);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setSecs(s => {
        if (s <= 1) { setRunning(false); clearInterval(ref.current); return 0; }
        return s - 1;
      }), 1000);
    } else {
      clearInterval(ref.current);
    }
    return () => clearInterval(ref.current);
  }, [running]);

  const start = (s) => { setSecs(s); setRunning(true); };
  const stop = () => { setRunning(false); setSecs(0); };
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return { secs, running, start, stop, fmt };
}

/* ─── Componentes base ──────────────────────────────────── */
function Card({ children, className = "" }) {
  return (
    <div className={`bg-[#141414] border border-[#2a2a2a] rounded-2xl p-4 ${className}`}>
      {children}
    </div>
  );
}

function Badge({ children, color = "#e879a0" }) {
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: color + "22", color }}>
      {children}
    </span>
  );
}

/* ─── Página: Home ──────────────────────────────────────── */
function Home({ setPage }) {
  const treinoHoje = getTreinoHoje();
  const treino = treinoHoje ? TREINOS[treinoHoje] : null;
  const historico = db.get("historico", []);
  const dietaDone = db.get(`dieta_${todayStr()}`, []);

  const semanaPassada = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 6 + i);
    const ds = d.toISOString().split("T")[0];
    const feito = historico.some(h => h.data === ds);
    return { ds, feito, dia: ["D", "S", "T", "Q", "Q", "S", "S"][d.getDay()] };
  });

  const streak = (() => {
    let s = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      if (historico.some(h => h.data === ds)) s++; else break;
    }
    return s;
  })();

  const totalSemana = semanaPassada.filter(x => x.feito).length;
  const refeicoesDone = dietaDone.length;
  const dietaPct = Math.round((refeicoesDone / DIETA.length) * 100);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="pt-2">
        <p className="text-[#888] text-sm">{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>
        <h1 className="text-2xl font-bold mt-1">Olá, guerreira! 💪</h1>
        <p className="text-[#888] text-sm mt-0.5">Objetivo: emagrecimento + definição</p>
      </div>

      {/* Streak + semana */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-[#888]">Sequência esta semana</span>
          <span className="text-sm font-bold" style={{ color: "#e879a0" }}>{streak} dia{streak !== 1 ? "s" : ""} seguido{streak !== 1 ? "s" : ""} 🔥</span>
        </div>
        <div className="flex gap-2 justify-between">
          {semanaPassada.map(({ ds, feito, dia }) => (
            <div key={ds} className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${feito ? "border-[#e879a0] bg-[#e879a022] text-[#e879a0]" : ds === todayStr() ? "border-[#e879a0] text-[#e879a0] border-dashed" : "border-[#2a2a2a] text-[#444]"}`}>
                {feito ? "✓" : dia}
              </div>
              <span className="text-[10px] text-[#555]">{dia}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-4 text-sm">
          <div><span className="text-[#888]">Esta semana: </span><span className="font-bold text-white">{totalSemana} treinos</span></div>
          <div><span className="text-[#888]">Total: </span><span className="font-bold text-white">{historico.length}</span></div>
        </div>
      </Card>

      {/* Treino de hoje */}
      {treino ? (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[#888]">Treino de hoje</span>
            <Badge color={treino.cor}>Treino {treino.letra}</Badge>
          </div>
          <h2 className="text-xl font-bold mb-1" style={{ color: treino.cor }}>{treino.nome}</h2>
          <p className="text-[#888] text-sm mb-3">{treino.exercicios.length} exercícios + cardio</p>
          <div className="space-y-1 mb-4">
            {treino.exercicios.slice(0, 3).map(e => (
              <div key={e.id} className="flex items-center gap-2 text-sm text-[#aaa]">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: treino.cor }} />
                {e.nome} — {e.series}×{e.reps}
              </div>
            ))}
            {treino.exercicios.length > 3 && <p className="text-xs text-[#555] pl-3.5">+{treino.exercicios.length - 3} mais...</p>}
          </div>
          <button onClick={() => setPage("treino")} className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-95"
            style={{ background: `linear-gradient(135deg, ${treino.cor}, ${treino.cor}99)` }}>
            Iniciar Treino {treino.letra}
          </button>
        </Card>
      ) : (
        <Card className="text-center py-6">
          <div className="text-4xl mb-2">🛋️</div>
          <h2 className="text-lg font-bold mb-1">Dia de descanso</h2>
          <p className="text-[#888] text-sm">Hoje é sábado ou domingo — recupere bem!</p>
          <p className="text-xs text-[#555] mt-2">Aproveite para alongar e descansar os músculos.</p>
        </Card>
      )}

      {/* Dieta do dia */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-[#888]">Dieta hoje</span>
          <span className="text-sm font-bold text-[#34d399]">{refeicoesDone}/{DIETA.length} refeições</span>
        </div>
        <div className="w-full bg-[#2a2a2a] rounded-full h-2 mb-3">
          <div className="h-2 rounded-full transition-all" style={{ width: `${dietaPct}%`, background: "#34d399" }} />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
          <div className="bg-[#0a0a0a] rounded-xl p-2">
            <div className="font-bold text-base text-white">{TOTAL_KCAL}</div>
            <div className="text-[#888]">kcal/dia</div>
          </div>
          <div className="bg-[#0a0a0a] rounded-xl p-2">
            <div className="font-bold text-base text-[#e879a0]">{TOTAL_PROT}g</div>
            <div className="text-[#888]">proteína</div>
          </div>
          <div className="bg-[#0a0a0a] rounded-xl p-2">
            <div className="font-bold text-base text-[#fb923c]">{TOTAL_CARB}g</div>
            <div className="text-[#888]">carbs</div>
          </div>
        </div>
        <button onClick={() => setPage("dieta")} className="w-full py-2.5 rounded-xl font-bold text-sm border border-[#34d399] text-[#34d399] hover:bg-[#34d39910] transition-all">
          Ver plano alimentar
        </button>
      </Card>
    </div>
  );
}

/* ─── Página: Treino ─────────────────────────────────────── */
function Treino() {
  const treinoHojeLetra = getTreinoHoje();
  const [letraSel, setLetraSel] = useState(treinoHojeLetra || "A");
  const treino = TREINOS[letraSel];
  const [registros, setRegistros] = useState(() => db.get(`treino_reg_${todayStr()}`, {}));
  const [expandido, setExpandido] = useState(null);
  const [sessaoAtiva, setSessaoAtiva] = useState(() => db.get("sessao_ativa", null));
  const timer = useTimer();

  const salvarRegistros = (r) => { db.set(`treino_reg_${todayStr()}`, r); setRegistros(r); };

  const adicionarSerie = (exId, peso, reps) => {
    const atual = registros[exId] || [];
    const novo = { ...registros, [exId]: [...atual, { peso, reps, ts: Date.now() }] };
    salvarRegistros(novo);
  };

  const removerSerie = (exId, idx) => {
    const atual = [...(registros[exId] || [])];
    atual.splice(idx, 1);
    const novo = { ...registros, [exId]: atual };
    salvarRegistros(novo);
  };

  const iniciarSessao = () => {
    const s = { letra: letraSel, inicio: Date.now() };
    db.set("sessao_ativa", s);
    setSessaoAtiva(s);
    setExpandido(treino.exercicios[0]?.id || null);
  };

  const finalizarTreino = () => {
    const historico = db.get("historico", []);
    const totalSeries = Object.values(registros).reduce((s, arr) => s + arr.length, 0);
    historico.unshift({
      id: uid(), letra: letraSel, nome: treino.nome,
      data: todayStr(), registros,
      totalSeries, duracao: sessaoAtiva ? Math.round((Date.now() - sessaoAtiva.inicio) / 60000) : 0,
    });
    db.set("historico", historico);
    db.set("sessao_ativa", null);
    db.set(`treino_reg_${todayStr()}`, {});
    setSessaoAtiva(null);
    setRegistros({});
    setExpandido(null);
    timer.stop();
  };

  const totalSeriesFeitas = Object.values(registros).reduce((s, arr) => s + arr.length, 0);
  const exerciciosConcluidos = treino.exercicios.filter(e => (registros[e.id] || []).length >= e.series).length;
  const progresso = Math.round((exerciciosConcluidos / treino.exercicios.length) * 100);

  return (
    <div className="p-4 space-y-4">
      {/* Seletor de treino */}
      <div>
        <h1 className="text-xl font-bold mb-3">Treinos</h1>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {Object.values(TREINOS).map(t => (
            <button key={t.letra} onClick={() => { setLetraSel(t.letra); setExpandido(null); }}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${letraSel === t.letra ? "text-white" : "text-[#888] border-[#2a2a2a] bg-[#141414]"}`}
              style={letraSel === t.letra ? { borderColor: t.cor, background: t.cor + "22", color: t.cor } : {}}>
              {t.letra} — {t.tag}
            </button>
          ))}
        </div>
      </div>

      {/* Header do treino */}
      <Card>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl font-black" style={{ color: treino.cor }}>Treino {treino.letra}</span>
          {treinoHojeLetra === letraSel && <Badge color={treino.cor}>Hoje</Badge>}
        </div>
        <p className="text-lg font-semibold text-white mb-1">{treino.nome}</p>
        <p className="text-sm text-[#888] mb-3">🏃 {treino.cardio}</p>
        {sessaoAtiva?.letra === letraSel ? (
          <>
            <div className="mb-3">
              <div className="flex justify-between text-xs text-[#888] mb-1">
                <span>{exerciciosConcluidos}/{treino.exercicios.length} exercícios</span>
                <span>{totalSeriesFeitas} séries registradas</span>
              </div>
              <div className="w-full bg-[#2a2a2a] rounded-full h-2">
                <div className="h-2 rounded-full transition-all" style={{ width: `${progresso}%`, background: treino.cor }} />
              </div>
            </div>
            <button onClick={finalizarTreino}
              className="w-full py-3 rounded-xl font-bold text-sm bg-[#2a2a2a] text-[#888] hover:bg-[#3a3a3a] transition-all">
              ✅ Finalizar & Salvar Treino
            </button>
          </>
        ) : (
          <button onClick={iniciarSessao}
            className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-95"
            style={{ background: `linear-gradient(135deg, ${treino.cor}, ${treino.cor}99)` }}>
            ▶ Iniciar Treino {treino.letra}
          </button>
        )}
      </Card>

      {/* Timer de descanso */}
      {timer.running && (
        <div className="fixed top-4 right-4 z-50 bg-[#141414] border-2 border-[#e879a0] rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3">
          <div>
            <div className="text-xs text-[#888]">Descanso</div>
            <div className="text-2xl font-black text-[#e879a0]">{timer.fmt(timer.secs)}</div>
          </div>
          <button onClick={timer.stop} className="text-[#888] text-xs border border-[#2a2a2a] rounded-lg px-2 py-1">Pular</button>
        </div>
      )}

      {/* Lista de exercícios */}
      <div className="space-y-3">
        {treino.exercicios.map((ex, idx) => {
          const seriesFeitas = registros[ex.id] || [];
          const concluido = seriesFeitas.length >= ex.series;
          const aberto = expandido === ex.id;

          return (
            <Card key={ex.id} className={concluido ? "border-[#34d39940]" : ""}>
              <button className="w-full flex items-center justify-between" onClick={() => setExpandido(aberto ? null : ex.id)}>
                <div className="flex items-center gap-3 text-left">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${concluido ? "bg-[#34d39922] text-[#34d399]" : "bg-[#2a2a2a] text-[#888]"}`}>
                    {concluido ? "✓" : idx + 1}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold leading-tight ${concluido ? "text-[#34d399]" : "text-white"}`}>{ex.nome}</p>
                    <p className="text-xs text-[#888]">{ex.series} séries × {ex.reps} reps · {ex.descanso}s descanso</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-bold" style={{ color: treino.cor }}>{seriesFeitas.length}/{ex.series}</span>
                  <span className="text-[#555] text-xs">{aberto ? "▲" : "▼"}</span>
                </div>
              </button>

              {aberto && (
                <div className="mt-3 border-t border-[#2a2a2a] pt-3 space-y-3">
                  {/* Séries feitas */}
                  {seriesFeitas.length > 0 && (
                    <div className="space-y-1.5">
                      {seriesFeitas.map((s, i) => (
                        <div key={i} className="flex items-center justify-between bg-[#0a0a0a] rounded-xl px-3 py-2">
                          <span className="text-xs text-[#888]">Série {i + 1}</span>
                          <span className="text-sm font-bold text-white">{s.reps} reps{s.peso ? ` · ${s.peso}kg` : ""}</span>
                          <button onClick={() => removerSerie(ex.id, i)} className="text-[#555] text-xs hover:text-red-400">✕</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Formulário nova série */}
                  {sessaoAtiva?.letra === letraSel && <SerieForm onAdd={(p, r) => {
                    adicionarSerie(ex.id, p, r);
                    timer.start(ex.descanso);
                  }} corTreino={treino.cor} />}

                  {/* Timer rápido */}
                  {sessaoAtiva?.letra === letraSel && !timer.running && (
                    <div className="flex gap-2">
                      {[30, 45, 60, 90].map(s => (
                        <button key={s} onClick={() => timer.start(s)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-[#2a2a2a] text-[#888] hover:bg-[#3a3a3a]">
                          {s}s
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
      <div className="h-4" />
    </div>
  );
}

function SerieForm({ onAdd, corTreino }) {
  const [peso, setPeso] = useState("");
  const [reps, setReps] = useState("");

  const submit = () => {
    if (!reps) return;
    onAdd(peso ? Number(peso) : null, Number(reps));
    setReps("");
  };

  return (
    <div className="flex gap-2 items-end">
      <div className="flex-1">
        <label className="text-xs text-[#888] block mb-1">Peso (kg)</label>
        <input type="number" inputMode="decimal" placeholder="ex: 20" value={peso} onChange={e => setPeso(e.target.value)}
          className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#e879a0]" />
      </div>
      <div className="flex-1">
        <label className="text-xs text-[#888] block mb-1">Reps</label>
        <input type="number" inputMode="numeric" placeholder="ex: 12" value={reps} onChange={e => setReps(e.target.value)}
          className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#e879a0]" />
      </div>
      <button onClick={submit}
        className="py-2 px-4 rounded-xl font-bold text-sm text-white flex-shrink-0"
        style={{ background: corTreino }}>
        +
      </button>
    </div>
  );
}

/* ─── Página: Dieta ─────────────────────────────────────── */
function Dieta() {
  const [done, setDone] = useState(() => db.get(`dieta_${todayStr()}`, []));
  const [aberto, setAberto] = useState(null);

  const toggle = (id) => {
    const novo = done.includes(id) ? done.filter(x => x !== id) : [...done, id];
    setDone(novo);
    db.set(`dieta_${todayStr()}`, novo);
  };

  const kcalConsumida = DIETA.filter(r => done.includes(r.id)).reduce((s, r) => s + r.kcal, 0);
  const protConsumida = DIETA.filter(r => done.includes(r.id)).reduce((s, r) => s + r.prot, 0);
  const pct = Math.round((kcalConsumida / TOTAL_KCAL) * 100);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold pt-2">Plano Alimentar</h1>
      <p className="text-sm text-[#888] -mt-2">Emagrecimento + definição · sem restrições</p>

      {/* Resumo macros */}
      <Card>
        <div className="flex justify-between items-center mb-3">
          <div>
            <span className="text-2xl font-black text-white">{kcalConsumida}</span>
            <span className="text-[#888] text-sm"> / {TOTAL_KCAL} kcal</span>
          </div>
          <span className="text-sm font-bold text-[#34d399]">{done.length}/{DIETA.length} refeições</span>
        </div>
        <div className="w-full bg-[#2a2a2a] rounded-full h-3 mb-3">
          <div className="h-3 rounded-full transition-all" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #34d399, #e879a0)" }} />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {[
            { label: "Proteínas", val: `${protConsumida}g`, total: `/${TOTAL_PROT}g`, color: "#e879a0" },
            { label: "Carboidratos", val: `${DIETA.filter(r => done.includes(r.id)).reduce((s, r) => s + r.carb, 0)}g`, total: `/${TOTAL_CARB}g`, color: "#fb923c" },
            { label: "Gorduras", val: `${DIETA.filter(r => done.includes(r.id)).reduce((s, r) => s + r.gord, 0)}g`, total: `/${TOTAL_GORD}g`, color: "#a78bfa" },
          ].map(m => (
            <div key={m.label} className="bg-[#0a0a0a] rounded-xl p-2">
              <div className="font-bold text-sm" style={{ color: m.color }}>{m.val}</div>
              <div className="text-[#555] text-[10px]">{m.total}</div>
              <div className="text-[#888] text-[10px] mt-0.5">{m.label}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Refeições */}
      <div className="space-y-3">
        {DIETA.map(ref => {
          const feita = done.includes(ref.id);
          const open = aberto === ref.id;
          return (
            <Card key={ref.id} className={feita ? "border-[#34d39940]" : ""}>
              <div className="flex items-center justify-between">
                <button className="flex items-center gap-3 flex-1 text-left" onClick={() => setAberto(open ? null : ref.id)}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">{ref.nome}</span>
                      <span className="text-xs text-[#555]">{ref.hora}</span>
                    </div>
                    <div className="flex gap-2 mt-0.5">
                      <span className="text-xs text-[#888]">{ref.kcal} kcal</span>
                      <span className="text-xs text-[#e879a0]">{ref.prot}g prot</span>
                    </div>
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-[#555] text-xs">{open ? "▲" : "▼"}</span>
                  <button onClick={() => toggle(ref.id)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${feita ? "bg-[#34d39922] border-[#34d399] text-[#34d399]" : "border-[#2a2a2a] text-transparent"}`}>
                    ✓
                  </button>
                </div>
              </div>

              {open && (
                <div className="mt-3 border-t border-[#2a2a2a] pt-3 space-y-2">
                  <div className="space-y-1.5">
                    {ref.alimentos.map((a, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-[#ccc]">
                        <span className="text-[#e879a0] flex-shrink-0">•</span>
                        {a}
                      </div>
                    ))}
                  </div>
                  {ref.dica && (
                    <div className="bg-[#0a0a0a] rounded-xl p-3 mt-2">
                      <p className="text-xs text-[#888]">💡 {ref.dica}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-4 gap-1 pt-1">
                    {[
                      { l: "Kcal", v: ref.kcal, c: "#fff" },
                      { l: "Prot", v: `${ref.prot}g`, c: "#e879a0" },
                      { l: "Carbs", v: `${ref.carb}g`, c: "#fb923c" },
                      { l: "Gord", v: `${ref.gord}g`, c: "#a78bfa" },
                    ].map(m => (
                      <div key={m.l} className="text-center">
                        <div className="text-xs font-bold" style={{ color: m.c }}>{m.v}</div>
                        <div className="text-[10px] text-[#555]">{m.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Dicas gerais */}
      <Card className="bg-[#0a0a0a]">
        <h3 className="text-sm font-bold text-[#e879a0] mb-2">Dicas gerais</h3>
        <div className="space-y-1.5 text-xs text-[#888]">
          {[
            "💧 Beba 2–3 litros de água por dia",
            "🚫 Evite açúcar refinado, refrigerantes e frituras",
            "⏰ Tente comer a cada 3–4 horas para manter o metabolismo",
            "🥩 Priorize proteína em todas as refeições",
            "🌙 Durma 7–9h por noite — o sono é fundamental para perda de gordura",
          ].map((d, i) => <p key={i}>{d}</p>)}
        </div>
      </Card>
      <div className="h-4" />
    </div>
  );
}

/* ─── Página: Histórico ──────────────────────────────────── */
function Historico() {
  const [historico, setHistorico] = useState(() => db.get("historico", []));
  const [aberto, setAberto] = useState(null);

  const remover = (id) => {
    const novo = historico.filter(h => h.id !== id);
    setHistorico(novo);
    db.set("historico", novo);
  };

  const fmt = (ds) => new Date(ds + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" });

  if (historico.length === 0) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="text-6xl mb-4">📋</div>
        <h2 className="text-xl font-bold mb-2">Sem treinos ainda</h2>
        <p className="text-[#888] text-sm">Finalize um treino para ver o histórico aqui.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-bold">Histórico</h1>
        <span className="text-sm text-[#888]">{historico.length} treino{historico.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Treinos", val: historico.length, color: "#e879a0" },
          { label: "Séries", val: historico.reduce((s, h) => s + (h.totalSeries || 0), 0), color: "#a78bfa" },
          { label: "Min totais", val: historico.reduce((s, h) => s + (h.duracao || 0), 0), color: "#34d399" },
        ].map(s => (
          <Card key={s.label} className="text-center p-3">
            <div className="text-xl font-black" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs text-[#888] mt-0.5">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {historico.map(h => {
          const treino = TREINOS[h.letra];
          const open = aberto === h.id;
          return (
            <Card key={h.id}>
              <button className="w-full flex items-center justify-between" onClick={() => setAberto(open ? null : h.id)}>
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black flex-shrink-0"
                    style={{ background: (treino?.cor || "#e879a0") + "22", color: treino?.cor || "#e879a0" }}>
                    {h.letra}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{h.nome}</p>
                    <p className="text-xs text-[#888]">{fmt(h.data)} · {h.totalSeries} séries{h.duracao ? ` · ${h.duracao} min` : ""}</p>
                  </div>
                </div>
                <span className="text-[#555] text-xs">{open ? "▲" : "▼"}</span>
              </button>

              {open && (
                <div className="mt-3 border-t border-[#2a2a2a] pt-3 space-y-2">
                  {treino?.exercicios.map(ex => {
                    const series = h.registros?.[ex.id] || [];
                    if (series.length === 0) return null;
                    return (
                      <div key={ex.id}>
                        <p className="text-xs font-semibold text-[#888] mb-1">{ex.nome}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {series.map((s, i) => (
                            <span key={i} className="text-xs bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-2 py-1 text-[#aaa]">
                              {s.reps}rep{s.peso ? ` · ${s.peso}kg` : ""}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  <button onClick={() => remover(h.id)} className="text-xs text-red-500 opacity-50 hover:opacity-100 mt-1">
                    Remover registro
                  </button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
      <div className="h-4" />
    </div>
  );
}

/* ─── App principal ─────────────────────────────────────── */
const PAGES = [
  { id: "home",     label: "Início",   icon: "🏠" },
  { id: "treino",   label: "Treino",   icon: "💪" },
  { id: "dieta",    label: "Dieta",    icon: "🥗" },
  { id: "historico",label: "Histórico",icon: "📋" },
];

export default function App() {
  const [page, setPage] = useState("home");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white max-w-md mx-auto relative">
      {/* Conteúdo */}
      <div className="pb-20 min-h-screen overflow-y-auto">
        {page === "home"      && <Home setPage={setPage} />}
        {page === "treino"    && <Treino />}
        {page === "dieta"     && <Dieta />}
        {page === "historico" && <Historico />}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#0e0e0e] border-t border-[#2a2a2a] z-40">
        <div className="flex">
          {PAGES.map(p => (
            <button key={p.id} onClick={() => setPage(p.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all ${page === p.id ? "text-[#e879a0]" : "text-[#555]"}`}>
              <span className="text-xl">{p.icon}</span>
              <span className="text-[10px] font-medium">{p.label}</span>
              {page === p.id && <div className="absolute bottom-0 w-6 h-0.5 bg-[#e879a0] rounded-full" />}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
