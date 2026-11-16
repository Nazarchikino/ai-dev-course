const { toMinutes } = require("./time");
const { overlaps } = require("./slots");

const MAX_BOOKING_HOURS = Number(process.env.MAX_BOOKING_HOURS) || 4;
const MIN_CANCEL_HOURS = 2;

/**
 * Опис аудиторії коледжу з розкладом її роботи.
 *
 * @typedef {object} Room
 * @property {string} id Унікальний рядковий ідентифікатор аудиторії (наприклад, "101", "204", "aula").
 * @property {string} name Назва аудиторії.
 * @property {number} seats Кількість посадкових місць.
 * @property {string} opens Час відкриття аудиторії у форматі "ГГ:ХХ".
 * @property {string} closes Час закриття аудиторії у форматі "ГГ:ХХ".
 */

/**
 * Вхідні дані для створення нового бронювання аудиторії.
 *
 * @typedef {object} BookingInput
 * @property {string} roomId Ідентифікатор аудиторії.
 * @property {string} date Дата бронювання у форматі "РРРР-ММ-ДД".
 * @property {string} from Час початку бронювання у форматі "ГГ:ХХ".
 * @property {string} to Час завершення бронювання у форматі "ГГ:ХХ".
 * @property {string} who Ім'я або ПІБ особи, яка бронює аудиторію.
 */

/**
 * Збережений запис про бронювання аудиторії.
 *
 * @typedef {object} Booking
 * @property {number} id Унікальний числовий ідентифікатор бронювання.
 * @property {string} roomId Ідентифікатор аудиторії.
 * @property {string} date Дата бронювання у форматі "РРРР-ММ-ДД".
 * @property {string} from Час початку бронювання у форматі "ГГ:ХХ".
 * @property {string} to Час завершення бронювання у форматі "ГГ:ХХ".
 * @property {string} who Ім'я або ПІБ особи, яка бронює аудиторію.
 */

/**
 * Помилка бізнес-логіки з HTTP-кодом статусу для передачі в обробник помилок Express.
 *
 * @typedef {Error} HttpError
 * @property {number} status HTTP-код відповіді (400, 404 або 409).
 * @property {boolean} expose Ознака того, що текст помилки призначений для клієнта.
 */

/**
 * Сервіс управління бронюваннями аудиторій у пам'яті процесу.
 *
 * @typedef {object} BookingService
 * @property {Function} list Повертає масив бронювань аудиторії за ідентифікатором і датою.
 * @property {Function} create Перевіряє правила та створює нове бронювання.
 * @property {Function} cancel Скасовує бронювання за ідентифікатором, якщо до початку не менше 2 годин.
 * @property {Function} rooms Повертає об'єкт аудиторії за її ідентифікатором або викидає помилку 404.
 */

/**
 * Створює об'єкт помилки з HTTP-статусом і прапорцем публічного відображення повідомлення.
 *
 * @param {number} status HTTP-код статусу помилки (наприклад, 400, 404, 409).
 * @param {string} message Текст повідомлення про помилку для клієнта.
 * @returns {HttpError} Екземпляр Error із додатковими властивостями status та expose.
 */
function httpError(status, message) {
  return Object.assign(new Error(message), { status, expose: true });
}

/**
 * Створює сервіс бронювань аудиторій зі зберіганням даних у пам'яті процесу.
 *
 * @param {Array<Room>} rooms Список доступних для бронювання аудиторій.
 * @returns {BookingService} Об'єкт сервісу з методами list, create, cancel та rooms.
 * @example
 * const service = createBookingService([{ id: "101", name: "Аудиторія 101", seats: 30, opens: "08:00", closes: "18:00" }]);
 * const booking = service.create({ roomId: "101", date: "2026-11-02", from: "10:00", to: "11:30", who: "Тимченко С. В." });
 */
function createBookingService(rooms) {
  /** @type {Array<Booking>} */
  const bookings = [];
  let nextId = 1;

  /**
   * Знаходить аудиторію за її ідентифікатором у довіднику аудиторій.
   *
   * @param {string} id Ідентифікатор аудиторії.
   * @returns {Room} Знайдений об'єкт аудиторії.
   * @throws {HttpError} Помилка 404, якщо аудиторію з вказаним id не знайдено.
   */
  function findRoom(id) {
    const room = rooms.find((r) => r.id === id);
    if (!room) throw httpError(404, "Аудиторію не знайдено");
    return room;
  }

  return {
    /**
     * Повертає список усіх бронювань обраної аудиторії на вказану дату.
     *
     * @param {string} roomId Ідентифікатор аудиторії.
     * @param {string} date Дата у форматі "РРРР-ММ-ДД".
     * @returns {Array<Booking>} Масив бронювань аудиторії на зазначену дату.
     * @throws {HttpError} Помилка 404, якщо аудиторію не знайдено.
     */
    list(roomId, date) {
      findRoom(roomId);
      return bookings.filter((b) => b.roomId === roomId && b.date === date);
    },

    /**
     * Створює нове бронювання після перевірки годин роботи аудиторії, тривалості та відсутності перетинів.
     *
     * @param {BookingInput} input Дані нового бронювання (roomId, date, from, to, who).
     * @returns {Booking} Створений запис бронювання з присвоєним числовим id.
     * @throws {RangeError} Якщо час from або to має некоректний формат.
     * @throws {HttpError} Помилка 404 (аудиторію не знайдено), 400 (некоректний інтервал, поза годинами роботи або перевищено MAX_BOOKING_HOURS) чи 409 (перетин із наявним бронюванням).
     */
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

    /**
     * Скасовує наявне бронювання, якщо до його початку залишилося не менше MIN_CANCEL_HOURS (2 годин).
     *
     * @param {number} id Числовий ідентифікатор бронювання.
     * @param {Date} [now=new Date()] Поточний момент часу для перевірки строку скасування.
     * @returns {void} Нічого не повертає після видалення бронювання.
     * @throws {HttpError} Помилка 404 (бронювання не знайдено) або 409 (до початку залишилося менше 2 годин).
     */
    // бронювання можна скасувати не пізніше ніж за 2 години (MIN_CANCEL_HOURS) до початку
    cancel(id, now = new Date()) {
      const booking = bookings.find((b) => b.id === id);
      if (!booking) throw httpError(404, "Бронювання не знайдено");
      const startsAt = new Date(`${booking.date}T${booking.from}:00`);
      if ((startsAt.getTime() - now.getTime()) / 3_600_000 < MIN_CANCEL_HOURS) throw httpError(409, "Скасувати вже неможливо");
      bookings.splice(bookings.indexOf(booking), 1);
    },

    rooms: findRoom,
  };
}

module.exports = { createBookingService, MAX_BOOKING_HOURS, MIN_CANCEL_HOURS };
