const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

function parseSchedule(text) {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const [day, time, ...rest] = l.split(/\s*\|\s*/);
      const [h, m] = time.split(":").map(Number);
      return { day, minutes: h * 60 + m, subject: rest.join(" | ") };
    })
    .sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.minutes - b.minutes);
}

module.exports = { parseSchedule, DAYS };
