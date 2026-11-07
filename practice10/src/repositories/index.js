const { MemoryRepository } = require("./memoryRepository");
const defaultSeed = require("./seed.json");

function createRepository(kind, seed = defaultSeed) {
  switch (kind) {
    case "memory":
      return new MemoryRepository(seed);
    default:
      throw new Error(`Невідомий тип сховища: ${kind}`);
  }
}

module.exports = { createRepository };
