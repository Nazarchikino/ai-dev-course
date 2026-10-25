const test = require("node:test");
const assert = require("node:assert/strict");
const { loadConfig } = require("../src/buggy/config");
test("loadConfig: читає прохідний бал", () => assert.equal(loadConfig().passingScore, 60));
