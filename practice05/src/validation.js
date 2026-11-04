/** @typedef {import("./store").Participant} Participant */

/**
 * Нормалізує адресу пошти: без пробілів по краях, нижній регістр.
 * @param {string} email
 * @returns {string}
 */
function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

/**
 * Перевіряє формат пошти: є «@», перед ним є символи, після нього – домен із крапкою.
 * @param {string} email нормалізована адреса
 * @returns {boolean}
 */
function isValidEmail(email) {
  const at = email.indexOf("@");
  if (at <= 0) return false;
  const domain = email.slice(at + 1);
  return domain.includes(".") && !domain.startsWith(".") && !domain.endsWith(".");
}

/**
 * Перевіряє та нормалізує дані учасника, повертаючи новий об’єкт без мутації вхідного.
 * @param {Participant} participant вхідні дані учасника
 * @returns {Participant} новий нормалізований об’єкт учасника
 */
function validateParticipant(participant) {
  const email = normalizeEmail(participant.email);
  if (!isValidEmail(email)) throw new TypeError("Некоректна електронна пошта");
  const fullName = String(participant.fullName ?? "").trim();
  if (!fullName) throw new TypeError("Вкажіть ПІБ");
  return { ...participant, email, fullName };
}

module.exports = { validateParticipant, normalizeEmail, isValidEmail };
