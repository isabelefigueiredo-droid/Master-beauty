import { useState } from "react";

const db = {
  get: (k, d = null) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const todayStr = () => new Date().toISOString().split("T")[0];

function Card({ children, className = "" }) {
  return <div className={`bg-white border border-[#fde8f0] rounded-2xl p-4 shadow-sm ${className}`}>{children}</div>;
}

/* ─── Respiração 4-7-8 com animação ─── */
function Respiracao() {
  const [fase, setFase] = useState(null); // null | "inspire" | "segure" | "expire"
  const [ciclos, setCiclos] = useState(0);
  const [timer, setTimer] = useState(0);

  const fases = [
    { id: "inspire", label: "Inspire pelo nariz", secs: 4, cor: "#7c3aed", instrucao: "Feche a boca e inspire contando 1-2-3-4" },
    { id: "segure", label: "Segure o ar", secs: 7, cor: "#d63384", instrucao: "Não respire. Conte 1-2-3-4-5-6-7" },
    { id: "expire", label: "Expire pela boca", secs: 8, cor: "#059669", instrucao: "Solte o ar fazendo um leve barulho, contando até 8" },
  ];

  const iniciar = () => {
    setFase(0); setTimer(fases[0].secs); setCiclos(0);
    const run = (faseIdx, secsLeft, ciclosFeitos) => {
      if (ciclosFeitos >= 4) { setFase(null); setTimer(0); setCiclos(4); return; }
      setFase(faseIdx); setTimer(secsLeft);
      if (secsLeft <= 0) {
        const proxFase = (faseIdx + 1) % 3;
        const novosCiclos = proxFase === 0 ? ciclosFeitos + 1 : ciclosFeitos;
        setTimeout(() => run(proxFase, fases[proxFase].secs, novosCiclos), 0);
      } else {
        setTimeout(() => run(faseIdx, secsLeft - 1, ciclosFeitos), 1000);
      }
    };
    run(0, fases[0].secs, 0);
  };

  const faseAtual = fase !== null ? fases[fase] : null;
  const pct = faseAtual ? (1 - timer / faseAtual.secs) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="relative w-36 h-36 mx-auto mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#fde8f0" strokeWidth="8" />
            <circle cx="50" cy="50" r="45" fill="none"
              stroke={faseAtual?.cor || "#d63384"} strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - pct / 100)}`}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {faseAtual ? (
              <>
                <span className="text-3xl font-black text-[#2d1b2e]">{timer}</span>
                <span className="text-xs font-semibold text-[#c4a0b5]">seg</span>
              </>
            ) : (
              <span className="text-3xl">🫁</span>
            )}
          </div>
        </div>
        {faseAtual ? (
          <div>
            <p className="font-bold text-lg text-[#2d1b2e]">{faseAtual.label}</p>
            <p className="text-sm text-[#c4a0b5] mt-1">{faseAtual.instrucao}</p>
            <p className="text-xs text-[#d4b8c8] mt-2">Ciclo {Math.min(ciclos + 1, 4)} de 4</p>
          </div>
        ) : ciclos === 4 ? (
          <div>
            <p className="font-bold text-lg text-[#059669]">✓ 4 ciclos completos!</p>
            <p className="text-sm text-[#c4a0b5]">Repita ao acordar e antes de dormir.</p>
          </div>
        ) : (
          <div>
            <p className="font-bold text-lg text-[#2d1b2e]">Respiração 4-7-8</p>
            <p className="text-sm text-[#c4a0b5]">4 ciclos completos · ~1 minuto</p>
          </div>
        )}
      </div>
      <button onClick={iniciar}
        className="w-full py-3 rounded-xl font-bold text-sm text-white"
        style={{ background: "linear-gradient(135deg, #d63384, #7c3aed)" }}>
        {faseAtual ? "Reiniciar" : ciclos === 4 ? "Fazer de novo" : "▶ Iniciar respiração"}
      </button>
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        {[{l:"Inspire",v:"4s",c:"#7c3aed"},{l:"Segure",v:"7s",c:"#d63384"},{l:"Expire",v:"8s",c:"#059669"}].map(f => (
          <div key={f.l} className="bg-[#fff8fa] rounded-xl p-2">
            <div className="font-black text-base" style={{ color: f.c }}>{f.v}</div>
            <div className="text-[#c4a0b5]">{f.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Dados do protocolo ─── */
const ROTINA = [
  { id: "r1", hora: "Ao acordar", acao: "Gelo no rosto", detalhe: "2 min · Enrole gelo em pano, movimentos circulares (bochechas → olheiras → mandíbula)", icon: "🧊" },
  { id: "r2", hora: "+3 min", acao: "Respiração 4-7-8", detalhe: "4 ciclos · Ativa o sistema parassimpático antes de qualquer coisa", icon: "🫁" },
  { id: "r3", hora: "+5 min", acao: "Massagem linfática facial", detalhe: "5 min · Drena retenção acumulada durante o sono", icon: "💆‍♀️" },
  { id: "r4", hora: "+30 min", acao: "500ml de água", detalhe: "Temperatura ambiente · Hidratação antes da cafeína — obrigatório", icon: "💧" },
  { id: "r5", hora: "+90 min do acordar", acao: "1º café do dia", detalhe: "Depois do pico natural de cortisol · Não antes!", icon: "☕" },
  { id: "r6", hora: "Café da manhã", acao: "Proteína + carboidrato complexo + gordura boa", detalhe: "Estabiliza glicose e reduz cortisol pós-café", icon: "🥚" },
  { id: "r7", hora: "Ao longo do dia", acao: "2L de água + 2 xícaras de chá de hibisco", detalhe: "Anti-retenção hídrica e anti-inflamatório", icon: "🌺" },
  { id: "r8", hora: "Max 14h", acao: "Último café do dia", detalhe: "Cafeína tardia eleva cortisol noturno", icon: "⏰" },
  { id: "r9", hora: "Exercício", acao: "Musculação ou Pilates", detalhe: "Ver cronograma · Max 60 min · Não treinar em jejum", icon: "🏋️‍♀️" },
  { id: "r10", hora: "Jantar", acao: "Refeição leve, baixo sódio", detalhe: "Jantar pesado prejudica qualidade do sono", icon: "🥗" },
  { id: "r11", hora: "Noite", acao: "Ashwagandha 300mg + Magnésio 400mg", detalhe: "Com o jantar ou antes de dormir", icon: "💊" },
  { id: "r12", hora: "30 min antes de dormir", acao: "ZERO telas", detalhe: "Livro, áudio ou nada · Protege melatonina e cortisol noturno", icon: "📵" },
  { id: "r13", hora: "Meta: dormir", acao: "22h30–23h no máximo", detalhe: "Sono antes da meia-noite é mais restaurador", icon: "🌙" },
];

const MASSAGEM = [
  { n: 1, parte: "Pescoço", instrucao: "Movimentos de baixo para cima, suavemente. Repita 5x de cada lado. Sem pressão forte." },
  { n: 2, parte: "Mandíbula", instrucao: "Do mento (queixo) em direção à orelha, deslizando indicador e médio. Pressão leve. 5x cada lado." },
  { n: 3, parte: "Bochechas", instrucao: "Da asa do nariz em direção à orelha. Use os 4 dedos juntos. Movimento deslizante. 5x cada lado." },
  { n: 4, parte: "Olheiras", instrucao: "Com o dedo anelar (o mais leve), do canto interno para o externo — por baixo do olho. 3x cada lado. Sem puxar a pele." },
  { n: 5, parte: "Têmporas", instrucao: "Movimentos circulares pequenos nas têmporas. 5 círculos de cada lado. Alívio imediato de tensão." },
  { n: 6, parte: "Testa", instrucao: "Do centro da testa em direção às laterais, deslizando os dedos. 3x. Ajuda na drenagem da cabeça." },
  { n: 7, parte: "Finalização", instrucao: "Pressione suavemente atrás da orelha (osso mastóide) e desça pelo pescoço. Esse é o ponto de saída do linfático. 3x." },
];

const SUPLEMENTOS = [
  { nome: "Magnésio Glicinato", dose: "400mg", quando: "Com o jantar ou antes de dormir", por_que: "Reduz cortisol, relaxa músculo, melhora sono profundo", prioridade: 1 },
  { nome: "Ashwagandha (KSM-66)", dose: "300–600mg", quando: "Manhã com café da manhã", por_que: "Adaptógeno — regula eixo HPA, reduz cortisol crônico em 4–6 semanas", prioridade: 2 },
  { nome: "Vitamina C", dose: "1000mg", quando: "Almoço ou lanche", por_que: "Reduz pico de cortisol pós-estresse. Antioxidante anti-inflamatório", prioridade: 4 },
  { nome: "Chá de Hibisco", dose: "2 xícaras", quando: "1 manhã, 1 tarde/noite", por_que: "Diurético natural, reduz retenção hídrica, anti-inflamatório", prioridade: 3 },
  { nome: "Chá de Camomila", dose: "1 xícara", quando: "À noite, 30–60 min antes de dormir", por_que: "Ansiolítico natural, reduz cortisol noturno, melhora qualidade do sono", prioridade: 5 },
];

const CRONOGRAMA = [
  { dia: "Seg", atividade: "Musculação", duracao: "45–60 min", foco: "Costas + Bíceps", tipo: "força" },
  { dia: "Ter", atividade: "Pilates", duracao: "50–60 min", foco: "Core, postura e mobilidade", tipo: "pilates" },
  { dia: "Qua", atividade: "Musculação", duracao: "45–60 min", foco: "Peito + Tríceps + Ombro", tipo: "força" },
  { dia: "Qui", atividade: "Caminhada + Cerâmica", duracao: "20 min + aula", foco: "Descompressão ativa — dia anti-estresse ⭐", tipo: "leve" },
  { dia: "Sex", atividade: "Musculação", duracao: "45–60 min", foco: "Pernas + Glúteos", tipo: "força" },
  { dia: "Sáb", atividade: "Pilates", duracao: "50–60 min", foco: "Equilíbrio + Flexibilidade + Core", tipo: "pilates" },
  { dia: "Dom", atividade: "Descanso ativo", duracao: "Livre", foco: "Caminhada leve, praça, parque — sem obrigação", tipo: "descanso" },
];

const SEMANAS_CARDAPIO = [
  {
    semana: 1, foco: "Reset & Adaptação",
    descricao: "Eliminar refrigerante zero, ajustar café, cortar sal processado, começar a mover",
    dias: [
      { dia: "Segunda", manha: "2 ovos mexidos + 1 torrada integral + café puro | Lanche: 1 banana + 4 castanhas-do-pará", tarde: "Arroz integral + feijão + frango grelhado + salada pepino/tomate | Lanche: Chá de hibisco + melancia | Jantar: Sopa de legumes + 1 omelete" },
      { dia: "Terça", manha: "Iogurte grego + mel + aveia + banana amassada | Lanche: 1 maçã + pasta de amendoim", tarde: "Batata-doce + tilápia grelhada com limão + brócolis | Lanche: Pepino + hummus | Jantar: Frango desfiado + abobrinha refogada + salada" },
      { dia: "Quarta", manha: "Tapioca + 2 ovos mexidos + queijo branco | Lanche: Meio abacate + 1 torrada", tarde: "Arroz integral + lentilha + carne moída + couve | Lanche: Chá de camomila + castanhas | Jantar: Omelete 3 ovos + salada verde" },
      { dia: "Quinta 🎨", manha: "Vitamina: leite + banana + aveia + mel | Lanche: 1 laranja + amêndoas", tarde: "Macarrão integral + frango + molho tomate natural | Lanche: Iogurte grego | Jantar: Sopa de abóbora com gengibre + queijo branco" },
      { dia: "Sexta", manha: "2 ovos mexidos + 1 torrada + café | Lanche: Morangos + iogurte grego", tarde: "Arroz integral + feijão + peixe assado + salada | Lanche: Chá de hibisco + melancia | Jantar: Frango + batata-doce + salada de folhas" },
      { dia: "Sábado", manha: "Panqueca banana+aveia (1 banana + 2 ovos + 3 col. aveia) | Lanche: Smoothie verde", tarde: "Frango ao forno + arroz integral + legumes assados | Lanche: Meio abacate + limão | Jantar: Salmão + salada colorida + azeite" },
      { dia: "Domingo", manha: "Omelete 3 ovos + queijo + tomate + suco laranja | Lanche: Castanhas + banana", tarde: "Patinho grelhado + batata-doce + salada variada | Lanche: Chá hibisco + torrada + ricota | Jantar: Caldo de frango caseiro com legumes" },
    ],
  },
  {
    semana: 2, foco: "Anti-inflamatório Intenso",
    descricao: "Introduzir cúrcuma e gengibre em todas as refeições. Ashwagandha todos os dias",
    dias: [
      { dia: "Segunda", manha: "Aveia cremosa + cúrcuma + mel | Lanche: 1 kiwi + 4 castanhas", tarde: "Arroz integral + grão-de-bico + frango ao gengibre | Lanche: Chá de gengibre com limão | Jantar: Peixe assado com cúrcuma + batata-doce" },
      { dia: "Terça", manha: "Iogurte grego + granola + frutas vermelhas | Lanche: 1 maçã + amêndoas", tarde: "Batata-doce + salmão grelhado + brócolis | Lanche: Pepino + hummus | Jantar: Frango com curry suave + arroz + salada" },
      { dia: "Quarta", manha: "Tapioca + ovo mexido + tomate + manjericão | Lanche: Abacate + limão + chia", tarde: "Lentilha com legumes + frango desfiado + cenoura | Lanche: Chá de camomila + 2 tâmaras | Jantar: Creme de abóbora com gengibre + torrada" },
      { dia: "Quinta 🎨", manha: "Vitamina verde: espinafre + banana + gengibre | Lanche: 1 laranja + castanhas", tarde: "Atum + arroz integral + brócolis + batata-doce | Lanche: Iogurte grego + mel | Jantar: Omelete de espinafre + queijo + salada" },
      { dia: "Sexta", manha: "2 ovos mexidos + abacate amassado + torrada | Lanche: Frutas vermelhas + cottage", tarde: "Arroz integral + feijão + frango + cúrcuma no arroz | Lanche: Chá hibisco + melão | Jantar: Peixe grelhado + abobrinha + tomate assado" },
      { dia: "Sábado", manha: "Açaí bowl: açaí puro + banana + granola | Lanche: Smoothie verde", tarde: "Frango assado com ervas + arroz + legumes coloridos | Lanche: Abacate + chia + limão | Jantar: Salmão com cúrcuma + batata-doce + aspargos" },
      { dia: "Domingo", manha: "Tapioca recheada + ovo + queijo + tomate | Lanche: Frutas + iogurte + mel", tarde: "Carne magra + arroz + feijão + couve | Lanche: Chá hibisco + 1 quadrado chocolate 70% | Jantar: Caldo de legumes com frango + gengibre" },
    ],
  },
  {
    semana: 3, foco: "Rica em Proteína",
    descricao: "Foco em musculação e recuperação muscular. Proteína em todas as refeições",
    dias: [
      { dia: "Segunda", manha: "3 ovos mexidos + 1 torrada + café | Lanche: Cottage + torrada", tarde: "Frango 200g + arroz integral + feijão + salada | Lanche: Iogurte grego + pasta de amendoim | Jantar: Atum + omelete 2 ovos + salada" },
      { dia: "Terça", manha: "Vitamina: leite + banana + aveia + pasta amendoim | Lanche: Iogurte grego + granola", tarde: "Tilápia 200g + arroz integral + brócolis + cenoura | Lanche: 1 ovo cozido + torrada | Jantar: Frango desfiado 150g + batata-doce + salada" },
      { dia: "Quarta", manha: "Tapioca proteica: 3 ovos + cottage + tomate | Lanche: Castanhas + 1 fruta", tarde: "Patinho moído 150g + lentilha + couve + cenoura | Lanche: Chá camomila + ovo cozido | Jantar: Sopa de frango com legumes + batata-baroa" },
      { dia: "Quinta 🎨", manha: "Omelete proteica: 3 ovos + espinafre + queijo | Lanche: Banana + pasta amendoim", tarde: "Salmão 150g + arroz integral + aspargos | Lanche: Iogurte grego + mel + nozes | Jantar: Frango ao pesto leve + salada" },
      { dia: "Sexta", manha: "2 ovos + abacate amassado + torrada | Lanche: Cottage + 1 fruta", tarde: "Arroz integral + feijão + frango 180g + salada colorida | Lanche: Chá hibisco + castanhas | Jantar: Peixe grelhado + batata-doce + salada" },
      { dia: "Sábado", manha: "Panqueca proteica: banana + 2 ovos + aveia | Lanche: Smoothie proteico", tarde: "Frango assado + arroz integral + legumes variados | Lanche: Iogurte grego + frutas vermelhas | Jantar: Salmão 200g + salada verde + azeite" },
      { dia: "Domingo", manha: "Ovos pochê + torrada + suco laranja | Lanche: Frutas + castanhas", tarde: "Carne magra + arroz + feijão + abóbora | Lanche: Chá hibisco + ricota + torrada | Jantar: Caldo proteico: frango + batata + legumes" },
    ],
  },
  {
    semana: 4, foco: "Consolidação e Variedade",
    descricao: "Rotina automática. Avaliar resultados, ajustar o que não colou, criar o hábito permanente",
    dias: [
      { dia: "Segunda", manha: "Aveia cremosa + leite + banana + canela | Lanche: 1 kiwi + amêndoas", tarde: "Arroz integral + feijão preto + frango + couve | Lanche: Chá hibisco + melancia | Jantar: Sopa de lentilha com cúrcuma + torrada" },
      { dia: "Terça", manha: "Iogurte grego + frutas vermelhas + mel + chia | Lanche: 1 maçã + pasta amendoim", tarde: "Tilápia assada + batata-doce + brócolis | Lanche: Pepino + torrada + ricota | Jantar: Frango com legumes no vapor + arroz integral" },
      { dia: "Quarta", manha: "Tapioca + 2 ovos + queijo + tomate seco | Lanche: Meio abacate + torrada", tarde: "Quinoa + frango + legumes coloridos | Lanche: Chá camomila + 2 tâmaras | Jantar: Omelete 3 ovos + espinafre + queijo + salada" },
      { dia: "Quinta 🎨", manha: "Vitamina: leite de amêndoa + banana + espinafre + mel | Lanche: 1 laranja + castanhas", tarde: "Salmão grelhado + arroz integral + aspargos | Lanche: Iogurte grego + granola | Jantar: Sopa leve de vegetais + frango desfiado" },
      { dia: "Sexta", manha: "2 ovos estrelados no azeite + torrada + abacate | Lanche: Frutas vermelhas + cottage", tarde: "Arroz integral + feijão + peixe assado + salada | Lanche: Chá hibisco + melão | Jantar: Frango ao forno + batata-doce + salada" },
      { dia: "Sábado", manha: "Açaí bowl: açaí + banana + granola + frutas | Lanche: Smoothie verde", tarde: "Churrasco saudável: carne magra + salada + batata-doce | Lanche: Abacate + sementes + torrada | Jantar: Salmão grelhado + quinoa + legumes" },
      { dia: "Domingo", manha: "Omelete recheada 3 ovos + queijo + tomate | Lanche: Castanhas + banana", tarde: "Frango assado + arroz integral + feijão + salada | Lanche: Chá hibisco + torrada + pasta amendoim | Jantar: Caldo caseiro de legumes + frango" },
    ],
  },
];

const EXAMES = [
  { nome: "Cortisol salivar (4 pontos: 8h, 12h, 16h, 20h)", quando: "Semana 2", motivo: "Mede o ritmo circadiano real do cortisol — mais fiel que o sanguíneo" },
  { nome: "TSH + T4 livre", quando: "Semana 2", motivo: "Tireoide desregulada causa retenção, cansaço e não responde à dieta" },
  { nome: "Hemograma completo + PCR", quando: "Semana 2", motivo: "Inflamação sistêmica e anemia impactam cortisol e retenção" },
  { nome: "Vitamina D", quando: "Semana 2", motivo: "Deficiência eleva cortisol e piora humor e imunidade" },
  { nome: "Insulina em jejum + glicemia", quando: "Semana 3", motivo: "Resistência insulínica eleva cortisol e piora retenção e inchaço" },
];

/* ─── Componente principal ─── */
export default function Cortisol() {
  const [secao, setSecao] = useState("rotina");
  const [rotinaDone, setRotinaDone] = useState(() => db.get(`cortisol_rotina_${todayStr()}`, []));
  const [massagemStep, setMassagemStep] = useState(null);
  const [semana, setSemana] = useState(0);
  const [diaAberto, setDiaAberto] = useState(null);
  const [suplAberto, setSuplAberto] = useState(null);

  const toggleRotina = (id) => {
    const novo = rotinaDone.includes(id) ? rotinaDone.filter(x => x !== id) : [...rotinaDone, id];
    setRotinaDone(novo);
    db.set(`cortisol_rotina_${todayStr()}`, novo);
  };

  const secoes = [
    { id: "rotina", label: "Rotina" },
    { id: "massagem", label: "Massagem" },
    { id: "respiracao", label: "Respiração" },
    { id: "exercicios", label: "Exercícios" },
    { id: "suplementos", label: "Suplementos" },
    { id: "cardapio", label: "Cardápio" },
    { id: "exames", label: "Exames" },
  ];

  const tipoCorBg = { força: "#7c3aed18", pilates: "#d6338418", leve: "#05996918", descanso: "#c4a0b520" };
  const tipoCorText = { força: "#7c3aed", pilates: "#d63384", leve: "#059669", descanso: "#9b7090" };

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold text-[#2d1b2e]">Protocolo Cortisol</h1>
        <p className="text-sm text-[#c4a0b5]">Isabele · 4 semanas · Rosto de cortisol</p>
      </div>

      {/* Nav horizontal */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pb-3">
        {secoes.map(s => (
          <button key={s.id} onClick={() => setSecao(s.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${secao === s.id ? "border-[#d63384] bg-[#d6338418] text-[#d63384]" : "border-[#fde8f0] bg-white text-[#c4a0b5]"}`}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-3">

        {/* ── ROTINA ── */}
        {secao === "rotina" && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#2d1b2e]">Do acordar ao dormir</p>
              <span className="text-xs font-bold text-[#d63384]">{rotinaDone.length}/{ROTINA.length} feitos</span>
            </div>
            <div className="w-full bg-[#fde8f0] rounded-full h-2 mb-1">
              <div className="h-2 rounded-full transition-all" style={{ width: `${Math.round((rotinaDone.length / ROTINA.length) * 100)}%`, background: "linear-gradient(90deg, #d63384, #7c3aed)" }} />
            </div>
            {ROTINA.map(item => (
              <Card key={item.id}>
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] font-bold text-[#d63384] bg-[#d6338412] px-2 py-0.5 rounded-full">{item.hora}</span>
                    </div>
                    <p className="font-semibold text-sm text-[#2d1b2e] mt-1">{item.acao}</p>
                    <p className="text-xs text-[#c4a0b5] mt-0.5 leading-relaxed">{item.detalhe}</p>
                  </div>
                  <button onClick={() => toggleRotina(item.id)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${rotinaDone.includes(item.id) ? "bg-[#05996918] border-[#059669] text-[#059669]" : "border-[#fde8f0] text-transparent"}`}>✓</button>
                </div>
              </Card>
            ))}
          </>
        )}

        {/* ── MASSAGEM ── */}
        {secao === "massagem" && (
          <>
            <Card className="bg-[#fff0f5]">
              <p className="text-sm font-bold text-[#d63384] mb-1">💆‍♀️ Massagem Linfática Facial</p>
              <p className="text-xs text-[#9b7090]">5 minutos · Ao acordar · Antes de qualquer produto · Com soro ou óleo facial</p>
              <p className="text-xs text-[#c4a0b5] mt-2">💡 Sempre em direção ao pescoço e orelha — nunca o contrário. Pressão leve como acariciar um gato.</p>
            </Card>
            {MASSAGEM.map(step => (
              <Card key={step.n}>
                <button className="w-full flex items-center gap-3 text-left" onClick={() => setMassagemStep(massagemStep === step.n ? null : step.n)}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 text-white" style={{ background: "linear-gradient(135deg, #d63384, #7c3aed)" }}>
                    {step.n}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-[#2d1b2e]">{step.parte}</p>
                  </div>
                  <span className="text-[#d4b8c8] text-xs">{massagemStep === step.n ? "▲" : "▼"}</span>
                </button>
                {massagemStep === step.n && (
                  <div className="mt-3 pt-3 border-t border-[#fde8f0]">
                    <p className="text-sm text-[#6b4e5e] leading-relaxed">{step.instrucao}</p>
                  </div>
                )}
              </Card>
            ))}
          </>
        )}

        {/* ── RESPIRAÇÃO ── */}
        {secao === "respiracao" && (
          <>
            <Card className="bg-[#fff0f5]">
              <p className="text-sm font-bold text-[#7c3aed] mb-1">🫁 Técnica 4-7-8 — Dr. Andrew Weil</p>
              <p className="text-xs text-[#9b7090]">Reduz cortisol em minutos ativando o sistema parassimpático.</p>
              <p className="text-xs text-[#c4a0b5] mt-1">Use: ao acordar, antes de dormir, antes de reunião estressante, ao sentir ansiedade.</p>
            </Card>
            <Card><Respiracao /></Card>
          </>
        )}

        {/* ── EXERCÍCIOS ── */}
        {secao === "exercicios" && (
          <>
            <Card className="bg-[#fff0f5]">
              <p className="text-sm font-bold text-[#d63384] mb-2">📋 Dicas para cortisol alto</p>
              {["Prefira treinos de 45–60 min. Acima de 90 min eleva cortisol.","Peso moderado com mais repetições é melhor do que carga máxima.","Pilates ativa o parassimpático sem elevar cortisol.","Não treinar em jejum — tome café da manhã antes.","Quinta é o dia mais importante: cerâmica + caminhada = maior redução de cortisol da semana."].map((d, i) => (
                <p key={i} className="text-xs text-[#9b7090] mt-1">• {d}</p>
              ))}
            </Card>
            {CRONOGRAMA.map(item => (
              <Card key={item.dia}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                    style={{ background: tipoCorBg[item.tipo], color: tipoCorText[item.tipo] }}>
                    {item.dia}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-[#2d1b2e]">{item.atividade}</p>
                    <p className="text-xs text-[#c4a0b5]">{item.duracao} · {item.foco}</p>
                  </div>
                </div>
              </Card>
            ))}
          </>
        )}

        {/* ── SUPLEMENTOS ── */}
        {secao === "suplementos" && (
          <>
            <Card className="bg-[#fff0f5]">
              <p className="text-sm font-bold text-[#d63384] mb-1">💊 Ordem de prioridade</p>
              <p className="text-xs text-[#9b7090]">Nenhum precisa de receita. Consulte médico se tiver hipertensão ou uso de medicamento.</p>
            </Card>
            {[...SUPLEMENTOS].sort((a, b) => a.prioridade - b.prioridade).map(s => (
              <Card key={s.nome}>
                <button className="w-full flex items-start gap-3 text-left" onClick={() => setSuplAberto(suplAberto === s.nome ? null : s.nome)}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 text-white bg-[#d63384]">
                    {s.prioridade}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-[#2d1b2e]">{s.nome}</p>
                    <div className="flex gap-2 mt-0.5">
                      <span className="text-xs text-[#d63384] font-semibold">{s.dose}</span>
                      <span className="text-xs text-[#c4a0b5]">· {s.quando}</span>
                    </div>
                  </div>
                  <span className="text-[#d4b8c8] text-xs">{suplAberto === s.nome ? "▲" : "▼"}</span>
                </button>
                {suplAberto === s.nome && (
                  <div className="mt-3 pt-3 border-t border-[#fde8f0]">
                    <p className="text-xs text-[#6b4e5e] leading-relaxed">💡 {s.por_que}</p>
                  </div>
                )}
              </Card>
            ))}
          </>
        )}

        {/* ── CARDÁPIO ── */}
        {secao === "cardapio" && (
          <>
            <div className="flex gap-2">
              {SEMANAS_CARDAPIO.map((s, i) => (
                <button key={i} onClick={() => { setSemana(i); setDiaAberto(null); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all ${semana === i ? "border-[#d63384] bg-[#d6338418] text-[#d63384]" : "border-[#fde8f0] bg-white text-[#c4a0b5]"}`}>
                  S{i + 1}
                </button>
              ))}
            </div>
            <Card className="bg-[#fff0f5]">
              <p className="text-sm font-bold text-[#d63384]">Semana {SEMANAS_CARDAPIO[semana].semana} — {SEMANAS_CARDAPIO[semana].foco}</p>
              <p className="text-xs text-[#9b7090] mt-1">{SEMANAS_CARDAPIO[semana].descricao}</p>
            </Card>
            {SEMANAS_CARDAPIO[semana].dias.map((dia, i) => (
              <Card key={i}>
                <button className="w-full flex items-center justify-between text-left" onClick={() => setDiaAberto(diaAberto === i ? null : i)}>
                  <p className="font-semibold text-sm text-[#2d1b2e]">{dia.dia}</p>
                  <span className="text-[#d4b8c8] text-xs">{diaAberto === i ? "▲" : "▼"}</span>
                </button>
                {diaAberto === i && (
                  <div className="mt-3 border-t border-[#fde8f0] pt-3 space-y-3">
                    <div>
                      <p className="text-xs font-bold text-[#d63384] mb-1">☀️ Manhã</p>
                      <p className="text-xs text-[#6b4e5e] leading-relaxed">{dia.manha}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#059669] mb-1">🌿 Tarde & Noite</p>
                      <p className="text-xs text-[#6b4e5e] leading-relaxed">{dia.tarde}</p>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </>
        )}

        {/* ── EXAMES ── */}
        {secao === "exames" && (
          <>
            <Card className="bg-[#fff0f5]">
              <p className="text-sm font-bold text-[#d63384] mb-1">🔬 Agendar na semana 2 ou 3</p>
              <p className="text-xs text-[#9b7090]">Especialidade: Endocrinologista ou Clínico Geral. Leve o protocolo impresso — facilita a consulta.</p>
            </Card>
            {EXAMES.map((e, i) => (
              <Card key={i}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#d6338418] flex items-center justify-center text-[#d63384] text-sm font-black flex-shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#2d1b2e]">{e.nome}</p>
                    <span className="text-[10px] font-bold text-[#7c3aed] bg-[#7c3aed12] px-2 py-0.5 rounded-full">{e.quando}</span>
                    <p className="text-xs text-[#c4a0b5] mt-1 leading-relaxed">{e.motivo}</p>
                  </div>
                </div>
              </Card>
            ))}
          </>
        )}

      </div>
    </div>
  );
}
