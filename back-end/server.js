const { join } = require("node:path");
require("dotenv").config({ path: join(__dirname, ".env"), quiet: true });

if (!process.env.JWT_SECRET?.trim()) {
  throw new Error("Configure JWT_SECRET em back-end/.env antes de iniciar a API");
}

const app = require("./src/app");

async function iniciar() {
  await require("./src/database/connection").inicializar();
  const render = process.env.RENDER === "true";
  const port = Number(process.env.PORT || (render ? 10000 : 3000));
  const host = render ? "0.0.0.0" : process.env.VORA_HOST || "127.0.0.1";
  const server = app.listen(port, host);
  server.on("listening", () => {
    console.log(`API da VORA ouvindo em ${host} na porta ${server.address().port}`);
  });
  server.on("error", (erro) => {
    console.error(`A API da VORA não conseguiu iniciar em ${host}:${port} (${erro.code ?? erro.message})`);
    process.exitCode = 1;
  });
}

if (require.main === module) {
  iniciar().catch((erro) => {
    console.error("Falha ao inicializar o banco:", erro.code ?? erro.message);
    process.exitCode = 1;
  });
}

module.exports = app;
