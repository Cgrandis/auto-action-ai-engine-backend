require('dotenv').config();
const { PrismaClient } = require('@prisma/client-nakane');

const prisma = new PrismaClient();

/**
 * Troca o schema ativo para as próximas queries.
 * @param {string} schema O nome do schema no PostgreSQL (ex: "nakane_imoveis" ou "auth")
 */
async function setSchema(schema) {
  try {
    await prisma.$executeRawUnsafe(`SET search_path TO ${schema}, public;`);
    const [{ search_path }] = await prisma.$queryRawUnsafe(`SHOW search_path`);
    
  } catch (e) {
    console.error('Erro ao definir search_path:', e);
  }
}

module.exports = { prisma, setSchema };
