const request = require("supertest");
const { createApp } = require("../src/app");
const { client } = require("../src/notifications/mailAdapter");

const LIB = { "X-Token": "t-librarian" };

let app;
beforeEach(() => {
  app = createApp();
  client.outbox.length = 0;
});

async function issue(readerId, date = "2026-09-01") {
  const res = await request(app).post("/api/loans").set(LIB).send({ readerId, bookId: 10, date });
  return res.body;
}

test("без токена — 401", async () => {
  expect((await request(app).get("/api/loans")).status).toBe(401);
});

test("читач не може видавати книги — 403", async () => {
  const res = await request(app).post("/api/loans").set({ "X-Token": "t-reader-1" }).send({ readerId: 1, bookId: 10, date: "2026-09-01" });
  expect(res.status).toBe(403);
});

test("видача створює запис зі строком 14 днів", async () => {
  const loan = await issue(1);
  expect(loan.due.slice(0, 10)).toBe("2026-09-15");
});

test("повернення з простроченням 3 дні — штраф студенту 15 грн і лист", async () => {
  const loan = await issue(1);
  const res = await request(app).post(`/api/loans/${loan.id}/return`).set(LIB).send({ date: "2026-09-18" });
  expect(res.body.fine).toBe(15);
  expect(client.outbox.map((m) => m.title)).toContain("Нараховано штраф");
});

test("викладач штрафу не сплачує", async () => {
  const loan = await issue(2);
  const res = await request(app).post(`/api/loans/${loan.id}/return`).set(LIB).send({ date: "2026-10-30" });
  expect(res.body.fine).toBe(0);
});

test("повторне повернення — 409", async () => {
  const loan = await issue(1);
  await request(app).post(`/api/loans/${loan.id}/return`).set(LIB).send({ date: "2026-09-10" });
  const res = await request(app).post(`/api/loans/${loan.id}/return`).set(LIB).send({ date: "2026-09-11" });
  expect(res.status).toBe(409);
});
