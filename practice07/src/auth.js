const crypto = require("node:crypto");
const config = require("./config");

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (typeof password !== "string" || typeof storedHash !== "string") return false;
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  const derivedBuffer = crypto.scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, "hex");
  if (derivedBuffer.length !== keyBuffer.length) return false;
  return crypto.timingSafeEqual(derivedBuffer, keyBuffer);
}

function sign(payload) {
  return crypto.createHmac("sha256", config.TOKEN_SECRET).update(payload).digest("hex");
}

/** Токен має вигляд login.role.підпис */
function createToken(login, role) {
  const payload = `${login}.${role}`;
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token) {
  const parts = String(token).split(".");
  if (parts.length !== 3) return null;
  const [login, role, signature] = parts;
  const expected = sign(`${login}.${role}`);
  if (signature.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  return { login, role };
}

/** Проміжний обробник: пропускає лише запити з дійсним токеном */
function requireAuth(req, res, next) {
  const header = req.get("Authorization") || "";
  const user = verifyToken(header.replace(/^Bearer /, ""));
  if (!user) return res.status(401).json({ error: "Потрібна автентифікація" });
  req.user = user;
  next();
}

function login(db, loginName, password) {
  if (typeof loginName !== "string" || typeof password !== "string") return null;
  const user = db.prepare("SELECT login, password_hash, role FROM users WHERE login = ?").get(loginName);
  if (!user || !verifyPassword(password, user.password_hash)) return null;
  return createToken(user.login, user.role);
}

module.exports = { hashPassword, verifyPassword, createToken, verifyToken, requireAuth, login };
