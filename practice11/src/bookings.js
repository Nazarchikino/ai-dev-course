const { toMinutes } = require("./time");
const { overlaps } = require("./slots");

const MAX_BOOKING_HOURS = Number(process.env.MAX_BOOKING_HOURS) || 4;
const MIN_CANCEL_HOURS = 2;

function httpError(status, message) {
  return Object.assign(new Error(message), { status, expose: true });
}

/**
 * Створює сервіс бронювань.
 * @param {Array} roomList список аудиторій
 */
function createBookingService(rooms) {
  const bookings = [];
  let nextId = 1;

  function findRoom(id) {
    const room = rooms.find((r) => r.id === id);
    if (!room) throw httpError(404, "Аудиторію не знайдено");
    return room;
  }

  return {
    list(roomId, date) {
      findRoom(roomId);
      return bookings.filter((b) => b.roomId === roomId && b.date === date);
    },

    create({ roomId, date, from, to, who }) {
      const room = findRoom(roomId);
      const span = { start: toMinutes(from), end: toMinutes(to) };
      if (span.end <= span.start) throw httpError(400, "Кінець має бути пізніше за початок");
      if (span.start < toMinutes(room.opens) || span.end > toMinutes(room.closes)) {
        throw httpError(400, "Аудиторія в цей час зачинена");
      }
      if (span.end - span.start > MAX_BOOKING_HOURS * 60) throw httpError(400, "Занадто довге бронювання");
      const clash = this.list(roomId, date).find((b) => overlaps(span, { start: toMinutes(b.from), end: toMinutes(b.to) }));
      if (clash) throw httpError(409, `Перетин із бронюванням #${clash.id}`);
      const booking = { id: nextId++, roomId, date, from, to, who };
      bookings.push(booking);
      return booking;
    },

    // бронювання можна скасувати не пізніше ніж за 24 години до початку
    cancel(id, now = new Date()) {
      const booking = bookings.find((b) => b.id === id);
      if (!booking) throw httpError(404, "Бронювання не знайдено");
      const startsAt = new Date(`${booking.date}T${booking.from}:00`);
      if ((startsAt - now) / 3_600_000 < MIN_CANCEL_HOURS) throw httpError(409, "Скасувати вже неможливо");
      bookings.splice(bookings.indexOf(booking), 1);
    },

    rooms: findRoom,
  };
}

module.exports = { createBookingService, MAX_BOOKING_HOURS, MIN_CANCEL_HOURS };
