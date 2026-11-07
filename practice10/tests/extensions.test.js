const request = require("supertest");
const { createApp } = require("../src/app");
const { fineFor } = require("../src/fines");
const { readerTypeLabel } = require("../src/utils/labels");
const { getJournal, clearJournal } = require("../src/notifications/fineJournal");

const LIB = { "X-Token": "t-librarian" };

beforeEach(() => {
  clearJournal();
});

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

describe("Завдання 7: журнал нарахованих штрафів (новий спостерігач)", () => {
  test("повернення зі штрафом потрапляє в журнал", async () => {
    const app = createApp();
    const issueRes = await request(app)
      .post("/api/loans")
      .set(LIB)
      .send({ readerId: 1, bookId: 10, date: "2026-09-01" });
    await request(app)
      .post(`/api/loans/${issueRes.body.id}/return`)
      .set(LIB)
      .send({ date: "2026-09-18" }); // 3 дні прострочення -> 15 грн

    expect(getJournal()).toEqual([
      {
        loanId: issueRes.body.id,
        readerId: 1,
        reader: "Коваль Андрій",
        overdueDays: 3,
        fine: 15,
      },
    ]);
  });

  test("повернення вчасно не потрапляє в журнал", async () => {
    const app = createApp();
    const issueRes = await request(app)
      .post("/api/loans")
      .set(LIB)
      .send({ readerId: 1, bookId: 10, date: "2026-09-01" });
    await request(app)
      .post(`/api/loans/${issueRes.body.id}/return`)
      .set(LIB)
      .send({ date: "2026-09-10" }); // вчасно -> 0 грн

    expect(getJournal()).toEqual([]);
  });
});

