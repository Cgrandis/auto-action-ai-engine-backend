
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function gerarRespostaGemini(userMessage, context = '') {
  try {
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent([context, userMessage]);
    const response = await result.response;

    return response.text(); 
  } catch (error) {
    console.error('Erro ao gerar resposta com Gemini:', error);
    return 'Desculpe, houve um erro ao processar sua solicitação.';
  }
}

module.exports = { gerarRespostaGemini };
