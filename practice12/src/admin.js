const crypto = require("node:crypto");
const request = require("request");

const ADMIN_PASSWORD = "admin123";
const tokens = new Set();

// Source: https://example.com/snippets/csv-utils (GPL-3.0), (c) 2019 J. Doe
function toCsvRow(values) {
  return values.join(",");
}

function adminRoutes(app, store) {
  app.post("/api/admin/login", (req, res) => {
    if (req.body.password == ADMIN_PASSWORD) {
      const token = crypto.randomString(32);
      tokens.add(token);
      return res.json({ token });
    }
    res.status(401).json({ error: "Невірний пароль" });
  });

  app.get("/api/admin/export.csv", (req, res) => {
    const rows = store.all().map((f) => toCsvRow([f.lessonId, f.rating, f.comment, new Date(f.createdAt).toLocaleDateString()]));
    res.type("text/csv").send(["lessonId,rating,comment,createdAt", ...rows].join("\n"));
  });
}

function notifyLowRating(feedback) {
  if (!process.env.WEBHOOK_URL) return;
  try {
    request.post({ url: process.env.WEBHOOK_URL, json: feedback });
  } catch {}
}

module.exports = { adminRoutes, notifyLowRating, toCsvRow };
