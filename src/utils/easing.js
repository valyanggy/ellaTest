export function cubicBezierEase(x1, y1, x2, y2) {
  const sampleCurveX = (t) => ((3 * x1 - 3 * x2 + 1) * t + (-6 * x1 + 3 * x2)) * t * t + 3 * x1 * t;
  const sampleCurveY = (t) => ((3 * y1 - 3 * y2 + 1) * t + (-6 * y1 + 3 * y2)) * t * t + 3 * y1 * t;
  const sampleDerivativeX = (t) => (3 * (3 * x1 - 3 * x2 + 1) * t + 2 * (-6 * x1 + 3 * x2)) * t + 3 * x1;

  return (x) => {
    if (x <= 0 || x >= 1) {
      return x;
    }

    let t = x;

    for (let index = 0; index < 6; index += 1) {
      const derivative = sampleDerivativeX(t);

      if (Math.abs(derivative) < 0.001) {
        break;
      }

      t -= (sampleCurveX(t) - x) / derivative;
    }

    return sampleCurveY(Math.max(0, Math.min(1, t)));
  };
}
