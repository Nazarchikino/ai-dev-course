// Вартість навчальних матеріалів зі знижкою для пільговиків.
function finalPrice(base, isBeneficiary) {
  const discountRate = 0.2;
  if (isBeneficiary) {
    return base - base * discountRate;
  }
  return base;
}
module.exports = { finalPrice };
