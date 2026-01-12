import { describe, it, expect } from 'vitest';
import { Vec3 } from '@/core/types';
import {
  PARITY_EVEN,
  PARITY_ODD,
  composeParity,
  invertParity,
  isFlipped,
  parityToString,
  antipodalTransitionParity,
  createPath,
  appendToPath,
  closeLoop,
  concatenatePaths,
  reversePath,
  windingParity,
  parallelTransport,
  isNullHomotopic,
  applyParityToVector,
} from '@/core/parity';

describe('parity module', () => {
  describe('constants', () => {
    it('PARITY_EVEN is 0', () => {
      expect(PARITY_EVEN).toBe(0);
    });

    it('PARITY_ODD is 1', () => {
      expect(PARITY_ODD).toBe(1);
    });
  });

  describe('composeParity', () => {
    it('even + even = even', () => {
      expect(composeParity(PARITY_EVEN, PARITY_EVEN)).toBe(PARITY_EVEN);
    });

    it('even + odd = odd', () => {
      expect(composeParity(PARITY_EVEN, PARITY_ODD)).toBe(PARITY_ODD);
    });

    it('odd + even = odd', () => {
      expect(composeParity(PARITY_ODD, PARITY_EVEN)).toBe(PARITY_ODD);
    });

    it('odd + odd = even', () => {
      expect(composeParity(PARITY_ODD, PARITY_ODD)).toBe(PARITY_EVEN);
    });

    it('is commutative', () => {
      expect(composeParity(PARITY_EVEN, PARITY_ODD)).toBe(composeParity(PARITY_ODD, PARITY_EVEN));
      expect(composeParity(PARITY_ODD, PARITY_ODD)).toBe(composeParity(PARITY_ODD, PARITY_ODD));
    });

    it('is associative', () => {
      const a = PARITY_ODD;
      const b = PARITY_EVEN;
      const c = PARITY_ODD;

      const result1 = composeParity(composeParity(a, b), c);
      const result2 = composeParity(a, composeParity(b, c));
      expect(result1).toBe(result2);
    });
  });

  describe('invertParity', () => {
    it('even is its own inverse', () => {
      expect(invertParity(PARITY_EVEN)).toBe(PARITY_EVEN);
    });

    it('odd is its own inverse', () => {
      expect(invertParity(PARITY_ODD)).toBe(PARITY_ODD);
    });

    it('double inversion returns original', () => {
      expect(invertParity(invertParity(PARITY_EVEN))).toBe(PARITY_EVEN);
      expect(invertParity(invertParity(PARITY_ODD))).toBe(PARITY_ODD);
    });

    it('composing with inverse gives identity', () => {
      const p = PARITY_ODD;
      const inv = invertParity(p);
      expect(composeParity(p, inv)).toBe(PARITY_EVEN);
    });
  });

  describe('isFlipped', () => {
    it('returns false for even parity', () => {
      expect(isFlipped(PARITY_EVEN)).toBe(false);
    });

    it('returns true for odd parity', () => {
      expect(isFlipped(PARITY_ODD)).toBe(true);
    });
  });

  describe('parityToString', () => {
    it('converts even to "even"', () => {
      expect(parityToString(PARITY_EVEN)).toBe('even');
    });

    it('converts odd to "odd"', () => {
      expect(parityToString(PARITY_ODD)).toBe('odd');
    });
  });

  describe('antipodalTransitionParity', () => {
    it('always returns odd parity', () => {
      const u: Vec3 = [1, 0, 0];
      const negU: Vec3 = [-1, 0, 0];
      expect(antipodalTransitionParity(u, negU)).toBe(PARITY_ODD);
    });

    it('returns odd for any pair of vectors', () => {
      const v1: Vec3 = [1, 2, 3];
      const v2: Vec3 = [4, 5, 6];
      expect(antipodalTransitionParity(v1, v2)).toBe(PARITY_ODD);
    });
  });

  describe('createPath', () => {
    it('creates path with even parity', () => {
      const points: Vec3[] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
      const path = createPath(points);

      expect(path.points).toEqual(points);
      expect(path.parity).toBe(PARITY_EVEN);
    });

    it('handles empty path', () => {
      const path = createPath([]);
      expect(path.points).toEqual([]);
      expect(path.parity).toBe(PARITY_EVEN);
    });

    it('handles single point', () => {
      const points: Vec3[] = [[1, 0, 0]];
      const path = createPath(points);
      expect(path.points).toEqual(points);
      expect(path.parity).toBe(PARITY_EVEN);
    });
  });

  describe('appendToPath', () => {
    it('appends point to path', () => {
      const path = createPath([[1, 0, 0]]);
      const newPoint: Vec3 = [0, 1, 0];
      const newPath = appendToPath(path, newPoint);

      expect(newPath.points).toHaveLength(2);
      expect(newPath.points[1]).toEqual(newPoint);
    });

    it('preserves parity in simplified implementation', () => {
      const path = createPath([[1, 0, 0]]);
      const newPoint: Vec3 = [0, 1, 0];
      const newPath = appendToPath(path, newPoint);

      expect(newPath.parity).toBe(path.parity);
    });

    it('does not mutate original path', () => {
      const original = createPath([[1, 0, 0]]);
      const newPoint: Vec3 = [0, 1, 0];
      appendToPath(original, newPoint);

      expect(original.points).toHaveLength(1);
    });
  });

  describe('closeLoop', () => {
    it('returns even for trivial loop', () => {
      const path = createPath([]);
      expect(closeLoop(path)).toBe(PARITY_EVEN);
    });

    it('returns even for single point', () => {
      const path = createPath([[1, 0, 0]]);
      expect(closeLoop(path)).toBe(PARITY_EVEN);
    });

    it('returns accumulated parity', () => {
      const path = createPath([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
      expect(closeLoop(path)).toBe(path.parity);
    });
  });

  describe('concatenatePaths', () => {
    it('concatenates points', () => {
      const path1 = createPath([[1, 0, 0], [0, 1, 0]]);
      const path2 = createPath([[0, 0, 1], [1, 1, 1]]);
      const result = concatenatePaths(path1, path2);

      expect(result.points).toHaveLength(4);
      expect(result.points[0]).toEqual([1, 0, 0]);
      expect(result.points[3]).toEqual([1, 1, 1]);
    });

    it('composes parities', () => {
      const path1 = { points: [[1, 0, 0] as Vec3], parity: PARITY_ODD };
      const path2 = { points: [[0, 1, 0] as Vec3], parity: PARITY_ODD };
      const result = concatenatePaths(path1, path2);

      expect(result.parity).toBe(PARITY_EVEN); // odd + odd = even
    });

    it('handles even + even = even', () => {
      const path1 = createPath([[1, 0, 0]]);
      const path2 = createPath([[0, 1, 0]]);
      const result = concatenatePaths(path1, path2);

      expect(result.parity).toBe(PARITY_EVEN);
    });

    it('handles even + odd = odd', () => {
      const path1 = { points: [[1, 0, 0] as Vec3], parity: PARITY_EVEN };
      const path2 = { points: [[0, 1, 0] as Vec3], parity: PARITY_ODD };
      const result = concatenatePaths(path1, path2);

      expect(result.parity).toBe(PARITY_ODD);
    });
  });

  describe('reversePath', () => {
    it('reverses point order', () => {
      const path = createPath([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
      const reversed = reversePath(path);

      expect(reversed.points[0]).toEqual([0, 0, 1]);
      expect(reversed.points[1]).toEqual([0, 1, 0]);
      expect(reversed.points[2]).toEqual([1, 0, 0]);
    });

    it('preserves parity', () => {
      const path = { points: [[1, 0, 0] as Vec3], parity: PARITY_ODD };
      const reversed = reversePath(path);

      expect(reversed.parity).toBe(path.parity);
    });

    it('double reversal returns original order', () => {
      const path = createPath([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
      const doubled = reversePath(reversePath(path));

      expect(doubled.points).toEqual(path.points);
      expect(doubled.parity).toBe(path.parity);
    });

    it('does not mutate original path', () => {
      const original = createPath([[1, 0, 0], [0, 1, 0]]);
      reversePath(original);

      expect(original.points[0]).toEqual([1, 0, 0]);
      expect(original.points[1]).toEqual([0, 1, 0]);
    });
  });

  describe('windingParity', () => {
    it('returns even parity (placeholder)', () => {
      const loop = createPath([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
      const point: Vec3 = [1, 1, 1];

      expect(windingParity(loop, point)).toBe(PARITY_EVEN);
    });
  });

  describe('parallelTransport', () => {
    it('returns initial vector (placeholder)', () => {
      const path = createPath([[1, 0, 0], [0, 1, 0]]);
      const vector: Vec3 = [0, 0, 1];

      const result = parallelTransport(path, vector);

      expect(result.vector).toEqual(vector);
      expect(result.parity).toBe(path.parity);
    });

    it('returns path parity', () => {
      const path = { points: [[1, 0, 0] as Vec3], parity: PARITY_ODD };
      const vector: Vec3 = [0, 1, 0];

      const result = parallelTransport(path, vector);

      expect(result.parity).toBe(PARITY_ODD);
    });
  });

  describe('isNullHomotopic', () => {
    it('returns true for even parity', () => {
      const path = createPath([[1, 0, 0], [0, 1, 0]]);
      expect(isNullHomotopic(path)).toBe(true);
    });

    it('returns false for odd parity', () => {
      const path = { points: [[1, 0, 0] as Vec3], parity: PARITY_ODD };
      expect(isNullHomotopic(path)).toBe(false);
    });
  });

  describe('applyParityToVector', () => {
    it('returns vector unchanged for even parity', () => {
      const v: Vec3 = [1, 2, 3];
      const result = applyParityToVector(v, PARITY_EVEN);
      expect(result).toEqual(v);
    });

    it('negates vector for odd parity', () => {
      const v: Vec3 = [1, 2, 3];
      const result = applyParityToVector(v, PARITY_ODD);
      expect(result).toEqual([-1, -2, -3]);
    });

    it('double application returns original for odd parity', () => {
      const v: Vec3 = [1, 2, 3];
      const flipped = applyParityToVector(v, PARITY_ODD);
      const restored = applyParityToVector(flipped, PARITY_ODD);
      expect(restored).toEqual(v);
    });
  });

  describe('integration tests - ℤ₂ group properties', () => {
    it('identity element exists', () => {
      const p = PARITY_ODD;
      expect(composeParity(p, PARITY_EVEN)).toBe(p);
      expect(composeParity(PARITY_EVEN, p)).toBe(p);
    });

    it('every element has an inverse', () => {
      const even_inv = invertParity(PARITY_EVEN);
      const odd_inv = invertParity(PARITY_ODD);

      expect(composeParity(PARITY_EVEN, even_inv)).toBe(PARITY_EVEN);
      expect(composeParity(PARITY_ODD, odd_inv)).toBe(PARITY_EVEN);
    });

    it('closure property', () => {
      const combinations = [
        composeParity(PARITY_EVEN, PARITY_EVEN),
        composeParity(PARITY_EVEN, PARITY_ODD),
        composeParity(PARITY_ODD, PARITY_EVEN),
        composeParity(PARITY_ODD, PARITY_ODD),
      ];

      combinations.forEach(result => {
        expect([PARITY_EVEN, PARITY_ODD]).toContain(result);
      });
    });

    it('path concatenation is associative', () => {
      const p1 = createPath([[1, 0, 0]]);
      const p2 = { points: [[0, 1, 0] as Vec3], parity: PARITY_ODD };
      const p3 = { points: [[0, 0, 1] as Vec3], parity: PARITY_ODD };

      const left = concatenatePaths(concatenatePaths(p1, p2), p3);
      const right = concatenatePaths(p1, concatenatePaths(p2, p3));

      expect(left.parity).toBe(right.parity);
    });

    it('path reversal is involutive', () => {
      const path = createPath([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
      const reversed = reversePath(path);
      const restored = reversePath(reversed);

      expect(restored.points).toEqual(path.points);
      expect(restored.parity).toBe(path.parity);
    });

    it('parity composition matches XOR', () => {
      expect(composeParity(0 as any, 0 as any)).toBe(0 ^ 0);
      expect(composeParity(0 as any, 1 as any)).toBe(0 ^ 1);
      expect(composeParity(1 as any, 0 as any)).toBe(1 ^ 0);
      expect(composeParity(1 as any, 1 as any)).toBe(1 ^ 1);
    });
  });

  describe('integration tests - vector parity application', () => {
    it('applying even parity twice is identity', () => {
      const v: Vec3 = [1, 2, 3];
      const result = applyParityToVector(applyParityToVector(v, PARITY_EVEN), PARITY_EVEN);
      expect(result).toEqual(v);
    });

    it('applying odd parity twice is identity', () => {
      const v: Vec3 = [1, 2, 3];
      const result = applyParityToVector(applyParityToVector(v, PARITY_ODD), PARITY_ODD);
      expect(result).toEqual(v);
    });

    it('composing parity then applying equals sequential application', () => {
      const v: Vec3 = [1, 2, 3];
      const p1 = PARITY_ODD;
      const p2 = PARITY_ODD;

      const composed = composeParity(p1, p2);
      const result1 = applyParityToVector(v, composed);

      const result2 = applyParityToVector(applyParityToVector(v, p1), p2);

      expect(result1).toEqual(result2);
    });
  });
});
