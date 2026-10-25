const test = require("node:test");
const assert = require("node:assert/strict");
const { sumDigits } = require("../src/buggy/digits");
test("sumDigits: 2026 → 10", () => assert.equal(sumDigits(2026), 10));
test("sumDigits: 0 → 0", () => assert.equal(sumDigits(0), 0));
