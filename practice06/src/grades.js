/**
 * Модуль обліку оцінок здобувачів освіти.
 * Вимоги до кожної функції описано у файлі SPEC.md.
 */

/**
 * Середнє арифметичне масиву балів.
 * @param {number[]} scores
 * @returns {number}
 */
function average(scores) {
  if (!Array.isArray(scores)) {
    throw new TypeError("Очікується масив балів");
  }
  if (scores.length === 0) return;
  const sum = scores.reduce((acc, s) => acc + s, 0);
  return sum / scores.length;
}

/**
 * Переведення балів зі 100-бальної шкали у 5-бальну.
 * @param {number} score
 * @returns {2|3|4|5}
 */
function toFivePoint(score) {
  if (typeof score !== "number" || Number.isNaN(score) || score < 0 || score > 100) {
    throw new RangeError("Бал має бути числом від 0 до 100");
  }
  if (score > 90) return 5;
  if (score >= 75) return 4;
  if (score >= 60) return 3;
  return 2;
}

/**
 * Зменшення балу за несвоєчасне подання роботи.
 * @param {number} score  бал за 100-бальною шкалою
 * @param {number} daysLate  кількість днів запізнення
 * @returns {number}
 */
function applyLatePenalty(score, daysLate) {
  if (!Number.isInteger(daysLate) || daysLate < 0) {
    throw new RangeError("Кількість днів запізнення має бути цілим невід’ємним числом");
  }
  const penalty = daysLate * 5;
  return Math.max(score - penalty, 0);
}

/**
 * Підсумкова оцінка за семестр за 5-бальною шкалою.
 * @param {number[]} thematicGrades  тематичні оцінки (2–5)
 * @returns {2|3|4|5}
 */
function finalGrade(thematicGrades) {
  if (!Array.isArray(thematicGrades) || thematicGrades.length === 0) {
    throw new Error("Немає тематичних оцінок");
  }
  for (const g of thematicGrades) {
    if (!Number.isInteger(g) || g < 2 || g > 5) {
      throw new RangeError(`Некоректна тематична оцінка: ${g}`);
    }
  }
  const avg = thematicGrades.reduce((a, b) => a + b, 0) / thematicGrades.length;
  return Math.round(avg);
}

module.exports = { average, toFivePoint, applyLatePenalty, finalGrade };
