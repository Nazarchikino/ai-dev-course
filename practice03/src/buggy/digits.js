// Сума цифр невід’ємного цілого числа: 2026 → 10.
function sumDigits(n) {
  if (n < 10) return n;
  return (n % 10) + sumDigits(Math.floor(n / 10));
}
module.exports = { sumDigits };
