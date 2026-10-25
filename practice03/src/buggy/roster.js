const fs = require("node:fs");

// Повертає список групи з файлу data/roster.txt (одне ім’я на рядок).
function readRoster() {
  return fs.readFileSync("../../data/roster.txt", "utf8").split(/\r?\n/).filter(Boolean);
}
module.exports = { readRoster };
