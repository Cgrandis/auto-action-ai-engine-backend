const { prisma, setSchema } = require('../db');

async function salvarContato(numero, nome) {
  try {
    if (!numero || numero === '0') {
      
      return;
    }

    await setSchema('nakane_imoveis');

    const result = await prisma.$queryRawUnsafe(`SHOW search_path`);
    

    await prisma.contact.upsert({
      where: { number: numero },
      update: { name: nome },
      create: { number: numero, name: nome },
    });

    
  } catch (error) {
    console.error('❌ Erro ao salvar contato:', error);
  }
}


module.exports = { salvarContato };
