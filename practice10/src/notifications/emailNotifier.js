const events = require("./events");
const { notify } = require("./mailAdapter");
const { formatDate } = require("../utils/dates");

events.on("loan:issued", ({ loan, reader }) => {
  notify(reader, "Книгу видано", `Поверніть книгу до ${formatDate(loan.due)}.`);
});

events.on("loan:returned", ({ reader, fine }) => {
  if (fine > 0) notify(reader, "Нараховано штраф", `Штраф за прострочення: ${fine} грн.`);
});
