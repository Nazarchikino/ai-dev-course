/** @typedef {import("./store").EventRegistry} EventRegistry */
/** @typedef {import("./store").Participant} Participant */

const { validateParticipant, normalizeEmail } = require("./validation");

/**
 * Реєструє учасника на подію або додає його до листа очікування.
 * @param {EventRegistry} registry
 * @param {Participant} participant
 * @param {Date} [now=new Date()] поточний момент
 * @returns {{status: "registered"} | {status: "waitlisted", position: number}}
 */
function registerParticipant(registry, participant, now = new Date()) {
  if (now >= new Date(registry.event.registrationClosesAt)) {
    throw new Error("Реєстрацію закрито");
  }
  const record = validateParticipant(participant);

  const all = [...registry.registered, ...registry.waitlist];
  if (all.some((x) => x.email === record.email)) throw new Error("Учасник уже зареєстрований");

  if (registry.registered.length < registry.event.capacity) {
    registry.registered.push(record);
    return { status: "registered" };
  }
  registry.waitlist.push(record);
  return { status: "waitlisted", position: registry.waitlist.length };
}

/**
 * Скасовує реєстрацію; за звільнення місця переводить першого з черги.
 * @param {EventRegistry} registry
 * @param {string} email
 * @returns {{promoted: Participant | null}}
 */
function cancelRegistration(registry, email) {
  const key = normalizeEmail(email);
  const i = registry.registered.findIndex((x) => x.email === key);
  if (i !== -1) {
    registry.registered.splice(i, 1);
    const promoted = registry.waitlist.shift() ?? null;
    if (promoted) registry.registered.push(promoted);
    return { promoted };
  }
  const j = registry.waitlist.findIndex((x) => x.email === key);
  if (j !== -1) {
    registry.waitlist.splice(j, 1);
    return { promoted: null };
  }
  throw new Error("Учасника не знайдено");
}

module.exports = { registerParticipant, cancelRegistration };
