const express = require('express');
const { prisma, setSchema } = require('../utils/db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    await setSchema('autoaction');

    const contatos = await prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json(contatos);
  } catch (error) {
    console.error('Erro ao buscar contatos:', error);
    res.status(500).json({ error: 'Erro ao buscar contatos' });
  }
});

module.exports = router;
