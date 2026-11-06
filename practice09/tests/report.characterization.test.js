const groupFixture = require("./fixtures/group.json");
const { buildReport } = require("../src/report");

describe("Характеризаційні тести buildReport (фіксація поточної поведінки)", () => {
  describe("Знімки повного тексту відомості на tests/fixtures/group.json", () => {
    test("звичайний режим (повні імена студентів)", () => {
      const result = buildReport(groupFixture, { short: false });
      expect(result).toMatchSnapshot();
    });

    test("скорочений режим (opts.short = true)", () => {
      const result = buildReport(groupFixture, { short: true });
      expect(result).toMatchSnapshot();
    });
  });

  describe("Варіанти параметра opts (undefined, null, {})", () => {
    test("opts = undefined працює як звичайний режим", () => {
      const resUndefined = buildReport(groupFixture, undefined);
      const resOmitted = buildReport(groupFixture);
      expect(resUndefined).toBe(resOmitted);
      expect(resUndefined).toContain("Коваль Андрій — 4.8 (відмінно)");
    });

    test("opts = null не викликає помилки і працює як звичайний режим", () => {
      const resNull = buildReport(groupFixture, null);
      expect(resNull).toBe(buildReport(groupFixture));
    });

    test("opts = {} працює як звичайний режим", () => {
      const resEmptyObj = buildReport(groupFixture, {});
      expect(resEmptyObj).toBe(buildReport(groupFixture));
    });
  });

  describe("Граничні випадки складу групи", () => {
    test("порожня група (students: [])", () => {
      const emptyGroup = { group: "456-Д", students: [] };
      const result = buildReport(emptyGroup);
      expect(result).toBe(
        [
          "Відомість успішності",
          "Група: 456-Д",
          "------------------------------",
          "------------------------------",
          "Середній бал групи: 0.0 (незадовільно)",
          "Потребують уваги: немає",
          "",
        ].join("\n")
      );
    });

    test("дивність: студент без оцінок отримує 0.0 (незадовільно) [!], потрапляє у список уваги і занижує середній бал групи", () => {
      const data = {
        group: "456-Д",
        students: [
          { name: "Коваль Андрій", grades: [5, 5] },
          { name: "Кравець Софія", grades: [] },
        ],
      };
      const result = buildReport(data);
      expect(result).toContain("Кравець Софія — 0.0 (незадовільно) [!]");
      expect(result).toContain("Середній бал групи: 2.5 (задовільно)");
      expect(result).toContain("Потребують уваги: Кравець Софія");
    });

    test("дивність: поріг рівня визначається за точним середнім до округлення toFixed(1)", () => {
      // 49 / 11 = 4.4545... < 4.5 (тому "добре"), але toFixed(1) форматує як "4.5"
      const data = {
        group: "456-Д",
        students: [
          { name: "Іваненко Петро", grades: [5, 5, 4, 4, 4, 5, 4, 5, 4, 5, 4] },
        ],
      };
      const result = buildReport(data);
      expect(result).toContain("Іваненко Петро — 4.5 (добре)");
    });
  });

  describe("Межові значення шкали оцінювання (4.5, 3.5, 2.5)", () => {
    test("рівно 4.5 — рівень «відмінно» для студента і групи", () => {
      const data = {
        group: "456-Д",
        students: [{ name: "Коваль Андрій", grades: [5, 4] }],
      };
      const result = buildReport(data);
      expect(result).toContain("Коваль Андрій — 4.5 (відмінно)");
      expect(result).toContain("Середній бал групи: 4.5 (відмінно)");
      expect(result).toContain("Потребують уваги: немає");
    });

    test("рівно 3.5 — рівень «добре» для студента і групи", () => {
      const data = {
        group: "456-Д",
        students: [{ name: "Бондар Марія", grades: [4, 3] }],
      };
      const result = buildReport(data);
      expect(result).toContain("Бондар Марія — 3.5 (добре)");
      expect(result).toContain("Середній бал групи: 3.5 (добре)");
      expect(result).toContain("Потребують уваги: немає");
    });

    test("рівно 2.5 — рівень «задовільно» без позначки [!] і без додавання у список уваги", () => {
      const data = {
        group: "456-Д",
        students: [{ name: "Ткач Олена", grades: [3, 2] }],
      };
      const result = buildReport(data);
      expect(result).toContain("Ткач Олена — 2.5 (задовільно)\n");
      expect(result).not.toContain("[!]");
      expect(result).toContain("Середній бал групи: 2.5 (задовільно)");
      expect(result).toContain("Потребують уваги: немає");
    });

    test("нижче 2.5 (2.4) — рівень «незадовільно» з позначкою [!] та додаванням у список уваги", () => {
      const data = {
        group: "456-Д",
        students: [{ name: "Мельник Іван", grades: [2, 2, 2, 3, 3] }],
      };
      const result = buildReport(data);
      expect(result).toContain("Мельник Іван — 2.4 (незадовільно) [!]");
      expect(result).toContain("Середній бал групи: 2.4 (незадовільно)");
      expect(result).toContain("Потребують уваги: Мельник Іван");
    });
  });
});
