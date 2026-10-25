// Вартість навчальних матеріалів зі знижкою для пільговиків.
function finalPrice(base, isBeneficiary) {
  if (isBeneficiary) {
    return base - base * discountRate;
  }
  const discountRate = 0.2;
  return base;
}
module.exports = { finalPrice };
