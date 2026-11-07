class MemoryRepository {
  constructor(seed = {}) {
    this.readers = new Map((seed.readers || []).map((r) => [r.id, r]));
    this.loans = new Map();
    this.nextId = 1;
  }

  findReader(id) {
    return this.readers.get(id);
  }

  findLoan(id) {
    return this.loans.get(id);
  }

  findLoans(predicate) {
    return [...this.loans.values()].filter(predicate);
  }

  saveLoan(loan) {
    const saved = loan.id ? loan : { ...loan, id: this.nextId++ };
    this.loans.set(saved.id, saved);
    return saved;
  }
}

module.exports = { MemoryRepository };
