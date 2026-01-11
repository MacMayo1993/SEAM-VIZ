
import { Vec3 } from "./vec3";

export type ProjectiveRep = {
  u: Vec3; // canonical unit representative
};

function canonicalSign(u: Vec3, eps = 1e-12): number {
  if (Math.abs(u[0]) > eps) return u[0] >= 0 ? +1 : -1;
  if (Math.abs(u[1]) > eps) return u[1] >= 0 ? +1 : -1;
  if (Math.abs(u[2]) > eps) return u[2] >= 0 ? +1 : -1;
  return +1;
}

export const Projective = {
  fromVec: (v: Vec3): ProjectiveRep => {
    const u0 = Vec3.normalize(v);
    const s = canonicalSign(u0);
    const u = s === 1 ? u0 : Vec3.neg(u0);
    return { u };
  },
  antipode: (p: ProjectiveRep): Vec3 => Vec3.neg(p.u),
  dist: (a: ProjectiveRep, b: ProjectiveRep): number => {
    const d = Math.abs(Vec3.dot(a.u, b.u));
    return Math.acos(Vec3.clamp(d, -1, 1));
  },
  approxEq: (a: ProjectiveRep, b: ProjectiveRep, tol = 1e-6): boolean => {
    return Projective.dist(a, b) <= tol;
  }
};
