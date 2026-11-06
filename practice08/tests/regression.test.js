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

  // Самоогляд (Завдання 6): зовнішня мутація issueDate після видачі не змінює loan.issuedAt
  issueDate.setDate(30);
  expect(loan.issuedAt).toEqual(new Date(2026, 8, 10));
});

test("ISSUES #2: строк 28.09, повернення 03.10 – штраф 25 грн (межа місяців, року та зимовий час)", () => {
  expect(lib.calculateFine(new Date(2026, 8, 28), new Date(2026, 9, 3))).toBe(25);
  // Перевірка переходу на зимовий час в Україні (25.10.2026 — доба 25 годин)
  expect(lib.calculateFine(new Date(2026, 9, 24), new Date(2026, 9, 26))).toBe(10);
  // Перевірка переходу через межу року та обмеження MAX_FINE (100 грн)
  expect(lib.calculateFine(new Date(2026, 11, 29), new Date(2027, 0, 3))).toBe(25);
  expect(lib.calculateFine(new Date(2026, 8, 1), new Date(2026, 9, 1))).toBe(100);
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

describe("Правило 5: renewLoan(loan, today) — продовження строку видачі (Завдання 9)", () => {
  test("продовжує строк на 7 днів до закінчення строку (включно з днем due) і не мутує вхідний запис", () => {
    const originalDue = new Date(2026, 8, 15);
    const loan = {
      readerId: 1,
      bookId: "BOOK-10",
      issuedAt: new Date(2026, 8, 1),
      due: originalDue,
      returnedAt: null,
    };

    const renewed = lib.renewLoan(loan, new Date(2026, 8, 15));

    expect(renewed).not.toBe(loan);
    expect(renewed.due).toEqual(new Date(2026, 8, 22));
    expect(renewed.renewed).toBe(true);
    // Перевірка незмінності (immutability) вхідного об'єкта loan
    expect(loan.due).toEqual(new Date(2026, 8, 15));
    expect(loan.renewed).toBeUndefined();
  });

  test("забороняє повторне продовження строку (не більше одного разу)", () => {
    const loan = {
      readerId: 1,
      bookId: "BOOK-10",
      issuedAt: new Date(2026, 8, 1),
      due: new Date(2026, 8, 15),
      returnedAt: null,
    };

    const renewedOnce = lib.renewLoan(loan, new Date(2026, 8, 10));
    expect(() => lib.renewLoan(renewedOnce, new Date(2026, 8, 12))).toThrow(
      "Строк видачі вже було продовжено"
    );
  });

  test("забороняє продовження для вже повернутої книги", () => {
    const returnedLoan = {
      readerId: 1,
      bookId: "BOOK-10",
      issuedAt: new Date(2026, 8, 1),
      due: new Date(2026, 8, 15),
      returnedAt: new Date(2026, 8, 10),
    };

    expect(() => lib.renewLoan(returnedLoan, new Date(2026, 8, 11))).toThrow(
      "Не можна продовжити повернуту книгу"
    );
  });

  test("забороняє продовження після закінчення строку повернення (простроченої книги)", () => {
    const overdueLoan = {
      readerId: 1,
      bookId: "BOOK-10",
      issuedAt: new Date(2026, 8, 1),
      due: new Date(2026, 8, 15),
      returnedAt: null,
    };

    expect(() => lib.renewLoan(overdueLoan, new Date(2026, 8, 16))).toThrow(
      "Не можна продовжити прострочену книгу"
    );
  });
});
