require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getPromptContext } = require('../services/aiPromptHandler');
const { prisma, setSchema } = require('./db');

/**
 * Gera resposta com base no histórico da conversa + resumo anterior + nova mensagem
 * @param {string} userMessage - Mensagem atual do cliente
 * @param {string} userNumber - Número do cliente no WhatsApp
 * @returns {Promise<string>}
 */
async function gerarRespostaGemini(userMessage, userNumber) {
  try {
    await setSchema('autoaction');

    if (!userNumber) {
      console.error('❌ Erro: userNumber não fornecido para gerarRespostaGemini');
      throw new Error('Número do cliente não fornecido.');
    }

    const model = new GoogleGenerativeAI(process.env.API_KEY).getGenerativeModel({ model: 'gemini-2.0-flash' });

    const resumo = await prisma.conversaResumo.findUnique({
      where: { numero: userNumber }
    });

    const mensagens = await prisma.message.findMany({
      where: {
        OR: [
          { from: userNumber },
          { to: userNumber }
        ]
      },
      orderBy: { createdAt: 'asc' },
      take: 10
    });

    const historico = mensagens.map((m) => {
      const prefix = m.direction === 'received' ? 'Cliente:' : 'Assistente:';
      return `${prefix} ${m.body}`;
    }).join('\n');

    const promptBase = getPromptContext();

    const contextoCompleto = resumo
      ? `Resumo da conversa anterior:\n${resumo.resumo}\n\nÚltima interação:\nUsuário: ${resumo.ultimaMensagemUsuario}\nAssistente: ${resumo.ultimaMensagemAssistente}\n\nHistórico recente:\n${historico}\n\nNova mensagem:\n${userMessage}`
      : `${promptBase}\n\nHistórico da conversa:\n${historico}\n\nNova mensagem do cliente:\n${userMessage}`;

    const result = await model.generateContent([contextoCompleto]);
    const response = await result.response;
    const respostaTexto = response.text();

    const resumoPrompt = `
Resuma a seguinte conversa em um parágrafo com a intenção do cliente:

Usuário: ${userMessage}
IA: ${respostaTexto}

Destaque: tipo de problema, serviço desejado, e necessidade clara.`;

    const resumoResult = await model.generateContent([resumoPrompt]);
    const resumoTexto = (await resumoResult.response).text();

    await prisma.conversaResumo.upsert({
      where: { numero: userNumber },
      update: {
        resumo: resumoTexto,
        ultimaMensagemUsuario: userMessage,
        ultimaMensagemAssistente: respostaTexto
      },
      create: {
        numero: userNumber,
        resumo: resumoTexto,
        ultimaMensagemUsuario: userMessage,
        ultimaMensagemAssistente: respostaTexto
      }
    });

    return respostaTexto;
  } catch (error) {
    console.error('❌ Erro ao gerar resposta com Gemini:', error);
    return 'Desculpe, houve um erro ao processar sua solicitação.';
  }
}

module.exports = { gerarRespostaGemini };
