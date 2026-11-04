const { PAGE_SIZE } = require("./config");

/** Сторінка списку студентів; page починається з 1 */
function listStudents(db, page) {
  const rows = db.prepare("SELECT id, name, group_name FROM students ORDER BY id").all();
  const safePage = Math.max(1, Math.trunc(Number(page)) || 1);
  const start = (safePage - 1) * PAGE_SIZE;
  return rows.slice(start, start + PAGE_SIZE);
}

/** Пошук студентів за частиною імені */
function findByName(db, name) {
  const escaped = String(name).replace(/[\\%_]/g, "\\$&");
  return db
    .prepare("SELECT id, name, group_name FROM students WHERE name LIKE ? ESCAPE '\\' ORDER BY id")
    .all(`%${escaped}%`);
}

function getById(db, id) {
  return db.prepare("SELECT id, name, group_name FROM students WHERE id = ?").get(id);
}

/** Середній бал студента, округлений до десятих */
function averageGrade(db, id) {
  const rows = db.prepare("SELECT value FROM grades WHERE student_id = ?").all(id);
  if (rows.length === 0) return null;
  const sum = rows.reduce((acc, r) => acc + r.value, 0);
  return Math.round((sum / rows.length) * 10) / 10;
}

function deleteStudent(db, id) {
  db.prepare("DELETE FROM grades WHERE student_id = ?").run(id);
  return db.prepare("DELETE FROM students WHERE id = ?").run(id).changes > 0;
}

module.exports = { listStudents, findByName, getById, averageGrade, deleteStudent };
