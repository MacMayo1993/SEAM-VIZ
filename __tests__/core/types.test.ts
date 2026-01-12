import { describe, it, expect } from 'vitest';
import { Vec3 } from '@/core/types';

describe('Vec3 namespace', () => {
  describe('add', () => {
    it('adds two vectors correctly', () => {
      const a: Vec3 = [1, 2, 3];
      const b: Vec3 = [4, 5, 6];
      const result = Vec3.add(a, b);
      expect(result).toEqual([5, 7, 9]);
    });

    it('handles zero vectors', () => {
      const a: Vec3 = [1, 2, 3];
      const zero: Vec3 = [0, 0, 0];
      const result = Vec3.add(a, zero);
      expect(result).toEqual(a);
    });

    it('handles negative numbers', () => {
      const a: Vec3 = [1, -2, 3];
      const b: Vec3 = [-1, 2, -3];
      const result = Vec3.add(a, b);
      expect(result).toEqual([0, 0, 0]);
    });
  });

  describe('sub', () => {
    it('subtracts two vectors correctly', () => {
      const a: Vec3 = [5, 7, 9];
      const b: Vec3 = [1, 2, 3];
      const result = Vec3.sub(a, b);
      expect(result).toEqual([4, 5, 6]);
    });

    it('returns zero when subtracting a vector from itself', () => {
      const a: Vec3 = [1, 2, 3];
      const result = Vec3.sub(a, a);
      expect(result).toEqual([0, 0, 0]);
    });
  });

  describe('scale', () => {
    it('scales a vector by a positive scalar', () => {
      const a: Vec3 = [1, 2, 3];
      const result = Vec3.scale(a, 2);
      expect(result).toEqual([2, 4, 6]);
    });

    it('scales a vector by zero', () => {
      const a: Vec3 = [1, 2, 3];
      const result = Vec3.scale(a, 0);
      expect(result).toEqual([0, 0, 0]);
    });

    it('scales a vector by a negative scalar', () => {
      const a: Vec3 = [1, 2, 3];
      const result = Vec3.scale(a, -1);
      expect(result).toEqual([-1, -2, -3]);
    });

    it('scales a vector by a fraction', () => {
      const a: Vec3 = [2, 4, 6];
      const result = Vec3.scale(a, 0.5);
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('dot', () => {
    it('computes dot product of two vectors', () => {
      const a: Vec3 = [1, 2, 3];
      const b: Vec3 = [4, 5, 6];
      const result = Vec3.dot(a, b);
      expect(result).toBe(32); // 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
    });

    it('returns zero for orthogonal vectors', () => {
      const a: Vec3 = [1, 0, 0];
      const b: Vec3 = [0, 1, 0];
      const result = Vec3.dot(a, b);
      expect(result).toBe(0);
    });

    it('returns norm squared when dotting with itself', () => {
      const a: Vec3 = [3, 4, 0];
      const result = Vec3.dot(a, a);
      expect(result).toBe(25); // 3² + 4² = 9 + 16 = 25
    });
  });

  describe('norm2', () => {
    it('computes squared norm correctly', () => {
      const a: Vec3 = [3, 4, 0];
      const result = Vec3.norm2(a);
      expect(result).toBe(25);
    });

    it('returns zero for zero vector', () => {
      const zero: Vec3 = [0, 0, 0];
      const result = Vec3.norm2(zero);
      expect(result).toBe(0);
    });

    it('handles 3D vectors', () => {
      const a: Vec3 = [1, 2, 2];
      const result = Vec3.norm2(a);
      expect(result).toBe(9); // 1 + 4 + 4 = 9
    });
  });

  describe('norm', () => {
    it('computes norm of a vector', () => {
      const a: Vec3 = [3, 4, 0];
      const result = Vec3.norm(a);
      expect(result).toBe(5);
    });

    it('returns zero for zero vector', () => {
      const zero: Vec3 = [0, 0, 0];
      const result = Vec3.norm(zero);
      expect(result).toBe(0);
    });

    it('computes norm of unit vector', () => {
      const unit: Vec3 = [1, 0, 0];
      const result = Vec3.norm(unit);
      expect(result).toBeCloseTo(1);
    });

    it('handles 3D vectors', () => {
      const a: Vec3 = [1, 2, 2];
      const result = Vec3.norm(a);
      expect(result).toBe(3);
    });
  });

  describe('normalize', () => {
    it('normalizes a vector to unit length', () => {
      const a: Vec3 = [3, 4, 0];
      const result = Vec3.normalize(a);
      expect(Vec3.norm(result)).toBeCloseTo(1);
      expect(result[0]).toBeCloseTo(0.6);
      expect(result[1]).toBeCloseTo(0.8);
      expect(result[2]).toBeCloseTo(0);
    });

    it('handles already normalized vectors', () => {
      const unit: Vec3 = [1, 0, 0];
      const result = Vec3.normalize(unit);
      expect(result).toEqual([1, 0, 0]);
    });

    it('returns fallback vector for zero vector', () => {
      const zero: Vec3 = [0, 0, 0];
      const result = Vec3.normalize(zero);
      expect(result).toEqual([0, 0, 1]);
    });

    it('returns fallback vector for very small vectors', () => {
      const tiny: Vec3 = [1e-15, 1e-15, 1e-15];
      const result = Vec3.normalize(tiny);
      expect(result).toEqual([0, 0, 1]);
    });
  });

  describe('neg', () => {
    it('negates a vector', () => {
      const a: Vec3 = [1, 2, 3];
      const result = Vec3.neg(a);
      expect(result).toEqual([-1, -2, -3]);
    });

    it('double negation returns original', () => {
      const a: Vec3 = [1, 2, 3];
      const result = Vec3.neg(Vec3.neg(a));
      expect(result).toEqual(a);
    });

    it('negates zero vector', () => {
      const zero: Vec3 = [0, 0, 0];
      const result = Vec3.neg(zero);
      expect(result[0]).toBeCloseTo(0);
      expect(result[1]).toBeCloseTo(0);
      expect(result[2]).toBeCloseTo(0);
    });
  });

  describe('clamp', () => {
    it('clamps value below minimum', () => {
      const result = Vec3.clamp(5, 10, 20);
      expect(result).toBe(10);
    });

    it('clamps value above maximum', () => {
      const result = Vec3.clamp(25, 10, 20);
      expect(result).toBe(20);
    });

    it('does not clamp value within range', () => {
      const result = Vec3.clamp(15, 10, 20);
      expect(result).toBe(15);
    });

    it('handles edge cases at boundaries', () => {
      expect(Vec3.clamp(10, 10, 20)).toBe(10);
      expect(Vec3.clamp(20, 10, 20)).toBe(20);
    });
  });

  describe('angle', () => {
    it('computes angle between parallel vectors', () => {
      const a: Vec3 = [1, 0, 0];
      const b: Vec3 = [1, 0, 0];
      const result = Vec3.angle(a, b);
      expect(result).toBeCloseTo(0);
    });

    it('computes angle between orthogonal vectors', () => {
      const a: Vec3 = [1, 0, 0];
      const b: Vec3 = [0, 1, 0];
      const result = Vec3.angle(a, b);
      expect(result).toBeCloseTo(Math.PI / 2);
    });

    it('computes angle between antiparallel vectors', () => {
      const a: Vec3 = [1, 0, 0];
      const b: Vec3 = [-1, 0, 0];
      const result = Vec3.angle(a, b);
      expect(result).toBeCloseTo(Math.PI);
    });

    it('computes angle between 45-degree vectors', () => {
      const a: Vec3 = [1, 0, 0];
      const b: Vec3 = Vec3.normalize([1, 1, 0]);
      const result = Vec3.angle(a, b);
      expect(result).toBeCloseTo(Math.PI / 4);
    });

    it('handles numerical precision with clamping', () => {
      // Test that clamp prevents acos domain errors
      const a: Vec3 = [1, 0, 0];
      const b: Vec3 = [1, 0, 0];
      const result = Vec3.angle(a, b);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(Math.PI);
    });
  });

  describe('cross', () => {
    it('computes cross product of orthogonal unit vectors', () => {
      const x: Vec3 = [1, 0, 0];
      const y: Vec3 = [0, 1, 0];
      const result = Vec3.cross(x, y);
      expect(result).toEqual([0, 0, 1]);
    });

    it('computes cross product in reverse order', () => {
      const x: Vec3 = [1, 0, 0];
      const y: Vec3 = [0, 1, 0];
      const result = Vec3.cross(y, x);
      expect(result).toEqual([0, 0, -1]);
    });

    it('returns zero for parallel vectors', () => {
      const a: Vec3 = [1, 2, 3];
      const b: Vec3 = [2, 4, 6];
      const result = Vec3.cross(a, b);
      expect(result).toEqual([0, 0, 0]);
    });

    it('returns zero when crossing vector with itself', () => {
      const a: Vec3 = [1, 2, 3];
      const result = Vec3.cross(a, a);
      expect(result).toEqual([0, 0, 0]);
    });

    it('computes cross product for general vectors', () => {
      const a: Vec3 = [1, 2, 3];
      const b: Vec3 = [4, 5, 6];
      const result = Vec3.cross(a, b);
      expect(result).toEqual([-3, 6, -3]);
    });

    it('cross product is orthogonal to both input vectors', () => {
      const a: Vec3 = [1, 2, 3];
      const b: Vec3 = [4, 5, 6];
      const result = Vec3.cross(a, b);
      expect(Vec3.dot(result, a)).toBeCloseTo(0);
      expect(Vec3.dot(result, b)).toBeCloseTo(0);
    });
  });

  describe('approxEq', () => {
    it('returns true for identical vectors', () => {
      const a: Vec3 = [1, 2, 3];
      const b: Vec3 = [1, 2, 3];
      expect(Vec3.approxEq(a, b)).toBe(true);
    });

    it('returns true for approximately equal vectors', () => {
      const a: Vec3 = [1, 2, 3];
      const b: Vec3 = [1.0000001, 2.0000001, 3.0000001];
      expect(Vec3.approxEq(a, b)).toBe(true);
    });

    it('returns false for clearly different vectors', () => {
      const a: Vec3 = [1, 2, 3];
      const b: Vec3 = [1, 2, 4];
      expect(Vec3.approxEq(a, b)).toBe(false);
    });

    it('respects custom epsilon', () => {
      const a: Vec3 = [1, 2, 3];
      const b: Vec3 = [1.01, 2, 3];
      expect(Vec3.approxEq(a, b, 0.1)).toBe(true);
      expect(Vec3.approxEq(a, b, 0.001)).toBe(false);
    });

    it('handles zero vectors', () => {
      const zero1: Vec3 = [0, 0, 0];
      const zero2: Vec3 = [0, 0, 0];
      expect(Vec3.approxEq(zero1, zero2)).toBe(true);
    });
  });

  describe('integration tests', () => {
    it('adding and subtracting gives original', () => {
      const a: Vec3 = [1, 2, 3];
      const b: Vec3 = [4, 5, 6];
      const result = Vec3.sub(Vec3.add(a, b), b);
      expect(Vec3.approxEq(result, a)).toBe(true);
    });

    it('normalize preserves direction', () => {
      const a: Vec3 = [3, 4, 0];
      const normalized = Vec3.normalize(a);
      const scaled = Vec3.scale(a, 1 / Vec3.norm(a));
      expect(Vec3.approxEq(normalized, scaled)).toBe(true);
    });

    it('cross product magnitude for orthogonal unit vectors', () => {
      const a: Vec3 = [1, 0, 0];
      const b: Vec3 = [0, 1, 0];
      const result = Vec3.cross(a, b);
      expect(Vec3.norm(result)).toBeCloseTo(1);
    });

    it('dot product of perpendicular cross products', () => {
      const a: Vec3 = [1, 0, 0];
      const b: Vec3 = [0, 1, 0];
      const c = Vec3.cross(a, b);
      expect(Vec3.dot(a, c)).toBeCloseTo(0);
      expect(Vec3.dot(b, c)).toBeCloseTo(0);
    });
  });
});
