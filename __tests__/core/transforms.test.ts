import { describe, it, expect } from 'vitest';
import { Vec3 } from '@/core/types';
import {
  IDENTITY_MAT3,
  IDENTITY_QUAT,
  matVecMul,
  matMul,
  transpose,
  rotationX,
  rotationY,
  rotationZ,
  rotationAxisAngle,
  rotationBetweenVectors,
  quaternionFromAxisAngle,
  quaternionToMatrix,
  quaternionRotate,
  createOrbitState,
  orbitToPosition,
  orbitForward,
  applyOrbitDrag,
  screenToRay,
  raySphereIntersection,
} from '@/core/transforms';

describe('transforms module', () => {
  describe('matVecMul', () => {
    it('multiplies identity matrix with vector', () => {
      const v: Vec3 = [1, 2, 3];
      const result = matVecMul(IDENTITY_MAT3, v);
      expect(Vec3.approxEq(result, v)).toBe(true);
    });

    it('applies rotation matrix correctly', () => {
      const rot90Z = rotationZ(Math.PI / 2);
      const v: Vec3 = [1, 0, 0];
      const result = matVecMul(rot90Z, v);
      expect(result[0]).toBeCloseTo(0);
      expect(result[1]).toBeCloseTo(1);
      expect(result[2]).toBeCloseTo(0);
    });

    it('applies scaling matrix', () => {
      const scale2 = [2, 0, 0, 0, 2, 0, 0, 0, 2] as any;
      const v: Vec3 = [1, 2, 3];
      const result = matVecMul(scale2, v);
      expect(result).toEqual([2, 4, 6]);
    });
  });

  describe('matMul', () => {
    it('multiplies with identity matrix', () => {
      const m = rotationZ(Math.PI / 4);
      const result = matMul(m, IDENTITY_MAT3);
      for (let i = 0; i < 9; i++) {
        expect(result[i]).toBeCloseTo(m[i]);
      }
    });

    it('composition of rotations', () => {
      const rotX = rotationX(Math.PI / 2);
      const rotY = rotationY(Math.PI / 2);
      const composed = matMul(rotX, rotY);

      // Apply composed rotation to a vector
      const v: Vec3 = [1, 0, 0];
      const result = matVecMul(composed, v);

      // Compare with sequential application
      const result2 = matVecMul(rotX, matVecMul(rotY, v));
      expect(Vec3.approxEq(result, result2)).toBe(true);
    });
  });

  describe('transpose', () => {
    it('transposes identity matrix', () => {
      const result = transpose(IDENTITY_MAT3);
      expect(result).toEqual(IDENTITY_MAT3);
    });

    it('double transpose returns original', () => {
      const m = rotationZ(Math.PI / 4);
      const result = transpose(transpose(m));
      for (let i = 0; i < 9; i++) {
        expect(result[i]).toBeCloseTo(m[i]);
      }
    });

    it('transposes correctly', () => {
      const m = [1, 2, 3, 4, 5, 6, 7, 8, 9] as any;
      const result = transpose(m);
      expect(result).toEqual([1, 4, 7, 2, 5, 8, 3, 6, 9]);
    });

    it('rotation matrix transpose is its inverse', () => {
      const rot = rotationZ(Math.PI / 3);
      const rotT = transpose(rot);
      const product = matMul(rot, rotT);

      // Should be close to identity
      for (let i = 0; i < 9; i++) {
        const expected = IDENTITY_MAT3[i];
        expect(product[i]).toBeCloseTo(expected, 5);
      }
    });
  });

  describe('rotationX', () => {
    it('rotates vector around X axis by 90 degrees', () => {
      const rot = rotationX(Math.PI / 2);
      const v: Vec3 = [0, 1, 0];
      const result = matVecMul(rot, v);
      expect(result[0]).toBeCloseTo(0);
      expect(result[1]).toBeCloseTo(0);
      expect(result[2]).toBeCloseTo(1);
    });

    it('leaves X axis unchanged', () => {
      const rot = rotationX(Math.PI / 3);
      const v: Vec3 = [1, 0, 0];
      const result = matVecMul(rot, v);
      expect(Vec3.approxEq(result, v)).toBe(true);
    });

    it('zero rotation is identity', () => {
      const rot = rotationX(0);
      for (let i = 0; i < 9; i++) {
        expect(rot[i]).toBeCloseTo(IDENTITY_MAT3[i]);
      }
    });

    it('preserves vector length', () => {
      const rot = rotationX(Math.PI / 4);
      const v: Vec3 = [1, 2, 3];
      const result = matVecMul(rot, v);
      expect(Vec3.norm(result)).toBeCloseTo(Vec3.norm(v));
    });
  });

  describe('rotationY', () => {
    it('rotates vector around Y axis by 90 degrees', () => {
      const rot = rotationY(Math.PI / 2);
      const v: Vec3 = [1, 0, 0];
      const result = matVecMul(rot, v);
      expect(result[0]).toBeCloseTo(0);
      expect(result[1]).toBeCloseTo(0);
      expect(result[2]).toBeCloseTo(-1);
    });

    it('leaves Y axis unchanged', () => {
      const rot = rotationY(Math.PI / 3);
      const v: Vec3 = [0, 1, 0];
      const result = matVecMul(rot, v);
      expect(Vec3.approxEq(result, v)).toBe(true);
    });

    it('preserves vector length', () => {
      const rot = rotationY(Math.PI / 4);
      const v: Vec3 = [1, 2, 3];
      const result = matVecMul(rot, v);
      expect(Vec3.norm(result)).toBeCloseTo(Vec3.norm(v));
    });
  });

  describe('rotationZ', () => {
    it('rotates vector around Z axis by 90 degrees', () => {
      const rot = rotationZ(Math.PI / 2);
      const v: Vec3 = [1, 0, 0];
      const result = matVecMul(rot, v);
      expect(result[0]).toBeCloseTo(0);
      expect(result[1]).toBeCloseTo(1);
      expect(result[2]).toBeCloseTo(0);
    });

    it('leaves Z axis unchanged', () => {
      const rot = rotationZ(Math.PI / 3);
      const v: Vec3 = [0, 0, 1];
      const result = matVecMul(rot, v);
      expect(Vec3.approxEq(result, v)).toBe(true);
    });

    it('preserves vector length', () => {
      const rot = rotationZ(Math.PI / 4);
      const v: Vec3 = [1, 2, 3];
      const result = matVecMul(rot, v);
      expect(Vec3.norm(result)).toBeCloseTo(Vec3.norm(v));
    });
  });

  describe('rotationAxisAngle', () => {
    it('rotation around X axis matches rotationX', () => {
      const angle = Math.PI / 4;
      const rot1 = rotationAxisAngle([1, 0, 0], angle);
      const rot2 = rotationX(angle);

      for (let i = 0; i < 9; i++) {
        expect(rot1[i]).toBeCloseTo(rot2[i]);
      }
    });

    it('rotation around Y axis matches rotationY', () => {
      const angle = Math.PI / 3;
      const rot1 = rotationAxisAngle([0, 1, 0], angle);
      const rot2 = rotationY(angle);

      for (let i = 0; i < 9; i++) {
        expect(rot1[i]).toBeCloseTo(rot2[i]);
      }
    });

    it('rotation around Z axis matches rotationZ', () => {
      const angle = Math.PI / 6;
      const rot1 = rotationAxisAngle([0, 0, 1], angle);
      const rot2 = rotationZ(angle);

      for (let i = 0; i < 9; i++) {
        expect(rot1[i]).toBeCloseTo(rot2[i]);
      }
    });

    it('leaves axis unchanged', () => {
      const axis: Vec3 = Vec3.normalize([1, 1, 1]);
      const rot = rotationAxisAngle(axis, Math.PI / 2);
      const result = matVecMul(rot, axis);
      expect(Vec3.approxEq(result, axis)).toBe(true);
    });

    it('preserves vector length', () => {
      const axis: Vec3 = Vec3.normalize([1, 2, 3]);
      const rot = rotationAxisAngle(axis, Math.PI / 4);
      const v: Vec3 = [4, 5, 6];
      const result = matVecMul(rot, v);
      expect(Vec3.norm(result)).toBeCloseTo(Vec3.norm(v));
    });
  });

  describe('rotationBetweenVectors', () => {
    it('returns identity for identical vectors', () => {
      const v: Vec3 = [1, 0, 0];
      const rot = rotationBetweenVectors(v, v);

      for (let i = 0; i < 9; i++) {
        expect(rot[i]).toBeCloseTo(IDENTITY_MAT3[i]);
      }
    });

    it('rotates from to to correctly', () => {
      const from: Vec3 = [1, 0, 0];
      const to: Vec3 = [0, 1, 0];
      const rot = rotationBetweenVectors(from, to);
      const result = matVecMul(rot, from);
      expect(Vec3.approxEq(result, to)).toBe(true);
    });

    it('handles antiparallel vectors', () => {
      const from: Vec3 = [1, 0, 0];
      const to: Vec3 = [-1, 0, 0];
      const rot = rotationBetweenVectors(from, to);
      const result = matVecMul(rot, from);
      expect(Vec3.approxEq(result, to)).toBe(true);
    });

    it('handles arbitrary vectors', () => {
      const from: Vec3 = Vec3.normalize([1, 2, 3]);
      const to: Vec3 = Vec3.normalize([4, 5, 6]);
      const rot = rotationBetweenVectors(from, to);
      const result = matVecMul(rot, from);
      expect(Vec3.approxEq(result, to)).toBe(true);
    });
  });

  describe('quaternionFromAxisAngle', () => {
    it('creates identity quaternion for zero angle', () => {
      const q = quaternionFromAxisAngle([1, 0, 0], 0);
      expect(q[0]).toBeCloseTo(0);
      expect(q[1]).toBeCloseTo(0);
      expect(q[2]).toBeCloseTo(0);
      expect(q[3]).toBeCloseTo(1);
    });

    it('creates quaternion for 90 degree rotation around X', () => {
      const q = quaternionFromAxisAngle([1, 0, 0], Math.PI / 2);
      expect(q[0]).toBeCloseTo(Math.sin(Math.PI / 4));
      expect(q[1]).toBeCloseTo(0);
      expect(q[2]).toBeCloseTo(0);
      expect(q[3]).toBeCloseTo(Math.cos(Math.PI / 4));
    });

    it('creates unit quaternion', () => {
      const q = quaternionFromAxisAngle([1, 1, 1], Math.PI / 3);
      const norm = Math.sqrt(q[0]*q[0] + q[1]*q[1] + q[2]*q[2] + q[3]*q[3]);
      expect(norm).toBeCloseTo(1);
    });
  });

  describe('quaternionToMatrix', () => {
    it('converts identity quaternion to identity matrix', () => {
      const m = quaternionToMatrix(IDENTITY_QUAT);
      for (let i = 0; i < 9; i++) {
        expect(m[i]).toBeCloseTo(IDENTITY_MAT3[i]);
      }
    });

    it('matches rotationAxisAngle', () => {
      const axis: Vec3 = Vec3.normalize([1, 2, 3]);
      const angle = Math.PI / 4;

      const q = quaternionFromAxisAngle(axis, angle);
      const m1 = quaternionToMatrix(q);
      const m2 = rotationAxisAngle(axis, angle);

      for (let i = 0; i < 9; i++) {
        expect(m1[i]).toBeCloseTo(m2[i]);
      }
    });
  });

  describe('quaternionRotate', () => {
    it('rotates vector using quaternion', () => {
      const q = quaternionFromAxisAngle([0, 0, 1], Math.PI / 2);
      const v: Vec3 = [1, 0, 0];
      const result = quaternionRotate(q, v);
      expect(result[0]).toBeCloseTo(0);
      expect(result[1]).toBeCloseTo(1);
      expect(result[2]).toBeCloseTo(0);
    });

    it('identity quaternion leaves vector unchanged', () => {
      const v: Vec3 = [1, 2, 3];
      const result = quaternionRotate(IDENTITY_QUAT, v);
      expect(Vec3.approxEq(result, v)).toBe(true);
    });

    it('preserves vector length', () => {
      const q = quaternionFromAxisAngle([1, 1, 1], Math.PI / 3);
      const v: Vec3 = [4, 5, 6];
      const result = quaternionRotate(q, v);
      expect(Vec3.norm(result)).toBeCloseTo(Vec3.norm(v));
    });
  });

  describe('createOrbitState', () => {
    it('creates default orbit state', () => {
      const orbit = createOrbitState();
      expect(orbit.distance).toBe(4.0);
      expect(orbit.azimuth).toBe(0);
      expect(orbit.polar).toBe(Math.PI / 3);
      expect(orbit.target).toEqual([0, 0, 0]);
    });
  });

  describe('orbitToPosition', () => {
    it('computes position for default orbit', () => {
      const orbit = createOrbitState();
      const pos = orbitToPosition(orbit);

      // Should be on a sphere of radius 4.0
      const dist = Vec3.norm(pos);
      expect(dist).toBeCloseTo(4.0);
    });

    it('computes position at north pole', () => {
      const orbit = {
        distance: 5.0,
        azimuth: 0,
        polar: 0,
        target: [0, 0, 0] as Vec3
      };
      const pos = orbitToPosition(orbit);
      expect(pos[0]).toBeCloseTo(0);
      expect(pos[1]).toBeCloseTo(5.0);
      expect(pos[2]).toBeCloseTo(0);
    });

    it('computes position at equator', () => {
      const orbit = {
        distance: 3.0,
        azimuth: 0,
        polar: Math.PI / 2,
        target: [0, 0, 0] as Vec3
      };
      const pos = orbitToPosition(orbit);
      expect(pos[0]).toBeCloseTo(0);
      expect(pos[1]).toBeCloseTo(0);
      expect(pos[2]).toBeCloseTo(3.0);
    });

    it('respects target offset', () => {
      const orbit = {
        distance: 1.0,
        azimuth: 0,
        polar: 0,
        target: [1, 2, 3] as Vec3
      };
      const pos = orbitToPosition(orbit);
      expect(pos[0]).toBeCloseTo(1);
      expect(pos[1]).toBeCloseTo(3); // 1 + 2
      expect(pos[2]).toBeCloseTo(3);
    });
  });

  describe('orbitForward', () => {
    it('computes forward direction', () => {
      const orbit = createOrbitState();
      const forward = orbitForward(orbit);

      // Should be normalized
      expect(Vec3.norm(forward)).toBeCloseTo(1);

      // Should point toward target
      const pos = orbitToPosition(orbit);
      const toTarget = Vec3.normalize(Vec3.sub(orbit.target, pos));
      expect(Vec3.approxEq(forward, toTarget)).toBe(true);
    });
  });

  describe('applyOrbitDrag', () => {
    it('updates azimuth', () => {
      const orbit = createOrbitState();
      const newOrbit = applyOrbitDrag(orbit, 0.5, 0);
      expect(newOrbit.azimuth).toBe(orbit.azimuth + 0.5);
    });

    it('updates polar', () => {
      const orbit = createOrbitState();
      const newOrbit = applyOrbitDrag(orbit, 0, 0.2);
      expect(newOrbit.polar).toBe(orbit.polar + 0.2);
    });

    it('clamps polar to valid range', () => {
      const orbit = createOrbitState();
      const newOrbit1 = applyOrbitDrag(orbit, 0, -10);
      expect(newOrbit1.polar).toBeGreaterThanOrEqual(0.1);

      const newOrbit2 = applyOrbitDrag(orbit, 0, 10);
      expect(newOrbit2.polar).toBeLessThanOrEqual(Math.PI - 0.1);
    });

    it('preserves distance and target', () => {
      const orbit = createOrbitState();
      const newOrbit = applyOrbitDrag(orbit, 0.5, 0.2);
      expect(newOrbit.distance).toBe(orbit.distance);
      expect(newOrbit.target).toEqual(orbit.target);
    });
  });

  describe('screenToRay', () => {
    it('casts ray from center of screen', () => {
      const orbit = createOrbitState();
      const ray = screenToRay(0, 0, orbit);

      expect(Vec3.norm(ray.direction)).toBeCloseTo(1);
      expect(Vec3.approxEq(ray.origin, orbitToPosition(orbit))).toBe(true);
    });

    it('ray direction is normalized', () => {
      const orbit = createOrbitState();
      const ray = screenToRay(0.5, 0.3, orbit);
      expect(Vec3.norm(ray.direction)).toBeCloseTo(1);
    });
  });

  describe('raySphereIntersection', () => {
    it('intersects sphere from outside', () => {
      const ray = {
        origin: [0, 0, 5] as Vec3,
        direction: [0, 0, -1] as Vec3
      };
      const intersection = raySphereIntersection(ray);

      expect(intersection).not.toBeNull();
      expect(Vec3.norm(intersection!)).toBeCloseTo(1);
      expect(intersection![2]).toBeCloseTo(1);
    });

    it('returns null for ray pointing away', () => {
      const ray = {
        origin: [0, 0, 5] as Vec3,
        direction: [0, 0, 1] as Vec3
      };
      const intersection = raySphereIntersection(ray);
      expect(intersection).toBeNull();
    });

    it('intersects from camera position', () => {
      const orbit = createOrbitState();
      const cameraPos = orbitToPosition(orbit);
      const ray = {
        origin: cameraPos,
        direction: Vec3.normalize(Vec3.sub([0, 0, 0], cameraPos))
      };

      const intersection = raySphereIntersection(ray);
      expect(intersection).not.toBeNull();
      expect(Vec3.norm(intersection!)).toBeCloseTo(1);
    });

    it('returns normalized intersection point', () => {
      const ray = {
        origin: [2, 0, 0] as Vec3,
        direction: [-1, 0, 0] as Vec3
      };
      const intersection = raySphereIntersection(ray);

      expect(intersection).not.toBeNull();
      expect(Vec3.norm(intersection!)).toBeCloseTo(1);
    });

    it('handles tangent ray', () => {
      const ray = {
        origin: [0, 1, 2] as Vec3,
        direction: [0, 0, -1] as Vec3
      };
      const intersection = raySphereIntersection(ray);
      expect(intersection).not.toBeNull();
    });
  });

  describe('integration tests', () => {
    it('rotation preserves orthogonality', () => {
      const v1: Vec3 = [1, 0, 0];
      const v2: Vec3 = [0, 1, 0];
      const rot = rotationZ(Math.PI / 4);

      const r1 = matVecMul(rot, v1);
      const r2 = matVecMul(rot, v2);

      expect(Vec3.dot(r1, r2)).toBeCloseTo(0);
    });

    it('quaternion and matrix rotations are equivalent', () => {
      const axis: Vec3 = Vec3.normalize([1, 1, 1]);
      const angle = Math.PI / 3;
      const v: Vec3 = [1, 2, 3];

      const mat = rotationAxisAngle(axis, angle);
      const quat = quaternionFromAxisAngle(axis, angle);

      const result1 = matVecMul(mat, v);
      const result2 = quaternionRotate(quat, v);

      expect(Vec3.approxEq(result1, result2)).toBe(true);
    });

    it('orbit drag maintains valid camera position', () => {
      let orbit = createOrbitState();

      for (let i = 0; i < 10; i++) {
        orbit = applyOrbitDrag(orbit, 0.1, 0.05);
        const pos = orbitToPosition(orbit);
        const dist = Vec3.norm(pos);
        expect(dist).toBeCloseTo(orbit.distance);
      }
    });
  });
});
