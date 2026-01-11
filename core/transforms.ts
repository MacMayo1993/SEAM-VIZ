/**
 * Transforms Module
 *
 * This module centralizes all coordinate transformations, rotations, and
 * camera operations. It enforces a single convention for coordinate systems
 * and handedness throughout the application.
 *
 * Coordinate Convention:
 * - Right-handed coordinate system
 * - +X: Right
 * - +Y: Up
 * - +Z: Forward (toward viewer)
 * - Camera looks along -Z by default
 */

import { Vec3, Ray } from './types';

/**
 * A 3x3 rotation matrix represented as an array of 9 numbers in row-major order.
 */
export type Mat3 = [
  number, number, number,
  number, number, number,
  number, number, number
];

/**
 * A quaternion represented as [x, y, z, w]
 */
export type Quaternion = [number, number, number, number];

// ============================================================================
// Matrix Operations
// ============================================================================

/**
 * Identity matrix
 */
export const IDENTITY_MAT3: Mat3 = [
  1, 0, 0,
  0, 1, 0,
  0, 0, 1
];

/**
 * Multiplies a 3x3 matrix by a vector.
 *
 * @param m - A 3x3 matrix in row-major order
 * @param v - A 3D vector
 * @returns The transformed vector
 */
export function matVecMul(m: Mat3, v: Vec3): Vec3 {
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2]
  ];
}

/**
 * Multiplies two 3x3 matrices.
 *
 * @param a - First matrix
 * @param b - Second matrix
 * @returns The product matrix a * b
 */
export function matMul(a: Mat3, b: Mat3): Mat3 {
  return [
    a[0]*b[0] + a[1]*b[3] + a[2]*b[6],  a[0]*b[1] + a[1]*b[4] + a[2]*b[7],  a[0]*b[2] + a[1]*b[5] + a[2]*b[8],
    a[3]*b[0] + a[4]*b[3] + a[5]*b[6],  a[3]*b[1] + a[4]*b[4] + a[5]*b[7],  a[3]*b[2] + a[4]*b[5] + a[5]*b[8],
    a[6]*b[0] + a[7]*b[3] + a[8]*b[6],  a[6]*b[1] + a[7]*b[4] + a[8]*b[7],  a[6]*b[2] + a[7]*b[5] + a[8]*b[8]
  ];
}

/**
 * Transposes a 3x3 matrix.
 *
 * @param m - A 3x3 matrix
 * @returns The transposed matrix
 */
export function transpose(m: Mat3): Mat3 {
  return [
    m[0], m[3], m[6],
    m[1], m[4], m[7],
    m[2], m[5], m[8]
  ];
}

// ============================================================================
// Rotation Matrices
// ============================================================================

/**
 * Creates a rotation matrix around the X axis.
 *
 * @param angle - Rotation angle in radians
 * @returns A 3x3 rotation matrix
 */
export function rotationX(angle: number): Mat3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [
    1, 0, 0,
    0, c, -s,
    0, s, c
  ];
}

/**
 * Creates a rotation matrix around the Y axis.
 *
 * @param angle - Rotation angle in radians
 * @returns A 3x3 rotation matrix
 */
export function rotationY(angle: number): Mat3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [
    c, 0, s,
    0, 1, 0,
    -s, 0, c
  ];
}

/**
 * Creates a rotation matrix around the Z axis.
 *
 * @param angle - Rotation angle in radians
 * @returns A 3x3 rotation matrix
 */
export function rotationZ(angle: number): Mat3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [
    c, -s, 0,
    s, c, 0,
    0, 0, 1
  ];
}

/**
 * Creates a rotation matrix from axis and angle (Rodrigues' formula).
 *
 * @param axis - The axis of rotation (should be normalized)
 * @param angle - The rotation angle in radians
 * @returns A 3x3 rotation matrix
 */
