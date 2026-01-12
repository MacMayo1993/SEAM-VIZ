/**
 * Color Utilities for Antipodal Color Pairing
 *
 * This module implements the concept of "antipodal colors" on the RGB color sphere.
 * Just as u and -u are antipodal points on the geometric sphere, colors have
 * antipodal pairs in RGB space.
 */

import { Vec3 } from '../../core';

/**
 * Converts a hex color string to an RGB vector [0-1, 0-1, 0-1]
 */
export function hexToRgbVec(hex: string): Vec3 {
  // Remove # if present
  const clean = hex.replace('#', '');

  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  return [r, g, b];
}

/**
 * Converts an RGB vector [0-1, 0-1, 0-1] to a hex color string
 */
export function rgbVecToHex(rgb: Vec3): string {
  const r = Math.round(rgb[0] * 255);
  const g = Math.round(rgb[1] * 255);
  const b = Math.round(rgb[2] * 255);

  return '#' + [r, g, b]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Computes the antipodal color of a given color on the RGB sphere.
 *
 * The RGB color space can be viewed as a cube [0,1]³. We map this to a sphere
 * by treating each color as a vector from the center [0.5, 0.5, 0.5].
 * The antipodal point is the reflection through the center.
 *
 * @param hex - A hex color string (e.g., "#ff0000")
 * @returns The antipodal hex color
 */
export function getAntipodalColor(hex: string): string {
  const rgb = hexToRgbVec(hex);

  // Reflect through the center of the RGB cube [0.5, 0.5, 0.5]
  // antipode = 2 * center - color = [1, 1, 1] - color
  const antipode: Vec3 = [
    1 - rgb[0],
    1 - rgb[1],
    1 - rgb[2]
  ];

  return rgbVecToHex(antipode);
}

/**
 * Interpolates between two colors in RGB space
 *
 * @param color1 - Start color (hex)
 * @param color2 - End color (hex)
 * @param t - Interpolation parameter [0, 1]
 * @returns Interpolated color (hex)
 */
export function lerpColor(color1: string, color2: string, t: number): string {
  const rgb1 = hexToRgbVec(color1);
  const rgb2 = hexToRgbVec(color2);

  const interpolated: Vec3 = [
    rgb1[0] + (rgb2[0] - rgb1[0]) * t,
    rgb1[1] + (rgb2[1] - rgb1[1]) * t,
    rgb1[2] + (rgb2[2] - rgb1[2]) * t
  ];

  return rgbVecToHex(interpolated);
}

/**
 * Computes the perceptual brightness of a color (0 to 1)
 * Uses the standard luminance formula
 */
export function getBrightness(hex: string): number {
  const rgb = hexToRgbVec(hex);
  // Standard luminance weights
  return 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];
}

/**
 * Returns black or white depending on which contrasts better with the given color
 */
export function getContrastColor(hex: string): string {
  const brightness = getBrightness(hex);
  return brightness > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Validates that a string is a valid hex color
 */
export function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}
