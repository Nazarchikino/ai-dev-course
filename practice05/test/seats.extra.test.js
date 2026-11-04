const test = require("node:test");
const assert = require("node:assert/strict");
const { createEventRegistry } = require("../src/store");
const { availableSeats } = require("../src/seats");
const { registerParticipant, cancelRegistration } = require("../src/registration");

const now = new Date("2026-10-10T12:00:00Z");
const makeEvent = (capacity) => ({
  id: "extra-ev",
  title: "Майстер-клас із ШІ",
  capacity,
  registrationClosesAt: "2026-10-20T18:00:00Z",
});

test("availableSeats (extra): скасування з основного списку за порожньої черги збільшує вільні місця на 1", () => {
  const r = createEventRegistry(makeEvent(2));
  registerParticipant(r, { email: "a@kpefk.ua", fullName: "А А" }, now);
  registerParticipant(r, { email: "b@kpefk.ua", fullName: "Б Б" }, now);
  assert.equal(availableSeats(r), 0);

  cancelRegistration(r, "a@kpefk.ua");
  assert.equal(availableSeats(r), 1);
});

test("availableSeats (extra): скасування учасника з листа очікування не змінює кількість вільних місць", () => {
  const r = createEventRegistry(makeEvent(1));
  registerParticipant(r, { email: "a@kpefk.ua", fullName: "А А" }, now);
  registerParticipant(r, { email: "b@kpefk.ua", fullName: "Б Б" }, now);
  assert.equal(availableSeats(r), 0);

  cancelRegistration(r, "b@kpefk.ua");
  assert.equal(availableSeats(r), 0);
});

test("availableSeats (extra): відхилена реєстрація (дублікат або невалідна пошта) не зменшує вільні місця", () => {
  const r = createEventRegistry(makeEvent(3));
  registerParticipant(r, { email: "a@kpefk.ua", fullName: "А А" }, now);
  assert.equal(availableSeats(r), 2);

  assert.throws(() => registerParticipant(r, { email: "A@KPEFK.UA", fullName: "А А" }, now));
  assert.throws(() => registerParticipant(r, { email: "invalid-email", fullName: "Б Б" }, now));
  assert.equal(availableSeats(r), 2);
});

test("availableSeats (extra): послідовна реєстрація та скасування усіх учасників повертає початкову місткість", () => {
  const r = createEventRegistry(makeEvent(2));
  assert.equal(availableSeats(r), 2);
  registerParticipant(r, { email: "a@kpefk.ua", fullName: "А А" }, now);
  assert.equal(availableSeats(r), 1);
  registerParticipant(r, { email: "b@kpefk.ua", fullName: "Б Б" }, now);
  assert.equal(availableSeats(r), 0);

  cancelRegistration(r, "a@kpefk.ua");
  cancelRegistration(r, "b@kpefk.ua");
  assert.equal(availableSeats(r), 2);
});

test("availableSeats (extra): інваріант невід’ємності (не менше 0) при перевищенні кількості учасників над capacity", () => {
  const r = createEventRegistry(makeEvent(1));
  r.registered.push(
    { email: "a@kpefk.ua", fullName: "А А" },
    { email: "b@kpefk.ua", fullName: "Б Б" }
  );
  assert.equal(availableSeats(r), 0);
});
