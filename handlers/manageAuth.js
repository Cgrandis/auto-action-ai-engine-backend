const { prisma, setSchema } = require('../db');

async function criarUsuario({ nome, email, contato, senha }) {
  await setSchema('auth');
  return prisma.usuario.create({ data: { nome, email, contato, senha }});
}

module.exports = { criarUsuario };
