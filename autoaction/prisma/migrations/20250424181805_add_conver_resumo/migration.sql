-- CreateTable
CREATE TABLE "ConversaResumo" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "resumo" TEXT NOT NULL,
    "ultimaMensagemUsuario" TEXT,
    "ultimaMensagemAssistente" TEXT,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversaResumo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConversaResumo_numero_key" ON "ConversaResumo"("numero");
