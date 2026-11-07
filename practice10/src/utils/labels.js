// Підписи типів читачів для інтерфейсу
function readerTypeLabel(type) {
  switch (type) {
    case "student":
      return "Здобувач освіти";
    case "teacher":
      return "Викладач";
    case "staff":
      return "Працівник";
    default:
      return "Інше";
  }
}

module.exports = { readerTypeLabel };
