# Groove Manager

Sistema Full-Stack para controlo do catálogo e do stock de uma loja de discos de vinil.

## Funcionalidades

- Login com sessão;
- Consulta, pesquisa e filtragem dos produtos;
- Criação, edição e eliminação de produtos;
- Registo de entradas e saídas de stock;
- Resumo de produtos, unidades, stock baixo e produtos sem stock;
- Persistência dos dados numa base de dados MySQL.

## Estrutura das páginas

- `index.html`: página de login;
- `stock.html`: controlo de produtos e stock, protegido por sessão;
- `about.html`: explicação do projeto.

## Preparação da base de dados

No MySQL Workbench:

1. Executar `database/schema.sql`;
2. Executar `database/seed.sql`;
3. Executar `database/users.sql`.

## Configuração

Na pasta `backend`, criar o ficheiro `.env`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=groove_store
SESSION_SECRET=groove_manager_sessao_2026
```

O MySQL utilizado no desenvolvimento está configurado com o utilizador `root` sem palavra-passe. Por isso, `DB_PASSWORD` permanece vazio.

## Instalação e arranque

No terminal:

```bash
cd backend
npm install
npm run create-admin
npm start
```

Depois, abrir:

```text
http://localhost:3000
```

Conta de demonstração:

```text
Email: groove@teste.pt
Palavra-passe: 123456
```

## API

| Método | Rota | Função |
|---|---|---|
| GET | `/api/estado` | Verificar o backend e o MySQL |
| POST | `/api/login` | Iniciar sessão |
| GET | `/api/session` | Verificar a sessão |
| POST | `/api/logout` | Terminar a sessão |
| GET | `/api/categories` | Consultar categorias |
| GET | `/api/products` | Consultar produtos |
| GET | `/api/products/:id` | Consultar um produto |
| POST | `/api/products` | Criar um produto |
| PUT | `/api/products/:id` | Editar o produto ou o stock |
| DELETE | `/api/products/:id` | Eliminar um produto |

As rotas das categorias e dos produtos exigem uma sessão válida.

## Funcionamento

Depois do login, o servidor guarda a identificação do utilizador numa sessão. A página de stock utiliza `fetch()` para comunicar com a API. O backend valida os dados, executa consultas SQL parametrizadas e devolve respostas em JSON. As alterações ficam guardadas no MySQL e permanecem depois de reiniciar o servidor.

O stock não pode ser negativo. Os botões `+` e `−` atualizam a quantidade do produto através da rota `PUT /api/products/:id`. O botão “Eliminar” remove definitivamente o produto através de `DELETE`.

## Tecnologias

HTML, CSS, JavaScript, Node.js, Express, MySQL, `mysql2`, `bcrypt`, `express-session` e `dotenv`.
