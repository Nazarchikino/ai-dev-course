const events = require("./events");

const entries = [];

events.on("loan:returned", ({ loan, reader, overdueDays, fine }) => {
  if (fine > 0) {
    entries.push({
      loanId: loan.id,
      readerId: reader.id,
      reader: reader.name,
      overdueDays,
      fine,
    });
  }
});

function getJournal() {
  return [...entries];
}

function clearJournal() {
  entries.length = 0;
}

module.exports = { getJournal, clearJournal };
