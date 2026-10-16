const test = require("node:test");
const assert = require("node:assert/strict");
const { longestWord } = require("../src/text");

test("longestWord: повертає найдовше слово", () => {
  assert.equal(longestWord("AI допомагає програмістам писати код"), "програмістам");
});
test("longestWord: розділові знаки не входять до слова", () => {
  assert.equal(longestWord("Привіт, світе! Як справи?"), "Привіт");
});
test("longestWord: за однакової довжини повертає перше слово", () => {
  assert.equal(longestWord("кіт пес сом"), "кіт");
});
test("longestWord: порожній рядок і рядок без слів", () => {
  assert.equal(longestWord(""), "");
  assert.equal(longestWord("  ... !!! "), "");
});
