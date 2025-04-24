const { prisma, setSchema } = require('../utils/db');

async function salvarContato(numero, nome) {
  await setSchema('autoaction');

  const existente = await prisma.contact.findUnique({
    where: { number: numero },
  });

  if (existente) {
    
    return;
  }

  await prisma.contact.create({
    data: { number: numero, name: nome },
  });

  console.log(`✅ Novo contato salvo: ${numero}`);
}

module.exports = { salvarContato };
