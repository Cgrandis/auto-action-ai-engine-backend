require('dotenv').config();    // garante que leu DATABASE_URL
const { PrismaClient } = require('@prisma/client-nakane');

const prisma = new PrismaClient();  // usa DATABASE_URL do .env

/**
 * Troca o schema ativo para as próximas queries.
 * @param {string} schema O nome do schema no PostgreSQL (ex: "nakane_imoveis" ou "auth")
 */
async function setSchema(schema) {
  try {
    await prisma.$executeRawUnsafe(`SET search_path TO ${schema}, public;`);
    const [{ search_path }] = await prisma.$queryRawUnsafe(`SHOW search_path`);
    console.log(`🎯 search_path atual: ${search_path}`);
  } catch (e) {
    console.error('Erro ao definir search_path:', e);
  }
}

module.exports = { prisma, setSchema };
