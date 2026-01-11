/**
 * SEAM-VIZ Core Engine
 *
 * This is the public API for the SEAM-VIZ core mathematics and topology engine.
 * The core is platform-agnostic and contains no UI-specific code.
 *
 * Architecture Principle: Separation of Concerns
 * - Core: Pure mathematics and topology (this module)
 * - App: UI rendering and user interaction (app/ directory)
 *
 * The core operates on abstract types (Vec3, QuotientClass, etc.) and provides
 * operations that respect the mathematical structure of the quotient space ℝP².
 */

// ============================================================================
// Type Exports
// ============================================================================

// Export Vec3 as both type and namespace
export { Vec3 } from './types';

export type {
  Ray,
  Cone,
  Mesh,
  QuotientClass,
  QuotientSelection,
  SelectionIntent,
  RenderDirective,
  Parity,
  PathWithParity,
  QuotientAction,
  PullbackResult,
  SourceEffect
} from './types';

// ============================================================================
// Quotient Space Operations
// ============================================================================

export {
  normalize,
  antipode,
  classOf,
  classEquals,
  quotientDistance,
  pointInQuotientCone,
  quotientConeWeight,
  getBothRepresentatives,
  directionToClass,
  assertCommutativity
} from './quotient';

// ============================================================================
// Calibration
// ============================================================================

export type {
  ViewportDimensions,
  CalibrationState
} from './calibration';

export {
  createCalibration,
  sliderToAperture,
  apertureToSlider,
  formatAngle,
  degreesToRadians,
  radiansToDegrees,
  apertureFomCoverage,
  coneSolidAngle,
  getDefaultConfig,
  recalibrate,
  lerpAperture,
  markerSizeForAperture
} from './calibration';

// ============================================================================
// Transforms
// ============================================================================

export type {
  Mat3,
  Quaternion
} from './transforms';

export type {
  OrbitState
} from './transforms';

export {
  IDENTITY_MAT3,
  matVecMul,
  matMul,
  transpose,
  rotationX,
  rotationY,
  rotationZ,
  rotationAxisAngle,
  rotationBetweenVectors,
  IDENTITY_QUAT,
  quaternionFromAxisAngle,
  quaternionToMatrix,
  quaternionRotate,
  createOrbitState,
  orbitToPosition,
  orbitForward,
  applyOrbitDrag,
  screenToRay,
  raySphereIntersection
} from './transforms';

// ============================================================================
// Selection
// ============================================================================

export type {
  SelectionState
} from './selection';

export {
  createDefaultSelection,
  processIntent,
  generateRenderDirectives,
  processAndRender,
  setColors,
  getCurrentSelection,
  isPointHighlighted,
  selectionWeight,
  closerRepresentative,
  validatePairing,
  selectClass
} from './selection';

// ============================================================================
// Pullback
// ============================================================================

export {
  pullbackAction,
  validateSymmetry,
  composePullbacks,
  createPullbackResult,
  getEffects,
  transformEffects,
  filterPullbacks
} from './pullback';

// ============================================================================
// Parity
// ============================================================================

export {
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
  applyParityToVector
} from './parity';

// ============================================================================
// Mesh and Shapes
// ============================================================================

export { vertexDirections } from './mesh';

export type { ShapeId } from './shapes';
export { makeShapeMesh } from './shapes';

// ============================================================================
// Version Information
// ============================================================================

/**
 * Core engine version
 */
export const VERSION = '2.0.0-alpha';

/**
 * Core engine metadata
 */
export const CORE_INFO = {
  name: 'SEAM-VIZ Core',
  version: VERSION,
  description: 'Mathematics and topology engine for projective space visualization',
  architecture: 'Clean-room implementation with quotient space semantics'
};
