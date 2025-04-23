const { prisma, setSchema } = require('./db');

async function salvarContato(numero, nome) {
  await setSchema('autoaction');
  await prisma.contact.upsert({
    where: { number: numero },
    update: { name: nome },
    create: { number: numero, name: nome },
  });
}

module.exports = { salvarContato };
