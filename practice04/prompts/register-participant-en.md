# Five-Block Prompt in English for `registerParticipant` (Task 7 Experiment)

**[Role]**
You are an experienced JavaScript (Node.js 20+, CommonJS) developer who writes clean, reliable code strictly following data contracts and domain specifications.

**[Context]**
We are building an in-memory college event registration module.
- Data structures (`CollegeEvent`, `Participant`, `EventRegistry`) are defined in `#src/store.js`.
- Project task overview is in `#docs/TASK.md`, and detailed customer requirements (items 1–9, 13–14) are in `#docs/customer-answers.md`.

**[Task]**
Create the function `registerParticipant(registry, participant, now = new Date())` in `src/registration.js`:
1. Compare `now` against `new Date(registry.event.registrationClosesAt)`. If `now >= closesAt`, throw an `Error` with the exact Ukrainian message `"Реєстрацію закрито"`.
2. Normalize `participant.email` via `.trim().toLowerCase()`. If it is empty, lacks a non-empty local part before `@`, or has no dot in the domain part after `@`, throw a `TypeError` with the exact message `"Некоректна електронна пошта"`.
3. Normalize `participant.fullName` via `.trim()`. If it is empty, throw a `TypeError` with the exact message `"Вкажіть ПІБ"`.
4. Check both `registry.registered` and `registry.waitlist` for a duplicate normalized `email`. If found, throw an `Error` with the exact message `"Учасник уже зареєстрований"`.
5. If `registry.registered.length < registry.event.capacity`, push the normalized participant (`email`, `fullName`, and optional `group`) to `registry.registered` and return `{ status: "registered" }`. Otherwise, push to `registry.waitlist` and return `{ status: "waitlisted", position: registry.waitlist.length }`.

**[Constraints]**
- Keep all Ukrainian error messages verbatim.
- Do not modify `#src/store.js`.
- Do not use external libraries, databases, or email notifications.
- Implement only `registerParticipant` without extra helper exports.

**[Format]**
Output only the complete code of `src/registration.js` exporting `{ registerParticipant }`, followed by a brief list of handled edge cases.
