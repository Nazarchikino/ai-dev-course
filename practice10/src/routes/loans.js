const express = require("express");
const { requireRole } = require("../middleware/auth");

function loansRouter(service) {
  const router = express.Router();

  router.get("/", (req, res) => {
    const readerId = Number(req.query.readerId);
    res.json(service.activeLoans(readerId));
  });

  router.post("/", requireRole("librarian"), (req, res) => {
    const loan = service.issue(req.body.readerId, req.body.bookId, new Date(req.body.date));
    res.status(201).json(loan);
  });

  router.post("/:id/return", requireRole("librarian"), (req, res) => {
    const result = service.returnLoan(Number(req.params.id), new Date(req.body.date));
    res.json(result);
  });

  return router;
}

module.exports = { loansRouter };
