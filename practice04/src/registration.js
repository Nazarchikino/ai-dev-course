/**
 * Модуль реєстрації учасників на події коледжу.
 */

/**
 * Реєструє учасника на подію або додає його до листа очікування.
 * @param {import('./store').EventRegistry} registry - Сховище реєстрацій події
 * @param {import('./store').Participant} participant - Дані учасника
 * @param {Date} [now=new Date()] - Поточний момент часу
 * @returns {{ status: "registered" } | { status: "waitlisted", position: number }}
 */
function registerParticipant(registry, participant, now = new Date()) {
  const closesAt = new Date(registry.event.registrationClosesAt);
  if (now > closesAt) {
    throw new Error("Реєстрацію закрито");
  }

  const rawEmail = typeof participant?.email === "string" ? participant.email.trim().toLowerCase() : "";
  const atIndex = rawEmail.indexOf("@");
  const domainPart = atIndex !== -1 ? rawEmail.slice(atIndex + 1) : "";
  if (!rawEmail || atIndex === -1 || !domainPart.includes(".")) {
    throw new TypeError("Некоректна електронна пошта");
  }

  const cleanName = typeof participant?.fullName === "string" ? participant.fullName.trim() : "";
  if (!cleanName) {
    throw new TypeError("Вкажіть ПІБ");
  }

  const isDuplicate = registry.registered.some((p) => p.email === rawEmail);
  if (isDuplicate) {
    throw new Error("Учасник уже зареєстрований");
  }

  const record = {
    email: rawEmail,
    fullName: cleanName,
    ...(participant.group !== undefined ? { group: participant.group } : {}),
  };

  if (registry.registered.length < registry.event.capacity) {
    registry.registered.push(record);
    return { status: "registered" };
  }

  registry.waitlist.push(record);
  return { status: "waitlisted", position: registry.waitlist.length };
}

module.exports = { registerParticipant };
