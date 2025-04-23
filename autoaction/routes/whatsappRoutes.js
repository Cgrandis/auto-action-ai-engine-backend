const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const qrPath = path.resolve(__dirname, '../public/qr.json');
const statusPath = path.resolve(__dirname, '../public/status.json');
const accountPath = path.resolve(__dirname, '../public/account.json');

router.get('/connection/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendStatus = () => {
    const connected = fs.existsSync(statusPath) && JSON.parse(fs.readFileSync(statusPath)).connected;
    const qrCode = fs.existsSync(qrPath) ? JSON.parse(fs.readFileSync(qrPath)).qr : null;
    const account = fs.existsSync(accountPath) ? JSON.parse(fs.readFileSync(accountPath)) : null;

    res.write(`data: ${JSON.stringify({ connected, qrCode, account })}\n\n`);
  };

  sendStatus();
  const interval = setInterval(sendStatus, 5000);

  req.on('close', () => clearInterval(interval));
});

router.post('/reset', (req, res) => {
  try {
    if (fs.existsSync('./.wwebjs_auth')) {
      fs.rmSync('./.wwebjs_auth', { recursive: true, force: true });
    }
    if (fs.existsSync(qrPath)) fs.unlinkSync(qrPath);
    if (fs.existsSync(statusPath)) fs.writeFileSync(statusPath, JSON.stringify({ connected: false }));

    return res.status(200).json({ message: 'Sessão resetada com sucesso.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao resetar sessão.' });
  }
});

module.exports = router;