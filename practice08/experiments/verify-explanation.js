/**
 * Експериментальна перевірка тверджень AI-асистента з пояснення модуля src/library.js (Завдання 2).
 */
const lib = require("../src/library");

function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${day}.${m}.${y}`;
}

console.log("=== 1. Перевірка CARD_RE (латиниця vs кирилиця, типи даних) ===");
console.log('isValidCard("KP-0123/26") [латиниця]:', lib.isValidCard("KP-0123/26")); // true
console.log('isValidCard("КР-0123/26") [кирилиця]:', lib.isValidCard("КР-0123/26")); // false
console.log("isValidCard(null):", lib.isValidCard(null)); // false
console.log("isValidCard(undefined):", lib.isValidCard(undefined)); // false

console.log("\n=== 2. Перевірка мутації вхідної дати у dueDate (Звіт #1) ===");
const originalIssueDate = new Date(2026, 8, 10);
const calculatedDue = lib.dueDate(originalIssueDate);
console.log("originalIssueDate після виклику dueDate:", fmtDate(originalIssueDate));
console.log("calculatedDue:", fmtDate(calculatedDue));
console.log("originalIssueDate === calculatedDue (те саме посилання):", originalIssueDate === calculatedDue);

console.log("\n=== 3. Перевірка calculateFine на межі місяців (Звіт #2) ===");
const fineCrossMonth = lib.calculateFine(new Date(2026, 8, 28), new Date(2026, 9, 3));
console.log("calculateFine(28.09.2026, 03.10.2026):", fineCrossMonth, "грн (очікувано 25 грн)");

console.log("\n=== 4. Перевірка canBorrow для нового читача (Звіт #3) ===");
const newReader = { id: 99, card: "ZV-0456/26", active: true };
try {
  console.log("canBorrow(newReader, []):", lib.canBorrow(newReader, []));
} catch (err) {
  console.log("Помилка виклику canBorrow(newReader, []):", `${err.name}: ${err.message}`);
}
