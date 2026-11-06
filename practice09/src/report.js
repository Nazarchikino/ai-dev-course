// Формування відомості успішності групи
const SEPARATOR = "------------------------------";

const GRADE_THRESHOLDS = [
  { min: 4.5, name: "відмінно" },
  { min: 3.5, name: "добре" },
  { min: 2.5, name: "задовільно" },
  { min: -Infinity, name: "незадовільно" },
];

function average(values) {
  if (values.length === 0) {
    return 0;
  }
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
}

function gradeName(score) {
  return GRADE_THRESHOLDS.find((level) => score >= level.min).name;
}

function formatScore(score) {
  return `${score.toFixed(1)} (${gradeName(score)})`;
}

function formatStudentName(name, isShort) {
  if (!isShort) {
    return name;
  }
  const [surname, firstName] = name.split(" ");
  return `${surname} ${firstName[0]}.`;
}

function formatStudentLine(student, studentAverage, opts) {
  const isShort = Boolean(opts && opts.short);
  const displayName = formatStudentName(student.name, isShort);
  if (studentAverage === null) {
    return `${displayName} — н/а`;
  }
  const warningSuffix = studentAverage < 2.5 ? " [!]" : "";
  return `${displayName} — ${formatScore(studentAverage)}${warningSuffix}`;
}

function buildReport(data, opts) {
  const records = data.students.map((student) => ({
    student,
    studentAverage: student.grades.length > 0 ? average(student.grades) : null,
  }));
  const studentLines = records.map(({ student, studentAverage }) =>
    formatStudentLine(student, studentAverage, opts)
  );
  const graded = records.filter((r) => r.studentAverage !== null);
  const attentionStudents = graded
    .filter((r) => r.studentAverage < 2.5)
    .map((r) => r.student.name);
  const groupAverage = average(graded.map((r) => r.studentAverage));
  const attentionText =
    attentionStudents.length > 0 ? attentionStudents.join(", ") : "немає";

  return [
    "Відомість успішності",
    `Група: ${data.group}`,
    SEPARATOR,
    ...studentLines,
    SEPARATOR,
    `Середній бал групи: ${formatScore(groupAverage)}`,
    `Потребують уваги: ${attentionText}`,
    "",
  ].join("\n");
}

module.exports = { buildReport };
