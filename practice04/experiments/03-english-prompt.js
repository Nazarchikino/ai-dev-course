/**
 * Експеримент 3 (Завдання 7): Генерація за п'ятиблоковим запитом повністю англійською мовою.
 * Спостереження:
 * - JSDoc-коментарі та внутрішні пояснення згенеровані англійською мовою (суперечить copilot-instructions.md).
 * - Попри вимогу зберегти українські рядки помилок, в одному з повідомлень ("Учасник вже зареєстрований"
 *   замість "Учасник уже зареєстрований") модель припустилася орфографічної заміни "уже" -> "вже",
 *   через що тест на дублікати впав.
 */

/**
 * Registers a participant for a college event or places them on the waitlist.
 * @param {Object} registry - Event registry object from store.js
 * @param {Object} participant - Participant info (email, fullName, optional group)
 * @param {Date} [now=new Date()] - Current timestamp
 * @returns {{ status: "registered" } | { status: "waitlisted", position: number }}
 */
function registerParticipant(registry, participant, now = new Date()) {
  const closesAt = new Date(registry.event.registrationClosesAt);
  if (now >= closesAt) {
    throw new Error("Реєстрацію закрито");
  }

  const email = typeof participant?.email === "string" ? participant.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new TypeError("Некоректна електронна пошта");
  }

  const fullName = typeof participant?.fullName === "string" ? participant.fullName.trim() : "";
  if (!fullName) {
    throw new TypeError("Вкажіть ПІБ");
  }

  // Subtle translation distortion in Ukrainian literal: "вже" instead of "уже"
  const exists =
    registry.registered.some((p) => p.email === email) ||
    registry.waitlist.some((p) => p.email === email);
  if (exists) {
    throw new Error("Учасник вже зареєстрований");
  }

  const normalized = {
    email,
    fullName,
    ...(participant.group !== undefined ? { group: participant.group } : {}),
  };

  if (registry.registered.length < registry.event.capacity) {
    registry.registered.push(normalized);
    return { status: "registered" };
  }

  registry.waitlist.push(normalized);
  return { status: "waitlisted", position: registry.waitlist.length };
}

module.exports = { registerParticipant };
