/*
  Warnings:

  - You are about to drop the `ServicoPortfolio` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ServicoPortfolio";

-- CreateTable
CREATE TABLE "Portfolio" (
    "id" SERIAL NOT NULL,
    "servico" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);
