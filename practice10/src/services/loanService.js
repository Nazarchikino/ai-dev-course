const { fineFor } = require("../fines");
const { daysBetween, addDays } = require("../utils/dates");
const events = require("../notifications/events");

const LOAN_DAYS = 14;

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  err.expose = true;
  return err;
}

function createLoanService(repo) {
  return {
    activeLoans(readerId) {
      return repo.findLoans((l) => l.readerId === readerId && !l.returnedAt);
    },

    issue(readerId, bookId, date) {
      const reader = repo.findReader(readerId);
      if (!reader) throw httpError(404, "Читача не знайдено");
      const loan = repo.saveLoan({ readerId, bookId, issuedAt: date, due: addDays(date, LOAN_DAYS), returnedAt: null });
      events.emit("loan:issued", { loan, reader });
      return loan;
    },

    returnLoan(loanId, date) {
      const loan = repo.findLoan(loanId);
      if (!loan) throw httpError(404, "Видачу не знайдено");
      if (loan.returnedAt) throw httpError(409, "Книгу вже повернуто");
      const reader = repo.findReader(loan.readerId);
      const overdueDays = Math.max(daysBetween(loan.due, date), 0);
      const fine = fineFor(reader.type, overdueDays);
      const updated = repo.saveLoan({ ...loan, returnedAt: date, fine });
      events.emit("loan:returned", { loan: updated, reader, overdueDays, fine });
      return { loan: updated, overdueDays, fine };
    },

    readerFines(readerId) {
      const reader = repo.findReader(readerId);
      if (!reader) throw httpError(404, "Читача не знайдено");
      const finedLoans = repo.findLoans((l) => l.readerId === readerId && Boolean(l.returnedAt) && l.fine > 0);
      const total = finedLoans.reduce((sum, l) => sum + l.fine, 0);
      return { readerId, total, loans: finedLoans.length };
    },
  };
}

module.exports = { createLoanService, LOAN_DAYS };
