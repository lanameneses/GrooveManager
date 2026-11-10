# GrooveManager

**Projeto Full-Stack — UC02837 | Desenvolver projetos de programação**

Trata-se de uma aplicação web desenvolvida para gerir o catálogo e controlar o stock de uma loja de discos de vinil.

Permite consultar, adicionar, editar e eliminar produtos, pesquisar discos e atualizar as quantidades disponíveis. As informações são armazenadas numa base de dados MySQL.

## Funcionalidades

- Autenticação de utilizadores através de email e palavra-passe.
- Gestão de produtos (CRUD): criar, consultar, editar e eliminar.
- Pesquisa de discos por título ou artista.
- Filtros por categoria e disponibilidade.
- Atualização de stock através dos botões `+` e `−`.
- Indicadores de produtos, unidades disponíveis, stock baixo e produtos sem stock.
- Validação dos dados e prevenção de quantidades negativas.
- Confirmação antes da eliminação de produtos.

## Tecnologias e arquitetura

| Camada | Tecnologias |
|---|---|
| Frontend | HTML5, CSS3 e JavaScript |
| Backend | Node.js e Express |
| Base de dados | MySQL |
| Sessões e autenticação | `express-session` e `bcrypt` |
| Comunicação | API REST, HTTP e JSON |
| Configuração | `dotenv` |

A aplicação comunica com o servidor através de pedidos HTTP utilizando `fetch()`. O backend recebe os pedidos, valida os dados e executa as operações necessárias na base de dados MySQL.

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
│   ├── index.html
│   ├── stock.html
│   ├── about.html
│   ├── css/
│   ├── js/
│   └── images/
├── iniciar-groove.command
└── README.md
```

As três páginas principais da aplicação são:

- `index.html` — página de login.
- `stock.html` — gestão dos produtos e respetivas quantidades.
- `about.html` — apresentação do projeto.

## Base de dados

A aplicação utiliza uma base de dados MySQL denominada `groove_store`, composta por três tabelas:

| Tabela | Descrição |
|---|---|
| `products` | Armazena as informações dos discos, incluindo título, artista, categoria, preço e stock. |
| `categories` | Armazena as categorias musicais. |
| `users` | Armazena os utilizadores e os hashes das palavras-passe. |

Cada produto está associado a uma categoria através da chave estrangeira `category_id`.

O backend utiliza consultas SQL parametrizadas para inserir, consultar, atualizar e eliminar os registos.

## Instalação e execução

### Pré-requisitos

- Node.js e npm.
- MySQL.
- MySQL Workbench ou outro cliente SQL.

### 1. Obter o projeto

```bash
git clone https://github.com/lanameneses/GrooveManager.git
cd GrooveManager
```

### 2. Preparar a base de dados

No MySQL Workbench, executar os seguintes ficheiros pela ordem indicada:

1. `database/schema.sql` — cria a base de dados e as tabelas de produtos e categorias.
2. `database/seed.sql` — insere os produtos e categorias de demonstração.
3. `database/users.sql` — cria a tabela de utilizadores.

**Atenção:** O ficheiro `schema.sql` contém instruções `DROP TABLE`, que eliminam e recriam as tabelas de produtos e categorias. Deve ser executado apenas na preparação inicial ou numa base de teste, pois os dados existentes nessas tabelas serão perdidos.

O ficheiro `utilizadores.sql` é uma alternativa para a criação da tabela `users`, não sendo necessário executar os dois.

### 3. Configurar o backend

Na pasta `backend`, criar o ficheiro `.env` a partir do exemplo fornecido:

```bash
cd backend
cp .env.example .env
```

A configuração utilizada durante o desenvolvimento é:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=groove_store
SESSION_SECRET=substituir_por_uma_chave_local
```

O MySQL utilizado no desenvolvimento está configurado com o utilizador `root` sem palavra-passe. Por esse motivo, `DB_PASSWORD` permanece vazio.

