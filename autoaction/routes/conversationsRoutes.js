const express = require('express');
const router = express.Router();
const { prisma, setSchema } = require('../utils/db');

router.get('/daily-summary', async (req, res) => {
  try {
    await setSchema('autoaction');

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    // Busca mensagens do dia agrupadas por número
    const messages = await prisma.message.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    const grouped = {};

    for (const msg of messages) {
      const key = msg.direction === 'sent' ? msg.to : msg.from;

      if (!grouped[key]) {
        grouped[key] = {
          number: key,
          name: '',
          sent: 0,
          received: 0,
        };
      }

      if (msg.direction === 'sent') grouped[key].sent += 1;
      if (msg.direction === 'received') grouped[key].received += 1;
    }

    // Associa nome de contato
    for (const key in grouped) {
      const contact = await prisma.contact.findUnique({
        where: { number: key },
      });
      grouped[key].name = contact?.name || 'Desconhecido';
    }

    return res.json(Object.values(grouped));
  } catch (error) {
    console.error('Erro ao gerar resumo diário:', error);
    res.status(500).json({ error: 'Erro ao buscar resumo diário' });
  }
});

module.exports = router;
