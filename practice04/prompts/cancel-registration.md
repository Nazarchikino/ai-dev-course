# Запит із п’яти блоків для додавання функції `cancelRegistration` (Завдання 6, Спосіб Б)

**[Роль]**
Ти — досвідчений розробник на JavaScript (Node.js 20+, CommonJS), який розширює наявний модуль без порушення зворотної сумісності.

**[Контекст]**
Ми продовжуємо розробку модуля реєстрації на події коледжу у файлі `#src/registration.js`.
- Структура сховища `EventRegistry` (`{ event, registered, waitlist }`) визначена у `#src/store.js`.
- Вимоги замовника щодо скасування реєстрації наведені у пунктах 10–12 файлу `#docs/customer-answers.md`.
- У файлі `#src/registration.js` вже реалізована і протестована функція `registerParticipant`.

**[Завдання]**
Додай у файл `src/registration.js` функцію `cancelRegistration(registry, email)` для скасування реєстрації учасника за такими правилами:
1. Нормалізуй вхідний аргумент `email`: прибери пробіли по краях і переведи в нижній регістр (`email.trim().toLowerCase()`).
2. Знайди учасника за нормалізованим `email` в основному списку `registry.registered` або в листі очікування `registry.waitlist`:
   - Якщо учасника знайдено в `registry.registered`: видали його з `registry.registered`. Якщо в `registry.waitlist` є учасники, вилучи першого з черги (`registry.waitlist.shift()`), додай його в кінець `registry.registered` і поверни `{ promoted: <переведений учасник> }`. Якщо черга `registry.waitlist` порожня, поверни `{ promoted: null }`.
   - Якщо учасника знайдено в `registry.waitlist`: видали його з `registry.waitlist` (нікого з черги не переводь) і поверни `{ promoted: null }`.
   - Якщо учасника немає ні в `registry.registered`, ні в `registry.waitlist`: викинь помилку `Error` із дослівним повідомленням `"Учасника не знайдено"`.

**[Обмеження]**
- Не змінюй жодного рядка вже реалізованої функції `registerParticipant`.
- Не змінюй файл `#src/store.js`.
- Текст повідомлення про помилку `"Учасника не знайдено"` візьми дослівно.
- Не використовуй сторонніх бібліотек.

**[Формат]**
Надай повний оновлений код файлу `src/registration.js` із JSDoc-коментарями українською мовою та експортом обох функцій: `module.exports = { registerParticipant, cancelRegistration };`.
