const { toMinutes, formatTime } = require("./time");

/**
 * Часовий інтервал у хвилинах від початку доби (напіввідкритий проміжок [start, end)).
 *
 * @typedef {object} MinuteSpan
 * @property {number} start Початок інтервалу у хвилинах від початку доби (включно).
 * @property {number} end Кінець інтервалу у хвилинах від початку доби (виключно).
 */

/**
 * Вільний або зайнятий часовий проміжок у текстовому форматі "ГГ:ХХ".
 *
 * @typedef {object} TimeSlot
 * @property {string} from Час початку проміжку у форматі "ГГ:ХХ".
 * @property {string} to Час завершення проміжку у форматі "ГГ:ХХ".
 */

/**
 * Перевіряє, чи перетинаються два напіввідкриті часові інтервали [start, end).
 * Суміжні інтервали, що лише торкаються межами (a.end === b.start), не перетинаються.
 *
 * @param {MinuteSpan} a Перший часовий інтервал у хвилинах.
 * @param {MinuteSpan} b Другий часовий інтервал у хвилинах.
 * @returns {boolean} true, якщо інтервали мають спільний час; інакше false.
 * @example
 * overlaps({ start: 0, end: 60 }, { start: 60, end: 90 }); // false
 * overlaps({ start: 540, end: 615 }, { start: 600, end: 690 }); // true
 */
function overlaps(a, b) {
  return a.start < b.end && b.start < a.end;
}

/**
 * Знаходить усі вільні часові вікна аудиторії в межах робочого дня [opens, closes)
 * тривалістю не менше minLength хвилин.
 *
 * Ідея алгоритму (сканування прямої з попереднім злиттям інтервалів):
 * Замість попарного порівняння сирих бронювань алгоритм переводить час у хвилини від початку доби,
 * впорядковує зайняті інтервали за часом початку й об'єднує всі перетинні або суміжні бронювання
 * у неперервні блоки зайнятості, після чого одним проходом курсора збирає вільні проміжки достатньої довжини.
 *
 * Навіщо потрібне злиття інтервалів:
 * У вхідному списку бронювання можуть перетинатися або бути вкладеними одне в одне
 * (наприклад, "09:00"–"10:15" та "10:00"–"11:30", або коли довге бронювання поглинає коротше).
 * Без злиття цих інтервалів у єдиний зайнятий блок [09:00, 11:30] наївна перевірка сусідніх елементів
 * не врахувала б сумарну межу зайнятості або помилково виявила б фантомне вільне вікно всередині зайнятого часу.
 *
 * Інваріанти:
 * 1. Масив merged містить попарно неперетинні інтервали, суворо впорядковані за зростанням (merged[i].end < merged[i+1].start).
 * 2. Курсор cursor монотонно не спадає і на кожному кроці вказує на найранішу хвилину від opens, з якої аудиторія вільна.
 *
 * Складність: часова O(n log n) через сортування n бронювань (злиття і пошук вікон — O(n)); просторова O(n).
 *
 * @param {Array<TimeSlot>} bookings Список наявних бронювань аудиторії з полями from і to у форматі "ГГ:ХХ".
 * @param {string} opens Час відкриття аудиторії у форматі "ГГ:ХХ".
 * @param {string} closes Час закриття аудиторії у форматі "ГГ:ХХ".
 * @param {number} minLength Мінімальна допустима тривалість вільного проміжку у хвилинах.
 * @returns {Array<TimeSlot>} Масив вільних часових проміжків у форматі { from: "ГГ:ХХ", to: "ГГ:ХХ" }.
 * @throws {RangeError} Якщо будь-який час у bookings, opens або closes має некоректний формат.
 * @example
 * const bookings = [
 *   { from: "10:00", to: "11:30" },
 *   { from: "09:00", to: "10:15" },
 *   { from: "13:00", to: "13:30" }
 * ];
 * findFreeSlots(bookings, "08:00", "18:00", 45);
 * // => [{ from: "08:00", to: "09:00" }, { from: "11:30", to: "13:00" }, { from: "13:30", to: "18:00" }]
 */
function findFreeSlots(bookings, opens, closes, minLength) {
  // Крок 1: переведення інтервалів у хвилини та сортування за часом початку O(n log n)
  const busy = bookings
    .map((b) => ({ start: toMinutes(b.from), end: toMinutes(b.to) }))
    .sort((a, b) => a.start - b.start);

  // Крок 2: злиття перетинних та суміжних інтервалів (cur.start <= last.end) у неперервні блоки зайнятості
  const merged = [];
  for (const cur of busy) {
    const last = merged[merged.length - 1];
    if (last && cur.start <= last.end) last.end = Math.max(last.end, cur.end);
    else merged.push({ ...cur });
  }

  // Крок 3: лінійне сканування робочого дня курсором і відбір вільних вікон довжиною >= minLength
  const free = [];
  let cursor = toMinutes(opens);
  for (const b of merged) {
    if (b.start - cursor >= minLength) free.push({ from: formatTime(cursor), to: formatTime(b.start) });
    cursor = Math.max(cursor, b.end);
  }

  // Крок 4: перевірка залишкового вікна між останнім бронюванням і закриттям аудиторії
  const end = toMinutes(closes);
  if (end - cursor >= minLength) free.push({ from: formatTime(cursor), to: formatTime(end) });
  return free;
}

module.exports = { overlaps, findFreeSlots };
