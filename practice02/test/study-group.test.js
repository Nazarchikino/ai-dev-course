const test = require("node:test");
const assert = require("node:assert/strict");
const students = require("../data/students.json");
const { StudyGroup } = require("../src/study-group");

function makeGroup() {
  const g = new StudyGroup("456-Д", 2023);
  students.filter((s) => s.groupCode === "456-Д").forEach((s) => g.addStudent(s));
  return g;
}

test("StudyGroup: конструктор", () => {
  const g = new StudyGroup("456-Д", 2023);
  assert.equal(g.code, "456-Д");
  assert.equal(g.year, 2023);
  assert.deepEqual(g.students, []);
});
test("StudyGroup: addStudent перевіряє групу та дублікати", () => {
  const g = makeGroup();
  assert.equal(g.students.length, 3);
  assert.throws(() => g.addStudent(students[3]), Error);
  assert.throws(() => g.addStudent(students[0]), Error);
});
test("StudyGroup: averageScore", () => {
  assert.equal(makeGroup().averageScore(), 84.9);
});
test("StudyGroup: topStudents упорядковує за середнім балом", () => {
  assert.deepEqual(makeGroup().topStudents(2).map((s) => s.id), [2, 1]);
});
test("StudyGroup: немає зайвих публічних методів", () => {
  const methods = Object.getOwnPropertyNames(StudyGroup.prototype).filter((m) => m !== "constructor").sort();
  assert.deepEqual(methods, ["addStudent", "averageScore", "topStudents"]);
});
