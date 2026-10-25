const fs = require("node:fs");
const path = require("node:path");

// Читає налаштування журналу з data/config.json.
function loadConfig() {
  const raw = fs.readFileSync(path.join(__dirname, "..", "..", "data", "config.json"), "utf8");
  return JSON.parse(raw);
}
module.exports = { loadConfig };
