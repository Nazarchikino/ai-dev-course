/**
 * Експеримент до Завдання 2 (Шаблон 2 – Пояснення чужого коду).
 * Емпірична перевірка тверджень із пунктів 3–4 (припущення щодо вхідних даних
 * функції cancelRegistration та наслідки їх порушення).
 */

const assert = require("node:assert/strict");
const { createEventRegistry } = require("../src/store");
const { cancelRegistration } = require("../src/registration");

const dummyEvent = {
  id: "exp-01",
  title: "Тестова подія",
  capacity: 1,
  registrationClosesAt: "2026-12-01T18:00:00Z",
};

const results = [];

function checkAssumption(id, description, fn) {
  try {
    const outcome = fn();
    results.push({ id, description, confirmed: true, detail: outcome });
  } catch (err) {
    results.push({ id, description, confirmed: false, detail: err.message });
  }
}

// 1. Порушення: registry = null або undefined
checkAssumption(
  1,
  "registry === null викликає TypeError при зверненні до registry.registered",
  () => {
    assert.throws(
      () => cancelRegistration(null, "a@kpefk.ua"),
      (err) => err instanceof TypeError
    );
    return "Підтверджено: TypeError (Cannot read properties of null)";
  }
);

// 2. Порушення: registry.registered заморожений (Object.freeze) — неможлива мутація splice
checkAssumption(
  2,
  "Заморожений масив registry.registered викликає TypeError під час splice",
  () => {
    const r = createEventRegistry(dummyEvent);
    r.registered = Object.freeze([{ email: "a@kpefk.ua", fullName: "А А" }]);
    assert.throws(
      () => cancelRegistration(r, "a@kpefk.ua"),
      (err) => err instanceof TypeError
    );
    return "Підтверджено: TypeError (Cannot delete property '0' of [object Array])";
  }
);

// 3. Порушення: у масиві registered збережено ненормалізовану пошту (верхній регістр) в обхід registerParticipant
checkAssumption(
  3,
  "Ненормалізований email у масиві registered ('A@KPEFK.UA') не знаходиться через строге порівняння з key",
  () => {
    const r = createEventRegistry(dummyEvent);
    r.registered.push({ email: "A@KPEFK.UA", fullName: "А А" });
    assert.throws(
      () => cancelRegistration(r, "a@kpefk.ua"),
      { name: "Error", message: "Учасника не знайдено" }
    );
    return "Підтверджено: Error('Учасника не знайдено'), бо x.email === key очікує нижній регістр";
  }
);

// 4. Порушення: елемент у масиві registered є null
checkAssumption(
  4,
  "Наявність null-елемента в масиві registered викликає TypeError у колбеку (x) => x.email === key",
  () => {
    const r = createEventRegistry(dummyEvent);
    r.registered.push(null);
    assert.throws(
      () => cancelRegistration(r, "a@kpefk.ua"),
      (err) => err instanceof TypeError
    );
    return "Підтверджено: TypeError (Cannot read properties of null (reading 'email'))";
  }
);

// 5. Порушення: email = null або undefined (перевірка захищеності normalizeEmail)
checkAssumption(
  5,
  "При email = null функція НЕ падає з TypeError завдяки String(email ?? ''), а викидає Error('Учасника не знайдено')",
  () => {
    const r = createEventRegistry(dummyEvent);
    r.registered.push({ email: "a@kpefk.ua", fullName: "А А" });
    assert.throws(
      () => cancelRegistration(r, null),
      { name: "Error", message: "Учасника не знайдено" }
    );
    return "Підтверджено: normalizeEmail перетворює null на '', тому викидається штатний Error('Учасника не знайдено')";
  }
);

console.log("=== Результати перевірки тверджень Шаблону 2 (cancelRegistration) ===");
for (const r of results) {
  console.log(`[${r.confirmed ? "OK" : "FAIL"}] Твердження ${r.id}: ${r.description}`);
  console.log(`     -> ${r.detail}`);
}
console.log(
  `\nПідсумок: підтверджено ${results.filter((x) => x.confirmed).length} із ${results.length} перевірених тверджень.`
);
