const lib = require("../src/library");

test("ISSUES #1: видача 10.09.2026 не змінює дату видачі issuedAt (залишається 10.09, а due — 24.09)", () => {
  const loans = [
    { readerId: 1, bookId: "BOOK-00", issuedAt: new Date(2026, 8, 1), due: new Date(2026, 8, 15), returnedAt: new Date(2026, 8, 5) },
  ];
  const reader = { id: 1, card: "KP-0123/26", active: true };
  const issueDate = new Date(2026, 8, 10);

  const loan = lib.issueBook(loans, reader, "BOOK-101", issueDate);

  expect(issueDate).toEqual(new Date(2026, 8, 10));
  expect(loan.issuedAt).toEqual(new Date(2026, 8, 10));
  expect(loan.due).toEqual(new Date(2026, 8, 24));
});

test("ISSUES #2: строк 28.09, повернення 03.10 – штраф 25 грн", () => {
  expect(lib.calculateFine(new Date(2026, 8, 28), new Date(2026, 9, 3))).toBe(25);
  // Перевірка переходу на зимовий час в Україні (25.10.2026 — доба 25 годин)
  expect(lib.calculateFine(new Date(2026, 9, 24), new Date(2026, 9, 26))).toBe(10);
});

test("ISSUES #3: новий читач (ZV-0456/26) без попередніх видач може отримати першу книгу", () => {
  const loans = [
    { readerId: 1, bookId: "BOOK-01", issuedAt: new Date(2026, 8, 1), due: new Date(2026, 8, 15), returnedAt: null },
  ];
  const newReader = { id: 2, card: "ZV-0456/26", active: true };

  expect(lib.canBorrow(newReader, loans)).toBe(true);
  const loan = lib.issueBook(loans, newReader, "BOOK-02", new Date(2026, 8, 10));
  expect(loan.readerId).toBe(2);
  expect(loan.bookId).toBe("BOOK-02");
});
