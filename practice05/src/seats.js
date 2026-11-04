/** @typedef {import("./store").EventRegistry} EventRegistry */

/**
 * Обчислює кількість вільних місць на подію (не менше 0).
 * @param {EventRegistry} registry сховище реєстрацій події
 * @returns {number} кількість доступних місць в основному списку
 */
function availableSeats(registry) {
  return Math.max(0, registry.event.capacity - registry.registered.length);
}

module.exports = { availableSeats };
