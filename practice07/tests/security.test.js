const request = require("supertest");
const { createApp } = require("../src/app");
const { createDb } = require("../src/db");
const { hashPassword, createToken } = require("../src/auth");
const { averageGrade } = require("../src/students");
const config = require("../src/config");
const data = require("../fixtures/seed.json");

let db;
let app;

beforeEach(() => {
  db = createDb(data);
  app = createApp(db);
});

test("пошук за ім’ям захищений від SQL-ін’єкції та коректно обробляє апостроф", async () => {
  const sqliRes = await request(app)
    .get("/api/students/search")
    .query({ name: "%' OR 1=1 --" });
  expect(sqliRes.status).toBe(200);
  expect(sqliRes.body).toEqual([]);

  const apostropheRes = await request(app)
    .get("/api/students/search")
    .query({ name: "Д'Артаньян" });
  expect(apostropheRes.status).toBe(200);
  expect(apostropheRes.body).toEqual([]);
});

test("перша сторінка списку студентів містить рівно 5 записів", async () => {
  const res = await request(app).get("/api/students").query({ page: 1 });
  expect(res.status).toBe(200);
  expect(res.body).toHaveLength(5);
  expect(res.body.map((s) => s.id)).toEqual([1, 2, 3, 4, 5]);
});

test("середній бал та HTML-картка для студента без оцінок повертають null та «оцінок немає»", async () => {
  expect(averageGrade(db, 7)).toBeNull();

  const avgRes = await request(app).get("/api/students/7/average");
  expect(avgRes.status).toBe(200);
  expect(avgRes.body).toEqual({ average: null });

  const cardRes = await request(app).get("/api/students/7/card");
  expect(cardRes.status).toBe(200);
  expect(cardRes.text).toContain("оцінок немає");
  expect(cardRes.text).not.toContain("NaN");
});

test("HTML-картка екранує спеціальні символи та не містить виконуваного тегу <script>", async () => {
  const xssData = {
    ...data,
    students: [
      ...data.students,
      { id: 8, name: "<script>alert('xss')</script>", group: "456-Д" },
    ],
  };
  const xssApp = createApp(createDb(xssData));

  const res = await request(xssApp).get("/api/students/8/card");
  expect(res.status).toBe(200);
  expect(res.text).not.toContain("<script>");
  expect(res.text).toContain("&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;");
});

test("видалення студента користувачем із роллю student повертає 403 Forbidden", async () => {
  const studentToken = createToken("student", "student");
  const res = await request(app)
    .delete("/api/students/1")
    .set("Authorization", `Bearer ${studentToken}`);
  expect(res.status).toBe(403);
});

test("внутрішня помилка сервера повертає 500 без витоку err.message та err.stack", async () => {
  db.close();
  const res = await request(app).get("/api/students");
  expect(res.status).toBe(500);
  expect(res.body.stack).toBeUndefined();
  expect(res.body.error).toBe("Внутрішня помилка сервера");
});

test("паролі гешуються стійким алгоритмом із випадковою сіллю, а не MD5", () => {
  const hash1 = hashPassword("teacher-pass");
  const hash2 = hashPassword("teacher-pass");
  expect(hash1).not.toMatch(/^[a-f0-9]{32}$/);
  expect(hash1).toContain(":");
  expect(hash1).not.toBe(hash2);
});

test("ключ підпису токенів береться зі змінної середовища TOKEN_SECRET, а не зберігається в коді", () => {
  expect(config.TOKEN_SECRET).toBe("test-only-secret");
  expect(config.TOKEN_SECRET).not.toBe("journal-secret-2026");
});

test("видалення неіснуючого студента вчителем повертає 404 (перевірка гіпотези асистента)", async () => {
  const teacherToken = createToken("teacher", "teacher");
  const res = await request(app)
    .delete("/api/students/999")
    .set("Authorization", `Bearer ${teacherToken}`);
  expect(res.status).toBe(404);
});
