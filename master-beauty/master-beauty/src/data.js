export const MHB = {
  user: { name: "Isabele", role: "Hunter · Beauty", initials: "IS" },

  agenda: [
    { id: "ev1", time: "09:30", end: "09:45", title: "Daily — Squad Hunting Beauty", kind: "meet", people: 6, tag: "Rotina" },
    { id: "ev2", time: "11:00", end: "11:45", title: "Negociação · Glowé Cosméticos", kind: "meet", people: 3, tag: "Pipeline", hot: true },
    { id: "ev3", time: "13:00", end: "13:30", title: "Almoço — bloqueado", kind: "block", people: 0, tag: "Pessoal" },
    { id: "ev4", time: "14:00", end: "15:00", title: "Review de pipeline com liderança", kind: "meet", people: 4, tag: "Interno" },
    { id: "ev5", time: "16:30", end: "17:00", title: "Call onboarding · Dermavita", kind: "meet", people: 2, tag: "Onboarding" },
  ],

  emails: [
    { id: "m1", from: "Renata · Glowé", subject: "Re: proposta de comissão e prazo de repasse", preview: "Oi Isabele, conversamos internamente e topamos os 14%, mas precisamos alinhar o prazo de repasse para…", time: "08:12", unread: true, needsReply: true, label: "Pipeline" },
    { id: "m2", from: "Carlos Bueno (Liderança)", subject: "Números do trimestre — hunting beauty", preview: "Pode me mandar o consolidado de novas marcas fechadas até sexta? Quero levar pro QBR.", time: "07:54", unread: true, needsReply: true, label: "Interno" },
    { id: "m3", from: "Dermavita Oficial", subject: "Documentação para cadastro de seller", preview: "Segue em anexo o contrato social e os dados bancários para iniciarmos o onboarding na plataforma.", time: "Ontem", unread: true, needsReply: true, label: "Onboarding" },
    { id: "m4", from: "Marina · Bloom", subject: "Podemos remarcar nossa call?", preview: "Surgiu um imprevisto aqui, conseguimos mover para quinta no mesmo horário?", time: "Ontem", unread: false, needsReply: true, label: "Pipeline" },
  ],

  tasks: [
    { id: "t1", title: "Fechar proposta da Glowé (14% + repasse 30d)", due: "Hoje", priority: "alta", done: false, ctx: "Pipeline" },
    { id: "t2", title: "Consolidar marcas fechadas no trimestre p/ Carlos", due: "Hoje", priority: "alta", done: false, ctx: "Interno" },
    { id: "t3", title: "Enviar contrato de onboarding · Dermavita", due: "Hoje", priority: "média", done: false, ctx: "Onboarding" },
    { id: "t4", title: "Mapear 5 novas marcas de skincare clean", due: "Amanhã", priority: "média", done: false, ctx: "Hunting" },
    { id: "t5", title: "Atualizar planilha de pipeline (semana)", due: "Hoje", priority: "baixa", done: true, ctx: "Pipeline" },
  ],

  drive: [
    { id: "d1", name: "Pipeline Hunting Beauty — 2026", type: "sheet", when: "editado há 20 min" },
    { id: "d2", name: "Proposta comercial · Glowé", type: "slides", when: "editado há 2 h" },
    { id: "d3", name: "Contrato onboarding · Dermavita", type: "doc", when: "ontem" },
    { id: "d4", name: "Benchmark de comissões — categoria", type: "sheet", when: "ontem" },
    { id: "d5", name: "Deck QBR — fechamentos do trimestre", type: "slides", when: "2 dias" },
  ],

  whatsapp: [
    { id: "w1", name: "Renata (Glowé)", preview: "Perfeito, mando o aceite por e-mail ainda hoje.", time: "08:30", unread: 2 },
    { id: "w2", name: "Fornecedor Dermavita", preview: "Já enviei a documentação no seu e-mail!", time: "08:01", unread: 1 },
    { id: "w3", name: "Squad Beauty (grupo)", preview: "Marina: alguém pega a call das 11?", time: "07:40", unread: 0 },
    { id: "w4", name: "Bloom Cosméticos", preview: "Conseguimos remarcar pra quinta?", time: "ontem", unread: 0 },
  ],

  notes: "Glowé: piso de 14% ok, lutar por exclusividade de lançamento.\nDermavita: confirmar frete full.\nIdeia: criar trilha de hunting p/ skincare coreano.",

  aiSuggestions: [
    "Resumir minha inbox de hoje",
    "Quais são minhas 3 prioridades agora?",
    "Gerar debriefing da última reunião",
    "Rascunhar resposta para a Glowé",
  ],

  resultados: [
    { id: "r1", marca: "Glowé Cosméticos",   cust: "CUST-00123456", lojaOficial: "LO-98201", gmvMeta: 50000, gmvRealizado: 47200, pedidos: 312, ticketMedio: 151.28, periodoRef: "Jun/2026", status: "Abaixo da meta" },
    { id: "r2", marca: "Dermavita",           cust: "CUST-00234567", lojaOficial: "LO-87340", gmvMeta: 30000, gmvRealizado: 33800, pedidos: 198, ticketMedio: 170.71, periodoRef: "Jun/2026", status: "Acima da meta" },
    { id: "r3", marca: "Bloom Cosméticos",    cust: "CUST-00345678", lojaOficial: "LO-76512", gmvMeta: 20000, gmvRealizado: 18500, pedidos: 145, ticketMedio: 127.59, periodoRef: "Jun/2026", status: "Abaixo da meta" },
    { id: "r4", marca: "Skincare Coreana X",  cust: "CUST-00456789", lojaOficial: "LO-65403", gmvMeta: 80000, gmvRealizado: 82100, pedidos: 520, ticketMedio: 157.88, periodoRef: "Jun/2026", status: "Acima da meta" },
    { id: "r5", marca: "BeautyBrand W",       cust: "CUST-00567890", lojaOficial: "LO-54290", gmvMeta: 45000, gmvRealizado: 45000, pedidos: 290, ticketMedio: 155.17, periodoRef: "Jun/2026", status: "Meta atingida" },
    { id: "r6", marca: "Cosméticos V",        cust: "CUST-00678901", lojaOficial: "LO-43182", gmvMeta: 20000, gmvRealizado: 21400, pedidos: 175, ticketMedio: 122.29, periodoRef: "Jun/2026", status: "Acima da meta" },
  ],

  pipeline: [
    { id: "p1", name: "Glowé Cosméticos", stage: "Negotiation", segment: "Skincare", sellerOrBrand: "Brand", gmvMonth: 50000, gmvYear: 600000, tiktok: false, shoppee: true, notes: "Proposta enviada — aceite dos 14%" },
    { id: "p2", name: "Dermavita", stage: "Setup", segment: "Dermocosméticos", sellerOrBrand: "Brand", gmvMonth: 30000, gmvYear: 360000, tiktok: false, shoppee: false, notes: "Documentação enviada" },
    { id: "p3", name: "Bloom Cosméticos", stage: "Not initiated", segment: "Maquiagem", sellerOrBrand: "Brand", gmvMonth: 20000, gmvYear: 240000, tiktok: true, shoppee: false, notes: "Remarcar call pra quinta" },
    { id: "p4", name: "Skincare Coreana X", stage: "Negotiation", segment: "Skincare", sellerOrBrand: "Brand", gmvMonth: 80000, gmvYear: 960000, tiktok: true, shoppee: true, notes: "" },
    { id: "p5", name: "BeautyBrand W", stage: "3P Go Live", segment: "Haircare", sellerOrBrand: "Brand", gmvMonth: 45000, gmvYear: 540000, tiktok: true, shoppee: false, notes: "Go live semana que vem" },
    { id: "p6", name: "Cosméticos V", stage: "Onboarded", segment: "Skincare", sellerOrBrand: "Seller", gmvMonth: 20000, gmvYear: 240000, tiktok: false, shoppee: true, notes: "Onboarding concluído ✓" },
  ],
};
