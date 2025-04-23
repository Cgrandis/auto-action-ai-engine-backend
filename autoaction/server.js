require('dotenv').config();
const express = require('express');
const cors = require('cors');
const whatsappRoutes = require('./routes/whatsappRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/autoaction/api/whatsapp', whatsappRoutes);

app.get('/autoaction/api/ping', (req, res) => {
  res.json({ message: 'AutoAction API está ativa!' });
});

app.listen(PORT, () => {
  console.log(`🚀 AutoAction API rodando em http://localhost:${PORT}`);
});