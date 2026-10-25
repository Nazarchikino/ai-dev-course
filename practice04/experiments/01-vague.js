/**
 * Експеримент 1 (Завдання 1): Результат генерації за нечітким запитом замовника без контексту.
 * Запит: "Напиши функцію, щоб студенти могли реєструватися на події коледжу.
 * Місць зазвичай небагато. Зроби, щоб усе працювало нормально."
 */

const events = new Map();

function createEvent(id, name, maxSeats = 20) {
  events.set(id, {
    id,
    name,
    maxSeats,
    participants: [],
  });
}

function registerStudent(eventId, student) {
  const event = events.get(eventId);
  if (!event) {
    return { success: false, message: "Подію не знайдено." };
  }

  if (!student || !student.name || !student.email) {
    return { success: false, message: "Будь ласка, вкажіть ім'я та email студента." };
  }

  // Перевірка на дублікати (лише точний збіг рядка email в основному списку)
  const isAlreadyRegistered = event.participants.some(
    (p) => p.email === student.email
  );
  if (isAlreadyRegistered) {
    return { success: false, message: "Цей студент вже зареєстрований на подію." };
  }

  // Перевірка наявності вільних місць (відмова замість листа очікування)
  if (event.participants.length >= event.maxSeats) {
    return { success: false, message: "Вибачте, вільних місць на подію більше немає." };
  }

  const newParticipant = {
    id: Date.now(),
    name: student.name,
    email: student.email,
    course: student.course || 1,
    registeredAt: new Date().toISOString(),
  };

  event.participants.push(newParticipant);

  return {
    success: true,
    message: `Студента ${student.name} успішно зареєстровано на "${event.name}".`,
    remainingSeats: event.maxSeats - event.participants.length,
  };
}

module.exports = { createEvent, registerStudent };
