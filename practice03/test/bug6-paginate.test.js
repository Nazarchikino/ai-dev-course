const test = require("node:test");
const assert = require("node:assert/strict");
const { paginate } = require("../src/buggy/paginate");
const items = ["a", "b", "c", "d", "e"];
test("paginate: перша сторінка", () => assert.deepEqual(paginate(items, 1, 2), ["a", "b"]));
test("paginate: остання неповна сторінка", () => assert.deepEqual(paginate(items, 3, 2), ["e"]));
