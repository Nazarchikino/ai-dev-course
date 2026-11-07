# Архітектура сервісу `library-service`

## 1. Призначення сервісу
`library-service` — навчальний REST API сервіс автоматизації бібліотеки коледжу на базі Node.js (CommonJS) та Express 5. Сервіс забезпечує перегляд активних видач читача (`GET /api/loans`), оформлення видачі книги бібліотекарем на 14 днів (`POST /api/loans`), приймання повернення книги з автоматичним розрахунком прострочення і штрафу за типом читача (`POST /api/loans/:id/return`), а також отримання зведеної інформації про нараховані штрафи читача (`GET /api/readers/:id/fines`) та сповіщення читачів електронною поштою.

## 2. Структура каталогів та їх ролі
- `src/app.js`, `src/server.js` — композиційний корінь застосунку (`createApp`): ініціалізує репозиторій, сервіс, глобальні middleware, маршрутизатори та обробник помилок; `server.js` запускає HTTP-сервер на порту `3000`.
- `src/routes/` — шар маршрутизації HTTP (`loans.js`, `readers.js`): приймає HTTP-запити, перетворює параметри запиту, перевіряє права доступу та делегує виклики сервісному шару.
- `src/middleware/` — наскрізні обробники запитів: логування HTTP-запитів (`requestLog.js`) та токенна автентифікація за заголовком `X-Token` із перевіркою ролей (`auth.js`).
- `src/services/` — бізнес-логіка предметної області (`loanService.js`): видача книг, повернення, перевірка станів (404 / 409), розрахунок прострочення й публікація доменних подій.
- `src/fines/` — підсистема розрахунку штрафів: диспетчер `fineFor` (`index.js`) та набір правил-стратегій за типами читачів (`rules.js`).
- `src/repositories/` — шар доступу до даних: фабрика сховищ (`index.js`), реалізація `MemoryRepository` у пам'яті (`memoryRepository.js`) та початкові дані читачів (`seed.json`).
- `src/notifications/` — подієво-орієнтована підсистема сповіщень та обліку: спільна шина подій `EventEmitter` (`events.js`), поштовий підписник (`emailNotifier.js`), журнал штрафів (`fineJournal.js`) і адаптер поштового клієнта (`mailAdapter.js`).
- `src/utils/` — допоміжні функції обчислення календарних дат у UTC (`dates.js`) та текстових підписів типів читачів (`labels.js`).
- `vendor/` — імітація сторонньої поштової бібліотеки (`mail-client.js`), яку заборонено модифікувати.

## 3. Ланцюжок обробки запиту `POST /api/loans/:id/return`
1. `express.json()` (`src/app.js:14`) — десеріалізує JSON-тіло запиту `{ date }` у `req.body`.
2. `requestLog(req, res, next)` (`src/middleware/requestLog.js:1-4`) — за наявності `process.env.LOG_REQUESTS` логує метод і URL, викликає `next()`.
3. `authenticate(req, res, next)` (`src/middleware/auth.js:7-12`) — перевіряє заголовок `X-Token` за таблицею `TOKENS`, записує об'єкт користувача у `req.user` (або повертає `401`) і викликає `next()`.
4. `requireRole("librarian")` (`src/middleware/auth.js:14-19`) — перевіряє роль `req.user.role === "librarian"` (інакше повертає `403`) та передає керування обробнику маршруту.
5. `router.post("/:id/return", ...)` (`src/routes/loans.js:17-20`) — конвертує `req.params.id` у число та `req.body.date` у `Date`, викликає `service.returnLoan(loanId, date)`.
6. `service.returnLoan(loanId, date)` (`src/services/loanService.js:28-38`):
   - отримує видачу через `repo.findLoan(loanId)` (`src/repositories/memoryRepository.js:12-14`), перевіряє її існування (`404`) і те, що книга ще не повернена (`409`);
   - знаходить читача через `repo.findReader(loan.readerId)` (`src/repositories/memoryRepository.js:8-10`);
   - обчислює прострочення `overdueDays` через `daysBetween(loan.due, date)` (`src/utils/dates.js:3-7`);
   - розраховує суму штрафу через `fineFor(reader.type, overdueDays)` (`src/fines/index.js:3-7` → `src/fines/rules.js`);
   - зберігає оновлену видачу через `repo.saveLoan(...)` (`src/repositories/memoryRepository.js:20-24`);
   - синхронно генерує подію `events.emit("loan:returned", { loan: updated, reader, overdueDays, fine })` (`src/notifications/events.js`).
7. Підписники на подію `loan:returned` (`src/notifications/emailNotifier.js:9-11`) синхронно отримують дані: при `fine > 0` викликають `notify(...)` (`src/notifications/mailAdapter.js:6-8`), який делегує відправку `client.deliver(...)` (`vendor/mail-client.js:8-12`).
8. Сервіс повертає `{ loan: updated, overdueDays, fine }`, а маршрут відправляє клієнту HTTP `200 OK` через `res.json(result)`.

## 4. Використані патерни проєктування
- **Стратегія (Strategy):** [`src/fines/rules.js`](../src/fines/rules.js) та [`src/fines/index.js`](../src/fines/index.js) — словник взаємозамінних функцій розрахунку штрафу за типом читача та диспетчер `fineFor`.
- **Спостерігач (Observer / Pub-Sub):** [`src/notifications/events.js`](../src/notifications/events.js), [`src/services/loanService.js`](../src/services/loanService.js), [`src/notifications/emailNotifier.js`](../src/notifications/emailNotifier.js) — слабке зв'язування бізнес-логіки видач і побічних реакцій через шину `EventEmitter`.
- **Адаптер (Adapter):** [`src/notifications/mailAdapter.js`](../src/notifications/mailAdapter.js) — перетворює внутрішній виклик `notify(reader, subject, text)` на формат стороннього класу `MailClient.deliver` з [`vendor/mail-client.js`](../vendor/mail-client.js).
- **Репозиторій (Repository):** [`src/repositories/memoryRepository.js`](../src/repositories/memoryRepository.js) — ізолює колекції `Map` за методами доступу до даних (`findReader`, `findLoan`, `findLoans`, `saveLoan`).
- **Фабрика (Simple Factory / Factory Function):** [`src/repositories/index.js`](../src/repositories/index.js) (`createRepository`), [`src/services/loanService.js`](../src/services/loanService.js) (`createLoanService`), [`src/app.js`](../src/app.js) (`createApp`).
- **Ланцюжок обов'язків (Chain of Responsibility):** [`src/middleware/requestLog.js`](../src/middleware/requestLog.js), [`src/middleware/auth.js`](../src/middleware/auth.js), [`src/app.js`](../src/app.js) — конвеєр middleware Express з передачею керування через `next()`.
- **Одинак модуля (Module Singleton):** [`src/notifications/events.js`](../src/notifications/events.js) — єдиний спільний екземпляр `EventEmitter`, кешований системою модулів CommonJS.
