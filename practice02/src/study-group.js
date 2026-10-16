const { calculateAverageGrade } = require("./students");

// Клас представляє навчальну групу коледжу.
// Зберігає шифр групи, рік вступу та список здобувачів освіти.
class StudyGroup {
  /**
   * Створює екземпляр навчальної групи.
   * @param {string} code шифр групи
   * @param {number} year рік вступу
   */
  constructor(code, year) {
    this.code = code;
    this.year = year;
    this.students = [];
  }

  /**
   * Додає здобувача освіти до групи.
   * @param {import("./models").Student} student здобувач освіти
   */
  addStudent(student) {
    if (student.groupCode !== this.code) {
      throw new Error("Шифр групи здобувача не збігається з шифром групи");
    }
    if (this.students.some((s) => s.id === student.id)) {
      throw new Error("Здобувач із таким id уже доданий до групи");
    }
    this.students.push(student);
  }

  /**
   * Обчислює середній бал усіх здобувачів групи.
   * @returns {number} середній бал групи, округлений до 0,1
   */
  averageScore() {
    const allScores = this.students.flatMap((s) => s.scores);
    return calculateAverageGrade(allScores);
  }

  /**
   * Повертає n здобувачів із найвищим середнім балом.
   * @param {number} n кількість здобувачів
   * @returns {import("./models").Student[]} список найкращих здобувачів
   */
  topStudents(n) {
    return [...this.students]
      .sort((a, b) => {
        const avgDiff =
          calculateAverageGrade(b.scores) - calculateAverageGrade(a.scores);
        if (avgDiff !== 0) {
          return avgDiff;
        }
        return a.fullName.localeCompare(b.fullName, "uk");
      })
      .slice(0, n);
  }
}

module.exports = { StudyGroup };
