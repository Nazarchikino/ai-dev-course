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
    let studentLevel = "";
    if (studentAverage >= 4.5) {
      studentLevel = "відмінно";
    } else {
      if (studentAverage >= 3.5) {
        studentLevel = "добре";
      } else {
        if (studentAverage >= 2.5) {
          studentLevel = "задовільно";
        } else {
          studentLevel = "незадовільно";
        }
      }
    }
    let line = "";
    if (opts && opts.short) {
      line =
        student.name.split(" ")[0] +
        " " +
        student.name.split(" ")[1][0] +
        ". — " +
        studentAverage.toFixed(1) +
        " (" +
        studentLevel +
        ")";
    } else {
      line =
        student.name +
        " — " +
        studentAverage.toFixed(1) +
        " (" +
        studentLevel +
        ")";
    }
    if (studentAverage < 2.5) {
      line = line + " [!]";
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
