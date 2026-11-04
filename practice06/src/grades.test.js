const {
  average,
  toFivePoint,
  applyLatePenalty,
  finalGrade,
} = require("./grades");

describe("Модульні тести grades.js за вимогами SPEC.md", () => {
  describe("average(scores)", () => {
    test("обчислює середнє арифметичне типового масиву чисел", () => {
      expect(average([60, 80, 100])).toBe(80);
    });

    test("для порожнього масиву повертає 0 (за SPEC.md)", () => {
      expect(average([])).toBe(0);
    });

    test("для масиву з одного елемента повертає цей самий елемент", () => {
      expect(average([95])).toBe(95);
    });

    test("кидає TypeError, якщо аргумент не є масивом", () => {
      expect(() => average(null)).toThrow(TypeError);
    });
  });

  describe("toFivePoint(score)", () => {
    test("для граничного балу 90 повертає оцінку 5 (межа включна за SPEC.md)", () => {
      expect(toFivePoint(90)).toBe(5);
    });

    test("для максимального балу 100 повертає оцінку 5", () => {
      expect(toFivePoint(100)).toBe(5);
    });

    test("для граничних балів 75 та 89 повертає оцінку 4", () => {
      expect(toFivePoint(75)).toBe(4);
      expect(toFivePoint(89)).toBe(4);
    });

    test("для граничних балів 60 та 74 повертає оцінку 3", () => {
      expect(toFivePoint(60)).toBe(3);
      expect(toFivePoint(74)).toBe(3);
    });

    test("для граничних балів 0 та 59 повертає оцінку 2", () => {
      expect(toFivePoint(0)).toBe(2);
      expect(toFivePoint(59)).toBe(2);
    });

    test("кидає RangeError для від’ємного балу або балу більше 100", () => {
      expect(() => toFivePoint(-1)).toThrow(RangeError);
      expect(() => toFivePoint(101)).toThrow(RangeError);
    });
  });

  describe("applyLatePenalty(score, daysLate)", () => {
    test("за 0 днів запізнення повертає початковий бал без штрафу", () => {
      expect(applyLatePenalty(85, 0)).toBe(85);
    });

    test("за 3 дні запізнення зменшує бал на 15", () => {
      expect(applyLatePenalty(80, 3)).toBe(65);
    });

    test("для 4 і більше днів запізнення обмежує штраф 15 балами (не більше 3 днів за SPEC.md)", () => {
      expect(applyLatePenalty(80, 4)).toBe(65);
    });

    test("повертає 0, якщо штраф перевищує початковий бал", () => {
      expect(applyLatePenalty(10, 3)).toBe(0);
    });
  });

  describe("finalGrade(thematicGrades)", () => {
    test("округлює середнє 3.5 вгору до 4 за математичними правилами", () => {
      expect(finalGrade([3, 4])).toBe(4);
    });

    test("округлює середнє 3.4 вниз до 3 за математичними правилами", () => {
      expect(finalGrade([3, 3, 3, 4, 4])).toBe(3);
    });

    test("обчислює підсумкову оцінку для граничних оцінок 2 та 5", () => {
      expect(finalGrade([2, 2])).toBe(2);
      expect(finalGrade([5, 5])).toBe(5);
    });
  });
});
