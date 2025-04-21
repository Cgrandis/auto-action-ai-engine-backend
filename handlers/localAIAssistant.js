const { prisma, setSchema } = require('../db');
const { gerarRespostaGemini } = require('./geminiAI');

async function loadCorretoraContext() {
  await setSchema('nakane_imoveis');

  const empresa = await prisma.empresa.findFirst();
  const corretores = await prisma.corretor.findMany();

  if (!empresa) {
    console.warn('⚠️ Nenhuma empresa encontrada no schema nakane_imoveis.');
    return null;
  }

  return {
    empresa: empresa.nome,
    endereco: empresa.endereco,
    instagram: empresa.instagram,
    corretores: corretores.map(c => c.nome),
  };
}

async function gerarRespostaIA(userMessage, customerId, conversationHistory = [], schema) {
  const contexto = await loadCorretoraContext(schema);

  if (!contexto) {
    return 'Desculpe, houve um erro ao carregar os dados da corretora.';
  }

  const validConversationHistory = Array.isArray(conversationHistory) ? conversationHistory : [];

  const conversationContext = validConversationHistory.map((msg, idx) => {
    return `${idx % 2 === 0 ? "Cliente" : "Assistente"}: ${msg}`;
  }).join("\n");

  let prompt = `
    Você é um assistente virtual da corretora de imóveis "${contexto.empresa}".
    A corretora está localizada em ${contexto.endereco}.
    O instagram da corretora é ${contexto.instagram}.
    Quando perguntado sobre os corretores, você pode mencionar os seguintes nomes: ${contexto.corretores.join(', ')}.
    Seu papel é responder dúvidas e ajudar a agendar visitas aos imóveis.

    Histórico da conversa:
    ${conversationContext}

    Mensagem do cliente: "${userMessage}"
  `;

  return await gerarRespostaGemini(userMessage, prompt);
}

module.exports = {
  gerarRespostaIA,
};
