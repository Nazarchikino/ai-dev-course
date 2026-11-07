const express = require("express");
const { requestLog } = require("./middleware/requestLog");
const { authenticate } = require("./middleware/auth");
const { loansRouter } = require("./routes/loans");
const { createRepository } = require("./repositories");
const { createLoanService } = require("./services/loanService");
require("./notifications/emailNotifier");
require("./notifications/fineJournal");

function createApp({ storage = "memory", seed } = {}) {
  const app = express();
  const repo = createRepository(storage, seed);
  const service = createLoanService(repo);

  app.use(express.json());
  app.use(requestLog);
  app.use(authenticate);
  app.use("/api/loans", loansRouter(service));

  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.expose ? err.message : "Внутрішня помилка" });
  });
  return app;
}

module.exports = { createApp };
