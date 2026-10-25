// Запуск прикладів для перевірки пояснень асистента (завдання 2–3).
// Змінюйте вхідні дані й спостерігайте за результатом.
const { parseSchedule } = require("../src/legacy/schedule");
const { memo, groupBy } = require("../src/legacy/memo");

const text = `
# розклад групи 456-Д
Вт | 10:10 | Розробка клієнт-серверних застосувань
Пн | 08:30 | Методи та засоби AI | ауд. 214
Пн | 10:10 | WEB-технології
`;
console.log(parseSchedule(text));

// Експеримент (Завдання 2): перевірка порушення припущень щодо вхідних даних
const experimentalText = `
Пн | 08:30 | Методи та засоби AI
Нд | 09:00 | Фізкультура
Пн | 9 | Історія
`;
console.log("Експеримент parseSchedule:", parseSchedule(experimentalText));

let calls = 0;
const slowSquare = memo((n) => { calls++; return n * n; });
slowSquare(4); slowSquare(4); slowSquare(5);
console.log("викликів функції:", calls);

// Експеримент (Завдання 3): перевірка ключа JSON.stringify(args) на об'єктах із різним порядком ключів
let objCalls = 0;
const memoObj = memo((obj) => { objCalls++; return obj.a + obj.b; });
memoObj({ a: 1, b: 2 });
memoObj({ b: 2, a: 1 });
console.log("викликів для {a:1,b:2} та {b:2,a:1}:", objCalls);

console.log(groupBy(["кіт", "пес", "їжак", "сом"], (w) => w.length));
