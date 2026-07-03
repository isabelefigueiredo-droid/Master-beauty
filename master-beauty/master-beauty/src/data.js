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

  pipeline: [
    { id: "p1", name: "Glowé Cosméticos", stage: "Negotiation", segment: "Skincare", sellerOrBrand: "Brand", gmvMonth: 50000, gmvYear: 600000, tiktok: false, shoppee: true, notes: "Proposta enviada — aceite dos 14%",
      items: [
        { itemId: "MLB3201847562", itemName: "Sérum Vitamina C Glowé 30ml", salesVolume: 1240, price: 89.90 },
        { itemId: "MLB3201847891", itemName: "Hidratante Facial FPS 50 Glowé 60g", salesVolume: 870, price: 129.90 },
        { itemId: "MLB3201853210", itemName: "Tônico Facial Glowé Ácido Hialurônico 120ml", salesVolume: 540, price: 74.90 },
      ]
    },
    { id: "p2", name: "Dermavita", stage: "Setup", segment: "Dermocosméticos", sellerOrBrand: "Brand", gmvMonth: 30000, gmvYear: 360000, tiktok: false, shoppee: false, notes: "Documentação enviada",
      items: [
        { itemId: "MLB2987634510", itemName: "Sabonete Dermatológico Dermavita 150ml", salesVolume: 980, price: 45.90 },
        { itemId: "MLB2987641023", itemName: "Creme Hidratante Dermavita Pele Seca 200g", salesVolume: 620, price: 79.90 },
      ]
    },
    { id: "p3", name: "Bloom Cosméticos", stage: "Not initiated", segment: "Maquiagem", sellerOrBrand: "Brand", gmvMonth: 20000, gmvYear: 240000, tiktok: true, shoppee: false, notes: "Remarcar call pra quinta",
      items: [
        { itemId: "MLB4102938471", itemName: "Base Líquida Bloom Cobertura Total 30ml", salesVolume: 430, price: 99.90 },
        { itemId: "MLB4102938652", itemName: "Paleta de Sombras Bloom Nude 12 cores", salesVolume: 310, price: 149.90 },
      ]
    },
    { id: "p4", name: "Skincare Coreana X", stage: "Negotiation", segment: "Skincare", sellerOrBrand: "Brand", gmvMonth: 80000, gmvYear: 960000, tiktok: true, shoppee: true, notes: "",
      items: [
        { itemId: "MLB5023847291", itemName: "Sérum Snail Mucin 96% 100ml", salesVolume: 2100, price: 119.90 },
        { itemId: "MLB5023847450", itemName: "Cushion SPF50+ PA++++ 15g", salesVolume: 1560, price: 189.90 },
        { itemId: "MLB5023851002", itemName: "Toner BHA Exfoliante 200ml", salesVolume: 980, price: 94.90 },
        { itemId: "MLB5023851378", itemName: "Máscara Coreana Hidratação 25ml (kit 5un)", salesVolume: 2840, price: 59.90 },
      ]
    },
    { id: "p5", name: "BeautyBrand W", stage: "3P Go Live", segment: "Haircare", sellerOrBrand: "Brand", gmvMonth: 45000, gmvYear: 540000, tiktok: true, shoppee: false, notes: "Go live semana que vem",
      items: [
        { itemId: "MLB6198273041", itemName: "Shampoo Reconstrutor BeautyBrand W 300ml", salesVolume: 1320, price: 69.90 },
        { itemId: "MLB6198273289", itemName: "Máscara Capilar Nutrição Intensa 500g", salesVolume: 890, price: 89.90 },
        { itemId: "MLB6198280173", itemName: "Óleo Finalizador Brilho 60ml", salesVolume: 670, price: 54.90 },
      ]
    },
    { id: "p6", name: "Cosméticos V", stage: "Onboarded", segment: "Skincare", sellerOrBrand: "Seller", gmvMonth: 20000, gmvYear: 240000, tiktok: false, shoppee: true, notes: "Onboarding concluído ✓",
      items: [
        { itemId: "MLB7341029857", itemName: "Kit Skincare Básico Cosméticos V (3 itens)", salesVolume: 760, price: 199.90 },
        { itemId: "MLB7341030012", itemName: "Protetor Solar Facial FPS 60 50ml", salesVolume: 1100, price: 79.90 },
      ]
    },
  ],
};
