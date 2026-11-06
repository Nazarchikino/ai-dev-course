// Метрики структури коду для порівняння «до» і «після» рефакторингу
module.exports = [
  {
    files: ["src/**/*.js"],
    languageOptions: { sourceType: "commonjs" },
    rules: {
      complexity: ["warn", 4],
      "max-depth": ["warn", 2],
      "max-lines-per-function": ["warn", 30],
      "no-var": "warn",
    },
  },
];
