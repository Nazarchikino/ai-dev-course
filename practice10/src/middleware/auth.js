// Навчальна спрощена автентифікація: токен передається в заголовку X-Token
const TOKENS = {
  "t-librarian": { login: "librarian", role: "librarian" },
  "t-reader-1": { login: "reader1", role: "reader", readerId: 1 },
};

function authenticate(req, res, next) {
  const user = TOKENS[req.get("X-Token")];
  if (!user) return res.status(401).json({ error: "Потрібна автентифікація" });
  req.user = user;
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) return res.status(403).json({ error: "Недостатньо прав" });
    next();
  };
}

module.exports = { authenticate, requireRole };
