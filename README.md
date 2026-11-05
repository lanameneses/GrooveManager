# Groove Manager

**Projeto individual Full-Stack — UC02837 | Desenvolver projetos de programação**

Aplicação web para gestão de um catálogo de discos de vinil e controlo das quantidades em stock. O utilizador inicia sessão, consulta os produtos e realiza operações de criação, edição, eliminação e atualização de stock, com persistência em **MySQL**.

## Funcionalidades

- Autenticação por email e palavra-passe, com sessão no servidor e opção de terminar sessão.
- Gestão de produtos (CRUD): adicionar, consultar, editar e eliminar discos.
- Atualização de stock através dos botões **+** e **−**, sem permitir quantidades negativas.
- Indicadores de total de produtos, total de unidades, produtos com stock baixo (1–2 unidades) e sem stock.
- Pesquisa por título ou artista e filtros por categoria e disponibilidade.
- Catálogo ilustrado com capas de álbuns e dados iniciais de demonstração.

## Tecnologias e arquitetura

| Camada | Tecnologias |
| --- | --- |
| Frontend | HTML5, CSS3 e JavaScript |
| Backend | Node.js e Express |
| Base de dados | MySQL, com o conector `mysql2` |
| Sessões e autenticação | `express-session` e `bcrypt` |
| Configuração | `dotenv` |

**Fluxo básico:** interface → `fetch()` → API HTTP → validação no servidor → SQL parametrizado → resposta JSON → atualização da interface.

As tabelas `products` e `categories` estão relacionadas por uma chave estrangeira. A tabela `users` guarda as contas com palavras-passe protegidas por hash.

## Estrutura do projeto

```text
GrooveManager/
├── backend/
│   ├── server.js
│   ├── create-admin.js
│   ├── package.json
│   ├── package-lock.json
│   └── .env.example
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   ├── users.sql
│   └── utilizadores.sql
├── frontend/
│   ├── index.html           # Login
│   ├── stock.html           # Gestão de produtos e stock
│   ├── about.html           # Sobre o projeto
│   ├── catalog.html
│   ├── cart.html
│   ├── css/
│   ├── js/
│   └── images/
├── iniciar-groove.command
└── README.md
```

## Instalação local

**Pré-requisitos:** Node.js, npm e um servidor MySQL em funcionamento. O MySQL Workbench pode ser utilizado para executar os scripts SQL.

1. Clonar o repositório e entrar na pasta do projeto:

   ```bash
   git clone https://github.com/tj6m69y99f-dotcom/GrooveManager.git
   cd GrooveManager
   ```

2. No MySQL Workbench, executar **por esta ordem**:
   - `database/schema.sql` — cria a base e recria as tabelas de categorias e produtos.
   - `database/seed.sql` — insere categorias e produtos fictícios.
   - `database/users.sql` — cria a tabela de utilizadores, caso ainda não exista.

   **Atenção:** `schema.sql` contém instruções `DROP TABLE`. Não executar sobre uma base de dados com informação que seja necessário conservar. O ficheiro `utilizadores.sql` é uma alternativa para a criação da tabela `users` e **não precisa de ser executado adicionalmente**.

3. Preparar as variáveis de ambiente:

   ```bash
   cd backend
   cp .env.example .env
   ```

   Editar `backend/.env` com as credenciais **locais** de MySQL e definir um `SESSION_SECRET` longo, aleatório e privado. O ficheiro `.env` está excluído do Git. Não publicar palavras-passe nem chaves reais.

4. Instalar dependências e criar o utilizador **de demonstração**:

   ```bash
   npm ci
   npm run create-admin
   ```

   O script `create-admin.js` cria ou atualiza uma conta de demonstração com credenciais definidas no próprio código. **Destina-se exclusivamente a testes locais; não utilizar esta conta nem estas credenciais numa aplicação exposta à Internet.**

5. Iniciar a aplicação:

   ```bash
   npm start
   ```

6. Abrir **http://localhost:3000** no navegador. Não abrir o HTML diretamente como ficheiro local, pois a aplicação depende da API e da sessão.

### Arranque no macOS

O ficheiro `iniciar-groove.command` inicia o serviço MySQL através do Homebrew, arranca o backend e abre o navegador. Pressupõe que MySQL, Node.js e dependências já estão instalados e configurados. Alternativamente, iniciar o MySQL manualmente e usar `npm start` na pasta `backend`.

## Páginas principais

- `/index.html` — formulário de login.
- `/stock.html` — painel de gestão, acessível apenas com sessão válida.
- `/about.html` — descrição do projeto.

## API HTTP

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/estado` | Verifica a ligação do backend ao MySQL |
| POST | `/api/login` | Inicia uma sessão |
| GET | `/api/session` | Consulta a sessão atual |
| POST | `/api/logout` | Termina a sessão |
| GET | `/api/categories` | Lista categorias |
| GET | `/api/products` | Lista produtos |
| GET | `/api/products/:id` | Consulta um produto |
| POST | `/api/products` | Cria um produto |
| PUT | `/api/products/:id` | Edita dados e stock de um produto |
| DELETE | `/api/products/:id` | Elimina um produto |

As rotas de categorias e produtos exigem sessão válida. O servidor utiliza códigos HTTP para indicar sucesso, erros de validação, recursos inexistentes e falta de autenticação.

## Demonstração e verificações

Exemplos de operações a demonstrar no navegador:

1. Iniciar sessão e abrir a página de stock.
2. Pesquisar um disco e aplicar um filtro de disponibilidade.
3. Criar um produto de teste e confirmar que aparece na lista.
4. Editar os dados do produto e atualizar o stock.
5. Recarregar a página para verificar a persistência no MySQL.
6. Eliminar o produto de teste após confirmação.
7. Terminar sessão e confirmar que o painel de gestão deixa de estar acessível.

Estas são **verificações sugeridas para apresentação**, não um relatório de testes executados automaticamente.

## Limitações e notas

- Projeto académico destinado a execução e demonstração **local**; não está preparado para alojamento público com acesso à gestão.
- Publicar o **código no GitHub** não disponibiliza automaticamente o site online.
- A conta criada por `create-admin.js` é apenas demonstrativa.
- Não existem pagamentos reais nem gestão de encomendas.
- As imagens e exemplos do catálogo destinam-se à demonstração académica; os direitos sobre capas e outros materiais pertencem aos respetivos titulares.
- Para entrega segundo o enunciado da UC02837, a documentação de planeamento, testes e resultados observados deve acompanhar o projeto quando exigida pelo formador.

## Autoria

Projeto desenvolvido individualmente para a UC02837 — Desenvolver projetos de programação.
