/**
 * Експеримент до Завдання 4 (Шаблон 4 – Порівняння варіантів).
 * Порівняння Способу 1 (регулярний вираз) та Способу 2 (покроковий розбір рядка)
 * на базових і кутових випадках формату електронної пошти.
 */

// Спосіб 1: Регулярний вираз
function isValidEmailRegex(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Спосіб 2: Покроковий розбір рядка (зі стартового src/registration.js)
function isValidEmailStringParse(email) {
  const at = email.indexOf("@");
  if (at <= 0) return false;
  const domain = email.slice(at + 1);
  return domain.includes(".") && !domain.startsWith(".") && !domain.endsWith(".");
}

const samples = [
  { email: "a.petrenko@kpefk.ua", expected: true, note: "Валідна пошта здобувача" },
  { email: "petrenko", expected: false, note: "Немає символу @" },
  { email: "petrenko@kpefk", expected: false, note: "Немає крапки в домені" },
  { email: "", expected: false, note: "Порожній рядок" },
  { email: "@kpefk.ua", expected: false, note: "Порожня локальна частина до @" },
  { email: "user@.kpefk.ua", expected: false, note: "Домен починається з крапки" },
  { email: "user@kpefk.", expected: false, note: "Домен закінчується крапкою" },
  { email: "user@@kpefk.ua", expected: false, note: "Кутовий випадок: подвійний символ @" },
  { email: "user name@kpefk.ua", expected: false, note: "Кутовий випадок: пробіл всередині пошти" },
];

console.log("=== Порівняння способів перевірки електронної пошти ===");
for (const s of samples) {
  const r1 = isValidEmailRegex(s.email);
  const r2 = isValidEmailStringParse(s.email);
  console.log(
    `Email: ${JSON.stringify(s.email).padEnd(22)} | Очікувано: ${String(s.expected).padEnd(5)} | RegExp: ${String(r1).padEnd(5)} | StringParse: ${String(r2).padEnd(5)} | ${s.note}`
  );
}
