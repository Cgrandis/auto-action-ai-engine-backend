const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { prisma, setSchema } = require('../utils/db');
const { gerarRespostaGemini } = require('../utils/geminiAI');
const { salvarContato } = require('../utils/manageThings');

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: './backend/autoaction/session' }),
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

const qrPath = path.resolve(__dirname, '../public/qr.json');
const statusPath = path.resolve(__dirname, '../public/status.json');
const accountPath = path.resolve(__dirname, '../public/account.json');

function startWhatsappClient() {
  client.on('ready', async () => {
    console.log('✅ AutoAction WhatsApp pronto!');
    await setSchema('autoaction');

    fs.writeFileSync(statusPath, JSON.stringify({ connected: true }));

    const info = client.info;
    fs.writeFileSync(accountPath, JSON.stringify({
      number: info.wid.user,
      pushname: info.pushname,
      platform: info.platform,
    }, null, 2));

    const contacts = await client.getContacts();
    for (const c of contacts) {
      if (c.number) await salvarContato(c.number, c.pushname || 'Nome não disponível');
    }
    console.log('✅ Contatos salvos.');
  });

  client.on('qr', async (qr) => {
    const qrImage = await qrcode.toDataURL(qr);
    fs.writeFileSync(qrPath, JSON.stringify({ qr: qrImage }));
    fs.writeFileSync(statusPath, JSON.stringify({ connected: false }));
    console.log('📲 QR code gerado.');
  });

  client.on('message', async (msg) => {
    await setSchema('autoaction');

    // 🚫 IGNORAR MENSAGENS DE GRUPO
    if (msg.from.endsWith('@g.us')) {
      console.log(`Mensagem ignorada (grupo): ${msg.from}`);
      return;
    }

    const text = msg.body.trim();
    const rawUser = msg.from;
    const userNumber = rawUser.replace('@c.us', '');

    const resposta = await gerarRespostaGemini(text, userNumber);

    await client.sendMessage(rawUser, resposta);

    await prisma.message.create({ data: { from: userNumber, to: 'assistente', direction: 'received', body: text } });
    await prisma.message.create({ data: { from: 'assistente', to: userNumber, direction: 'sent', body: resposta } });

    const contato = await client.getContactById(rawUser);
    await salvarContato(userNumber, contato.pushname || 'Nome não disponível');
  });

  client.initialize();
}

module.exports = startWhatsappClient;
