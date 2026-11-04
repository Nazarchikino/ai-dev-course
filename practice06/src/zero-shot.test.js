const {
  average,
  toFivePoint,
  applyLatePenalty,
  finalGrade,
} = require("./grades");

describe("Zero-shot тести модуля grades.js (без SPEC.md)", () => {
  describe("average", () => {
    test("обчислює середнє арифметичне масиву балів", () => {
      expect(average([70, 80, 90])).toBe(80);
    });

    test("повертає undefined для порожнього масиву", () => {
      expect(average([])).toBeUndefined();
    });

    test("кидає TypeError, якщо передано не масив", () => {
      expect(() => average("100")).toThrow(TypeError);
    });
  });

  describe("toFivePoint", () => {
    test("повертає 5 для балу строго більше 90", () => {
      expect(toFivePoint(95)).toBe(5);
    });

    test("повертає 4 для балу 90 та діапазону 75–89", () => {
      expect(toFivePoint(90)).toBe(4);
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

    test("зменшує бал на 25 за 5 днів запізнення", () => {
      expect(applyLatePenalty(100, 5)).toBe(75);
    });

    test("не повертає значення менше 0", () => {
      expect(applyLatePenalty(10, 3)).toBe(0);
    });
  });

  describe("finalGrade", () => {
    test("обчислює округлену підсумкову оцінку", () => {
      expect(finalGrade([3, 4, 5])).toBe(4);
    });

    test("правильно рахує середню оцінку за семестр", () => {
      expect(finalGrade([4, 4, 4])).toBe(4);
    });

    test("повертає 5 для відмінних тематичних оцінок", () => {
      expect(finalGrade([5, 5, 5])).toBe(5);
    });
  });
});
