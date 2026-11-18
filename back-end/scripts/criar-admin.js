const { join } = require("node:path");
require("dotenv").config({ path: join(__dirname, "../.env"), quiet: true });
const bcrypt = require("bcryptjs");
const db = require("../src/database/connection");

async function main() {
  const [nome, email, senha = process.env.VORA_ADMIN_PASSWORD] = process.argv.slice(2);
  if (!nome || !email || !senha || senha.length < 6) {
    console.error('Uso: node scripts/criar-admin.js "Nome" email senha');
    process.exit(1);
  }
  const hash = await bcrypt.hash(senha, 10);
  await db.execute({
    sql: "INSERT INTO administrador (nome, email, senha) VALUES (?, ?, ?)",
    args: [nome, email, hash],
  });
  console.log("Administrador criado:", email);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
