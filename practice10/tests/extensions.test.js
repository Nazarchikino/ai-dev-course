const request = require("supertest");
const { createApp } = require("../src/app");
const { fineFor } = require("../src/fines");
const { readerTypeLabel } = require("../src/utils/labels");

const LIB = { "X-Token": "t-librarian" };

describe("Завдання 6: тип читача guest (розширення стратегії)", () => {
  test("штраф для guest за 3 дні — 30 грн", () => {
    expect(fineFor("guest", 3)).toBe(30);
  });

  test("штраф для guest за 40 днів — 200 грн (верхня межа)", () => {
    expect(fineFor("guest", 40)).toBe(200);
  });

  test("підпис типу читача guest — «Гість»", () => {
    expect(readerTypeLabel("guest")).toBe("Гість");
  });

  test("повернення книги гостем через API нараховує штраф", async () => {
    const app = createApp();
    const issueRes = await request(app)
      .post("/api/loans")
      .set(LIB)
      .send({ readerId: 4, bookId: 15, date: "2026-09-01" });
    expect(issueRes.status).toBe(201);

    const returnRes = await request(app)
      .post(`/api/loans/${issueRes.body.id}/return`)
      .set(LIB)
      .send({ date: "2026-09-18" }); // 3 дні прострочення (due: 2026-09-15)
    expect(returnRes.status).toBe(200);
    expect(returnRes.body.overdueDays).toBe(3);
    expect(returnRes.body.fine).toBe(30);
  });
});
