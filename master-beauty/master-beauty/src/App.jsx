import { useState, useRef, useEffect } from "react";

const db = {
  get: (k, d = null) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const todayStr = () => new Date().toISOString().split("T")[0];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const ytEmbed = (q) => `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(q + " como fazer academia")}`;

/* ─── Semana iniciando na segunda-feira ─── */
function getWeekDays(historico) {
  const today = new Date();
  const dow = today.getDay();
  const daysFromMon = dow === 0 ? 6 : dow - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysFromMon);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const ds = d.toISOString().split("T")[0];
    return { ds, feito: historico.some(h => h.data === ds), dia: ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"][i] };
  });
}

/* ─── Treinos ABCDE ─── */
const TREINOS = {
  A: {
    letra: "A", nome: "Peito + Tríceps", tag: "Seg", cor: "#d63384",
    cardio: "20 min caminhada rápida ou elíptico",
    exercicios: [
      { id: "a1", nome: "Supino Reto (barra ou halteres)", series: 4, reps: "12", descanso: 60, video: ytEmbed("supino reto") },
      { id: "a2", nome: "Crucifixo com Halteres", series: 3, reps: "15", descanso: 45, video: ytEmbed("crucifixo halteres peito") },
      { id: "a3", nome: "Supino Inclinado", series: 3, reps: "12", descanso: 60, video: ytEmbed("supino inclinado") },
      { id: "a4", nome: "Tríceps Corda (polia)", series: 4, reps: "12", descanso: 45, video: ytEmbed("triceps corda polia") },
      { id: "a5", nome: "Tríceps Francês", series: 3, reps: "15", descanso: 45, video: ytEmbed("triceps frances") },
      { id: "a6", nome: "Tríceps Testa (barra W)", series: 3, reps: "12", descanso: 45, video: ytEmbed("triceps testa barra W") },
    ],
  },
  B: {
    letra: "B", nome: "Costas + Bíceps", tag: "Ter", cor: "#7c3aed",
    cardio: "20 min bike ou escada",
    exercicios: [
      { id: "b1", nome: "Puxada Frontal (polia alta)", series: 4, reps: "12", descanso: 60, video: ytEmbed("puxada frontal polia alta") },
      { id: "b2", nome: "Remada Curvada com Barra", series: 4, reps: "12", descanso: 60, video: ytEmbed("remada curvada barra") },
      { id: "b3", nome: "Remada Unilateral Halter", series: 3, reps: "12", descanso: 45, video: ytEmbed("remada unilateral haltere") },
      { id: "b4", nome: "Pulldown na Polia (triângulo)", series: 3, reps: "15", descanso: 45, video: ytEmbed("pulldown polia triangulo costas") },
      { id: "b5", nome: "Rosca Direta com Barra", series: 4, reps: "12", descanso: 45, video: ytEmbed("rosca direta barra biceps") },
      { id: "b6", nome: "Rosca Martelo com Halteres", series: 3, reps: "15", descanso: 45, video: ytEmbed("rosca martelo halteres") },
    ],
  },
  C: {
    letra: "C", nome: "Pernas", tag: "Qua", cor: "#059669",
    cardio: "10 min aquecimento + 5 min alongamento",
    exercicios: [
      { id: "c1", nome: "Agachamento Livre", series: 4, reps: "12", descanso: 90, video: ytEmbed("agachamento livre") },
      { id: "c2", nome: "Leg Press 45°", series: 4, reps: "15", descanso: 90, video: ytEmbed("leg press 45 graus") },
      { id: "c3", nome: "Avanço com Halteres", series: 3, reps: "12/lado", descanso: 60, video: ytEmbed("avanco halteres passada") },
      { id: "c4", nome: "Cadeira Extensora", series: 3, reps: "15", descanso: 45, video: ytEmbed("cadeira extensora quadriceps") },
      { id: "c5", nome: "Cadeira Flexora", series: 3, reps: "15", descanso: 45, video: ytEmbed("cadeira flexora posterior") },
      { id: "c6", nome: "Panturrilha na Máquina", series: 4, reps: "20", descanso: 30, video: ytEmbed("panturrilha maquina academia") },
    ],
  },
  D: {
    letra: "D", nome: "Glúteos + Abdômen", tag: "Qui", cor: "#c2410c",
    cardio: "15 min cardio leve ao final",
    exercicios: [
      { id: "d1", nome: "Hip Thrust com Barra", series: 4, reps: "15", descanso: 60, video: ytEmbed("hip thrust barra gluteos") },
      { id: "d2", nome: "Stiff com Halteres", series: 4, reps: "12", descanso: 60, video: ytEmbed("stiff halteres posterior") },
      { id: "d3", nome: "Abdução de Quadril (máquina)", series: 3, reps: "20", descanso: 30, video: ytEmbed("abducao quadril maquina") },
      { id: "d4", nome: "Agachamento Sumô", series: 3, reps: "15", descanso: 45, video: ytEmbed("agachamento sumo gluteos") },
      { id: "d5", nome: "Abdominal Crunch", series: 3, reps: "20", descanso: 30, video: ytEmbed("abdominal crunch") },
      { id: "d6", nome: "Prancha (isometria)", series: 3, reps: "30s", descanso: 30, video: ytEmbed("prancha abdominal isometria") },
      { id: "d7", nome: "Abdominal Bicicleta", series: 3, reps: "20", descanso: 30, video: ytEmbed("abdominal bicicleta") },
    ],
  },
  E: {
    letra: "E", nome: "Ombros + HIIT", tag: "Sex", cor: "#0369a1",
    cardio: "15 min HIIT: 30s forte / 30s leve",
    exercicios: [
      { id: "e1", nome: "Desenvolvimento com Halteres", series: 4, reps: "12", descanso: 60, video: ytEmbed("desenvolvimento halteres ombros") },
      { id: "e2", nome: "Elevação Lateral", series: 4, reps: "15", descanso: 45, video: ytEmbed("elevacao lateral ombros") },
      { id: "e3", nome: "Elevação Frontal", series: 3, reps: "15", descanso: 45, video: ytEmbed("elevacao frontal ombros") },
      { id: "e4", nome: "Encolhimento de Ombros", series: 3, reps: "15", descanso: 30, video: ytEmbed("encolhimento ombros trapezio") },
      { id: "e5", nome: "Crucifixo Invertido (posterior)", series: 3, reps: "15", descanso: 45, video: ytEmbed("crucifixo invertido posterior deltoides") },
      { id: "e6", nome: "Prancha Lateral", series: 3, reps: "20s/lado", descanso: 30, video: ytEmbed("prancha lateral abdominal") },
    ],
  },
};

const DIA_TREINO = { 1: "A", 2: "B", 3: "C", 4: "D", 5: "E" };
const getTreinoHoje = () => DIA_TREINO[new Date().getDay()] || null;

