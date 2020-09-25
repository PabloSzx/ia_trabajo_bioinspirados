export function calcRastrigin(x1: number, x2: number) {
  return (
    20 +
    (Math.pow(x1, 2) - 10 * Math.cos(2 * Math.PI * x1)) +
    (Math.pow(x2, 2) - 10 * Math.cos(2 * Math.PI * x2))
  );
}

export function limitX(v: number) {
  if (v > 5.12) {
    return 5.12;
  }
  if (v < -5.12) {
    return -5.12;
  }
  return v;
}
