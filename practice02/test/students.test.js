const test = require("node:test");
const assert = require("node:assert/strict");
const students = require("../data/students.json");
const { uniqueEmails, calculateAverageGrade, formatStudentName, groupAverage } = require("../src/students");

test("uniqueEmails: нижній регістр, без пробілів, без дублікатів і порожніх", () => {
  assert.deepEqual(uniqueEmails(students), ["a.petrenko@example.com", "m.koval@example.com", "i.bondar@example.com"]);
});
test("calculateAverageGrade: середнє з округленням до 0,1", () => {
  assert.equal(calculateAverageGrade([92, 85, 78]), 85);
  assert.equal(calculateAverageGrade([60, 71]), 65.5);
  assert.equal(calculateAverageGrade([1, 2, 2]), 1.7);
});
test("calculateAverageGrade: порожній масив дає 0", () => {
  assert.equal(calculateAverageGrade([]), 0);
});
test("formatStudentName: прізвище та ініціали", () => {
  assert.equal(formatStudentName("Петренко Андрій Іванович"), "Петренко А. І.");
  assert.equal(formatStudentName("Шевчук Олег"), "Шевчук О.");
  assert.equal(formatStudentName("  Коваль   Марія  Олегівна "), "Коваль М. О.");
});
test("groupAverage: середнє всіх балів групи", () => {
  assert.equal(groupAverage(students, "456-Д"), 84.9);
  assert.equal(groupAverage(students, "366-Д"), 89);
});
test("groupAverage: невідома група дає null", () => {
  assert.equal(groupAverage(students, "999-Х"), null);
});
