requireAuthrequire("dotenv").config();

const path = require("path");
const cors = require("cors");
const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const session = require("express-session");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

if (!process.env.SESSION_SECRET) {
  throw new Error("Defina SESSION_SECRET no ficheiro .env.");
}

app.use(cors());
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 2
  }
}));

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "groove_store",
  waitForConnections: true,
  connectionLimit: 10
});

function validId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0;
}


function validProduct(product) {
  if (!product || typeof product !== "object" || Array.isArray(product)) {
    return false;
  }

  const { categoryId, title, artist, condition, price, stock, imageUrl } = product;

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return false;
  }

  if (
    typeof title !== "string" ||
    title.trim().length === 0 ||
    title.length > 180
  ) {
    return false;
  }

  if (
    typeof artist !== "string" ||
    artist.trim().length === 0 ||
    artist.length > 180
  ) {
    return false;
  }

  if (!["New", "Used"].includes(condition)) {
    return false;
  }

  if (
    typeof price !== "number" ||
    !Number.isFinite(price) ||
    price < 0 ||
    price > 99999999.99 ||
    Math.abs(price * 100 - Math.round(price * 100)) > 0.000001
  ) {
    return false;
  }

  if (
    typeof stock !== "number" ||
    !Number.isInteger(stock) ||
    stock < 0 ||
    stock > 4294967295
  ) {
    return false;
  }

  if (
    typeof imageUrl !== "string" ||
    imageUrl.trim().length === 0 ||
    imageUrl.length > 255
  ) {
    return false;
  }

  return true;
}

// Protege as rotas da API.
function requireAuth(request, response, next) {
  if (!request.session.user) {
    return response.status(401).json({
      erro: "É necessário iniciar sessão."
    });
  }

  next();
}

// Protege a página de gestão.
function requirePageAuth(request, response, next) {
  if (!request.session.user) {
    return response.redirect("/index.html");
  }

  next();
}

app.get("/api/estado", async (request, response) => {
  try {
    await pool.query("SELECT 1");
    response.json({ mensagem: "Backend e MySQL estão ligados." });
  } catch (error) {
    response.status(503).json({
      erro: "O backend funciona, mas não conseguiu ligar ao MySQL."
    });
  }
});

