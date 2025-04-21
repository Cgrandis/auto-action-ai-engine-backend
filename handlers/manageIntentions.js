const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Armazena um resumo da intenção do cliente
 * @param {string} customerId - Número de telefone ou ID do cliente
 * @param {string} resumo - Resumo da intenção da conversa
 */
async function armazenarIntencao(customerId, resumo) {
  try {
    const intencao = await prisma.intencao.create({
      data: {
        customerId,
        resumo,
      },
    });
    console.log('Intenção armazenada com sucesso:', intencao);
  } catch (error) {
    console.error('Erro ao armazenar a intenção:', error);
  }
}

async function recuperarIntencao(customerId) {
  try {
    const intencao = await prisma.intencao.findFirst({
      where: {
        customerId,
      },
      orderBy: {
        createdAt: 'desc', // Pega o resumo mais recente
      },
    });

    return intencao ? intencao.resumo : null;
  } catch (error) {
    console.error('Erro ao recuperar a intenção:', error);
    return null;
  }
}

module.exports = {
  armazenarIntencao,
  recuperarIntencao,
};
