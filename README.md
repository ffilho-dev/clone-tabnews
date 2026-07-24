# Clone TabNews

Projeto prático desenvolvido durante o [curso.dev](https://curso.dev) ministrado por Filipe Deschamps. 
O objetivo deste projeto é construir uma plataforma de conteúdo e fórum de discussões com funcionalidades similares ao [TabNews](https://www.tabnews.com.br/). A construção foi feita do zero, passando pela infraestrutura básica, testes, e regras de negócio, seguindo princípios sólidos de arquitetura.

## 🚀 Tecnologias e Stack

- **Framework:** [Next.js](https://nextjs.org/) (Fullstack com API Routes)
- **Linguagem:** JavaScript (Node.js)
- **Banco de Dados:** PostgreSQL
- **Migrações:** `node-pg-migrate`
- **Testes:** [Jest](https://jestjs.io/) (Testes de integração e unitários)
- **Interface e Estilização:** [Primer React](https://primer.style/react/) (Design System do GitHub)
- **Infraestrutura Local:** Docker e Docker Compose
- **Qualidade de Código:** ESLint, Prettier, Husky, Commitizen e Commitlint

## 📂 Arquitetura

O repositório é projetado para evitar alto acoplamento, dividindo responsabilidades claras:
- `infra/`: Configurações de conexão com o banco (`database.js`), servidor de email, rotinas de tratamento de erros global e scripts utilitários.
- `models/`: O coração da aplicação, contendo todas as regras de negócio puras (ex: cadastro de usuários, autenticação, sessões).
- `pages/`: Arquivos da interface Web do Next.js.
- `pages/api/`: Controladores (endpoints) REST do Back-end.
- `tests/`: Ambiente orquestrado de testes (`integration` e `unit`), garantindo resiliência da aplicação.

## 🛠️ Como rodar o projeto localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 24)
- [Docker](https://www.docker.com/) e Docker Compose instalados

### Instalação

1. **Clone e instale as dependências:**
   ```bash
   npm install
   ```

2. **Inicie o ambiente de desenvolvimento:**
   O script abaixo cuidará de subir os containers Docker (Postgres), criar o banco, rodar as migrações (tabelas) e iniciar o servidor Next.js automaticamente:
   ```bash
   npm run dev
   ```

3. **Acesse a aplicação:**
   Abra [http://localhost:3000](http://localhost:3000) no seu navegador. O banco de dados será desligado automaticamente ao você parar a execução do script.

## 🧪 Testes

A suíte de testes utiliza o Jest e configura seu próprio ambiente isolado no banco de dados para evitar conflitos de dados.

Para rodar toda a bateria de testes de ponta a ponta:
```bash
npm run test
```

## 📝 Padronização e Commits

O repositório está equipado com o Husky e ferramentas de linting para barrar códigos com erro. Também adota o formato do **Conventional Commits**. 

Para realizar um commit de forma guiada pelo terminal sem errar o padrão, faça as adições e execute:
```bash
git add .
npm run commit
```