// Iniciar sessão.
app.post("/api/login", async (request, response) => {
  const email = String(request.body.email || "").trim().toLowerCase();
  const password = String(request.body.password || "");

  if (!email || !password) {
    return response.status(400).json({
      erro: "Preencha o email e a palavra-passe."
    });
  }

  try {
    const [users] = await pool.query(
      `SELECT id, name, email, password_hash AS passwordHash
       FROM users
       WHERE email = ?`,
      [email]
    );

    if (users.length === 0) {
      return response.status(401).json({
        erro: "Email ou palavra-passe incorretos."
      });
    }

    const user = users[0];
    const correctPassword = await bcrypt.compare(password, user.passwordHash);

    if (!correctPassword) {
      return response.status(401).json({
        erro: "Email ou palavra-passe incorretos."
      });
    }

    request.session.user = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    response.json({
      mensagem: "Sessão iniciada com sucesso.",
      user: request.session.user
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({
      erro: "Não foi possível iniciar a sessão."
    });
  }
});

// Verificar a sessão atual.
app.get("/api/session", (request, response) => {
  if (!request.session.user) {
    return response.status(401).json({ authenticated: false });
  }

  response.json({
    authenticated: true,
    user: request.session.user
  });
});

// Terminar a sessão.
app.post("/api/logout", (request, response) => {
  request.session.destroy(error => {
    if (error) {
      return response.status(500).json({
        erro: "Não foi possível terminar a sessão."
      });
    }

    response.clearCookie("connect.sid");
    response.json({ mensagem: "Sessão terminada." });
  });
});

// Consultar categorias.
app.get("/api/categories", requireAuth, async (request, response) => {
  try {
    const [categories] = await pool.query(
      "SELECT id, name, description FROM categories ORDER BY name"
    );
    response.json(categories);
  } catch (error) {
    response.status(500).json({
      erro: "Não foi possível carregar as categorias."
    });
  }
});

// Consultar produtos.
app.get("/api/products", requireAuth, async (request, response) => {
  try {
    const [products] = await pool.query(`
      SELECT p.id, p.category_id AS categoryId,
             p.title, p.artist, c.name AS category,
             p.condition, p.price, p.stock,
             p.cover_class AS coverClass,
             p.image_url AS imageUrl
      FROM products p
      INNER JOIN categories c ON c.id = p.category_id
      ORDER BY c.name, p.title
    `);
    response.json(products);
  } catch (error) {
    response.status(500).json({
      erro: "Não foi possível carregar os produtos."
    });
  }
});

// Consultar um produto.
app.get("/api/products/:id", requireAuth, async (request, response) => {
  if (!validId(request.params.id)) {
    return response.status(400).json({ erro: "O ID não é válido." });
  }

  try {
    const [products] = await pool.query(`
      SELECT p.id, p.category_id AS categoryId,
             p.title, p.artist, p.condition, p.price, p.stock,
             p.cover_class AS coverClass,
             p.image_url AS imageUrl
      FROM products p
      WHERE p.id = ?
    `, [request.params.id]);

    if (products.length === 0) {
      return response.status(404).json({ erro: "Produto não encontrado." });
    }

    response.json(products[0]);
  } catch (error) {
    response.status(500).json({
      erro: "Não foi possível carregar o produto."
    });
  }
});

// Criar produto.
app.post("/api/products", requireAuth, async (request, response) => {
  if (!validProduct(request.body)) {
    return response.status(400).json({
      erro: "Verifique os dados do produto."
    });
  }

  const {
    categoryId,
    title,
    artist,
    condition,
    price,
    stock,
    coverClass = "cover-1",
    imageUrl
  } = request.body;

  try {
    const [result] = await pool.query(
      "INSERT INTO products " +
      "(category_id, title, artist, `condition`, price, stock, cover_class, image_url) " +
      "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        categoryId,
        title.trim(),
        artist.trim(),
        condition,
        price,
        stock,
        coverClass,
        imageUrl.trim()
      ]
    );

    response.status(201).json({
      mensagem: "Produto adicionado.",
      id: result.insertId
    });
  } catch (error) {
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return response.status(400).json({
        erro: "A categoria indicada não existe."
      });
    }

    response.status(500).json({
      erro: "Não foi possível adicionar o produto."
    });
  }
});

// Editar produto e respetivo stock.
app.put("/api/products/:id", requireAuth, async (request, response) => {
  if (!validId(request.params.id) || !validProduct(request.body)) {
    return response.status(400).json({
      erro: "Verifique o ID e os dados do produto."
    });
  }

  const {
    categoryId,
    title,
    artist,
    condition,
    price,
    stock,
    coverClass = "cover-1",
    imageUrl
  } = request.body;

  try {
    const [result] = await pool.query(
      "UPDATE products SET category_id = ?, title = ?, artist = ?, " +
      "`condition` = ?, price = ?, stock = ?, cover_class = ?, image_url = ? " +
      "WHERE id = ?",
      [
        categoryId,
        title.trim(),
        artist.trim(),
        condition,
        price,
        stock,
        coverClass,
        imageUrl.trim(),
        request.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return response.status(404).json({ erro: "Produto não encontrado." });
    }

    response.json({ mensagem: "Produto atualizado." });
  } catch (error) {
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return response.status(400).json({
        erro: "A categoria indicada não existe."
      });
    }

    response.status(500).json({
      erro: "Não foi possível atualizar o produto."
    });
  }
});

// Eliminar produto.
app.delete("/api/products/:id", requireAuth, async (request, response) => {
  if (!validId(request.params.id)) {
    return response.status(400).json({ erro: "O ID não é válido." });
  }

  try {
    const [result] = await pool.query(
      "DELETE FROM products WHERE id = ?",
      [request.params.id]
    );

    if (result.affectedRows === 0) {
      return response.status(404).json({ erro: "Produto não encontrado." });
    }

    response.status(204).send();
  } catch (error) {
    response.status(500).json({
      erro: "Não foi possível eliminar o produto."
    });
  }
});

app.get("/stock.html", requirePageAuth, (request, response) => {
  response.sendFile(path.join(__dirname, "..", "frontend", "stock.html"));
});

app.use(express.static(path.join(__dirname, "..", "frontend")));

app.listen(PORT, () => {
  console.log(`Groove Manager: http://localhost:${PORT}`);
});
