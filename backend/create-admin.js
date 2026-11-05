require("dotenv").config();

const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "groove_store"
});

async function createAdmin() {
  const name = "Administrador Groove";
  const email = "groove@teste.pt";
  const password = "123456";
  const passwordHash = await bcrypt.hash(password, 10);

  await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       password_hash = VALUES(password_hash)`,
    [name, email, passwordHash]
  );

  console.log("Utilizador de demonstração criado:");
  console.log(`Email: ${email}`);
  console.log(`Palavra-passe: ${password}`);
  await pool.end();
}

createAdmin().catch(async error => {
  console.error("Não foi possível criar o utilizador:", error.message);
  await pool.end();
  process.exitCode = 1;
});
