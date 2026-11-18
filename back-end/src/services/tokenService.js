const jwt = require("jsonwebtoken");

function emitirToken(id, tipo) {
  return jwt.sign({ id, tipo }, process.env.JWT_SECRET, { expiresIn: "2h" });
}

module.exports = { emitirToken };
