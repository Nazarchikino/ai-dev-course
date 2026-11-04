/**
 * Скрипт перевірки виправлень безпеки та межових випадків journal-api (Практична робота № 7)
 */
process.env.TOKEN_SECRET = process.env.TOKEN_SECRET || "experiment-secret-key";

const { createDb } = require("../src/db");
const { hashPassword } = require("../src/auth");
const { listStudents, findByName, averageGrade } = require("../src/students");
const edgeData = require("../fixtures/edge-cases.json");

const db = createDb(edgeData);

console.log("=== Перевірка безпеки та межових випадків journal-api ===");
console.log("1. Сторінка 1 (очікується 5 записів):", listStudents(db, 1).length);
console.log("2. Пошук з апострофом (Лук'ян):", findByName(db, "Лук'ян").map((s) => s.name));
console.log("3. Пошук зі спецсимволом %:", findByName(db, "%").map((s) => s.name));
console.log("4. Спроба SQLi (%' OR 1=1 --):", findByName(db, "%' OR 1=1 --").length);
console.log("5. Середній бал без оцінок (id=6):", averageGrade(db, 6));
console.log("6. Приклад scrypt-гешу з сіллю:", hashPassword("demo-pass").slice(0, 45) + "...");
