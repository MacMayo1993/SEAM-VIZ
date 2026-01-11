
import { Vec3 } from "./vec3";
import { ProjectiveRep } from "./projective";
import { Mesh, vertexDirections } from "./mesh";

export type Spotlight = {
  center: ProjectiveRep;
  halfAngleRad: number;
};

export type SpotlightHit = {
  vertexMask: boolean[];
  hitCount: number;
  weights?: number[];
};

export function computeSpotlightHit(mesh: Mesh, light: Spotlight): SpotlightHit {
  const dirs = vertexDirections(mesh);
  const u = light.center.u;
  const um = Vec3.neg(u);
  const th = light.halfAngleRad;

  const mask: boolean[] = new Array(dirs.length).fill(false);
  const weights: number[] = new Array(dirs.length).fill(0);
  let hitCount = 0;

  for (let i = 0; i < dirs.length; i++) {
    const d = dirs[i];
    const a1 = Vec3.angle(d, u);
    const a2 = Vec3.angle(d, um);
    const minAngle = Math.min(a1, a2);
    
    if (minAngle <= th) {
      mask[i] = true;
      hitCount++;
      // Falloff weight
      weights[i] = 1.0 - (minAngle / th);
    }
  }

  return { vertexMask: mask, hitCount, weights };
}
