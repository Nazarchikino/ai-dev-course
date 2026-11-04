const test = require("node:test");
const assert = require("node:assert/strict");
const { createEventRegistry } = require("../src/store");
const { availableSeats } = require("../src/seats");
const { registerParticipant, cancelRegistration } = require("../src/registration");

const now = new Date("2026-10-10T12:00:00Z");
const ev = (capacity) => ({ id: "e", title: "Семінар", capacity, registrationClosesAt: "2026-10-20T18:00:00Z" });

test("availableSeats: порожня подія – усі місця вільні", () => {
  assert.equal(availableSeats(createEventRegistry(ev(3))), 3);
});
test("availableSeats: зменшується після реєстрації", () => {
  const r = createEventRegistry(ev(3));
  registerParticipant(r, { email: "a@kpefk.ua", fullName: "А А" }, now);
  assert.equal(availableSeats(r), 2);
});
test("availableSeats: заповнена подія з чергою – 0, не від’ємне", () => {
  const r = createEventRegistry(ev(1));
  registerParticipant(r, { email: "a@kpefk.ua", fullName: "А А" }, now);
  registerParticipant(r, { email: "b@kpefk.ua", fullName: "Б Б" }, now);
  assert.equal(availableSeats(r), 0);
});
test("availableSeats: capacity = 0 – 0", () => {
  assert.equal(availableSeats(createEventRegistry(ev(0))), 0);
});
test("availableSeats: скасування з переведенням з черги не звільняє місце", () => {
  const r = createEventRegistry(ev(1));
  registerParticipant(r, { email: "a@kpefk.ua", fullName: "А А" }, now);
  registerParticipant(r, { email: "b@kpefk.ua", fullName: "Б Б" }, now);
  cancelRegistration(r, "a@kpefk.ua");
  assert.equal(availableSeats(r), 0);
});
