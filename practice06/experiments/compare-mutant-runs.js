/**
 * Експериментальний скрипт для демонстрації виявлених помилок за SPEC.md
 * та перевірки виправленого модуля src/grades.js (Практична робота № 6).
 */
const {
  average,
  toFivePoint,
  applyLatePenalty,
  finalGrade,
} = require("../src/grades");

const scenarios = [
  {
    fn: "average([])",
    actual: average([]),
    expected: 0,
    bugBeforeFix: "undefined (рядок 15: return без значення замість return 0)",
  },
  {
    fn: "toFivePoint(90)",
    actual: toFivePoint(90),
    expected: 5,
    bugBeforeFix: "4 (рядок 29: строга нерівність score > 90 замість score >= 90)",
  },
  {
    fn: "applyLatePenalty(80, 4)",
    actual: applyLatePenalty(80, 4),
    expected: 65,
    bugBeforeFix:
      "60 (рядок 45: відсутнє обмеження Math.min(daysLate, 3) * 5 на 3 дні)",
  },
  {
    fn: "finalGrade([3, 4])",
    actual: finalGrade([3, 4]),
    expected: 4,
    bugBeforeFix: "Помилок не виявлено (працювало коректно)",
  },
];

console.table(scenarios);
