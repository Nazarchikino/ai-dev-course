function toMinutes(hhmm) {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(hhmm);
  if (!m) throw new RangeError(`Некоректний час: ${hhmm}`);
  return Number(m[1]) * 60 + Number(m[2]);
}

/**
 * Перетворює хвилини від початку доби на рядок часу.
 * @param {number} minutes
 * @returns {string} рядок у форматі "08:30" ("ГГ:ХХ")
 */
function formatTime(minutes) {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}`;
}

module.exports = { toMinutes, formatTime };