export function rotationAxisAngle(axis: Vec3, angle: number): Mat3 {
  const [x, y, z] = Vec3.normalize(axis);
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const t = 1 - c;

  return [
    t*x*x + c,    t*x*y - s*z,  t*x*z + s*y,
    t*x*y + s*z,  t*y*y + c,    t*y*z - s*x,
    t*x*z - s*y,  t*y*z + s*x,  t*z*z + c
  ];
}

/**
 * Creates a rotation matrix that rotates vector 'from' to vector 'to'.
 *
 * @param from - Starting unit vector
 * @param to - Target unit vector
 * @returns A 3x3 rotation matrix
 */
export function rotationBetweenVectors(from: Vec3, to: Vec3): Mat3 {
  const f = Vec3.normalize(from);
  const t = Vec3.normalize(to);

  // Check if vectors are parallel or antiparallel
  const dot = Vec3.dot(f, t);
  if (Math.abs(dot - 1.0) < 1e-6) {
    // Already aligned
    return IDENTITY_MAT3;
  }
  if (Math.abs(dot + 1.0) < 1e-6) {
    // Antiparallel - rotate 180° around any perpendicular axis
    const perp = Math.abs(f[0]) < 0.9 ? [1, 0, 0] as Vec3 : [0, 1, 0] as Vec3;
    const axis = Vec3.normalize(Vec3.cross(f, perp));
    return rotationAxisAngle(axis, Math.PI);
  }

  // General case: use axis-angle
  const axis = Vec3.normalize(Vec3.cross(f, t));
  const angle = Math.acos(Vec3.clamp(dot, -1, 1));
  return rotationAxisAngle(axis, angle);
}

// ============================================================================
// Quaternion Operations
// ============================================================================

/**
 * Identity quaternion [0, 0, 0, 1]
 */
export const IDENTITY_QUAT: Quaternion = [0, 0, 0, 1];

/**
 * Creates a quaternion from axis and angle.
 *
 * @param axis - The rotation axis (should be normalized)
 * @param angle - The rotation angle in radians
 * @returns A quaternion
 */
export function quaternionFromAxisAngle(axis: Vec3, angle: number): Quaternion {
  const halfAngle = angle / 2;
  const s = Math.sin(halfAngle);
  const [x, y, z] = Vec3.normalize(axis);
  return [x * s, y * s, z * s, Math.cos(halfAngle)];
}

/**
 * Converts a quaternion to a rotation matrix.
 *
 * @param q - A quaternion [x, y, z, w]
 * @returns A 3x3 rotation matrix
 */
export function quaternionToMatrix(q: Quaternion): Mat3 {
  const [x, y, z, w] = q;
  const xx = x * x, yy = y * y, zz = z * z;
  const xy = x * y, xz = x * z, xw = x * w;
  const yz = y * z, yw = y * w, zw = z * w;

  return [
    1 - 2*(yy + zz),  2*(xy - zw),      2*(xz + yw),
    2*(xy + zw),      1 - 2*(xx + zz),  2*(yz - xw),
    2*(xz - yw),      2*(yz + xw),      1 - 2*(xx + yy)
  ];
}

/**
 * Rotates a vector by a quaternion.
 *
 * @param q - A quaternion
 * @param v - A vector
 * @returns The rotated vector
 */
export function quaternionRotate(q: Quaternion, v: Vec3): Vec3 {
  const mat = quaternionToMatrix(q);
  return matVecMul(mat, v);
}

// ============================================================================
// Camera Operations
// ============================================================================

/**
 * Camera orbit state
 */
export interface OrbitState {
  /**
   * Distance from the origin
   */
  distance: number;

  /**
   * Azimuthal angle (rotation around Y axis) in radians
   */
  azimuth: number;

  /**
   * Polar angle (angle from Y axis) in radians
   */
  polar: number;

  /**
   * Target point the camera looks at
   */
  target: Vec3;
}

/**
 * Creates a default orbit state.
 *
 * @returns A default orbit state
 */
