# 🤖 AutoAction AI Backend

Este é o backend do projeto **AutoAction**, responsável por gerenciar:
- Conexão com o WhatsApp Web via `whatsapp-web.js`
- Integração com a IA Gemini
- Persistência de dados com Prisma/PostgreSQL
- API de status com Express

---

## 🚀 Como rodar o projeto localmente

### 1. Instale as dependências

```bash
npm install
```

### 2. Configure as variáveis de ambiente

Crie um arquivo `.env` com as variáveis:

```
AUTOACTION_DATABASE_URL=postgresql://usuario:senha@localhost:5432/auto_action_db?schema=autoaction
API_KEY=SUA_API_KEY_DO_GEMINI
```

### 3. Rode o Prisma

```bash
npm run migrate
```

Opcionalmente, para visualizar os dados:

```bash
npm run studio
```

### 4. Inicie tudo (WhatsApp + API)

```bash
npm run start:full
```

---

## 📫 Contato

Em caso de dúvidas ou sugestões, entre em contato com o desenvolvedor responsável.
