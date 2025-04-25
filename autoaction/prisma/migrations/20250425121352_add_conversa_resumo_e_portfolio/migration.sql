-- CreateTable
CREATE TABLE "ServicoPortfolio" (
    "id" SERIAL NOT NULL,
    "servico" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServicoPortfolio_pkey" PRIMARY KEY ("id")
);
