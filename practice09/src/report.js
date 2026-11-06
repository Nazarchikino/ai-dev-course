// Формування відомості успішності групи
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
  if (score >= 4.5) {
    return "відмінно";
  } else {
    if (score >= 3.5) {
      return "добре";
    } else {
      if (score >= 2.5) {
        return "задовільно";
      } else {
        return "незадовільно";
      }
    }
  }
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
  let line = "";
  if (opts && opts.short) {
    line =
      formatStudentName(student.name, true) +
      " — " +
      formatScore(studentAverage);
  } else {
    line =
      formatStudentName(student.name, false) +
      " — " +
      formatScore(studentAverage);
  }
  if (studentAverage < 2.5) {
    line = line + " [!]";
  }
  return line;
}

function buildReport(data, opts) {
  let reportText = "";
  const attentionStudents = [];
  reportText += "Відомість успішності\n";
  reportText += "Група: " + data.group + "\n";
  reportText += "------------------------------\n";
  let groupGradesSum = 0;
  let studentCount = 0;
  for (let i = 0; i < data.students.length; i++) {
    const student = data.students[i];
    const studentAverage = average(student.grades);
    const line = formatStudentLine(student, studentAverage, opts);
    if (studentAverage < 2.5) {
      attentionStudents.push(student.name);
    }
    reportText += line + "\n";
    groupGradesSum = groupGradesSum + studentAverage;
    studentCount = studentCount + 1;
  }
  reportText += "------------------------------\n";
  let groupAverage = 0;
  if (studentCount > 0) {
    groupAverage = groupGradesSum / studentCount;
  }
  let groupLevel = "";
  if (groupAverage >= 4.5) {
    groupLevel = "відмінно";
  } else {
    if (groupAverage >= 3.5) {
      groupLevel = "добре";
    } else {
      if (groupAverage >= 2.5) {
        groupLevel = "задовільно";
      } else {
        groupLevel = "незадовільно";
      }
    }
  }
  reportText +=
    "Середній бал групи: " + groupAverage.toFixed(1) + " (" + groupLevel + ")\n";
  if (attentionStudents.length > 0) {
    reportText += "Потребують уваги: " + attentionStudents.join(", ") + "\n";
  } else {
    reportText += "Потребують уваги: немає\n";
  }
  return reportText;
}

module.exports = { buildReport };
