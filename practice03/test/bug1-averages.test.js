const test = require("node:test");
const assert = require("node:assert/strict");
const { averageOf } = require("../src/buggy/averages");
test("averageOf: середнє балів", () => assert.equal(averageOf({ scores: [80, 90] }), 85));
test("averageOf: здобувач без поля scores дає 0", () => assert.equal(averageOf({ fullName: "Новенький" }), 0));
