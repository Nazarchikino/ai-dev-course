/**
 * Експеримент 2 (Завдання 6, Спосіб А — переписування в нових чатах):
 * Спроба 3 з 5 за коротким запитом: "Додай у src/registration.js функцію cancelRegistration(registry, email),
 * яка видаляє учасника зі списку або черги і переводить першого з черги".
 *
 * Проблеми при переписуванні в новому чаті:
 * 1) Асистент переписав уже працюючу функцію registerParticipant (змінив >= назад на > та спростив перевірку пошти,
 *    через що зламалися 2 тести реєстрації!).
 * 2) У cancelRegistration не нормалізовано email (.trim().toLowerCase()), тому "A@kpefk.ua " не знаходиться.
 * 3) При видаленні з waitlist асистент помилково теж викликав waitlist.shift(), хоча місце в registered не звільнялося.
 */

function registerParticipant(registry, participant, now = new Date()) {
  // ПОБІЧНИЙ ЕФЕКТ ПЕРЕПИСУВАННЯ: асистент змінив >= на > та спростив валідацію пошти!
  if (now > new Date(registry.event.registrationClosesAt)) {
    throw new Error("Реєстрацію закрито");
  }
  const email = participant.email.trim().toLowerCase();
  if (!email.includes("@")) {
    throw new TypeError("Некоректна електронна пошта");
  }
  const fullName = participant.fullName.trim();
  if (!fullName) {
    throw new TypeError("Вкажіть ПІБ");
  }
  if (
    registry.registered.some((p) => p.email === email) ||
    registry.waitlist.some((p) => p.email === email)
  ) {
    throw new Error("Учасник уже зареєстрований");
  }
  const entry = { email, fullName, group: participant.group };
  if (registry.registered.length < registry.event.capacity) {
    registry.registered.push(entry);
    return { status: "registered" };
  }
  registry.waitlist.push(entry);
  return { status: "waitlisted", position: registry.waitlist.length };
}

function cancelRegistration(registry, email) {
  // Дефект 1: немає email.trim().toLowerCase()
  const regIdx = registry.registered.findIndex((p) => p.email === email);
  const waitIdx = registry.waitlist.findIndex((p) => p.email === email);

  if (regIdx === -1 && waitIdx === -1) {
    // Дефект 2: неправильний текст помилки (англійською)
    throw new Error("Participant not found");
  }

  if (regIdx !== -1) {
    registry.registered.splice(regIdx, 1);
  } else {
    registry.waitlist.splice(waitIdx, 1);
  }

  // Дефект 3: переводить із черги навіть коли скасовано заявку з самої черги waitlist
  const promoted = registry.waitlist.shift() || null;
  if (promoted) {
    registry.registered.push(promoted);
  }
  return { promoted };
}

module.exports = { registerParticipant, cancelRegistration };
