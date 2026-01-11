/**
 * Calibration Module
 *
 * This module provides a single source of truth for size calibration, ensuring
 * that the mathematical instrument has a consistent "feel" across different
 * viewport sizes and devices.
 *
 * Inspired by the "characteristic size" pattern: define one fundamental scale
 * from which all other dimensions are derived.
 */

/**
 * Viewport dimensions
 */
export interface ViewportDimensions {
  width: number;
  height: number;
  pixelRatio?: number;
}

/**
 * Calibration state that defines the scaling relationship between
 * UI pixels and mathematical units.
 */
export interface CalibrationState {
  /**
   * The characteristic size in pixels (typically min(width, height))
   */
  characteristicSizePx: number;

  /**
   * The span of intrinsic units visible in the view
   * For a sphere of radius 1.0, this might be 2.0 (diameter)
   */
  intrinsicUnitSpan: number;

  /**
   * Derived: pixels per intrinsic unit
   */
  pixelsPerIU: number;

  /**
   * Viewport dimensions
   */
  viewport: ViewportDimensions;
}

/**
 * Default configuration for calibration
 */
const DEFAULT_CONFIG = {
  /**
   * The fraction of the characteristic size to use for the unit span
   * (e.g., 0.4 means the sphere diameter occupies 40% of the smaller viewport dimension)
   */
  spanFraction: 0.4,

  /**
   * Minimum aperture angle in radians
   */
  minAperture: 0.05,

  /**
   * Maximum aperture angle in radians
   */
  maxAperture: Math.PI / 2,

  /**
   * Default aperture angle in radians
   */
  defaultAperture: 0.4,
};

/**
 * Creates a calibration state from viewport dimensions.
 *
 * This is the single place where UI dimensions affect mathematical scaling.
 *
 * @param viewport - The viewport dimensions
 * @returns A calibration state
 */
export function createCalibration(viewport: ViewportDimensions): CalibrationState {
  const { width, height, pixelRatio = 1 } = viewport;

  // Characteristic size: use the minimum dimension
  // This ensures the sphere fits comfortably in the viewport
  const characteristicSizePx = Math.min(width, height) * pixelRatio;

  // For a unit sphere (radius = 1.0), the visible span is the diameter
  const intrinsicUnitSpan = 2.0;

  // Compute the scaling factor
  const k = DEFAULT_CONFIG.spanFraction;
  const pixelsPerIU = characteristicSizePx / (k * intrinsicUnitSpan);

  return {
    characteristicSizePx,
    intrinsicUnitSpan,
    pixelsPerIU,
    viewport
  };
}

/**
 * Converts a slider value (0 to 1) into an aperture angle in radians.
 *
 * This provides a consistent mapping from UI controls to mathematical units.
 *
 * @param sliderValue - A value from 0 to 1
 * @param calibration - The current calibration state (optional, for future use)
 * @returns An aperture angle in radians
 */
export function sliderToAperture(
  sliderValue: number,
  calibration?: CalibrationState
): number {
  // Clamp to [0, 1]
  const t = Math.max(0, Math.min(1, sliderValue));

  // Map linearly from [minAperture, maxAperture]
  const { minAperture, maxAperture } = DEFAULT_CONFIG;
  return minAperture + t * (maxAperture - minAperture);
}

/**
 * Converts an aperture angle to a slider value (0 to 1).
 *
 * @param aperture - An aperture angle in radians
 * @param calibration - The current calibration state (optional, for future use)
 * @returns A slider value from 0 to 1
 */
export function apertureToSlider(
  aperture: number,
  calibration?: CalibrationState
): number {
  const { minAperture, maxAperture } = DEFAULT_CONFIG;

  // Clamp aperture to valid range
  const clamped = Math.max(minAperture, Math.min(maxAperture, aperture));

  // Map to [0, 1]
  return (clamped - minAperture) / (maxAperture - minAperture);
}

/**
 * Converts an angle in radians to a human-readable string.
 *
 * @param angleRad - An angle in radians
 * @returns A formatted string (e.g., "23.0°")
 */
export function formatAngle(angleRad: number): string {
  const degrees = (angleRad * 180) / Math.PI;
  return `${degrees.toFixed(1)}°`;
}

/**
 * Converts degrees to radians.
 *
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Converts radians to degrees.
 *
 * @param radians - Angle in radians
 * @returns Angle in degrees
 */
export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Computes a "comfortable" aperture for a given cone coverage fraction.
 *
 * This is useful for suggesting initial aperture values that look good visually.
 *
 * @param coverageFraction - Desired fraction of hemisphere to cover (0 to 1)
 * @returns An aperture angle in radians
 */
export function apertureFomCoverage(coverageFraction: number): number {
  // The solid angle of a cone with half-angle θ is:
  //   Ω = 2π(1 - cos(θ))
  // The solid angle of a hemisphere is 2π.
  // So coverage = (1 - cos(θ)) / 1 = 1 - cos(θ)
  // Therefore: θ = arccos(1 - coverage)

  const clamped = Math.max(0, Math.min(1, coverageFraction));
  return Math.acos(1 - clamped);
}

/**
 * Computes the solid angle (in steradians) of a cone with given aperture.
 *
 * @param aperture - The half-angle of the cone in radians
 * @returns The solid angle in steradians
 */
export function coneSolidAngle(aperture: number): number {
  return 2 * Math.PI * (1 - Math.cos(aperture));
}

/**
 * Returns the default configuration values.
 */
export function getDefaultConfig() {
  return { ...DEFAULT_CONFIG };
}

/**
 * Updates the calibration when the viewport changes.
 *
 * @param calibration - The current calibration state
 * @param newViewport - The new viewport dimensions
 * @returns A new calibration state
 */
export function recalibrate(
  calibration: CalibrationState,
  newViewport: ViewportDimensions
): CalibrationState {
  return createCalibration(newViewport);
}

/**
 * Smoothly interpolates between two aperture values.
 *
 * This can be used for animated transitions.
 *
 * @param from - Starting aperture in radians
 * @param to - Ending aperture in radians
 * @param t - Interpolation parameter (0 to 1)
 * @returns Interpolated aperture in radians
 */
export function lerpAperture(from: number, to: number, t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return from + (to - from) * clamped;
}

/**
 * Computes an appropriate marker size (in intrinsic units) for a given aperture.
 *
 * This ensures that markers are visible but not overwhelming.
 *
 * @param aperture - The aperture angle in radians
 * @returns A marker radius in intrinsic units
 */
export function markerSizeForAperture(aperture: number): number {
  // Markers should be proportional to aperture but not too small or large
  const minSize = 0.02;
  const maxSize = 0.1;

  // Use a fraction of the aperture's geometric size
  const fraction = 0.15;
  const size = fraction * Math.sin(aperture);

  return Math.max(minSize, Math.min(maxSize, size));
}