/* ─── Dieta (~1370 kcal) ─── */
const DIETA = [
  {
    id: "ref1", nome: "☀️ Café da Manhã", hora: "07:00",
    kcal: 280, prot: 18, carb: 26, gord: 9,
    alimentos: ["2 ovos mexidos ou omelete com espinafre", "1 fatia de pão integral com pasta de amendoim (1 col de chá)", "Café preto ou chá verde sem açúcar"],
    dica: "Os ovos garantem proteína e saciedade logo cedo.",
  },
  {
    id: "ref2", nome: "🍎 Lanche da Manhã", hora: "10:00",
    kcal: 120, prot: 8, carb: 15, gord: 4,
    alimentos: ["1 fruta pequena (maçã ou pera)", "5 castanhas-do-pará ou amêndoas"],
    dica: "Lanche leve para não ultrapassar as calorias.",
  },
  {
    id: "ref3", nome: "🍽️ Almoço", hora: "12:30",
    kcal: 400, prot: 38, carb: 38, gord: 9,
    alimentos: ["120g de frango grelhado ou peixe", "2 col de sopa de arroz integral", "2 col de sopa de feijão ou lentilha", "Salada à vontade (alface, rúcula, tomate, pepino)", "1 col de chá de azeite na salada"],
    dica: "Proteína + fibras no almoço = menos fome à tarde.",
  },
  {
    id: "ref4", nome: "🥛 Lanche da Tarde", hora: "16:00",
    kcal: 150, prot: 14, carb: 16, gord: 2,
    alimentos: ["1 iogurte grego natural (sem açúcar, 120g)", "1/2 fruta picada ou 1 col de granola sem açúcar"],
    dica: "Ideal antes do treino para ter energia.",
  },
  {
    id: "ref5", nome: "🌙 Jantar", hora: "19:30",
    kcal: 330, prot: 32, carb: 28, gord: 8,
    alimentos: ["120g de frango, peixe ou 2 ovos", "100g de batata doce cozida ou 1/3 xíc de arroz integral", "Legumes à vontade: abobrinha, brócolis, cenoura"],
    dica: "Refeição leve mas com proteína suficiente para recuperação.",
  },
  {
    id: "ref6", nome: "🌛 Ceia (opcional)", hora: "21:30",
    kcal: 90, prot: 12, carb: 5, gord: 2,
    alimentos: ["80g de cottage ou ricota", "Canela em pó a gosto"],
    dica: "Proteína de absorção lenta que nutre os músculos durante o sono.",
  },
];

const TOTAL_KCAL = DIETA.reduce((s, r) => s + r.kcal, 0);
const TOTAL_PROT = DIETA.reduce((s, r) => s + r.prot, 0);
const TOTAL_CARB = DIETA.reduce((s, r) => s + r.carb, 0);
const TOTAL_GORD = DIETA.reduce((s, r) => s + r.gord, 0);

/* ─── Timer ─── */
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
    } else clearInterval(ref.current);
    return () => clearInterval(ref.current);
  }, [running]);
  const start = (s) => { setSecs(s); setRunning(true); };
  const stop = () => { setRunning(false); setSecs(0); };
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return { secs, running, start, stop, fmt };
}

/* ─── Componentes base ─── */
function Card({ children, className = "" }) {
  return <div className={`bg-white border border-[#fde8f0] rounded-2xl p-4 shadow-sm ${className}`}>{children}</div>;
}
function Badge({ children, color = "#d63384" }) {
  return <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: color + "18", color }}>{children}</span>;
}

/* ─── Modal de vídeo ─── */
function VideoModal({ url, nome, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black" onClick={onClose}>
      <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1a]" onClick={e => e.stopPropagation()}>
        <p className="text-white text-sm font-semibold flex-1 mr-2 truncate">{nome}</p>
        <button onClick={onClose} className="text-white text-xl w-8 h-8 flex items-center justify-center">✕</button>
      </div>
      <div className="flex-1" onClick={e => e.stopPropagation()}>
        <iframe
          src={url}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={nome}
        />
      </div>
    </div>
  );
}

