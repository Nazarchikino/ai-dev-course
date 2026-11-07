const express = require("express");

function readersRouter(service) {
  const router = express.Router();

  router.get("/:id/fines", (req, res) => {
    const readerId = Number(req.params.id);
    const isLibrarian = req.user.role === "librarian";
    const isOwnReader = req.user.role === "reader" && req.user.readerId === readerId;

    if (!isLibrarian && !isOwnReader) {
      return res.status(403).json({ error: "Недостатньо прав" });
    }

    const summary = service.readerFines(readerId);
    res.json(summary);
  });

  return router;
}

module.exports = { readersRouter };
