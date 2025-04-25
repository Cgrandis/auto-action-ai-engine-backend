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
          messages: [],
        };
      }

      if (msg.direction === 'sent') grouped[key].sent += 1;
      if (msg.direction === 'received') grouped[key].received += 1;

      grouped[key].messages.push(msg);
    }

    for (const key in grouped) {
      const contact = await prisma.contact.findUnique({ where: { number: key } });
      grouped[key].name = contact?.name || 'Desconhecido';
    }

    return res.json(Object.values(grouped));
  } catch (error) {
    console.error('Erro ao gerar resumo diário:', error);
    res.status(500).json({ error: 'Erro ao buscar resumo diário' });
  }
});

router.get('/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  await setSchema('autoaction');

  const getTodayMessages = async () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return await prisma.message.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });
  };

  const sendGroupedMessages = async () => {
    try {
      const messages = await getTodayMessages();
      const grouped = {};

      for (const msg of messages) {
        const key = msg.direction === 'sent' ? msg.to : msg.from;

        if (!grouped[key]) {
          grouped[key] = {
            number: key,
            name: '',
            sent: 0,
            received: 0,
            messages: [],
          };
        }

        if (msg.direction === 'sent') grouped[key].sent += 1;
        if (msg.direction === 'received') grouped[key].received += 1;

        grouped[key].messages.push(msg);
      }

      for (const key in grouped) {
        const contact = await prisma.contact.findUnique({ where: { number: key } });
        grouped[key].name = contact?.name || 'Desconhecido';
      }

      res.write(`data: ${JSON.stringify(Object.values(grouped))}\n\n`);
    } catch (err) {
      console.error('Erro no stream de conversas:', err);
      res.write(`data: []\n\n`);
    }
  };

  const interval = setInterval(sendGroupedMessages, 5000);
  sendGroupedMessages();

  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});

module.exports = router;
