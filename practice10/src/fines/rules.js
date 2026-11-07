// Правила нарахування штрафу за типом читача; days — кількість днів прострочення
module.exports = {
  student: (days) => Math.min(days * 5, 100),
  teacher: () => 0,
  staff: (days) => Math.min(days * 3, 60),
  guest: (days) => Math.min(days * 10, 200),
};
