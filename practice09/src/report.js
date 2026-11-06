// Формування відомості успішності групи
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
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum = sum + values[i];
  }
  return sum / values.length;
}

function gradeName(score) {
  return GRADE_THRESHOLDS.find((level) => score >= level.min).name;
}

function formatScore(score) {
  return score.toFixed(1) + " (" + gradeName(score) + ")";
}

function formatStudentName(name, isShort) {
  if (!isShort) {
    return name;
  }
  const [surname, firstName] = name.split(" ");
  return surname + " " + firstName[0] + ".";
}

function formatStudentLine(student, studentAverage, opts) {
  const isShort = Boolean(opts && opts.short);
  const displayName = formatStudentName(student.name, isShort);
  let line = displayName + " — " + formatScore(studentAverage);
  if (studentAverage < 2.5) {
    line = line + " [!]";
  }
  return line;
}

function buildReport(data, opts) {
  let reportText = "";
  const attentionStudents = [];
  const studentAverages = [];
  reportText += "Відомість успішності\n";
  reportText += "Група: " + data.group + "\n";
  reportText += "------------------------------\n";
  for (let i = 0; i < data.students.length; i++) {
    const student = data.students[i];
    const studentAverage = average(student.grades);
    const line = formatStudentLine(student, studentAverage, opts);
    if (studentAverage < 2.5) {
      attentionStudents.push(student.name);
    }
    reportText += line + "\n";
    studentAverages.push(studentAverage);
  }
  reportText += "------------------------------\n";
  const groupAverage = average(studentAverages);
  reportText += "Середній бал групи: " + formatScore(groupAverage) + "\n";
  if (attentionStudents.length > 0) {
    reportText += "Потребують уваги: " + attentionStudents.join(", ") + "\n";
  } else {
    reportText += "Потребують уваги: немає\n";
  }
  return reportText;
}

module.exports = { buildReport };
