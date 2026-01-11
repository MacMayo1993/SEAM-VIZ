/**
 * Core domain types for SEAM-VIZ
 *
 * This module defines the fundamental mathematical objects used throughout the system.
 * These types are platform-agnostic and represent pure mathematical concepts.
 */

// ============================================================================
// Vector Types
// ============================================================================

/**
 * A 3D vector represented as a tuple of three numbers.
 * Used for positions, directions, and normals in 3D space.
 */
export type Vec3 = [number, number, number];

/**
 * Vector operations namespace
 */
export const Vec3 = {
  /**
   * Add two vectors
   */
  add: (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],

  /**
   * Subtract two vectors
   */
  sub: (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],

  /**
   * Scale a vector by a scalar
   */
  scale: (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s],

  /**
   * Compute the dot product of two vectors
   */
  dot: (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],

  /**
   * Compute the squared norm (length²) of a vector
   */
  norm2: (a: Vec3): number => Vec3.dot(a, a),

  /**
   * Compute the norm (length) of a vector
   */
  norm: (a: Vec3): number => Math.sqrt(Vec3.norm2(a)),

  /**
   * Normalize a vector to unit length
   * @param eps - Epsilon threshold for zero detection
   */
  normalize: (a: Vec3, eps = 1e-12): Vec3 => {
    const n = Vec3.norm(a);
    if (n < eps) return [0, 0, 1]; // Fallback to safe unit vector
    return Vec3.scale(a, 1 / n);
  },

  /**
   * Negate a vector (multiply by -1)
   */
  neg: (a: Vec3): Vec3 => [-a[0], -a[1], -a[2]],

  /**
   * Clamp a value between min and max
   */
  clamp: (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x)),

  /**
   * Compute the angle between two unit vectors (in radians)
   */
  angle: (a: Vec3, b: Vec3): number => {
    const d = Vec3.clamp(Vec3.dot(a, b), -1, 1);
    return Math.acos(d);
  },

  /**
   * Cross product of two vectors
   */
  cross: (a: Vec3, b: Vec3): Vec3 => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ],

  /**
   * Check if two vectors are approximately equal
   */
  approxEq: (a: Vec3, b: Vec3, eps = 1e-6): boolean => {
    return Math.abs(a[0] - b[0]) < eps &&
           Math.abs(a[1] - b[1]) < eps &&
           Math.abs(a[2] - b[2]) < eps;
  }
};

// ============================================================================
// Geometric Types
// ============================================================================

/**
 * A ray in 3D space defined by an origin and a direction
 */
export interface Ray {
  origin: Vec3;
  direction: Vec3; // Should be normalized
}

/**
 * A cone in 3D space defined by an axis direction and a half-angle
 */
export interface Cone {
  axis: Vec3;      // Should be normalized
  halfAngle: number; // In radians
}

/**
 * A mesh represented by vertices and indices
 */
export interface Mesh {
  vertices: Vec3[];
  normals?: Vec3[];
  indices: number[];
}

// ============================================================================
// Quotient Space Types
// ============================================================================

/**
 * A quotient class [u] representing the equivalence class {u, -u} under
 * the antipodal identification u ≡ -u.
 *
 * This is the fundamental object in projective space ℝP².
 */
export interface QuotientClass {
  /**
   * The canonical representative of this class.
   * By convention, we choose the representative with positive first non-zero coordinate.
   */
  canonical: Vec3;

  /**
   * Both representatives {u, -u} of this class.
   */
  representatives: [Vec3, Vec3];
}

/**
 * A selection in quotient space, representing a cone around a quotient class
 */
export interface QuotientSelection {
  /**
   * The selected quotient class [u]
   */
  class: QuotientClass;

  /**
   * The aperture (half-angle) of the selection cone in radians
   */
  aperture: number;
}

// ============================================================================
// Interaction Types
// ============================================================================

/**
 * User interaction intents that the UI sends to the core engine.
 * The core interprets these and returns render directives.
 */
export type SelectionIntent =
  | { type: 'ClickQuotient'; point: Vec3 }
  | { type: 'ClickSource'; point: Vec3 }
  | { type: 'DragOrbit'; delta: [number, number] }
  | { type: 'SetAperture'; value: number }
  | { type: 'Reset' };

/**
 * Render directives that the core returns to the UI.
 * These tell the UI what to draw.
 */
export interface RenderDirective {
  /**
   * Spotlights to render on the source object
   */
  spotlights: Array<{
    direction: Vec3;
    color: string;
    aperture: number;
  }>;

  /**
   * Markers to render on the quotient sphere
   */
  quotientMarkers: Array<{
    class: QuotientClass;
    aperture: number;
    colors: [string, string]; // [color for u, color for -u]
  }>;

  /**
   * Optional highlight overlays
   */
  highlights?: Array<{
    position: Vec3;
    radius: number;
    color: string;
  }>;
}

// ============================================================================
// Parity Types
// ============================================================================

/**
 * Parity (orientation) in ℤ₂
 *
 * Tracks whether an orientation-reversing transformation has been applied.
 * Used for future features like loop tracking and frame transport.
 */
export type Parity = 0 | 1;

/**
 * A path with associated parity information
 */
export interface PathWithParity {
  /**
   * The points along the path
   */
  points: Vec3[];

  /**
   * The accumulated parity along the path
   */
  parity: Parity;
}

// ============================================================================
// Action Types (for future extensibility)
// ============================================================================

/**
 * Actions that can be performed in quotient space.
 * These represent operations that should be "pulled back" to act on both representatives.
 */
export type QuotientAction =
  | { type: 'Select'; class: QuotientClass; aperture: number }
  | { type: 'Paint'; class: QuotientClass; radius: number; color: string }
  | { type: 'Stamp'; class: QuotientClass; pattern: string }
  | { type: 'Trace'; path: Vec3[] };

/**
 * The result of pulling back a quotient action to the source space.
 * Contains effects that should be applied to both representatives.
 */
export interface PullbackResult {
  /**
   * The action that was performed
   */
  action: QuotientAction;

  /**
   * Effects to apply to the first representative u
   */
  effectOnU: SourceEffect;

  /**
   * Effects to apply to the second representative -u
   */
  effectOnNegU: SourceEffect;
}

/**
 * An effect to be applied in the source space
 */
export interface SourceEffect {
  type: 'spotlight' | 'paint' | 'stamp' | 'trace';
  position: Vec3;
  parameters: Record<string, unknown>;
}
