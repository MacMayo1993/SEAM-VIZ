
export type Vec3 = [number, number, number];

export const Vec3 = {
  add: (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  sub: (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  scale: (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s],
  dot: (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  norm2: (a: Vec3): number => Vec3.dot(a, a),
  norm: (a: Vec3): number => Math.sqrt(Vec3.norm2(a)),
  normalize: (a: Vec3, eps = 1e-12): Vec3 => {
    const n = Vec3.norm(a);
    if (n < eps) return [0, 0, 1]; // Fallback to safe unit vector
    return Vec3.scale(a, 1 / n);
  },
  neg: (a: Vec3): Vec3 => [-a[0], -a[1], -a[2]],
  clamp: (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x)),
  angle: (a: Vec3, b: Vec3): number => {
    // a,b assumed unit
    const d = Vec3.clamp(Vec3.dot(a, b), -1, 1);
    return Math.acos(d);
  },
};
