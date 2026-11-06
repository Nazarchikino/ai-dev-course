/**
 * Облік видачі книг у бібліотеці коледжу.
 * Вимоги — у README.md, розділ «Правила бібліотеки».
 */

const LOAN_DAYS = 14;
const FINE_PER_DAY = 5;
const MAX_FINE = 100;
const MAX_ACTIVE = 3;
const CARD_RE = /^(KP|ZV)-(\d{4})\/(\d{2})$/;

function isValidCard(card) {
  return CARD_RE.test(card);
}

function dueDate(issueDate, days = LOAN_DAYS) {
  const due = new Date(issueDate.getTime());
  due.setDate(due.getDate() + days);
  return due;
}

const MS_PER_DAY = 86_400_000;

function toUtcDay(date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

function calculateFine(due, returnedAt) {
  const late = (toUtcDay(returnedAt) - toUtcDay(due)) / MS_PER_DAY;
  if (late <= 0) return 0;
  return Math.min(late * FINE_PER_DAY, MAX_FINE);
}

function groupByReader(loans) {
  const result = {};
  for (const loan of loans) {
    (result[loan.readerId] ||= []).push(loan);
  }
  return result;
}

function canBorrow(reader, loans) {
  const byReader = groupByReader(loans);
  const readerLoans = byReader[reader.id] || [];
  const active = readerLoans.filter((l) => !l.returnedAt);
  return Boolean(reader.active) && active.length < MAX_ACTIVE;
}

function issueBook(loans, reader, bookId, issueDate) {
  if (!isValidCard(reader.card)) {
    throw new Error("Некоректний номер читацького квитка");
  }
  if (!canBorrow(reader, loans)) {
    throw new Error("Видачу заборонено");
  }
  const loan = {
    readerId: reader.id,
    bookId,
    issuedAt: issueDate,
    due: dueDate(issueDate),
    returnedAt: null,
  };
  loans.push(loan);
  return loan;
}

function returnBook(loan, returnedAt) {
  loan.returnedAt = returnedAt;
  return calculateFine(loan.due, returnedAt);
}

module.exports = {
  LOAN_DAYS, FINE_PER_DAY, MAX_FINE, MAX_ACTIVE,
  isValidCard, dueDate, calculateFine, canBorrow, issueBook, returnBook,
};
