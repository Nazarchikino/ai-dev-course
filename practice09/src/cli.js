const fs = require("node:fs");
const { buildReport } = require("./report");

const [file, flag] = process.argv.slice(2);
const data = JSON.parse(fs.readFileSync(file, "utf8"));
process.stdout.write(buildReport(data, { short: flag === "--short" }));
