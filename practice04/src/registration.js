/**
 * Модуль реєстрації учасників на події коледжу та скасування реєстрації.
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
  if (now >= closesAt) {
    throw new Error("Реєстрацію закрито");
  }

  const rawEmail = typeof participant?.email === "string" ? participant.email.trim().toLowerCase() : "";
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail);
  if (!isValidEmail) {
    throw new TypeError("Некоректна електронна пошта");
  }

  const cleanName = typeof participant?.fullName === "string" ? participant.fullName.trim() : "";
  if (!cleanName) {
    throw new TypeError("Вкажіть ПІБ");
  }

  const isDuplicate =
    registry.registered.some((p) => p.email === rawEmail) ||
    registry.waitlist.some((p) => p.email === rawEmail);
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

/**
 * Скасовує реєстрацію учасника за електронною поштою та за потреби переводить першого з черги.
 * @param {import('./store').EventRegistry} registry - Сховище реєстрацій події
 * @param {string} email - Електронна пошта учасника
 * @returns {{ promoted: import('./store').Participant | null }}
 */
function cancelRegistration(registry, email) {
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  const regIndex = registry.registered.findIndex((p) => p.email === normalizedEmail);
  if (regIndex !== -1) {
    registry.registered.splice(regIndex, 1);
    const promoted = registry.waitlist.length > 0 ? registry.waitlist.shift() : null;
    if (promoted) {
      registry.registered.push(promoted);
    }
    return { promoted };
  }

  const waitIndex = registry.waitlist.findIndex((p) => p.email === normalizedEmail);
  if (waitIndex !== -1) {
    registry.waitlist.splice(waitIndex, 1);
    return { promoted: null };
  }

  throw new Error("Учасника не знайдено");
}

module.exports = { registerParticipant, cancelRegistration };
