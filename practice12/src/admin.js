const crypto = require("node:crypto");

const FORMULA_PREFIXES = /^[=+\-@\t\r]/;

/**
 * Безпечне порівняння пароля адміністратора за сталий час.
 * @param {unknown} input пароль із тіла запиту
 * @param {string|undefined} expected пароль зі змінної середовища ADMIN_PASSWORD
 * @returns {boolean}
 */
function verifyPassword(input, expected) {
  if (typeof input !== "string" || typeof expected !== "string" || expected.length === 0) {
    return false;
  }
  const inputBuf = Buffer.from(input, "utf8");
  const expectedBuf = Buffer.from(expected, "utf8");
  if (inputBuf.length !== expectedBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(inputBuf, expectedBuf);
}

/**
 * Екранує одне значення CSV за стандартом RFC 4180 та нейтралізує CSV Injection.
 * @param {unknown} value значення поля
 * @returns {string}
 */
function escapeCsvCell(value) {
  let str = value === null || value === undefined ? "" : String(value);
  if (FORMULA_PREFIXES.test(str)) {
    str = `'${str}`;
  }
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Формує рядок CSV із масиву значень за RFC 4180 (ліцензія MIT).
 * @param {Array<unknown>} values масив значень рядка
 * @returns {string}
 */
function toCsvRow(values) {
  return values.map(escapeCsvCell).join(",");
}

/**
 * Реєструє маршрути адміністратора: вхід та експорт відгуків у CSV.
 * @param {object} app екземпляр Express
 * @param {object} store сховище відгуків
 */
function adminRoutes(app, store) {
  const tokens = new Set();

  app.post("/api/admin/login", (req, res) => {
    const password = req.body?.password;
    if (verifyPassword(password, process.env.ADMIN_PASSWORD)) {
      const token = crypto.randomBytes(32).toString("hex");
      tokens.add(token);
      return res.json({ token });
    }
    return res.status(401).json({ error: "Невірний пароль" });
  });

  app.get("/api/admin/export.csv", (req, res) => {
    const authHeader = req.get("authorization") || "";
    const match = /^Bearer\s+(\S+)$/.exec(authHeader);
    if (!match || !tokens.has(match[1])) {
      return res.status(401).json({ error: "Необхідна авторизація адміністратора" });
    }

    const rows = store
      .all()
      .map((f) => toCsvRow([f.lessonId, f.rating, f.comment, new Date(f.createdAt).toISOString()]));
    return res.type("text/csv").send(["lessonId,rating,comment,createdAt", ...rows].join("\n"));
  });
}

/**
 * Надсилає сповіщення про низьку оцінку (1 або 2) на WEBHOOK_URL через вбудований fetch.
 * Помилка мережі перехоплюється і не перешкоджає збереженню відгуку.
 * @param {{ lessonId: string, rating: number, comment: string, createdAt: string }} feedback
 */
async function notifyLowRating(feedback) {
  const url = process.env.WEBHOOK_URL;
  if (!url) return;
  const payload = {
    lessonId: feedback.lessonId,
    rating: feedback.rating,
    comment: feedback.comment,
    createdAt: feedback.createdAt,
  };
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Помилка сповіщення не повинна заважати збереженню відгуку (REQUIREMENTS.md)
  }
}

module.exports = { adminRoutes, notifyLowRating, toCsvRow, escapeCsvCell, verifyPassword };