A variável `SESSION_SECRET` corresponde à chave privada utilizada pelo servidor para assinar o cookie de sessão. Deve ser definida no ficheiro `.env` com um valor privado.

O ficheiro `.env` contém configurações locais e está excluído do repositório através do `.gitignore`.

### 4. Instalar as dependências

No terminal, dentro da pasta `backend`:

```bash
npm ci
```

### 5. Criar o utilizador de demonstração

```bash
npm run create-admin
```

Este comando cria ou atualiza uma conta de demonstração para testar a autenticação e as funcionalidades de gestão da aplicação.

Para iniciar sessão, utilizar as seguintes credenciais:

- **Email:** `groove@teste.pt`
- **Palavra-passe:** `123456`

As credenciais estão definidas no ficheiro `backend/create-admin.js` e destinam-se exclusivamente à execução e aos testes em ambiente local.

### 6. Iniciar a aplicação

```bash
npm start
```

Depois, abrir no navegador:

**http://localhost:3000**

O frontend deve ser acedido através do servidor, uma vez que depende da API e do sistema de autenticação.

### Arranque alternativo no macOS

O projeto inclui o ficheiro `iniciar-groove.command`, que permite iniciar a aplicação de forma simplificada em computadores macOS com Homebrew.

Este ficheiro executa o serviço MySQL através do Homebrew, inicia o servidor Node.js e abre a aplicação no navegador.

A utilização deste ficheiro é opcional. A aplicação também pode ser iniciada manualmente através do comando `npm start`, conforme descrito anteriormente.

Para utilizar este método, é necessário que o MySQL esteja instalado através do Homebrew e que a configuração do ambiente já tenha sido realizada.

## API REST

| Método | Endpoint | Função |
|---|---|---|
| GET | `/api/estado` | Verificar a ligação do backend ao MySQL |
| POST | `/api/login` | Iniciar sessão |
| GET | `/api/session` | Verificar a sessão |
| POST | `/api/logout` | Terminar sessão |
| GET | `/api/categories` | Consultar categorias |
| GET | `/api/products` | Listar produtos |
| GET | `/api/products/:id` | Consultar um produto |
| POST | `/api/products` | Adicionar um produto |
| PUT | `/api/products/:id` | Atualizar um produto |
| DELETE | `/api/products/:id` | Eliminar um produto |

As rotas de produtos e categorias exigem uma sessão autenticada.

## Testes realizados

Foram realizados testes funcionais através da interface e testes de validação utilizando pedidos HTTP à API.

| Teste | Resultado observado |
|---|---|
| Login com credenciais válidas | Sessão iniciada corretamente |
| Criação de produto | Produto adicionado e apresentado na tabela |
| Eliminação de produto | Confirmação apresentada e produto eliminado |
| Pesquisa sem correspondências | Mensagem de lista vazia apresentada |
| Atualização de stock | Botões `+` e `−` funcionam corretamente |
| Tentativa de stock negativo | Operação rejeitada |
| Preço negativo enviado à API | HTTP 400 |
| Preço enviado como texto | HTTP 400 |
| Título vazio | HTTP 400 |
| Stock decimal | HTTP 400 |
| Categoria inexistente | HTTP 400 |

### Correções realizadas

Durante o desenvolvimento e os testes, foram identificados e corrigidos problemas relacionados com a pesquisa sem resultados e com a validação de dados.

Foi também ajustada a atualização de stock para assegurar a compatibilidade entre os valores recebidos do MySQL e os dados enviados ao backend.

Após essas alterações, os comportamentos afetados foram novamente testados.

## Limitações

O GrooveManager foi desenvolvido para execução e demonstração em ambiente local, não estando preparado para disponibilização pública como serviço de gestão.

A aplicação não inclui pagamentos, processamento de encomendas ou outras operações de comércio eletrónico.

A autenticação utiliza uma conta de demonstração, destinada exclusivamente a testes locais.

## Autoria

**Lana Lima**

UC02837 — Desenvolver projetos de programação

2026
