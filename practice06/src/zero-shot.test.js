const {
  average,
  toFivePoint,
  applyLatePenalty,
  finalGrade,
} = require("./grades");

describe("Zero-shot тести модуля grades.js (відкориговані за SPEC.md у завданні 8)", () => {
  describe("average", () => {
    test("обчислює середнє арифметичне масиву балів", () => {
      expect(average([70, 80, 90])).toBe(80);
    });

    // Виправлено у завданні 8: за SPEC.md для порожнього масиву повертається 0, а не undefined
    test("повертає 0 для порожнього масиву (виправлено за SPEC.md)", () => {
      expect(average([])).toBe(0);
    });

    test("кидає TypeError, якщо передано не масив", () => {
      expect(() => average("100")).toThrow(TypeError);
    });
  });

  describe("toFivePoint", () => {
    test("повертає 5 для балу більше 90", () => {
      expect(toFivePoint(95)).toBe(5);
    });

    // Виправлено у завданні 8: за SPEC.md межа 90 включна і відповідає оцінці 5, а діапазон 75–89 — оцінці 4
    test("повертає 5 для граничного балу 90 та 4 для діапазону 75–89 (виправлено за SPEC.md)", () => {
      expect(toFivePoint(90)).toBe(5);
      expect(toFivePoint(82)).toBe(4);
    });

    test("повертає 3 для балу з діапазону 60–74", () => {
      expect(toFivePoint(65)).toBe(3);
    });

    test("повертає 2 для балу менше 60", () => {
      expect(toFivePoint(45)).toBe(2);
    });

    test("кидає RangeError для балу поза межами 0–100", () => {
      expect(() => toFivePoint(-5)).toThrow(RangeError);
    });
  });

  describe("applyLatePenalty", () => {
    test("зменшує бал на 5 за кожен день запізнення", () => {
      expect(applyLatePenalty(90, 2)).toBe(80);
    });

    // Виправлено у завданні 8: за SPEC.md максимальний штраф становить 15 балів (не більше 3 днів)
    test("обмежує штраф 15 балами за 5 днів запізнення (виправлено за SPEC.md)", () => {
      expect(applyLatePenalty(100, 5)).toBe(85);
    });

    test("не повертає значення менше 0", () => {
      expect(applyLatePenalty(10, 3)).toBe(0);
    });
  });

  describe("finalGrade", () => {
    test("обчислює округлену підсумкову оцінку", () => {
      expect(finalGrade([3, 4, 5])).toBe(4);
    });

    // Дублікат тесту «правильно рахує середню оцінку за семестр» ([4, 4, 4] -> 4) видалено у завданні 8

    test("повертає 5 для відмінних тематичних оцінок", () => {
      expect(finalGrade([5, 5, 5])).toBe(5);
    });
  });
});
