// Функція повертає факторіал невід'ємного цілого числа n.
// Для від'ємного n кидає RangeError.
function factorial(n) {
	if (!Number.isInteger(n)) {
		throw new TypeError("n must be an integer");
	}

	if (n < 0) {
		throw new RangeError("n must be non-negative");
	}

	let result = 1;
	for (let i = 2; i <= n; i += 1) {
		result *= i;
	}

	return result;
}

console.log(factorial(5));