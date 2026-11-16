/**
 * Перетворює рядок часу у форматі "ГГ:ХХ" на кількість хвилин від початку доби.
 *
 * @param {string} hhmm Час доби у 24-годинному форматі "ГГ:ХХ" (від "00:00" до "23:59").
 * @returns {number} Кількість хвилин від початку доби (від 0 до 1439).
 * @throws {RangeError} Якщо рядок не відповідає формату "ГГ:ХХ" або містить некоректний час.
 * @example
 * toMinutes("08:30"); // 510
 */
function toMinutes(hhmm) {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(hhmm);
  if (!m) throw new RangeError(`Некоректний час: ${hhmm}`);
  return Number(m[1]) * 60 + Number(m[2]);
}

/**
 * Перетворює хвилини від початку доби на рядок часу у форматі "ГГ:ХХ".
 *
 * @param {number} minutes Кількість хвилин від початку доби.
 * @returns {string} Рядок часу у форматі "ГГ:ХХ" з провідними нулями (наприклад, "08:30").
 * @example
 * formatTime(510); // "08:30"
 */
function formatTime(minutes) {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}`;
}

module.exports = { toMinutes, formatTime };
