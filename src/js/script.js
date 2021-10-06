const [a, b] = [5, 9];

const sum = (...args) => [...args].reduce((sum, elem) => sum + elem, 0);

console.log(sum(a, b));
