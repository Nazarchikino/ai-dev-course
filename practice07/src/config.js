// Налаштування застосунку
module.exports = {
  PORT: Number(process.env.PORT) || 3000,
  PAGE_SIZE: 5,
  get TOKEN_SECRET() {
    if (!process.env.TOKEN_SECRET) {
      throw new Error("Не задано змінну середовища TOKEN_SECRET");
    }
    return process.env.TOKEN_SECRET;
  },
};
