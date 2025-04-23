require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { prisma, setSchema } = require('./db');
const { gerarRespostaIA } = require('./handlers/localAIAssistant');
const { salvarContato } = require('./handlers/manageThings');

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: './backend/nakane-imoveis/session' }),
  puppeteer: {
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
    ],
  },
});

const qrPath = path.resolve(__dirname, 'qr.json');
const statusPath = path.resolve(__dirname, 'status.json');

client.on('ready', async () => {
  console.log('✅ WhatsApp Client is ready!');

  
  await setSchema('nakane_imoveis');

  
  const info = client.info;
  fs.writeFileSync(path.resolve(__dirname, 'status.json'),
                   JSON.stringify({ connected: true }));
  
  fs.writeFileSync(path.resolve(__dirname, 'account.json'),
                   JSON.stringify({
                     number: info.wid.user,
                     pushname: info.pushname,
                     platform: info.platform
                   }, null, 2));

  
  try {
    const contacts = await client.getContacts();
    for (const c of contacts) {
      if (c.number && c.number.trim()) {
        await salvarContato(c.number, c.pushname || 'Nome não disponível');
      }
    }
    console.log('✅ Contatos do WhatsApp salvos no banco de dados.');
  } catch (e) {
    console.error('Erro ao salvar contatos:', e);
  }
});

client.on('disconnected', (reason) => {
  console.log('🚫 Cliente desconectado:', reason);
});

client.on('qr', async (qr) => {
  const qrImage = await qrcode.toDataURL(qr);
  fs.writeFileSync(qrPath, JSON.stringify({ qr: qrImage }));
  fs.writeFileSync(statusPath, JSON.stringify({ connected: false }));
  console.log('📲 Novo QR code gerado.');
});

client.on('message', async (msg) => {
  
  await setSchema('nakane_imoveis');

  const text = msg.body.trim();
  const user = msg.from;
  const name = msg.pushname || 'Nome não disponível';
  
  const resposta = await gerarRespostaIA(text, user, [ /* histórico se tiver */ ]);

  await client.sendMessage(user, resposta);

  await prisma.message.create({
    data: { from: user, to: 'assistente', direction: 'received', body: text }
  });
  
  await prisma.message.create({
    data: { from: 'assistente', to: user, direction: 'sent', body: resposta }
  });
});

client.initialize();
