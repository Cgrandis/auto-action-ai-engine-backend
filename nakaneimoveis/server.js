require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { gerarRespostaIA } = require('./handlers/localAIAssistant');
const { salvarContato } = require('./handlers/manageThings');
const { prisma, setSchema } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const SCHEMA = 'nakane_imoveis';

app.post('/api/ia/perguntar', async (req, res) => {
  const { pergunta, usuario } = req.body;
  if (!pergunta || !usuario) return res.status(400).json({ error: 'Pergunta e usuário são obrigatórios.' });

  try {
    await setSchema(SCHEMA);
    const resposta = await gerarRespostaIA(pergunta, usuario);
    res.json({ resposta: 'IA funcionando' });
  } catch (err) {
    console.error('Erro ao gerar resposta:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

app.get('/api/whatsapp/status', (req, res) => {
  const statusPath = path.resolve(__dirname, 'status.json');
  if (fs.existsSync(statusPath)) {
    const status = JSON.parse(fs.readFileSync(statusPath, 'utf-8'));
    return res.json(status);
  }
  return res.status(404).json({ connected: false });
});

app.get('/api/whatsapp/qr', (req, res) => {
  const qrPath = path.resolve(__dirname, 'qr.json');
  if (fs.existsSync(qrPath)) {
    const qrData = JSON.parse(fs.readFileSync(qrPath, 'utf-8'));
    return res.json(qrData);
  }
  return res.status(404).json({ error: 'QR Code não encontrado.' });
});

app.get('/api/contatos', async (req, res) => {
  try {
    await setSchema(SCHEMA);
    const contatos = await prisma.contact.findMany({ orderBy: { name: 'asc' } });
    res.json(contatos);
  } catch (err) {
    console.error('Erro ao buscar contatos:', err);
    res.status(500).json({ error: 'Erro ao buscar contatos.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 API do WhatsApp Nakane rodando em http://localhost:${PORT}`);
});

