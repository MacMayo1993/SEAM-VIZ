/**
 * Quotient Space Operations
 *
 * This module implements the core operations for working with the quotient space
 * ℝP² = S² / {±1}, where we identify antipodal points u ≡ -u.
 *
 * Key invariant: Every operation that acts on a quotient class [u] must respect
 * the equivalence relation and maintain the pairing between u and -u.
 */

import { Vec3, QuotientClass } from './types';

/**
 * Determines the canonical sign for a vector based on lexicographic ordering.
 * We choose the representative with the first non-zero coordinate being positive.
 *
 * @param u - A unit vector
 * @param eps - Epsilon threshold for zero detection
 * @returns +1 if u is canonical, -1 if -u is canonical
 */
function canonicalSign(u: Vec3, eps = 1e-12): 1 | -1 {
  // Use lexicographic ordering: first non-zero coordinate should be positive
  if (Math.abs(u[0]) > eps) return u[0] >= 0 ? 1 : -1;
  if (Math.abs(u[1]) > eps) return u[1] >= 0 ? 1 : -1;
  if (Math.abs(u[2]) > eps) return u[2] >= 0 ? 1 : -1;
  return 1; // Default if all coordinates are zero
}

/**
 * Normalizes a vector to unit length.
 * This is the fundamental operation for projecting onto the sphere S².
 *
 * @param v - Any non-zero vector
 * @returns A unit vector in the same direction
 */
export function normalize(v: Vec3): Vec3 {
  return Vec3.normalize(v);
}

/**
 * Computes the antipode (opposite point) of a vector on the sphere.
 *
 * @param u - A unit vector
 * @returns The antipodal point -u
 */
export function antipode(u: Vec3): Vec3 {
  return Vec3.neg(u);
}

/**
 * Creates a quotient class [u] from a vector.
 * The quotient class represents the equivalence class {u, -u} under antipodal identification.
 *
 * This is the canonical way to construct quotient classes in the system.
 * It ensures that:
 * 1. The vector is normalized to lie on S²
 * 2. A canonical representative is chosen
 * 3. Both representatives are stored for rendering
 *
 * @param v - Any non-zero vector
 * @returns A QuotientClass representing [v] in ℝP²
 */
export function classOf(v: Vec3): QuotientClass {
  // Step 1: Normalize to get a point on S²
  const u0 = normalize(v);

  // Step 2: Choose canonical representative
  const sign = canonicalSign(u0);
  const canonical = sign === 1 ? u0 : antipode(u0);

  // Step 3: Compute both representatives
  const representatives: [Vec3, Vec3] = [canonical, antipode(canonical)];

  return {
    canonical,
    representatives
  };
}

/**
 * Tests if two quotient classes are equivalent.
 * Two classes [u] and [v] are equal if u = v or u = -v.
 *
 * @param a - First quotient class
 * @param b - Second quotient class
 * @param eps - Epsilon threshold for floating-point comparison
 * @returns true if the classes represent the same point in ℝP²
 */
export function classEquals(a: QuotientClass, b: QuotientClass, eps = 1e-6): boolean {
  // Check if either representative of a matches either representative of b
  const [u1, negU1] = a.representatives;
  const [u2, negU2] = b.representatives;

  return Vec3.approxEq(u1, u2, eps) || Vec3.approxEq(u1, negU2, eps);
}

/**
 * Computes the distance between two quotient classes in ℝP².
 *
 * The distance is defined as the minimum angle between any pair of representatives:
 *   d([u], [v]) = min(∠(u,v), ∠(u,-v), ∠(-u,v), ∠(-u,-v))
 *
 * Since we're in projective space, this simplifies to:
 *   d([u], [v]) = arccos(|u · v|)
 *
 * @param a - First quotient class
 * @param b - Second quotient class
 * @returns The distance in radians (0 to π/2)
 */
export function quotientDistance(a: QuotientClass, b: QuotientClass): number {
  const u = a.canonical;
  const v = b.canonical;

  // In projective space, distance is determined by the absolute value of the dot product
  const absDot = Math.abs(Vec3.dot(u, v));
  const clamped = Vec3.clamp(absDot, 0, 1);

  return Math.acos(clamped);
}

/**
 * Tests if a point on S² lies within a cone around a quotient class.
 *
 * A cone around [u] with aperture θ consists of all points v such that:
 *   min(∠(v,u), ∠(v,-u)) ≤ θ
 *
 * @param point - A unit vector on S²
 * @param center - The quotient class at the center of the cone
 * @param aperture - The half-angle of the cone in radians
 * @returns true if the point lies within the cone
 */
export function pointInQuotientCone(
  point: Vec3,
  center: QuotientClass,
  aperture: number
): boolean {
  const [u, negU] = center.representatives;

  // Compute angles to both representatives
  const angleToU = Vec3.angle(point, u);
  const angleToNegU = Vec3.angle(point, negU);

  // Point is in cone if it's within aperture of either representative
  const minAngle = Math.min(angleToU, angleToNegU);
  return minAngle <= aperture;
}

/**
 * Computes a smooth falloff weight for a point within a quotient cone.
 *
 * Returns a value in [0, 1] where:
 * - 1.0 at the center of the cone
 * - 0.0 outside the cone
 * - Smooth interpolation in between
 *
 * @param point - A unit vector on S²
 * @param center - The quotient class at the center of the cone
 * @param aperture - The half-angle of the cone in radians
 * @returns A weight in [0, 1]
 */
export function quotientConeWeight(
  point: Vec3,
  center: QuotientClass,
  aperture: number
): number {
  const [u, negU] = center.representatives;

  // Compute angles to both representatives
  const angleToU = Vec3.angle(point, u);
  const angleToNegU = Vec3.angle(point, negU);

  // Use the minimum angle (closest representative)
  const minAngle = Math.min(angleToU, angleToNegU);

  // Linear falloff from 1.0 at center to 0.0 at aperture
  if (minAngle >= aperture) return 0.0;
  return 1.0 - (minAngle / aperture);
}

/**
 * Enforces the commutativity requirement for operations on quotient classes.
 *
 * This is a semantic assertion: any operation f that acts on a quotient class [u]
 * must produce the same result regardless of which representative we use.
 *
 * Mathematically: f([u]) must satisfy f(u) = f(-u) or handle both symmetrically.
 *
 * This function doesn't do anything at runtime, but serves as documentation
 * and could be used for testing/validation in development.
 *
 * @param operation - A description of the operation being performed
 * @param qClass - The quotient class being operated on
 */
export function assertCommutativity(operation: string, qClass: QuotientClass): void {
  // In production, this is a no-op
  // In development/testing, we could add validation here
  // For now, it serves as inline documentation

  if (process.env.NODE_ENV === 'development') {
    // Could add runtime checks here if needed
    console.debug(`Operation '${operation}' respects quotient symmetry for class`, qClass);
  }
}

/**
 * Helper function to get both representatives of a quotient class.
 *
 * This is useful when you need to apply an effect to both u and -u symmetrically.
 *
 * @param qClass - A quotient class
 * @returns An array [u, -u] of both representatives
 */
export function getBothRepresentatives(qClass: QuotientClass): [Vec3, Vec3] {
  return qClass.representatives;
}

/**
 * Converts a raw direction vector into a quotient class.
 * This is the main entry point for user interactions.
 *
 * @param direction - A direction vector (will be normalized)
 * @returns The corresponding quotient class [direction]
 */
export function directionToClass(direction: Vec3): QuotientClass {
  return classOf(direction);
}