/* ─── Home ─── */
function Home({ setPage }) {
  const treinoHoje = getTreinoHoje();
  const treino = treinoHoje ? TREINOS[treinoHoje] : null;
  const historico = db.get("historico", []);
  const dietaDone = db.get(`dieta_${todayStr()}`, []);
  const semana = getWeekDays(historico);
  const streak = (() => {
    let s = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      if (historico.some(h => h.data === d.toISOString().split("T")[0])) s++; else break;
    }
    return s;
  })();

  return (
    <div className="p-4 space-y-4">
      <div className="pt-2">
        <p className="text-[#c4a0b5] text-sm">{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>
        <h1 className="text-2xl font-bold mt-1 text-[#2d1b2e]">Olá! 🌸</h1>
        <p className="text-[#c4a0b5] text-sm mt-0.5">Objetivo: emagrecimento + definição</p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-[#c4a0b5]">Semana atual</span>
          <span className="text-sm font-bold text-[#d63384]">{streak} dia{streak !== 1 ? "s" : ""} 🔥</span>
        </div>
        <div className="flex gap-1.5 justify-between">
          {semana.map(({ ds, feito, dia }) => (
            <div key={ds} className="flex flex-col items-center gap-1 flex-1">
              <div className={`w-full aspect-square rounded-xl flex items-center justify-center text-xs font-bold border-2 max-w-[36px] mx-auto ${feito ? "border-[#d63384] bg-[#d6338418] text-[#d63384]" : ds === todayStr() ? "border-[#d63384] text-[#d63384] border-dashed bg-[#fff0f5]" : "border-[#fde8f0] text-[#d4b8c8] bg-[#fff8fa]"}`}>
                {feito ? "✓" : dia.slice(0,1)}
              </div>
              <span className="text-[9px] text-[#d4b8c8] font-medium">{dia.slice(0,3)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-4 text-sm">
          <div><span className="text-[#c4a0b5]">Esta semana: </span><span className="font-bold text-[#2d1b2e]">{semana.filter(x => x.feito).length} treinos</span></div>
          <div><span className="text-[#c4a0b5]">Total: </span><span className="font-bold text-[#2d1b2e]">{historico.length}</span></div>
        </div>
      </Card>

      {treino ? (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[#c4a0b5]">Treino de hoje</span>
            <Badge color={treino.cor}>Treino {treino.letra}</Badge>
          </div>
          <h2 className="text-xl font-bold mb-1" style={{ color: treino.cor }}>{treino.nome}</h2>
          <p className="text-[#c4a0b5] text-sm mb-3">{treino.exercicios.length} exercícios + cardio</p>
          <div className="space-y-1 mb-4">
            {treino.exercicios.slice(0, 3).map(e => (
              <div key={e.id} className="flex items-center gap-2 text-sm text-[#9b7090]">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: treino.cor }} />
                {e.nome} — {e.series}×{e.reps}
              </div>
            ))}
            {treino.exercicios.length > 3 && <p className="text-xs text-[#d4b8c8] pl-3.5">+{treino.exercicios.length - 3} mais...</p>}
          </div>
          <button onClick={() => setPage("treino")}
            className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-95"
            style={{ background: `linear-gradient(135deg, ${treino.cor}, ${treino.cor}bb)` }}>
            Iniciar Treino {treino.letra}
          </button>
        </Card>
      ) : (
        <Card className="text-center py-6">
          <div className="text-4xl mb-2">🛋️</div>
          <h2 className="text-lg font-bold mb-1 text-[#2d1b2e]">Dia de descanso</h2>
          <p className="text-[#c4a0b5] text-sm">Hoje é sábado ou domingo — recupere bem!</p>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-[#c4a0b5]">Dieta hoje</span>
          <span className="text-sm font-bold text-[#059669]">{dietaDone.length}/{DIETA.length} refeições</span>
        </div>
        <div className="w-full bg-[#fde8f0] rounded-full h-2 mb-3">
          <div className="h-2 rounded-full transition-all" style={{ width: `${Math.round((dietaDone.length / DIETA.length) * 100)}%`, background: "#059669" }} />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
          <div className="bg-[#fff8fa] rounded-xl p-2">
            <div className="font-bold text-base text-[#2d1b2e]">{TOTAL_KCAL}</div>
            <div className="text-[#c4a0b5]">kcal/dia</div>
          </div>
          <div className="bg-[#fff8fa] rounded-xl p-2">
            <div className="font-bold text-base text-[#d63384]">{TOTAL_PROT}g</div>
            <div className="text-[#c4a0b5]">proteína</div>
          </div>
          <div className="bg-[#fff8fa] rounded-xl p-2">
            <div className="font-bold text-base text-[#c2410c]">{TOTAL_CARB}g</div>
            <div className="text-[#c4a0b5]">carbs</div>
          </div>
        </div>
        <button onClick={() => setPage("dieta")}
          className="w-full py-2.5 rounded-xl font-bold text-sm border border-[#059669] text-[#059669] transition-all">
          Ver plano alimentar
        </button>
      </Card>
    </div>
  );
}

/* ─── Treino ─── */
function Treino() {
  const treinoHojeLetra = getTreinoHoje();
  const [letraSel, setLetraSel] = useState(treinoHojeLetra || "A");
  const treino = TREINOS[letraSel];
  const [registros, setRegistros] = useState(() => db.get(`treino_reg_${todayStr()}`, {}));
  const [expandido, setExpandido] = useState(null);
  const [videoAberto, setVideoAberto] = useState(null);
  const [sessaoAtiva, setSessaoAtiva] = useState(() => db.get("sessao_ativa", null));
  const timer = useTimer();

  const salvarRegistros = (r) => { db.set(`treino_reg_${todayStr()}`, r); setRegistros(r); };
  const adicionarSerie = (exId, peso, reps) => {
    const atual = registros[exId] || [];
    salvarRegistros({ ...registros, [exId]: [...atual, { peso, reps, ts: Date.now() }] });
  };
  const removerSerie = (exId, idx) => {
    const atual = [...(registros[exId] || [])];
    atual.splice(idx, 1);
    salvarRegistros({ ...registros, [exId]: atual });
  };
  const iniciarSessao = () => {
    const s = { letra: letraSel, inicio: Date.now() };
    db.set("sessao_ativa", s); setSessaoAtiva(s);
    setExpandido(treino.exercicios[0]?.id || null);
  };
  const finalizarTreino = () => {
    const historico = db.get("historico", []);
    historico.unshift({
      id: uid(), letra: letraSel, nome: treino.nome, data: todayStr(), registros,
      totalSeries: Object.values(registros).reduce((s, a) => s + a.length, 0),
      duracao: sessaoAtiva ? Math.round((Date.now() - sessaoAtiva.inicio) / 60000) : 0,
    });
    db.set("historico", historico);
    db.set("sessao_ativa", null);
    db.set(`treino_reg_${todayStr()}`, {});
    setSessaoAtiva(null); setRegistros({}); setExpandido(null); timer.stop();
  };

  const exerciciosConcluidos = treino.exercicios.filter(e => (registros[e.id] || []).length >= e.series).length;
  const progresso = Math.round((exerciciosConcluidos / treino.exercicios.length) * 100);
  const totalSeriesFeitas = Object.values(registros).reduce((s, a) => s + a.length, 0);

  return (
    <div className="p-4 space-y-4">
      {videoAberto && <VideoModal url={videoAberto.url} nome={videoAberto.nome} onClose={() => setVideoAberto(null)} />}

      <div>
        <h1 className="text-xl font-bold mb-3 text-[#2d1b2e]">Treinos</h1>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {Object.values(TREINOS).map(t => (
            <button key={t.letra} onClick={() => { setLetraSel(t.letra); setExpandido(null); }}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all"
              style={letraSel === t.letra
                ? { borderColor: t.cor, background: t.cor + "18", color: t.cor }
                : { borderColor: "#fde8f0", background: "white", color: "#c4a0b5" }}>
              {t.letra} — {t.tag}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl font-black" style={{ color: treino.cor }}>Treino {treino.letra}</span>
          {treinoHojeLetra === letraSel && <Badge color={treino.cor}>Hoje</Badge>}
        </div>
        <p className="text-lg font-semibold text-[#2d1b2e] mb-1">{treino.nome}</p>
        <p className="text-sm text-[#c4a0b5] mb-3">🏃 {treino.cardio}</p>
        {sessaoAtiva?.letra === letraSel ? (
          <>
            <div className="mb-3">
              <div className="flex justify-between text-xs text-[#c4a0b5] mb-1">
                <span>{exerciciosConcluidos}/{treino.exercicios.length} exercícios</span>
                <span>{totalSeriesFeitas} séries</span>
              </div>
              <div className="w-full bg-[#fde8f0] rounded-full h-2">
                <div className="h-2 rounded-full transition-all" style={{ width: `${progresso}%`, background: treino.cor }} />
              </div>
            </div>
            <button onClick={finalizarTreino}
              className="w-full py-3 rounded-xl font-bold text-sm bg-[#fde8f0] text-[#c4a0b5] hover:bg-[#fbd4e4] transition-all">
              ✅ Finalizar & Salvar Treino
            </button>
          </>
        ) : (
          <button onClick={iniciarSessao}
            className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-95"
            style={{ background: `linear-gradient(135deg, ${treino.cor}, ${treino.cor}bb)` }}>
            ▶ Iniciar Treino {treino.letra}
          </button>
        )}
      </Card>

      {timer.running && (
        <div className="fixed top-4 right-4 z-40 bg-white border-2 border-[#d63384] rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3">
          <div>
            <div className="text-xs text-[#c4a0b5]">Descanso</div>
            <div className="text-2xl font-black text-[#d63384]">{timer.fmt(timer.secs)}</div>
          </div>
          <button onClick={timer.stop} className="text-[#c4a0b5] text-xs border border-[#fde8f0] rounded-lg px-2 py-1">Pular</button>
        </div>
      )}

      <div className="space-y-3">
        {treino.exercicios.map((ex, idx) => {
          const seriesFeitas = registros[ex.id] || [];
          const concluido = seriesFeitas.length >= ex.series;
          const aberto = expandido === ex.id;
          return (
            <Card key={ex.id} className={concluido ? "border-[#05996940]" : ""}>
              <button className="w-full flex items-center justify-between" onClick={() => setExpandido(aberto ? null : ex.id)}>
                <div className="flex items-center gap-3 text-left">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${concluido ? "bg-[#05996918] text-[#059669]" : "bg-[#fde8f0] text-[#c4a0b5]"}`}>
                    {concluido ? "✓" : idx + 1}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold leading-tight ${concluido ? "text-[#059669]" : "text-[#2d1b2e]"}`}>{ex.nome}</p>
                    <p className="text-xs text-[#c4a0b5]">{ex.series}×{ex.reps} · {ex.descanso}s descanso</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-bold" style={{ color: treino.cor }}>{seriesFeitas.length}/{ex.series}</span>
                  <span className="text-[#d4b8c8] text-xs">{aberto ? "▲" : "▼"}</span>
                </div>
              </button>

              {aberto && (
                <div className="mt-3 border-t border-[#fde8f0] pt-3 space-y-3">
                  {/* Vídeo embutido */}
                  <button
                    onClick={() => setVideoAberto({ url: ex.video, nome: ex.nome })}
                    className="w-full flex items-center gap-3 bg-[#fff0f5] border border-[#fde8f0] rounded-xl px-3 py-2.5 text-left">
                    <div className="w-8 h-8 rounded-lg bg-[#d63384] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm">▶</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#d63384]">Ver vídeo de exemplo</p>
                      <p className="text-[10px] text-[#c4a0b5]">YouTube · abre no app</p>
                    </div>
                  </button>

                  {seriesFeitas.length > 0 && (
                    <div className="space-y-1.5">
                      {seriesFeitas.map((s, i) => (
                        <div key={i} className="flex items-center justify-between bg-[#fff8fa] rounded-xl px-3 py-2">
                          <span className="text-xs text-[#c4a0b5]">Série {i + 1}</span>
                          <span className="text-sm font-bold text-[#2d1b2e]">{s.reps} reps{s.peso ? ` · ${s.peso}kg` : ""}</span>
                          <button onClick={() => removerSerie(ex.id, i)} className="text-[#d4b8c8] text-xs hover:text-red-400">✕</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {sessaoAtiva?.letra === letraSel && (
                    <SerieForm onAdd={(p, r) => { adicionarSerie(ex.id, p, r); timer.start(ex.descanso); }} corTreino={treino.cor} />
                  )}
                  {sessaoAtiva?.letra === letraSel && !timer.running && (
                    <div className="flex gap-2">
                      {[30, 45, 60, 90].map(s => (
                        <button key={s} onClick={() => timer.start(s)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-[#fde8f0] text-[#c4a0b5] hover:bg-[#fbd4e4]">
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
        <label className="text-xs text-[#c4a0b5] block mb-1">Peso (kg)</label>
        <input type="number" inputMode="decimal" placeholder="ex: 20" value={peso} onChange={e => setPeso(e.target.value)}
          className="w-full bg-[#fff8fa] border border-[#fde8f0] rounded-xl px-3 py-2 text-sm text-[#2d1b2e] placeholder-[#d4b8c8] focus:outline-none focus:border-[#d63384]" />
      </div>
      <div className="flex-1">
        <label className="text-xs text-[#c4a0b5] block mb-1">Reps</label>
        <input type="number" inputMode="numeric" placeholder="ex: 12" value={reps} onChange={e => setReps(e.target.value)}
          className="w-full bg-[#fff8fa] border border-[#fde8f0] rounded-xl px-3 py-2 text-sm text-[#2d1b2e] placeholder-[#d4b8c8] focus:outline-none focus:border-[#d63384]" />
      </div>
      <button onClick={submit} className="py-2 px-4 rounded-xl font-bold text-sm text-white flex-shrink-0" style={{ background: corTreino }}>+</button>
    </div>
  );
}

/* ─── Dieta ─── */
function Dieta() {
  const [done, setDone] = useState(() => db.get(`dieta_${todayStr()}`, []));
  const [aberto, setAberto] = useState(null);
  const toggle = (id) => {
    const novo = done.includes(id) ? done.filter(x => x !== id) : [...done, id];
    setDone(novo); db.set(`dieta_${todayStr()}`, novo);
  };
  const kcalConsumida = DIETA.filter(r => done.includes(r.id)).reduce((s, r) => s + r.kcal, 0);
  const protConsumida = DIETA.filter(r => done.includes(r.id)).reduce((s, r) => s + r.prot, 0);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold pt-2 text-[#2d1b2e]">Plano Alimentar</h1>
      <p className="text-sm text-[#c4a0b5] -mt-2">Emagrecimento + definição · ~{TOTAL_KCAL} kcal/dia</p>

      <Card>
        <div className="flex justify-between items-center mb-3">
          <div>
            <span className="text-2xl font-black text-[#2d1b2e]">{kcalConsumida}</span>
            <span className="text-[#c4a0b5] text-sm"> / {TOTAL_KCAL} kcal</span>
          </div>
          <span className="text-sm font-bold text-[#059669]">{done.length}/{DIETA.length} refeições</span>
        </div>
        <div className="w-full bg-[#fde8f0] rounded-full h-3 mb-3">
          <div className="h-3 rounded-full transition-all" style={{ width: `${Math.round((kcalConsumida / TOTAL_KCAL) * 100)}%`, background: "linear-gradient(90deg, #d63384, #fb923c)" }} />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {[
            { label: "Proteínas", val: `${protConsumida}g`, total: `/${TOTAL_PROT}g`, color: "#d63384" },
            { label: "Carboidratos", val: `${DIETA.filter(r => done.includes(r.id)).reduce((s, r) => s + r.carb, 0)}g`, total: `/${TOTAL_CARB}g`, color: "#c2410c" },
            { label: "Gorduras", val: `${DIETA.filter(r => done.includes(r.id)).reduce((s, r) => s + r.gord, 0)}g`, total: `/${TOTAL_GORD}g`, color: "#7c3aed" },
          ].map(m => (
            <div key={m.label} className="bg-[#fff8fa] rounded-xl p-2">
              <div className="font-bold text-sm" style={{ color: m.color }}>{m.val}</div>
              <div className="text-[#d4b8c8] text-[10px]">{m.total}</div>
              <div className="text-[#c4a0b5] text-[10px] mt-0.5">{m.label}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="space-y-3">
        {DIETA.map(ref => {
          const feita = done.includes(ref.id);
          const open = aberto === ref.id;
          return (
            <Card key={ref.id} className={feita ? "border-[#05996940]" : ""}>
              <div className="flex items-center justify-between">
                <button className="flex items-center gap-3 flex-1 text-left" onClick={() => setAberto(open ? null : ref.id)}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#2d1b2e]">{ref.nome}</span>
                      <span className="text-xs text-[#d4b8c8]">{ref.hora}</span>
                    </div>
                    <div className="flex gap-2 mt-0.5">
                      <span className="text-xs text-[#c4a0b5]">{ref.kcal} kcal</span>
                      <span className="text-xs text-[#d63384]">{ref.prot}g prot</span>
                    </div>
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-[#d4b8c8] text-xs">{open ? "▲" : "▼"}</span>
                  <button onClick={() => toggle(ref.id)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${feita ? "bg-[#05996918] border-[#059669] text-[#059669]" : "border-[#fde8f0] text-transparent"}`}>✓</button>
                </div>
              </div>
              {open && (
                <div className="mt-3 border-t border-[#fde8f0] pt-3 space-y-2">
                  <div className="space-y-1.5">
                    {ref.alimentos.map((a, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-[#6b4e5e]">
                        <span className="text-[#d63384] flex-shrink-0">•</span>{a}
                      </div>
                    ))}
                  </div>
                  {ref.dica && <div className="bg-[#fff8fa] rounded-xl p-3 mt-2"><p className="text-xs text-[#c4a0b5]">💡 {ref.dica}</p></div>}
                  <div className="grid grid-cols-4 gap-1 pt-1">
                    {[{l:"Kcal",v:ref.kcal,c:"#2d1b2e"},{l:"Prot",v:`${ref.prot}g`,c:"#d63384"},{l:"Carbs",v:`${ref.carb}g`,c:"#c2410c"},{l:"Gord",v:`${ref.gord}g`,c:"#7c3aed"}].map(m => (
                      <div key={m.l} className="text-center">
                        <div className="text-xs font-bold" style={{ color: m.c }}>{m.v}</div>
                        <div className="text-[10px] text-[#d4b8c8]">{m.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="bg-[#fff8fa]">
        <h3 className="text-sm font-bold text-[#d63384] mb-2">Dicas gerais</h3>
        <div className="space-y-1.5 text-xs text-[#9b7090]">
          {["💧 Beba 2–3 litros de água por dia","🚫 Evite açúcar refinado, refrigerantes e frituras","⏰ Coma a cada 3–4 horas para manter o metabolismo","🥩 Priorize proteína em todas as refeições","🌙 Durma 7–9h — o sono é fundamental para perda de gordura"].map((d, i) => <p key={i}>{d}</p>)}
        </div>
      </Card>
      <div className="h-4" />
    </div>
  );
}

/* ─── Histórico ─── */
function Historico() {
  const [historico, setHistorico] = useState(() => db.get("historico", []));
  const [aberto, setAberto] = useState(null);
  const remover = (id) => { const novo = historico.filter(h => h.id !== id); setHistorico(novo); db.set("historico", novo); };
  const fmt = (ds) => new Date(ds + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" });

  if (!historico.length) return (
    <div className="p-4 flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="text-6xl mb-4">📋</div>
      <h2 className="text-xl font-bold mb-2 text-[#2d1b2e]">Sem treinos ainda</h2>
      <p className="text-[#c4a0b5] text-sm">Finalize um treino para ver o histórico aqui.</p>
    </div>
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-bold text-[#2d1b2e]">Histórico</h1>
        <span className="text-sm text-[#c4a0b5]">{historico.length} treino{historico.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[{label:"Treinos",val:historico.length,color:"#d63384"},{label:"Séries",val:historico.reduce((s,h)=>s+(h.totalSeries||0),0),color:"#7c3aed"},{label:"Minutos",val:historico.reduce((s,h)=>s+(h.duracao||0),0),color:"#059669"}].map(s => (
          <Card key={s.label} className="text-center p-3">
            <div className="text-xl font-black" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs text-[#c4a0b5] mt-0.5">{s.label}</div>
          </Card>
        ))}
      </div>
      <div className="space-y-3">
        {historico.map(h => {
          const t = TREINOS[h.letra];
          const open = aberto === h.id;
          return (
            <Card key={h.id}>
              <button className="w-full flex items-center justify-between" onClick={() => setAberto(open ? null : h.id)}>
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black flex-shrink-0"
                    style={{ background: (t?.cor || "#d63384") + "18", color: t?.cor || "#d63384" }}>{h.letra}</div>
                  <div>
                    <p className="text-sm font-semibold text-[#2d1b2e]">{h.nome}</p>
                    <p className="text-xs text-[#c4a0b5]">{fmt(h.data)} · {h.totalSeries} séries{h.duracao ? ` · ${h.duracao} min` : ""}</p>
                  </div>
                </div>
                <span className="text-[#d4b8c8] text-xs">{open ? "▲" : "▼"}</span>
              </button>
              {open && (
                <div className="mt-3 border-t border-[#fde8f0] pt-3 space-y-2">
                  {t?.exercicios.map(ex => {
                    const series = h.registros?.[ex.id] || [];
                    if (!series.length) return null;
                    return (
                      <div key={ex.id}>
                        <p className="text-xs font-semibold text-[#c4a0b5] mb-1">{ex.nome}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {series.map((s, i) => (
                            <span key={i} className="text-xs bg-[#fff8fa] border border-[#fde8f0] rounded-lg px-2 py-1 text-[#6b4e5e]">
                              {s.reps}rep{s.peso ? ` · ${s.peso}kg` : ""}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  <button onClick={() => remover(h.id)} className="text-xs text-red-400 opacity-60 hover:opacity-100 mt-1">Remover registro</button>
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

/* ─── Dados estratégicos de afiliadas ─── */
const PROGRAMAS = [
  {
    id: "shopee",
    nome: "Shopee Afiliados",
    categoria: "Marketplace",
    comissao: "5–12%",
    cor: "#ee4d2d",
    dificuldade: "Fácil",
    prazo: "Aprovação imediata",
    nichos: ["Beleza", "Moda", "Fitness"],
    pros: ["Aprovação rápida", "Catálogo enorme", "Links fáceis de gerar", "Pagamento mensal"],
    inicio: "1º Prioridade — comece aqui",
    passos: ["Acesse affiliate.shopee.com.br", "Cadastre-se com CPF e dados bancários", "Instale o app Shopee Parceiros", "Gere links de qualquer produto"],
  },
  {
    id: "amazon",
    nome: "Amazon Associates",
    categoria: "Marketplace",
    comissao: "3–10%",
    cor: "#ff9900",
    dificuldade: "Fácil",
    prazo: "2–3 dias",
    nichos: ["Beleza", "Fitness"],
    pros: ["Alta credibilidade", "Boa variedade beauty/fitness", "Dashboard completo"],
    inicio: "2ª Prioridade",
    passos: ["Acesse affiliate-program.amazon.com.br", "Crie conta com conta Amazon existente", "Aguarde aprovação (2–3 dias)", "Crie links personalizados"],
  },
  {
    id: "hotmart",
    nome: "Hotmart",
    categoria: "Produtos Digitais",
    comissao: "30–60%",
    cor: "#ff4d2b",
    dificuldade: "Médio",
    prazo: "Aprovação por produto",
    nichos: ["Fitness", "Beleza"],
    pros: ["Comissões altíssimas (R$50–R$300/venda)", "Produtos de qualidade", "Pagamento rápido"],
    inicio: "3ª Prioridade — alta rentabilidade",
    passos: ["Acesse hotmart.com e crie conta Afiliada", "Pesquise produtos de fitness e beleza", "Peça aprovação ao produtor", "Promova com link de afiliado"],
  },
  {
    id: "renner",
    nome: "Renner Afiliados",
    categoria: "Moda",
    comissao: "5–8%",
    cor: "#e63946",
    dificuldade: "Médio",
    prazo: "3–5 dias",
    nichos: ["Moda"],
    pros: ["Marca conhecida", "Produtos sazonais", "Boa conversão em moda"],
    inicio: "4ª Prioridade — moda",
    passos: ["Acesse Lomadee ou Awin (Renner usa essas redes)", "Cadastre seu canal (TikTok/Pinterest)", "Aguarde aprovação", "Gere links de peças específicas"],
  },
];

const CHECKLIST_ONBOARDING = [
  { id: "bio", grupo: "Perfil", texto: "Otimizar bio do TikTok com foco em 'Beleza • Moda • Fitness'" },
  { id: "linktree", grupo: "Perfil", texto: "Criar Linktree ou Beacons.ai (agrupa todos os links)" },
  { id: "shopee_cad", grupo: "Programas", texto: "Cadastrar no Shopee Afiliados" },
  { id: "amazon_cad", grupo: "Programas", texto: "Cadastrar no Amazon Associates" },
  { id: "hotmart_cad", grupo: "Programas", texto: "Criar conta na Hotmart como afiliada" },
  { id: "pilares", grupo: "Conteúdo", texto: "Definir os 3 pilares de conteúdo semanal" },
  { id: "primeiro_video", grupo: "Conteúdo", texto: "Criar primeiro TikTok com produto afiliado" },
  { id: "primeiro_pin", grupo: "Conteúdo", texto: "Criar 5 pins no Pinterest com links afiliados" },
  { id: "planilha", grupo: "Gestão", texto: "Criar planilha de controle de receita" },
  { id: "meta30", grupo: "Gestão", texto: "Definir meta de R$300 para o primeiro mês" },
];

const CALENDARIO = [
  { dia: "Seg", tema: "Skincare Routine", nicho: "Beleza", formato: "TikTok 30–60s", hook: "\"O produto que mudou minha pele...\"", programas: ["Shopee", "Amazon"] },
  { dia: "Ter", tema: "Look do Dia", nicho: "Moda", formato: "TikTok GRWM", hook: "\"Look completo por menos de R$X...\"", programas: ["Renner", "Shopee"] },
  { dia: "Qua", tema: "Treino + Produto", nicho: "Fitness", formato: "TikTok + Pin", hook: "\"Sem isso meu treino não é o mesmo...\"", programas: ["Amazon", "Shopee"] },
  { dia: "Qui", tema: "Review Honesto", nicho: "Beleza", formato: "TikTok 60s", hook: "\"Testei por 30 dias e...\"", programas: ["Hotmart", "Amazon"] },
  { dia: "Sex", tema: "Top 5 da Semana", nicho: "Todos", formato: "TikTok + 5 Pins", hook: "\"5 produtos que comprei e amei...\"", programas: ["Shopee", "Amazon"] },
  { dia: "Sáb", tema: "Pinterest SEO", nicho: "Todos", formato: "10–15 Pins", hook: "Palavras-chave longas + links diretos", programas: ["Todos"] },
  { dia: "Dom", tema: "Planejamento", nicho: "—", formato: "Bastidores", hook: "Preparar conteúdo da semana seguinte", programas: [] },
];

const PROJECAO = [
  { mes: "Mês 1", min: 100, max: 300, fase: "Aprendizado", foco: "Onboarding + primeiros links" },
  { mes: "Mês 2", min: 250, max: 600, fase: "Tração", foco: "Consistência + otimização" },
  { mes: "Mês 3", min: 500, max: 1000, fase: "Crescimento", foco: "Pinterest evergreen gera tráfego passivo" },
  { mes: "Mês 6", min: 1000, max: 3000, fase: "Escala", foco: "Hotmart + produtos digitais de alto ticket" },
  { mes: "Mês 12", min: 2000, max: 5000, fase: "Maturidade", foco: "Renda passiva + parcerias fixas" },
];

/* ─── Página de Afiliadas ─── */
function Afiliadas() {
  const [aba, setAba] = useState("plano");
  const [checklist, setChecklist] = useState(() => db.get("afil_checklist", []));
  const [programaAberto, setProgramaAberto] = useState(null);
  const [diaAberto, setDiaAberto] = useState(null);

  const toggleCheck = (id) => {
    const novo = checklist.includes(id) ? checklist.filter(x => x !== id) : [...checklist, id];
    setChecklist(novo); db.set("afil_checklist", novo);
  };

  const grupos = [...new Set(CHECKLIST_ONBOARDING.map(i => i.grupo))];
  const progresso = Math.round((checklist.length / CHECKLIST_ONBOARDING.length) * 100);

  const ABAS = [
    { id: "plano", label: "Plano" },
    { id: "programas", label: "Programas" },
    { id: "calendario", label: "Calendário" },
    { id: "projecao", label: "Receita" },
  ];

  const nichoColor = { "Beleza": "#d63384", "Moda": "#7c3aed", "Fitness": "#059669", "Todos": "#0369a1" };

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-[#2d1b2e]">Estratégia Afiliada</h1>
        <p className="text-sm text-[#c4a0b5] mt-0.5">Nano Influencer · Beleza, Moda & Fitness</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Meta 6 meses", val: "R$3k", sub: "por mês", color: "#d63384" },
          { label: "Plataformas", val: "TikTok", sub: "+ Pinterest", color: "#7c3aed" },
          { label: "Setup", val: "1–2h", sub: "por dia", color: "#059669" },
        ].map(s => (
          <Card key={s.label} className="text-center p-3">
            <div className="text-base font-black" style={{ color: s.color }}>{s.val}</div>
            <div className="text-[10px] text-[#d4b8c8]">{s.sub}</div>
            <div className="text-[10px] text-[#c4a0b5] mt-0.5">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Sub-abas */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {ABAS.map(a => (
          <button key={a.id} onClick={() => setAba(a.id)}
            className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all"
            style={aba === a.id
              ? { borderColor: "#d63384", background: "#d6338418", color: "#d63384" }
              : { borderColor: "#fde8f0", background: "white", color: "#c4a0b5" }}>
            {a.label}
          </button>
        ))}
      </div>

      {/* ── ABA: PLANO (Onboarding Checklist) ── */}
      {aba === "plano" && (
        <div className="space-y-4">
          <Card>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-[#2d1b2e]">Checklist de Onboarding</span>
              <span className="text-sm font-bold text-[#d63384]">{checklist.length}/{CHECKLIST_ONBOARDING.length}</span>
            </div>
            <div className="w-full bg-[#fde8f0] rounded-full h-2.5 mb-1">
              <div className="h-2.5 rounded-full transition-all" style={{ width: `${progresso}%`, background: "linear-gradient(90deg, #d63384, #7c3aed)" }} />
            </div>
            <p className="text-xs text-[#c4a0b5]">{progresso}% completo</p>
          </Card>

          {grupos.map(grupo => (
            <div key={grupo}>
              <p className="text-xs font-bold text-[#c4a0b5] uppercase tracking-wider mb-2">{grupo}</p>
              <div className="space-y-2">
                {CHECKLIST_ONBOARDING.filter(i => i.grupo === grupo).map(item => {
                  const feito = checklist.includes(item.id);
                  return (
                    <button key={item.id} onClick={() => toggleCheck(item.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${feito ? "border-[#d6338440] bg-[#d6338408]" : "border-[#fde8f0] bg-white"}`}>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${feito ? "border-[#d63384] bg-[#d63384]" : "border-[#fde8f0]"}`}>
                        {feito && <span className="text-white text-xs font-bold">✓</span>}
                      </div>
                      <span className={`text-sm ${feito ? "line-through text-[#c4a0b5]" : "text-[#2d1b2e]"}`}>{item.texto}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <Card className="bg-[#fff0f5]">
            <h3 className="text-sm font-bold text-[#d63384] mb-2">Sua Vantagem como Nano Influencer</h3>
            <div className="space-y-2 text-xs text-[#9b7090]">
              {[
                "Engajamento de 5–8% (mega influencers têm 1–2%) — sua audiência CONFIA em você",
                "Produtos indicados por você têm mais conversão que influencers grandes",
                "Marcas valorizam nano influencers pelo baixo custo e alta autenticidade",
                "Shopee e Amazon aprovam nano influencers sem complicação",
              ].map((d, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[#d63384] flex-shrink-0">✦</span>
                  <span>{d}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-bold text-[#2d1b2e] mb-3">Ângulo Estratégico: Glow Up Completo</h3>
            <p className="text-xs text-[#9b7090] mb-3">
              Com 3 nichos e pouco tempo, o segredo é uma <span className="font-bold text-[#d63384]">narrativa única</span> que conecta tudo:
              beleza, moda e fitness como pilares da <span className="font-bold">transformação pessoal</span>.
            </p>
            <div className="space-y-2">
              {[
                { icon: "💄", titulo: "Beleza", desc: "Skincare, maquiagem e cuidados que fazem diferença" },
                { icon: "👗", titulo: "Moda", desc: "Looks acessíveis que valorizam qualquer corpo" },
                { icon: "💪", titulo: "Fitness", desc: "Treino + produtos que potencializam resultados" },
              ].map(p => (
                <div key={p.titulo} className="flex items-start gap-3 bg-[#fff8fa] rounded-xl p-3">
                  <span className="text-xl">{p.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-[#2d1b2e]">{p.titulo}</p>
                    <p className="text-xs text-[#c4a0b5]">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── ABA: PROGRAMAS ── */}
      {aba === "programas" && (
        <div className="space-y-3">
          <Card className="bg-[#fff0f5]">
            <p className="text-xs text-[#9b7090]">
              <span className="font-bold text-[#d63384]">Estratégia:</span> Comece pelo Shopee (aprovação imediata) + Amazon. Só avance para Hotmart após gerar as primeiras vendas.
            </p>
          </Card>

          {PROGRAMAS.map((prog, idx) => {
            const aberto = programaAberto === prog.id;
            return (
              <Card key={prog.id}>
                <button className="w-full flex items-center justify-between" onClick={() => setProgramaAberto(aberto ? null : prog.id)}>
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                      style={{ background: prog.cor + "18", color: prog.cor }}>{idx + 1}</div>
                    <div>
                      <p className="text-sm font-bold text-[#2d1b2e]">{prog.nome}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold" style={{ color: prog.cor }}>{prog.comissao}</span>
                        <span className="text-xs text-[#c4a0b5]">· {prog.dificuldade}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: prog.cor + "18", color: prog.cor }}>{prog.categoria}</span>
                    <span className="text-[#d4b8c8] text-xs">{aberto ? "▲" : "▼"}</span>
                  </div>
                </button>

                {aberto && (
                  <div className="mt-3 border-t border-[#fde8f0] pt-3 space-y-3">
                    <div className="bg-[#fff8fa] rounded-xl p-3">
                      <p className="text-xs font-bold text-[#d63384] mb-1">{prog.inicio}</p>
                      <p className="text-xs text-[#c4a0b5]">Prazo: {prog.prazo}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#c4a0b5] mb-1.5">Como cadastrar:</p>
                      <div className="space-y-1.5">
                        {prog.passos.map((p, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-[#6b4e5e]">
                            <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                              style={{ background: prog.cor + "18", color: prog.cor }}>{i + 1}</span>
                            {p}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#c4a0b5] mb-1.5">Vantagens:</p>
                      <div className="space-y-1">
                        {prog.pros.map((p, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-[#9b7090]">
                            <span style={{ color: prog.cor }}>✓</span>{p}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {prog.nichos.map(n => (
                        <span key={n} className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: (nichoColor[n] || "#d63384") + "18", color: nichoColor[n] || "#d63384" }}>{n}</span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}

          <Card className="bg-[#fff8fa]">
            <h3 className="text-sm font-bold text-[#2d1b2e] mb-2">Ferramentas Essenciais</h3>
            <div className="space-y-2 text-xs text-[#9b7090]">
              {[
                { nome: "Beacons.ai ou Linktree", desc: "Link na bio que centraliza todos os afiliados" },
                { nome: "Canva", desc: "Criar capas de Pin para o Pinterest (grátis)" },
                { nome: "CapCut", desc: "Editar TikToks com legendas automáticas" },
                { nome: "Notion / Planilha", desc: "Controle de links, comissões e conteúdo" },
              ].map(f => (
                <div key={f.nome} className="flex items-start gap-2 bg-white rounded-xl p-2.5 border border-[#fde8f0]">
                  <span className="text-[#d63384] flex-shrink-0">→</span>
                  <div>
                    <span className="font-bold text-[#2d1b2e]">{f.nome}: </span>
                    <span>{f.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── ABA: CALENDÁRIO ── */}
      {aba === "calendario" && (
        <div className="space-y-3">
          <Card className="bg-[#fff0f5]">
            <p className="text-xs text-[#9b7090]">
              <span className="font-bold text-[#d63384]">Regra de ouro:</span> 1 TikTok/dia + 3–5 pins/dia no Pinterest. Com 1–2h você consegue criar, editar e postar tudo.
            </p>
          </Card>

          {CALENDARIO.map(dia => {
            const aberto = diaAberto === dia.dia;
            const cor = nichoColor[dia.nicho] || "#d63384";
            return (
              <Card key={dia.dia}>
                <button className="w-full flex items-center justify-between" onClick={() => setDiaAberto(aberto ? null : dia.dia)}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                      style={{ background: cor + "18", color: cor }}>{dia.dia}</div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-[#2d1b2e]">{dia.tema}</p>
                      <p className="text-xs text-[#c4a0b5]">{dia.formato}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {dia.nicho !== "—" && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: cor + "18", color: cor }}>{dia.nicho}</span>
                    )}
                    <span className="text-[#d4b8c8] text-xs">{aberto ? "▲" : "▼"}</span>
                  </div>
                </button>

                {aberto && (
                  <div className="mt-3 border-t border-[#fde8f0] pt-3 space-y-2.5">
                    <div className="bg-[#fff8fa] rounded-xl p-3">
                      <p className="text-xs font-bold text-[#c4a0b5] mb-1">Hook sugerido:</p>
                      <p className="text-sm font-medium text-[#2d1b2e]">{dia.hook}</p>
                    </div>
                    {dia.programas.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-[#c4a0b5] mb-1.5">Programas para usar:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {dia.programas.map(p => (
                            <span key={p} className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#fde8f0] text-[#d63384]">{p}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {dia.dia === "Dom" && (
                      <div className="text-xs text-[#9b7090] space-y-1">
                        <p className="font-bold text-[#2d1b2e]">Tarefas do domingo:</p>
                        {["Listar 5–10 produtos para promover na semana", "Gerar todos os links com antecedência", "Salvar os links no Linktree/Beacons", "Gravar 2–3 TikToks em lote (se possível)"].map((t, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-[#d63384]">•</span>{t}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}

          <Card>
            <h3 className="text-sm font-bold text-[#2d1b2e] mb-3">Formato dos TikToks que Convertem</h3>
            <div className="space-y-2 text-xs text-[#9b7090]">
              {[
                { passo: "0–3s", desc: "Hook forte: \"Nunca mais comprei errado de beleza...\"" },
                { passo: "3–15s", desc: "Problema + solução: mostre o produto em uso" },
                { passo: "15–30s", desc: "Resultado: antes/depois ou reação genuína" },
                { passo: "30–45s", desc: "CTA: \"Link na bio pra pegar o meu!\"" },
              ].map(f => (
                <div key={f.passo} className="flex items-start gap-3 bg-[#fff8fa] rounded-xl p-2.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#d6338418] text-[#d63384] flex-shrink-0">{f.passo}</span>
                  <span>{f.desc}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── ABA: PROJEÇÃO DE RECEITA ── */}
      {aba === "projecao" && (
        <div className="space-y-3">
          <Card className="bg-[#fff0f5]">
            <p className="text-xs text-[#9b7090]">
              Projeção conservadora baseada em nano influencer (até 10k) com TikTok + Pinterest, 1–2h/dia, consistência diária.
            </p>
          </Card>

          {PROJECAO.map(m => {
            const largura = Math.min(100, (m.max / 5000) * 100);
            return (
              <Card key={m.mes}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-bold text-[#2d1b2e]">{m.mes}</span>
                    <span className="text-xs text-[#c4a0b5] ml-2">· {m.fase}</span>
                  </div>
                  <span className="text-sm font-black text-[#d63384]">R${m.min}–R${m.max}</span>
                </div>
                <div className="w-full bg-[#fde8f0] rounded-full h-2 mb-2">
                  <div className="h-2 rounded-full transition-all"
                    style={{ width: `${largura}%`, background: "linear-gradient(90deg, #d63384, #7c3aed)" }} />
                </div>
                <p className="text-xs text-[#c4a0b5]">{m.foco}</p>
              </Card>
            );
          })}

          <Card>
            <h3 className="text-sm font-bold text-[#2d1b2e] mb-3">Como Chegar em R$5.000/mês</h3>
            <div className="space-y-2 text-xs text-[#9b7090]">
              {[
                { icon: "1", titulo: "Consistência (meses 1–3)", desc: "Postar diariamente, mesmo que imperfeito. Volume cria algoritmo." },
                { icon: "2", titulo: "Pinterest Evergreen (mês 3+)", desc: "Pins bem otimizados trazem tráfego 12–18 meses. É renda passiva real." },
                { icon: "3", titulo: "Hotmart de Alto Ticket (mês 4+)", desc: "1 curso de R$497 = R$200+ de comissão. 25 vendas/mês = R$5.000." },
                { icon: "4", titulo: "Parcerias Fixas (mês 6+)", desc: "Marcas que pagam mensalmente por posts. Mais previsível que comissão." },
              ].map(e => (
                <div key={e.icon} className="flex items-start gap-3 bg-[#fff8fa] rounded-xl p-3 border border-[#fde8f0]">
                  <span className="w-6 h-6 rounded-full bg-[#d6338418] text-[#d63384] flex items-center justify-center text-xs font-black flex-shrink-0">{e.icon}</span>
                  <div>
                    <p className="font-bold text-[#2d1b2e] mb-0.5">{e.titulo}</p>
                    <p>{e.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-[#fff0f5]">
            <h3 className="text-sm font-bold text-[#d63384] mb-2">Simulação Realista — Mês 3</h3>
            <div className="space-y-1.5 text-xs text-[#9b7090]">
              {[
                { fonte: "Shopee (50 cliques/dia × 3% conv. × R$15 ticket × 8%)", val: "R$180" },
                { fonte: "Amazon (30 cliques/dia × 2% conv. × R$80 ticket × 5%)", val: "R$144" },
                { fonte: "Pinterest (tráfego passivo acumulado)", val: "R$80" },
                { fonte: "Hotmart (2 vendas × R$100 comissão)", val: "R$200" },
              ].map(s => (
                <div key={s.fonte} className="flex justify-between items-start gap-2 bg-white rounded-lg p-2 border border-[#fde8f0]">
                  <span className="flex-1">{s.fonte}</span>
                  <span className="font-bold text-[#059669] flex-shrink-0">{s.val}</span>
                </div>
              ))}
              <div className="flex justify-between items-center bg-[#d6338418] rounded-lg p-2 mt-1">
                <span className="font-bold text-[#2d1b2e]">Total estimado</span>
                <span className="font-black text-[#d63384]">≈ R$604/mês</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ─── App ─── */
const PAGES = [
  { id: "home", label: "Início", icon: "🏠" },
  { id: "treino", label: "Treino", icon: "💪" },
  { id: "dieta", label: "Dieta", icon: "🥗" },
  { id: "afiliadas", label: "Afiliadas", icon: "💰" },
];

export default function App() {
  const [page, setPage] = useState("home");
  return (
    <div className="min-h-screen bg-[#fff8fa] text-[#2d1b2e] max-w-md mx-auto relative">
      <div className="pb-20 min-h-screen overflow-y-auto">
        {page === "home"       && <Home setPage={setPage} />}
        {page === "treino"     && <Treino />}
        {page === "dieta"      && <Dieta />}
        {page === "afiliadas"  && <Afiliadas />}
      </div>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-[#fde8f0] z-40 shadow-[0_-4px_20px_rgba(214,51,132,0.08)]">
        <div className="flex">
          {PAGES.map(p => (
            <button key={p.id} onClick={() => setPage(p.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 relative transition-all ${page === p.id ? "text-[#d63384]" : "text-[#d4b8c8]"}`}>
              <span className="text-xl">{p.icon}</span>
              <span className="text-[10px] font-medium">{p.label}</span>
              {page === p.id && <div className="absolute bottom-0 w-6 h-0.5 bg-[#d63384] rounded-full" />}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
