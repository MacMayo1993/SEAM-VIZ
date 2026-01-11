/**
 * Parity Module
 *
 * This module implements orientation tracking using ℤ₂ (the cyclic group of order 2).
 * In the context of projective geometry, parity tracks whether an orientation-reversing
 * transformation has been applied.
 *
 * Key Concept: Non-Orientability
 * The real projective plane ℝP² is non-orientable. When you traverse a loop that
 * wraps around the projective structure, you can return with a flipped orientation.
 *
 * This module provides the infrastructure for tracking this phenomenon, even though
 * V1 of SEAM-VIZ doesn't expose it in the UI. It's designed for future features like:
 * - Path tracing with orientation awareness
 * - Frame transport (parallel transport of tangent vectors)
 * - Loop detection (identifying whether a closed path flips orientation)
 */

import { Vec3, Parity, PathWithParity } from './types';

/**
 * The identity element in ℤ₂ (no flip)
 */
export const PARITY_EVEN: Parity = 0;

/**
 * The generator in ℤ₂ (one flip)
 */
export const PARITY_ODD: Parity = 1;

/**
 * Composes two parities using ℤ₂ addition.
 *
 * In ℤ₂, addition is the same as XOR:
 * - even + even = even (0 + 0 = 0)
 * - even + odd = odd (0 + 1 = 1)
 * - odd + even = odd (1 + 0 = 1)
 * - odd + odd = even (1 + 1 = 0)
 *
 * @param a - First parity
 * @param b - Second parity
 * @returns The composed parity
 */
export function composeParity(a: Parity, b: Parity): Parity {
  return ((a + b) % 2) as Parity;
}

/**
 * Inverts a parity.
 *
 * In ℤ₂, every element is its own inverse:
 * - inv(even) = even
 * - inv(odd) = odd
 *
 * @param p - A parity value
 * @returns The inverse parity (same as input in ℤ₂)
 */
export function invertParity(p: Parity): Parity {
  return p; // In ℤ₂, every element is its own inverse
}

/**
 * Checks if a parity represents an orientation flip.
 *
 * @param p - A parity value
 * @returns true if the parity is odd (orientation-reversing)
 */
export function isFlipped(p: Parity): boolean {
  return p === PARITY_ODD;
}

/**
 * Converts a parity to a human-readable string.
 *
 * @param p - A parity value
 * @returns A string like "even" or "odd"
 */
export function parityToString(p: Parity): string {
  return p === PARITY_EVEN ? 'even' : 'odd';
}

/**
 * Computes the parity of transitioning from one point to its antipode.
 *
 * Moving from u to -u (or vice versa) is orientation-reversing in ℝP²,
 * so this always returns PARITY_ODD.
 *
 * @param from - Starting point (unused in this simple implementation)
 * @param to - Ending point (unused in this simple implementation)
 * @returns PARITY_ODD (antipodal transitions flip orientation)
 */
export function antipodalTransitionParity(from: Vec3, to: Vec3): Parity {
  // In ℝP², moving from a point to its antipode always flips orientation
  return PARITY_ODD;
}

/**
 * Creates a path with zero parity (orientation-preserving).
 *
 * @param points - The points along the path
 * @returns A path with even parity
 */
export function createPath(points: Vec3[]): PathWithParity {
  return {
    points,
    parity: PARITY_EVEN
  };
}

/**
 * Appends a point to a path, updating the parity if needed.
 *
 * This is a simplified version that doesn't actually compute parity changes.
 * A full implementation would analyze the geometry of the path to determine
 * if an orientation flip occurred.
 *
 * @param path - The current path
 * @param newPoint - The point to append
 * @returns A new path with the point added
 */
export function appendToPath(path: PathWithParity, newPoint: Vec3): PathWithParity {
  return {
    points: [...path.points, newPoint],
    parity: path.parity // Keep same parity (simplified)
  };
}

/**
 * Closes a path by connecting the last point back to the first.
 *
 * Returns the accumulated parity, which tells you whether the loop is
 * orientation-preserving (even) or orientation-reversing (odd).
 *
 * @param path - A path to close
 * @returns The parity of the closed loop
 */
