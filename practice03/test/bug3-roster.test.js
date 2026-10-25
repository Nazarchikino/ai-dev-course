const test = require("node:test");
const assert = require("node:assert/strict");
const { readRoster } = require("../src/buggy/roster");
test("readRoster: повертає трьох здобувачів", () => assert.equal(readRoster().length, 3));
