/**
 * Spherical Navigation Utilities
 *
 * Provides functions for navigating on the surface of a unit sphere
 * using keyboard controls (WASD).
 */

import { Vec3 } from '../../core';

/**
 * Spherical coordinates representation
 */
export interface SphericalCoords {
  theta: number; // Azimuthal angle (rotation around Y-axis) [0, 2π]
  phi: number;   // Polar angle (angle from +Y axis) [0, π]
}

/**
 * Converts Cartesian coordinates (Vec3) to spherical coordinates
 */
export function cartesianToSpherical(v: Vec3): SphericalCoords {
  const normalized = Vec3.normalize(v);
  const [x, y, z] = normalized;

  // phi = angle from +Y axis
  const phi = Math.acos(Math.max(-1, Math.min(1, y)));

  // theta = angle in XZ plane from +Z axis
  let theta = Math.atan2(x, z);
  if (theta < 0) theta += 2 * Math.PI;

  return { theta, phi };
}

/**
 * Converts spherical coordinates to Cartesian coordinates (Vec3)
 */
export function sphericalToCartesian(coords: SphericalCoords): Vec3 {
  const { theta, phi } = coords;

  const sinPhi = Math.sin(phi);
  const x = sinPhi * Math.sin(theta);
  const y = Math.cos(phi);
  const z = sinPhi * Math.cos(theta);

  return [x, y, z];
}

/**
 * Moves a point on the sphere in a given direction
 *
 * @param current - Current position on sphere
 * @param deltaTheta - Change in azimuthal angle (radians)
 * @param deltaPhi - Change in polar angle (radians)
 * @returns New position on sphere
 */
export function moveOnSphere(
  current: Vec3,
  deltaTheta: number,
  deltaPhi: number
): Vec3 {
  // Convert to spherical
  const coords = cartesianToSpherical(current);

  // Apply deltas
  let newTheta = coords.theta + deltaTheta;
  let newPhi = coords.phi + deltaPhi;

  // Wrap theta to [0, 2π]
  newTheta = ((newTheta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

  // Clamp phi to [0.01, π - 0.01] to avoid poles
  newPhi = Math.max(0.01, Math.min(Math.PI - 0.01, newPhi));

  // Convert back to Cartesian
  return sphericalToCartesian({ theta: newTheta, phi: newPhi });
}

/**
 * WASD key state
 */
export interface WASDState {
  w: boolean; // Up (toward north pole)
  a: boolean; // Left (counter-clockwise)
  s: boolean; // Down (toward south pole)
  d: boolean; // Right (clockwise)
}

/**
 * Computes the velocity vector based on WASD key state
 *
 * @param keys - Current WASD key state
 * @param speed - Movement speed (radians per second)
 * @returns Velocity as [deltaTheta, deltaPhi]
 */
export function computeVelocity(
  keys: WASDState,
  speed: number = 2.0
): [number, number] {
  let deltaTheta = 0;
  let deltaPhi = 0;

  // Horizontal movement (theta)
  if (keys.a) deltaTheta -= speed;
  if (keys.d) deltaTheta += speed;

  // Vertical movement (phi)
  if (keys.w) deltaPhi -= speed;
  if (keys.s) deltaPhi += speed;

  return [deltaTheta, deltaPhi];
}

/**
 * Updates position based on WASD input and elapsed time
 *
 * @param current - Current position
 * @param keys - WASD key state
 * @param delta - Time elapsed since last frame (seconds)
 * @param speed - Movement speed (radians per second)
 * @returns New position
 */
export function updatePositionFromWASD(
  current: Vec3,
  keys: WASDState,
  delta: number,
  speed: number = 2.0
): Vec3 {
  const [deltaTheta, deltaPhi] = computeVelocity(keys, speed);

  // Scale by delta time
  const scaledDeltaTheta = deltaTheta * delta;
  const scaledDeltaPhi = deltaPhi * delta;

  // If no movement, return current position
  if (Math.abs(scaledDeltaTheta) < 0.0001 && Math.abs(scaledDeltaPhi) < 0.0001) {
    return current;
  }

  return moveOnSphere(current, scaledDeltaTheta, scaledDeltaPhi);
}
