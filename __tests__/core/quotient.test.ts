import { describe, it, expect } from 'vitest';
import { Vec3 } from '@/core/types';
import {
  normalize,
  antipode,
  classOf,
  classEquals,
  quotientDistance,
  pointInQuotientCone,
  quotientConeWeight,
  getBothRepresentatives,
  directionToClass,
} from '@/core/quotient';

describe('quotient module', () => {
  describe('normalize', () => {
    it('normalizes a vector to unit length', () => {
      const v: Vec3 = [3, 4, 0];
      const result = normalize(v);
      const norm = Vec3.norm(result);
      expect(norm).toBeCloseTo(1);
    });

    it('preserves direction of unit vectors', () => {
      const unit: Vec3 = [1, 0, 0];
      const result = normalize(unit);
      expect(Vec3.approxEq(result, unit)).toBe(true);
    });

    it('handles arbitrary vectors', () => {
      const v: Vec3 = [1, 2, 3];
      const result = normalize(v);
      expect(Vec3.norm(result)).toBeCloseTo(1);
    });
  });

  describe('antipode', () => {
    it('computes antipodal point', () => {
      const u: Vec3 = [1, 0, 0];
      const result = antipode(u);
      expect(result[0]).toBeCloseTo(-1);
      expect(result[1]).toBeCloseTo(0);
      expect(result[2]).toBeCloseTo(0);
    });

    it('double antipode returns original', () => {
      const u: Vec3 = [1, 2, 3];
      const result = antipode(antipode(u));
      expect(Vec3.approxEq(result, u)).toBe(true);
    });

    it('antipode is at angle π', () => {
      const u: Vec3 = Vec3.normalize([1, 1, 1]);
      const negU = antipode(u);
      const angle = Vec3.angle(u, negU);
      expect(angle).toBeCloseTo(Math.PI);
    });
  });

  describe('classOf', () => {
    it('creates a quotient class from a vector', () => {
      const v: Vec3 = [1, 0, 0];
      const qClass = classOf(v);

      expect(qClass).toHaveProperty('canonical');
      expect(qClass).toHaveProperty('representatives');
      expect(qClass.representatives).toHaveLength(2);
    });

    it('ensures canonical representative has positive first coordinate', () => {
      const v: Vec3 = [-1, 0, 0];
      const qClass = classOf(v);

      // Canonical should be [1, 0, 0], not [-1, 0, 0]
      expect(qClass.canonical[0]).toBeGreaterThan(0);
    });

    it('handles vector with zero x, positive y', () => {
      const v: Vec3 = [0, 1, 0];
      const qClass = classOf(v);

      expect(qClass.canonical[1]).toBeGreaterThanOrEqual(0);
    });

    it('handles vector with zero x and y, positive z', () => {
      const v: Vec3 = [0, 0, 1];
      const qClass = classOf(v);

      expect(qClass.canonical[2]).toBeGreaterThanOrEqual(0);
    });

    it('normalizes the input vector', () => {
      const v: Vec3 = [3, 4, 0];
      const qClass = classOf(v);

      expect(Vec3.norm(qClass.canonical)).toBeCloseTo(1);
    });

    it('representatives are antipodal', () => {
      const v: Vec3 = [1, 2, 3];
      const qClass = classOf(v);

      const [u, negU] = qClass.representatives;
      expect(Vec3.approxEq(negU, Vec3.neg(u))).toBe(true);
    });

    it('canonical is first representative', () => {
      const v: Vec3 = [1, 2, 3];
      const qClass = classOf(v);

      expect(Vec3.approxEq(qClass.canonical, qClass.representatives[0])).toBe(true);
    });
  });

  describe('classEquals', () => {
    it('returns true for identical classes', () => {
      const v: Vec3 = [1, 0, 0];
      const a = classOf(v);
      const b = classOf(v);

      expect(classEquals(a, b)).toBe(true);
    });

    it('returns true for classes from antipodal vectors', () => {
      const v1: Vec3 = [1, 0, 0];
      const v2: Vec3 = [-1, 0, 0];
      const a = classOf(v1);
      const b = classOf(v2);

      expect(classEquals(a, b)).toBe(true);
    });

    it('returns false for different classes', () => {
      const v1: Vec3 = [1, 0, 0];
      const v2: Vec3 = [0, 1, 0];
      const a = classOf(v1);
      const b = classOf(v2);

      expect(classEquals(a, b)).toBe(false);
    });

    it('handles epsilon tolerance', () => {
      const v1: Vec3 = [1, 0, 0];
      const v2: Vec3 = [1.0000001, 0, 0];
      const a = classOf(v1);
      const b = classOf(v2);

      expect(classEquals(a, b, 1e-5)).toBe(true);
    });
  });

  describe('quotientDistance', () => {
    it('returns 0 for same class', () => {
      const v: Vec3 = [1, 0, 0];
      const a = classOf(v);
      const b = classOf(v);

      const dist = quotientDistance(a, b);
      expect(dist).toBeCloseTo(0);
    });

    it('returns 0 for antipodal representatives', () => {
      const v1: Vec3 = [1, 0, 0];
      const v2: Vec3 = [-1, 0, 0];
      const a = classOf(v1);
      const b = classOf(v2);

      const dist = quotientDistance(a, b);
      expect(dist).toBeCloseTo(0);
    });

    it('returns π/2 for orthogonal classes', () => {
      const v1: Vec3 = [1, 0, 0];
      const v2: Vec3 = [0, 1, 0];
      const a = classOf(v1);
      const b = classOf(v2);

      const dist = quotientDistance(a, b);
      expect(dist).toBeCloseTo(Math.PI / 2);
    });

    it('returns value in [0, π/2]', () => {
      const v1: Vec3 = [1, 0, 0];
      const v2: Vec3 = [1, 1, 0];
      const a = classOf(v1);
      const b = classOf(v2);

      const dist = quotientDistance(a, b);
      expect(dist).toBeGreaterThanOrEqual(0);
      expect(dist).toBeLessThanOrEqual(Math.PI / 2);
    });

    it('is symmetric', () => {
      const v1: Vec3 = [1, 2, 3];
      const v2: Vec3 = [4, 5, 6];
      const a = classOf(v1);
      const b = classOf(v2);

      const distAB = quotientDistance(a, b);
      const distBA = quotientDistance(b, a);
      expect(distAB).toBeCloseTo(distBA);
    });
  });

  describe('pointInQuotientCone', () => {
    it('returns true for point at cone center', () => {
      const center = classOf([1, 0, 0]);
      const point: Vec3 = [1, 0, 0];
      const aperture = Math.PI / 4;

      expect(pointInQuotientCone(point, center, aperture)).toBe(true);
    });

    it('returns true for point at antipode of center', () => {
      const center = classOf([1, 0, 0]);
      const point: Vec3 = [-1, 0, 0];
      const aperture = Math.PI / 4;

      expect(pointInQuotientCone(point, center, aperture)).toBe(true);
    });

    it('returns true for point within cone', () => {
      const center = classOf([1, 0, 0]);
      const point: Vec3 = Vec3.normalize([1, 0.1, 0]);
      const aperture = Math.PI / 4;

      expect(pointInQuotientCone(point, center, aperture)).toBe(true);
    });

    it('returns false for point outside cone', () => {
      const center = classOf([1, 0, 0]);
      const point: Vec3 = [0, 1, 0]; // 90 degrees away
      const aperture = Math.PI / 4; // 45 degrees

      expect(pointInQuotientCone(point, center, aperture)).toBe(false);
    });

    it('handles small aperture', () => {
      const center = classOf([1, 0, 0]);
      const point: Vec3 = Vec3.normalize([1, 0.1, 0]);
      const aperture = 0.01; // Very small cone

      expect(pointInQuotientCone(point, center, aperture)).toBe(false);
    });

    it('handles large aperture', () => {
      const center = classOf([1, 0, 0]);
      const point: Vec3 = [0, 1, 0];
      const aperture = Math.PI; // Very large cone

      expect(pointInQuotientCone(point, center, aperture)).toBe(true);
    });
  });

  describe('quotientConeWeight', () => {
    it('returns 1.0 at cone center', () => {
      const center = classOf([1, 0, 0]);
      const point: Vec3 = [1, 0, 0];
      const aperture = Math.PI / 4;

      const weight = quotientConeWeight(point, center, aperture);
      expect(weight).toBeCloseTo(1.0);
    });

    it('returns 1.0 at antipode of center', () => {
      const center = classOf([1, 0, 0]);
      const point: Vec3 = [-1, 0, 0];
      const aperture = Math.PI / 4;

      const weight = quotientConeWeight(point, center, aperture);
      expect(weight).toBeCloseTo(1.0);
    });

    it('returns 0.0 outside cone', () => {
      const center = classOf([1, 0, 0]);
      const point: Vec3 = [0, 1, 0];
      const aperture = Math.PI / 4;

      const weight = quotientConeWeight(point, center, aperture);
      expect(weight).toBeCloseTo(0.0);
    });

    it('returns value in [0, 1]', () => {
      const center = classOf([1, 0, 0]);
      const point: Vec3 = Vec3.normalize([1, 0.5, 0]);
      const aperture = Math.PI / 4;

      const weight = quotientConeWeight(point, center, aperture);
      expect(weight).toBeGreaterThanOrEqual(0);
      expect(weight).toBeLessThanOrEqual(1);
    });

    it('decreases linearly with distance', () => {
      const center = classOf([1, 0, 0]);
      const aperture = Math.PI / 4;

      // Points at different distances
      const near: Vec3 = Vec3.normalize([1, 0.1, 0]);
      const far: Vec3 = Vec3.normalize([1, 0.5, 0]);

      const weightNear = quotientConeWeight(near, center, aperture);
      const weightFar = quotientConeWeight(far, center, aperture);

      expect(weightNear).toBeGreaterThan(weightFar);
    });

    it('returns approximately 0.5 at half aperture', () => {
      const center = classOf([1, 0, 0]);
      const aperture = Math.PI / 4;

      // Create a point at half the aperture angle
      const halfAngle = aperture / 2;
      const point: Vec3 = Vec3.normalize([
        Math.cos(halfAngle),
        Math.sin(halfAngle),
        0
      ]);

      const weight = quotientConeWeight(point, center, aperture);
      expect(weight).toBeCloseTo(0.5, 1);
    });
  });

  describe('getBothRepresentatives', () => {
    it('returns both representatives', () => {
      const v: Vec3 = [1, 0, 0];
      const qClass = classOf(v);

      const [u, negU] = getBothRepresentatives(qClass);
      expect(Vec3.approxEq(negU, Vec3.neg(u))).toBe(true);
    });

    it('returns array of length 2', () => {
      const v: Vec3 = [1, 2, 3];
      const qClass = classOf(v);

      const reps = getBothRepresentatives(qClass);
      expect(reps).toHaveLength(2);
    });

    it('first representative is canonical', () => {
      const v: Vec3 = [1, 2, 3];
      const qClass = classOf(v);

      const [u] = getBothRepresentatives(qClass);
      expect(Vec3.approxEq(u, qClass.canonical)).toBe(true);
    });
  });

  describe('directionToClass', () => {
    it('converts direction to quotient class', () => {
      const direction: Vec3 = [1, 0, 0];
      const qClass = directionToClass(direction);

      expect(qClass).toHaveProperty('canonical');
      expect(qClass).toHaveProperty('representatives');
    });

    it('is equivalent to classOf', () => {
      const direction: Vec3 = [1, 2, 3];
      const qClass1 = directionToClass(direction);
      const qClass2 = classOf(direction);

      expect(classEquals(qClass1, qClass2)).toBe(true);
    });

    it('normalizes the direction', () => {
      const direction: Vec3 = [3, 4, 0];
      const qClass = directionToClass(direction);

      expect(Vec3.norm(qClass.canonical)).toBeCloseTo(1);
    });
  });

  describe('integration tests', () => {
    it('quotient space respects antipodal symmetry', () => {
      const v: Vec3 = [1, 2, 3];
      const negV: Vec3 = Vec3.neg(v);

      const class1 = classOf(v);
      const class2 = classOf(negV);

      expect(classEquals(class1, class2)).toBe(true);
      expect(quotientDistance(class1, class2)).toBeCloseTo(0);
    });

    it('cone membership is symmetric for antipodes', () => {
      const center = classOf([1, 0, 0]);
      const point: Vec3 = Vec3.normalize([1, 0.5, 0]);
      const antipodePoint = Vec3.neg(point);
      const aperture = Math.PI / 4;

      const inCone1 = pointInQuotientCone(point, center, aperture);
      const inCone2 = pointInQuotientCone(antipodePoint, center, aperture);

      expect(inCone1).toBe(inCone2);
    });

    it('cone weight is symmetric for antipodes', () => {
      const center = classOf([1, 0, 0]);
      const point: Vec3 = Vec3.normalize([1, 0.5, 0]);
      const antipodePoint = Vec3.neg(point);
      const aperture = Math.PI / 4;

      const weight1 = quotientConeWeight(point, center, aperture);
      const weight2 = quotientConeWeight(antipodePoint, center, aperture);

      expect(weight1).toBeCloseTo(weight2);
    });

    it('projective distance metric properties', () => {
      const a = classOf([1, 0, 0]);
      const b = classOf([0, 1, 0]);
      const c = classOf([0, 0, 1]);

      // Distance is symmetric
      expect(quotientDistance(a, b)).toBeCloseTo(quotientDistance(b, a));

      // Distance to self is 0
      expect(quotientDistance(a, a)).toBeCloseTo(0);

      // All distances are non-negative
      expect(quotientDistance(a, b)).toBeGreaterThanOrEqual(0);
      expect(quotientDistance(b, c)).toBeGreaterThanOrEqual(0);
      expect(quotientDistance(a, c)).toBeGreaterThanOrEqual(0);
    });
  });
});
