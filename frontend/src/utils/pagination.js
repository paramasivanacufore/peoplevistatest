export function getPaginationRange(current, total, delta = 1) {
  const range = [];
  const rangeWithDots = [];
  let last;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (last) {
      if (i - last > 1) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    last = i;
  }

  return rangeWithDots;
}

export default getPaginationRange;
