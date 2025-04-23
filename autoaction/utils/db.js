require('dotenv').config();
const { PrismaClient } = require('@prisma/client-autoaction');

const prisma = new PrismaClient();

async function setSchema(schema) {
  await prisma.$executeRawUnsafe(`SET search_path TO ${schema}, public`);
}

module.exports = { prisma, setSchema };