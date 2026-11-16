const request = require("supertest");
const { createApp } = require("../src/app");
const { createStore } = require("../src/store");

describe("Верифікація версії 1.1 (tests/admin.test.js)", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV, ADMIN_PASSWORD: "test-only-password" };
    delete process.env.WEBHOOK_URL;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  test("граничні оцінки 1 і 5 приймаються (збереження поведінки v1.0)", async () => {
    const app = createApp();
    const res1 = await request(app).post("/api/feedback").send({ lessonId: "L38", rating: 1, comment: "Складно" });
    const res5 = await request(app).post("/api/feedback").send({ lessonId: "L38", rating: 5, comment: "Чудово" });
    expect(res1.status).toBe(201);
    expect(res5.status).toBe(201);
  });

  test("вхід адміністратора використовує пароль зі змінної ADMIN_PASSWORD і повертає криптостійкий токен", async () => {
    const app = createApp();

    const wrongRes = await request(app).post("/api/admin/login").send({ password: "admin123" });
    expect(wrongRes.status).toBe(401);

    const okRes = await request(app).post("/api/admin/login").send({ password: "test-only-password" });
    expect(okRes.status).toBe(200);
    expect(typeof okRes.body.token).toBe("string");
    expect(okRes.body.token).toMatch(/^[0-9a-f]{64}$/);
  });

  test("експорт CSV без токена або з недійсним токеном повертає 401", async () => {
    const app = createApp();

    const noTokenRes = await request(app).get("/api/admin/export.csv");
    expect(noTokenRes.status).toBe(401);

    const badTokenRes = await request(app)
      .get("/api/admin/export.csv")
      .set("Authorization", "Bearer invalid-token");
    expect(badTokenRes.status).toBe(401);
  });

  test("коми, лапки й переведення рядка в коментарі екрануються за RFC 4180, а дата має формат ISO", async () => {
    const store = createStore();
    const app = createApp({ store });

    await request(app)
      .post("/api/feedback")
      .send({ lessonId: "L38", rating: 4, comment: 'Коментар з комою, "лапками"\nта новим рядком' });

    const loginRes = await request(app).post("/api/admin/login").send({ password: "test-only-password" });
    const csvRes = await request(app)
      .get("/api/admin/export.csv")
      .set("Authorization", `Bearer ${loginRes.body.token}`);

    expect(csvRes.status).toBe(200);
    expect(csvRes.headers["content-type"]).toMatch(/text\/csv/);
    expect(csvRes.text).toContain("lessonId,rating,comment,createdAt\n");
    expect(csvRes.text).toContain('"Коментар з комою, ""лапками""\nта новим рядком"');
    expect(csvRes.text).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
  });

  test("коментар, що починається з =, +, -, @, захищений від виконання як формула (CSV Injection)", async () => {
    const store = createStore();
    const app = createApp({ store });

    await request(app)
      .post("/api/feedback")
      .send({ lessonId: "L38", rating: 3, comment: "=cmd|' /C calc'!A0" });

    const loginRes = await request(app).post("/api/admin/login").send({ password: "test-only-password" });
    const csvRes = await request(app)
      .get("/api/admin/export.csv")
      .set("Authorization", `Bearer ${loginRes.body.token}`);

    expect(csvRes.status).toBe(200);
    const dataLine = csvRes.text.trim().split("\n")[1];
    expect(dataLine).not.toContain(",=cmd");
    expect(dataLine).toContain("'=cmd|' /C calc'!A0");
  });

  test("анонімність: збережений відгук та лог не містять IP-адреси автора", async () => {
    const store = createStore();
    const app = createApp({ store });
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    try {
      const res = await request(app)
        .post("/api/feedback")
        .set("User-Agent", "TestBrowser/1.0")
        .send({ lessonId: "L38", rating: 4, comment: "Анонімно" });

      expect(res.status).toBe(201);
      const items = store.all();
      expect(items).toHaveLength(1);
      expect(items[0]).not.toHaveProperty("ip");
      expect(items[0]).not.toHaveProperty("userAgent");
      expect(Object.keys(items[0]).sort()).toEqual(["comment", "createdAt", "lessonId", "rating"]);

      const loggedText = JSON.stringify(logSpy.mock.calls);
      expect(loggedText).not.toContain("127.0.0.1");
    } finally {
      logSpy.mockRestore();
    }
  });

  test("помилка сховища перехоплюється (await store.add) і не розкриває стек чи внутрішній текст помилки", async () => {
    const faultyStore = {
      all: () => [],
      add: async () => {
        throw new Error("disk full");
      },
    };
    const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    try {
      const app = createApp({ store: faultyStore });
      const res = await request(app)
        .post("/api/feedback")
        .send({ lessonId: "L38", rating: 4, comment: "Перевірка помилки" });

      expect(res.status).toBe(500);
      expect(res.body).not.toHaveProperty("stack");
      expect(res.body.error).toBe("Внутрішня помилка сервера");
      expect(res.body.error).not.toContain("disk full");
    } finally {
      errSpy.mockRestore();
    }
  });

  test("недоступний вебхук при низькій оцінці (1 або 2) не заважає збереженню відгуку", async () => {
    process.env.WEBHOOK_URL = "http://127.0.0.1:9/unreachable";
    const store = createStore();
    const app = createApp({ store });

    const res = await request(app)
      .post("/api/feedback")
      .send({ lessonId: "L39", rating: 1, comment: "Погано чути" });

    expect(res.status).toBe(201);
    expect(store.all()).toHaveLength(1);
    expect(store.all()[0]).toMatchObject({ lessonId: "L39", rating: 1, comment: "Погано чути" });
  });

  test("сповіщення через вбудований fetch викликається лише для оцінок 1–2 без персональних даних", async () => {
    process.env.WEBHOOK_URL = "https://hooks.example.com/low-rating";
    const fetchSpy = jest.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true });

    try {
      const app = createApp();
      await request(app).post("/api/feedback").send({ lessonId: "L39", rating: 4, comment: "Добре" });
      expect(fetchSpy).not.toHaveBeenCalled();

      await request(app).post("/api/feedback").send({ lessonId: "L39", rating: 2, comment: "Замало прикладів" });
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      const [url, options] = fetchSpy.mock.calls[0];
      expect(url).toBe("https://hooks.example.com/low-rating");
      expect(options.method).toBe("POST");
      const payload = JSON.parse(options.body);
      expect(payload).toMatchObject({ lessonId: "L39", rating: 2, comment: "Замало прикладів" });
      expect(payload).not.toHaveProperty("ip");
    } finally {
      fetchSpy.mockRestore();
    }
  });
});
