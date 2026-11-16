const { toMinutes, formatTime } = require("./time");

function overlaps(a, b) {
  return a.start < b.end && b.start < a.end;
}

function findFreeSlots(bookings, opens, closes, minLength) {
  const busy = bookings
    .map((b) => ({ start: toMinutes(b.from), end: toMinutes(b.to) }))
    .sort((a, b) => a.start - b.start);
  const merged = [];
  for (const cur of busy) {
    const last = merged[merged.length - 1];
    if (last && cur.start <= last.end) last.end = Math.max(last.end, cur.end);
    else merged.push({ ...cur });
  }
  const free = [];
  let cursor = toMinutes(opens);
  for (const b of merged) {
    if (b.start - cursor >= minLength) free.push({ from: formatTime(cursor), to: formatTime(b.start) });
    cursor = Math.max(cursor, b.end);
  }
  const end = toMinutes(closes);
  if (end - cursor >= minLength) free.push({ from: formatTime(cursor), to: formatTime(end) });
  return free;
}

module.exports = { overlaps, findFreeSlots };
