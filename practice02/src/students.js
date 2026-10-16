/** @typedef {import("./models").Student} Student */

// Повертає масив унікальних адрес пошти студентів у нижньому регістрі,
// без пробілів на початку й у кінці. Порожні адреси ігноруються.
// Порядок – за першою появою.
function uniqueEmails(students) {
  const result = [];
  const seen = new Set();
  for (const student of students) {
    const email = (student.email || "").trim().toLowerCase();
    if (email && !seen.has(email)) {
      seen.add(email);
      result.push(email);
    }
  }
  return result;
}

/**
 * @param {number[]} scores бали за 100-бальною шкалою
 * @returns {number} середнє, округлене до 0,1; для [] – 0
 */
function calculateAverageGrade(scores) {
  if (!Array.isArray(scores) || scores.length === 0) {
    return 0;
  }
  const sum = scores.reduce((acc, score) => acc + score, 0);
  return Math.round((sum / scores.length) * 10) / 10;
}

// formatStudentName("Петренко Андрій Іванович") === "Петренко А. І."
// formatStudentName("Шевчук Олег") === "Шевчук О."
// formatStudentName("  Коваль   Марія  Олегівна ") === "Коваль М. О."
function formatStudentName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "";
  const [lastName, ...rest] = parts;
  const initials = rest.map((name) => `${name[0]}.`).join(" ");
  return initials ? `${lastName} ${initials}` : lastName;
}

module.exports = {
  uniqueEmails,
  calculateAverageGrade,
  formatStudentName,
};
