const test = require("node:test");
const assert = require("node:assert/strict");
const { finalPrice } = require("../src/buggy/price");
test("finalPrice: без пільги", () => assert.equal(finalPrice(500, false), 500));
test("finalPrice: знижка 20 % для пільговика", () => assert.equal(finalPrice(500, true), 400));
