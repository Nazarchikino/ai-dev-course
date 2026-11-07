const rules = require("./rules");

function fineFor(readerType, overdueDays) {
  const rule = rules[readerType];
  if (!rule) throw new Error(`Невідомий тип читача: ${readerType}`);
  return overdueDays > 0 ? rule(overdueDays) : 0;
}

module.exports = { fineFor };