export function closeLoop(path: PathWithParity): Parity {
  if (path.points.length < 2) {
    return PARITY_EVEN; // Trivial loop
  }

  // In a full implementation, we'd analyze the path geometry here
  // For now, just return the accumulated parity
  return path.parity;
}

/**
 * Concatenates two paths, composing their parities.
 *
 * @param path1 - First path
 * @param path2 - Second path
 * @returns A new path that is the concatenation of the two
 */
export function concatenatePaths(
  path1: PathWithParity,
  path2: PathWithParity
): PathWithParity {
  return {
    points: [...path1.points, ...path2.points],
    parity: composeParity(path1.parity, path2.parity)
  };
}

/**
 * Reverses a path.
 *
 * Reversing a path doesn't change its parity in ℝP².
 *
 * @param path - The path to reverse
 * @returns A new path with points in reverse order
 */
export function reversePath(path: PathWithParity): PathWithParity {
  return {
    points: [...path.points].reverse(),
    parity: path.parity // Parity unchanged by reversal
  };
}

/**
 * Computes the "winding parity" of a loop around a point.
 *
 * This is a placeholder for future implementation. In full generality,
 * this would use homotopy theory to determine the topological winding number
 * modulo 2.
 *
 * @param loop - A closed path
 * @param point - A point on the sphere
 * @returns The winding parity (mod 2)
 */
export function windingParity(loop: PathWithParity, point: Vec3): Parity {
  // Placeholder: always return even
  // Full implementation would use algebraic topology
  return PARITY_EVEN;
}

/**
 * Parallel transports a vector along a path in ℝP².
 *
 * This is a placeholder for a more sophisticated feature. Parallel transport
 * in projective space can flip orientation when you complete certain loops.
 *
 * @param path - The path to transport along
 * @param initialVector - The starting tangent vector
 * @returns The transported vector and the accumulated parity
 */
export function parallelTransport(
  path: PathWithParity,
  initialVector: Vec3
): { vector: Vec3; parity: Parity } {
  // Placeholder: just return the initial vector
  // Full implementation would use differential geometry
  return {
    vector: initialVector,
    parity: path.parity
  };
}

/**
 * Tests if a path is "null-homotopic" (contractible to a point) in ℝP².
 *
 * A path is null-homotopic if its parity is even and it doesn't wrap around
 * the projective structure.
 *
 * @param path - A closed path
 * @returns true if the path is null-homotopic
 */
export function isNullHomotopic(path: PathWithParity): boolean {
  // Simple heuristic: even parity suggests contractibility
  // Full implementation would need more geometric analysis
  return path.parity === PARITY_EVEN;
}

/**
 * Applies a parity flip to a vector interpretation.
 *
 * In the context of signed quantities (like normals or orientations),
 * flipping parity means negating the vector.
 *
 * @param vector - A vector
 * @param parity - The parity to apply
 * @returns The vector, possibly negated
 */
export function applyParityToVector(vector: Vec3, parity: Parity): Vec3 {
  return parity === PARITY_ODD ? Vec3.neg(vector) : vector;
}

/**
 * Documentation: Parity and Non-Orientability
 *
 * The real projective plane ℝP² is a non-orientable surface. This has profound
 * implications for any operation that involves "direction" or "orientation."
 *
 * Intuitive Picture:
 * Imagine walking along a path on ℝP². When you return to your starting point,
 * you might find that "left" and "right" have swapped! This is the essence of
 * non-orientability.
 *
 * Mathematical Formalization:
 * - Orientability is captured by the first Stiefel-Whitney class w₁ ∈ H¹(ℝP²; ℤ₂)
 * - For ℝP², w₁ ≠ 0, so the space is non-orientable
 * - Parity tracks the accumulated effect of w₁ along a path
 *
 * Pedagogical Value:
 * Even though SEAM-VIZ V1 doesn't expose parity in the UI, the infrastructure
 * is here so that future extensions can demonstrate:
 * - Möbius strip embeddings (1D non-orientability)
 * - Klein bottle projections (2D non-orientability)
 * - Frame rotation paradoxes (orientation flip after loop)
 *
 * By building this module now, we ensure that V2 features can plug in cleanly
 * without requiring architectural changes.
 */
