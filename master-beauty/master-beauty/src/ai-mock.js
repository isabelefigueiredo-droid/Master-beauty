export function aiAnswer(q) {
  const s = q.toLowerCase();
  if (s.includes("inbox") || s.includes("resumir") || s.includes("e-mail") || s.includes("email"))
    return "4 e-mails pedem resposta hoje. Por urgência:\n\n— Glowé (Renata): aceitou os 14%, falta fechar o prazo de repasse. É o que destrava o maior negócio da semana.\n— Carlos (liderança): quer o consolidado do trimestre até sexta.\n— Dermavita: já enviou a documentação — basta seguir com o onboarding.\n— Bloom (Marina): pediu para remarcar a call para quinta.\n\nQuer que eu rascunhe a resposta da Glowé primeiro?";
  if (s.includes("priorida"))
    return "Suas 3 prioridades agora:\n\n1. Fechar a proposta da Glowé (14% + repasse 30d) — trava o maior negócio do mês.\n2. Preparar a reunião das 11h com a Glowé — começa em 18 min.\n3. Consolidar os fechamentos do trimestre para o Carlos antes de sexta.\n\nO resto pode esperar a tarde.";
  if (s.includes("glow") || s.includes("rascunh") || s.includes("resposta"))
    return "Rascunho de resposta — Glowé:\n\n\"Oi Renata, ótima notícia. Fechamos nos 14%. Sobre o repasse, conseguimos trabalhar com 30 dias corridos após a venda. Te envio a minuta ainda hoje para assinatura. Seguimos com a exclusividade do lançamento de skincare, combinado?\"\n\nQuer que eu ajuste o tom ou já deixo pronto para enviar?";
  if (s.includes("dermavita") || s.includes("onboarding"))
    return "Dermavita já enviou contrato social e dados bancários. Pendências para o onboarding:\n\n— Confirmar frete Full.\n— Validar documentação com o Jurídico (contrato no Drive).\n— Agendar go-live.\n\nPosso abrir as 3 tarefas e marcar a call de onboarding das 16h30?";
  return "Posso te ajudar com a inbox, a agenda, as tarefas e os arquivos do Drive. Tente, por exemplo: \"prepara a reunião das 11h\", \"quais minhas prioridades?\" ou \"o que ficou pendente com a Dermavita?\".";
}
