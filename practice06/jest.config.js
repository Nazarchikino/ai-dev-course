/** @type {import('jest').Config} */
module.exports = {
  collectCoverageFrom: ["src/**/*.js", "!src/**/*.test.js"],
  coverageThreshold: {
    global: { lines: 90, branches: 90, functions: 100, statements: 90 },
  },
};
