// Повертає найдовше слово рядка. Слово – послідовність літер або цифр
// (зокрема українських). Якщо таких кілька – перше. Для порожнього рядка – "".
function longestWord(text) {
  if (!text) return "";
  const words = text.match(/[\p{L}\p{N}]+/gu) || [];
  let longest = "";
  for (const word of words) {
    if (word.length > longest.length) {
      longest = word;
    }
  }
  return longest;
}

module.exports = { longestWord };
