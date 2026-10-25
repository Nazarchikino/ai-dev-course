function memo(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, fn.apply(this, args));
    return cache.get(key);
  };
}

const groupBy = (xs, f) => xs.reduce((acc, x) => ((acc[f(x)] ||= []).push(x), acc), {});

module.exports = { memo, groupBy };
