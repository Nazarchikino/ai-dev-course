// Завдання 8: критерій успіху для агента. Скопіюйте файл у tests/ і доведіть до проходження.
// Вимога: GET /api/readers/:id/fines повертає { readerId, total, loans } — суму штрафів читача
// та кількість повернених книг зі штрафом. Доступ: бібліотекар — до будь-якого читача,
// читач — лише до себе (інакше 403). Неіснуючий читач — 404.
const request = require("supertest");
const { createApp } = require("../src/app");

const LIB = { "X-Token": "t-librarian" };
const READER1 = { "X-Token": "t-reader-1" };

async function issueAndReturn(app, readerId, returnDate) {
  const loan = (await request(app).post("/api/loans").set(LIB).send({ readerId, bookId: 10, date: "2026-09-01" })).body;
  await request(app).post(`/api/loans/${loan.id}/return`).set(LIB).send({ date: returnDate });
}

test("бібліотекар бачить суму штрафів читача", async () => {
  const app = createApp();
  await issueAndReturn(app, 1, "2026-09-18"); // 3 дні — 15 грн
  await issueAndReturn(app, 1, "2026-09-10"); // вчасно — 0
  await issueAndReturn(app, 1, "2026-09-20"); // 5 днів — 25 грн
  const res = await request(app).get("/api/readers/1/fines").set(LIB);
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ readerId: 1, total: 40, loans: 2 });
});

test("читач бачить власні штрафи", async () => {
  const app = createApp();
  const res = await request(app).get("/api/readers/1/fines").set(READER1);
  expect(res.body).toEqual({ readerId: 1, total: 0, loans: 0 });
});

test("читач не бачить чужих штрафів — 403", async () => {
  const app = createApp();
  expect((await request(app).get("/api/readers/2/fines").set(READER1)).status).toBe(403);
});

test("неіснуючий читач — 404", async () => {
  const app = createApp();
  expect((await request(app).get("/api/readers/99/fines").set(LIB)).status).toBe(404);
});
