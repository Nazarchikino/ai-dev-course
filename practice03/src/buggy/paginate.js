// Повертає сторінку списку. Нумерація сторінок починається з 1.
function paginate(items, page, size) {
  const start = (page - 1) * size;
  return items.slice(start, start + size);
}
module.exports = { paginate };
