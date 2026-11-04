const test = require("node:test");
const assert = require("node:assert/strict");
const { validateParticipant } = require("../src/validation");

test("validateParticipant: нормалізує пошту й ПІБ, зберігає групу", () => {
  assert.deepEqual(validateParticipant({ email: " A@KPEFK.ua ", fullName: "  Коваль Марія ", group: "456-Д" }),
    { email: "a@kpefk.ua", fullName: "Коваль Марія", group: "456-Д" });
});
test("validateParticipant: некоректна пошта – TypeError", () => {
  assert.throws(() => validateParticipant({ email: "petrenko@kpefk", fullName: "А" }), { name: "TypeError", message: "Некоректна електронна пошта" });
});
test("validateParticipant: порожнє ПІБ – TypeError", () => {
  assert.throws(() => validateParticipant({ email: "a@kpefk.ua", fullName: " " }), { name: "TypeError", message: "Вкажіть ПІБ" });
});
test("validateParticipant: не змінює вхідний об’єкт", () => {
  const input = { email: " A@KPEFK.ua ", fullName: "Коваль Марія" };
  validateParticipant(input);
  assert.equal(input.email, " A@KPEFK.ua ");
});
