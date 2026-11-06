// Формування відомості успішності групи
// Написано кілька років тому, працює, тестів немає.
function buildReport(data, opts) {
  var r = "";
  var arr2 = [];
  r += "Відомість успішності\n";
  r += "Група: " + data.group + "\n";
  r += "------------------------------\n";
  var sum2 = 0;
  var cnt2 = 0;
  for (var i = 0; i < data.students.length; i++) {
    var s = data.students[i];
    var t = 0;
    for (var j = 0; j < s.grades.length; j++) {
      t = t + s.grades[j];
    }
    var d = 0;
    if (s.grades.length > 0) {
      d = t / s.grades.length;
    }
    var g = "";
    if (d >= 4.5) {
      g = "відмінно";
    } else {
      if (d >= 3.5) {
        g = "добре";
      } else {
        if (d >= 2.5) {
          g = "задовільно";
        } else {
          g = "незадовільно";
        }
      }
    }
    var line = "";
    if (opts && opts.short) {
      line = s.name.split(" ")[0] + " " + s.name.split(" ")[1][0] + ". — " + d.toFixed(1) + " (" + g + ")";
    } else {
      line = s.name + " — " + d.toFixed(1) + " (" + g + ")";
    }
    if (d < 2.5) {
      line = line + " [!]";
      arr2.push(s.name);
    }
    r += line + "\n";
    sum2 = sum2 + d;
    cnt2 = cnt2 + 1;
  }
  r += "------------------------------\n";
  var avg = 0;
  if (cnt2 > 0) {
    avg = sum2 / cnt2;
  }
  var ga = "";
  if (avg >= 4.5) {
    ga = "відмінно";
  } else {
    if (avg >= 3.5) {
      ga = "добре";
    } else {
      if (avg >= 2.5) {
        ga = "задовільно";
      } else {
        ga = "незадовільно";
      }
    }
  }
  r += "Середній бал групи: " + avg.toFixed(1) + " (" + ga + ")\n";
  if (arr2.length > 0) {
    r += "Потребують уваги: " + arr2.join(", ") + "\n";
  } else {
    r += "Потребують уваги: немає\n";
  }
  return r;
}

module.exports = { buildReport };
