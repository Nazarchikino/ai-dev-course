const request = require("supertest");
const { createApp } = require("../src/app");
const { createDb } = require("../src/db");
const edgeData = require("../fixtures/edge-cases.json");

let app;
beforeEach(() => {
  app = createApp(createDb(edgeData));
});

test("пагінація на синтетичних даних: сторінка 1 повертає 5 студентів, сторінка 2 — 2 студенти", async () => {
  const page1 = await request(app).get("/api/students").query({ page: 1 });
  expect(page1.status).toBe(200);
  expect(page1.body).toHaveLength(5);

  const page2 = await request(app).get("/api/students").query({ page: 2 });
  expect(page2.status).toBe(200);
  expect(page2.body).toHaveLength(2);
});

test("пошук студента з апострофом у імені працює як звичайний текст", async () => {
  const res = await request(app).get("/api/students/search").query({ name: "Лук'ян" });
  expect(res.status).toBe(200);
  expect(res.body.map((s) => s.id)).toEqual([4]);
});

test("пошук за символом % повертає лише студента із символом % в імені, а не весь список", async () => {
  const res = await request(app).get("/api/students/search").query({ name: "%" });
  expect(res.status).toBe(200);
  expect(res.body.map((s) => s.id)).toEqual([7]);
});

test("картка студента з тегом <script> у імені екранує розмітку", async () => {
  const res = await request(app).get("/api/students/5/card");
  expect(res.status).toBe(200);
  expect(res.text).not.toContain("<script>");
  expect(res.text).toContain("&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;");
});

test("студент без жодної оцінки отримує average: null та «оцінок немає» у картці", async () => {
  const avgRes = await request(app).get("/api/students/6/average");
  expect(avgRes.status).toBe(200);
  expect(avgRes.body).toEqual({ average: null });

  const cardRes = await request(app).get("/api/students/6/card");
  expect(cardRes.status).toBe(200);
  expect(cardRes.text).toContain("оцінок немає");
});

test("середній бал звичайного запису коректно округлюється до десятих", async () => {
  const res = await request(app).get("/api/students/3/average");
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ average: 2.7 });
});

test("користувач student отримує 403 при спробі видалення, а teacher — 204", async () => {
  const studentLogin = await request(app)
    .post("/api/login")
    .send({ login: "edge_student", password: "Student#Edge2026!" });
  expect(studentLogin.status).toBe(200);

  const forbiddenDel = await request(app)
    .delete("/api/students/1")
    .set("Authorization", `Bearer ${studentLogin.body.token}`);
  expect(forbiddenDel.status).toBe(403);

  const teacherLogin = await request(app)
    .post("/api/login")
    .send({ login: "edge_teacher", password: "Teacher#Edge2026!" });
  expect(teacherLogin.status).toBe(200);

  const allowedDel = await request(app)
    .delete("/api/students/1")
    .set("Authorization", `Bearer ${teacherLogin.body.token}`);
  expect(allowedDel.status).toBe(204);
});
