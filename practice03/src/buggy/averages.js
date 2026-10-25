// Середній бал здобувача. Для здобувача без балів має повертати 0.
function averageOf(student) {
  if (student.scores.length === 0) return 0;
  return student.scores.reduce((a, b) => a + b, 0) / student.scores.length;
}
module.exports = { averageOf };
