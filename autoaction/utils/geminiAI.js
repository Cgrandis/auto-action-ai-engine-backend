require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getPromptContext } = require('../services/aiPromptHandler');

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

/**
 * Gera uma resposta da IA com base na mensagem do usuário
 * O prompt base da AutoAction é sempre incluído automaticamente.
 *
 * @param {string} userMessage - Mensagem recebida do usuário via WhatsApp
 * @returns {Promise<string>} - Resposta gerada pela IA
 */
async function gerarRespostaGemini(userMessage) {
  try {
    const promptBase = getPromptContext();

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent([promptBase, userMessage]);
    const response = await result.response;

    return response.text(); 
  } catch (error) {
    console.error('❌ Erro ao gerar resposta com Gemini:', error);
    return 'Desculpe, houve um erro ao processar sua solicitação.';
  }
}

module.exports = { gerarRespostaGemini };