export function createOrbitState(): OrbitState {
  return {
    distance: 4.0,
    azimuth: 0,
    polar: Math.PI / 3,
    target: [0, 0, 0]
  };
}

/**
 * Computes the camera position from an orbit state.
 *
 * @param orbit - The orbit state
 * @returns The camera position in world space
 */
export function orbitToPosition(orbit: OrbitState): Vec3 {
  const { distance, azimuth, polar, target } = orbit;

  // Spherical to Cartesian conversion
  const sinPolar = Math.sin(polar);
  const x = distance * sinPolar * Math.sin(azimuth);
  const y = distance * Math.cos(polar);
  const z = distance * sinPolar * Math.cos(azimuth);

  // Offset by target
  return Vec3.add([x, y, z], target);
}

/**
 * Computes the camera's forward direction (from orbit state).
 *
 * @param orbit - The orbit state
 * @returns The normalized forward direction
 */
export function orbitForward(orbit: OrbitState): Vec3 {
  const pos = orbitToPosition(orbit);
  return Vec3.normalize(Vec3.sub(orbit.target, pos));
}

/**
 * Updates an orbit state by applying a drag delta.
 *
 * @param orbit - The current orbit state
 * @param deltaX - Horizontal drag amount (in radians)
 * @param deltaY - Vertical drag amount (in radians)
 * @returns A new orbit state
 */
export function applyOrbitDrag(
  orbit: OrbitState,
  deltaX: number,
  deltaY: number
): OrbitState {
  return {
    ...orbit,
    azimuth: orbit.azimuth + deltaX,
    polar: Math.max(0.1, Math.min(Math.PI - 0.1, orbit.polar + deltaY))
  };
}

// ============================================================================
// Ray Casting
// ============================================================================

/**
 * Casts a ray from screen coordinates into world space.
 *
 * This is a simplified version that assumes we're looking at a sphere
 * centered at the origin.
 *
 * @param screenX - Screen X coordinate (normalized -1 to 1)
 * @param screenY - Screen Y coordinate (normalized -1 to 1)
 * @param orbit - The camera orbit state
 * @returns A ray in world space
 */
export function screenToRay(
  screenX: number,
  screenY: number,
  orbit: OrbitState
): Ray {
  const cameraPos = orbitToPosition(orbit);
  const forward = orbitForward(orbit);

  // Compute right and up vectors
  const worldUp: Vec3 = [0, 1, 0];
  const right = Vec3.normalize(Vec3.cross(forward, worldUp));
  const up = Vec3.cross(right, forward);

  // Compute ray direction based on screen coordinates
  // This is a simplified projection for a perspective camera
  const direction = Vec3.normalize(
    Vec3.add(
      Vec3.add(forward, Vec3.scale(right, screenX)),
      Vec3.scale(up, screenY)
    )
  );

  return {
    origin: cameraPos,
    direction
  };
}

/**
 * Computes the intersection of a ray with a unit sphere centered at the origin.
 *
 * @param ray - The ray to test
 * @returns The intersection point, or null if no intersection
 */
export function raySphereIntersection(ray: Ray): Vec3 | null {
  const { origin, direction } = ray;

  // Sphere: |p|² = 1
  // Ray: p = origin + t * direction
  // Substituting: |origin + t * direction|² = 1

  const a = Vec3.dot(direction, direction);
  const b = 2 * Vec3.dot(origin, direction);
  const c = Vec3.dot(origin, origin) - 1;

  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return null;

  // Take the smaller positive t (closest intersection)
  const sqrtDisc = Math.sqrt(discriminant);
  const t1 = (-b - sqrtDisc) / (2 * a);
  const t2 = (-b + sqrtDisc) / (2 * a);

  const t = t1 > 0 ? t1 : t2;
  if (t < 0) return null;

  const intersection = Vec3.add(origin, Vec3.scale(direction, t));
  return Vec3.normalize(intersection);
}
