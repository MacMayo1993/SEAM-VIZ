/**
 * Pullback Module
 *
 * This module implements the "operational quotient" semantics: any action
 * performed in quotient space is "pulled back" to act symmetrically on both
 * representatives in the source space.
 *
 * Key Concept: Structured Ambiguity
 * When you perform an operation on [u] in ℝP², it should affect both u and -u
 * in S² symmetrically. This is the mathematical essence of "working in quotient space."
 *
 * This module provides the interface for this pattern, even though V1 only
 * implements selection. Future features (paint, stamp, trace) will plug into
 * this same structure.
 */

import {
  Vec3,
  QuotientClass,
  QuotientAction,
  PullbackResult,
  SourceEffect
} from './types';
import { getBothRepresentatives } from './quotient';

/**
 * Applies a quotient action by pulling it back to both representatives.
 *
 * This is the core operation that ensures symmetry: any action on [u] in
 * quotient space becomes a pair of actions on {u, -u} in source space.
 *
 * @param action - The action to perform in quotient space
 * @returns A PullbackResult containing effects for both representatives
 */
export function pullbackAction(action: QuotientAction): PullbackResult {
  switch (action.type) {
    case 'Select':
      return pullbackSelect(action);

    case 'Paint':
      return pullbackPaint(action);

    case 'Stamp':
      return pullbackStamp(action);

    case 'Trace':
      return pullbackTrace(action);

    default:
      throw new Error(`Unknown action type: ${(action as any).type}`);
  }
}

/**
 * Pulls back a selection action.
 *
 * Selection in quotient space → two spotlights in source space
 *
 * @param action - A Select action
 * @returns Effects for both representatives
 */
function pullbackSelect(action: Extract<QuotientAction, { type: 'Select' }>): PullbackResult {
  const [u, negU] = getBothRepresentatives(action.class);

  const effectOnU: SourceEffect = {
    type: 'spotlight',
    position: u,
    parameters: {
      aperture: action.aperture,
      color: '#00e5bc', // Default color for u
      intensity: 1.0
    }
  };

  const effectOnNegU: SourceEffect = {
    type: 'spotlight',
    position: negU,
    parameters: {
      aperture: action.aperture,
      color: '#6366f1', // Default color for -u
      intensity: 1.0
    }
  };

  return {
    action,
    effectOnU,
    effectOnNegU
  };
}

/**
 * Pulls back a paint action (future feature).
 *
 * Painting at [u] in quotient space → paint at both u and -u in source space
 *
 * @param action - A Paint action
 * @returns Effects for both representatives
 */
function pullbackPaint(action: Extract<QuotientAction, { type: 'Paint' }>): PullbackResult {
  const [u, negU] = getBothRepresentatives(action.class);

  const effectOnU: SourceEffect = {
    type: 'paint',
    position: u,
    parameters: {
      radius: action.radius,
      color: action.color,
      blendMode: 'normal'
    }
  };

  const effectOnNegU: SourceEffect = {
    type: 'paint',
    position: negU,
    parameters: {
      radius: action.radius,
      color: action.color,
      blendMode: 'normal'
    }
  };

  return {
    action,
    effectOnU,
    effectOnNegU
  };
}

/**
 * Pulls back a stamp action (future feature).
 *
 * Stamping at [u] in quotient space → stamp at both u and -u in source space
 *
 * @param action - A Stamp action
 * @returns Effects for both representatives
 */
function pullbackStamp(action: Extract<QuotientAction, { type: 'Stamp' }>): PullbackResult {
  const [u, negU] = getBothRepresentatives(action.class);

  const effectOnU: SourceEffect = {
    type: 'stamp',
    position: u,
    parameters: {
      pattern: action.pattern,
      rotation: 0,
      scale: 1.0
    }
  };

  const effectOnNegU: SourceEffect = {
    type: 'stamp',
    position: negU,
    parameters: {
      pattern: action.pattern,
      rotation: Math.PI, // Rotate 180° for antipodal symmetry
      scale: 1.0
    }
  };

  return {
    action,
    effectOnU,
    effectOnNegU
  };
}

/**
 * Pulls back a trace action (future feature).
 *
 * Tracing a path in quotient space → trace the path and its antipodal reflection
 *
 * @param action - A Trace action
 * @returns Effects for both representatives
 */
function pullbackTrace(action: Extract<QuotientAction, { type: 'Trace' }>): PullbackResult {
  // For a trace, we need to lift the entire path
  const pathU = action.path;
  const pathNegU = action.path.map(p => Vec3.neg(p));

  const effectOnU: SourceEffect = {
    type: 'trace',
    position: pathU[0], // Start position
    parameters: {
      path: pathU,
      lineWidth: 2,
      color: '#00e5bc'
    }
  };

  const effectOnNegU: SourceEffect = {
    type: 'trace',
    position: pathNegU[0], // Start position
    parameters: {
      path: pathNegU,
      lineWidth: 2,
      color: '#6366f1'
    }
  };

  return {
    action,
    effectOnU,
    effectOnNegU
  };
}

/**
 * Validates that a pullback result maintains symmetry.
 *
 * This checks that the effects on u and -u are properly antipodal.
 *
 * @param result - A pullback result
 * @returns true if the result is symmetric
 */
export function validateSymmetry(result: PullbackResult): boolean {
  const { effectOnU, effectOnNegU } = result;

  // Check that types match
  if (effectOnU.type !== effectOnNegU.type) {
    console.error('Effect types do not match:', effectOnU.type, effectOnNegU.type);
    return false;
  }

  // Check that positions are antipodal
  const expectedNegU = Vec3.neg(effectOnU.position);
  if (!Vec3.approxEq(effectOnNegU.position, expectedNegU, 1e-6)) {
    console.error('Positions are not antipodal:', effectOnU.position, effectOnNegU.position);
    return false;
  }

  return true;
}

/**
 * Composes multiple pullback results into a single result.
 *
 * This is useful when multiple actions need to be applied simultaneously.
 *
 * @param results - An array of pullback results
 * @returns A combined result (currently just returns the last one; future enhancement)
 */
export function composePullbacks(results: PullbackResult[]): PullbackResult | null {
  if (results.length === 0) return null;

  // For now, just return the last result
  // Future: implement proper composition that merges effects
  return results[results.length - 1];
}

/**
 * Creates a pullback result from raw data.
 *
 * This is a low-level constructor for when you need to manually specify effects.
 *
 * @param action - The quotient action
 * @param effectOnU - The effect to apply at u
 * @param effectOnNegU - The effect to apply at -u
 * @returns A pullback result
 */
export function createPullbackResult(
  action: QuotientAction,
  effectOnU: SourceEffect,
  effectOnNegU: SourceEffect
): PullbackResult {
  return {
    action,
    effectOnU,
    effectOnNegU
  };
}

/**
 * Extracts the effects from a pullback result as an array.
 *
 * This is useful when you need to iterate over both effects uniformly.
 *
 * @param result - A pullback result
 * @returns An array [effectOnU, effectOnNegU]
 */
export function getEffects(result: PullbackResult): [SourceEffect, SourceEffect] {
  return [result.effectOnU, result.effectOnNegU];
}

/**
 * Applies a transformation to all effects in a pullback result.
 *
 * This is useful for modifying effects after they've been computed.
 *
 * @param result - A pullback result
 * @param transform - A function that transforms source effects
 * @returns A new pullback result with transformed effects
 */
export function transformEffects(
  result: PullbackResult,
  transform: (effect: SourceEffect) => SourceEffect
): PullbackResult {
  return {
    action: result.action,
    effectOnU: transform(result.effectOnU),
    effectOnNegU: transform(result.effectOnNegU)
  };
}

/**
 * Filters pullback results based on a predicate.
 *
 * @param results - An array of pullback results
 * @param predicate - A function that returns true for results to keep
 * @returns Filtered array of results
 */
export function filterPullbacks(
  results: PullbackResult[],
  predicate: (result: PullbackResult) => boolean
): PullbackResult[] {
  return results.filter(predicate);
}

/**
 * Documentation: The Pullback Pattern
 *
 * This module implements a key insight: operations in quotient space naturally
 * "lift" to symmetric operations in the covering space (S²).
 *
 * Mathematical Background:
 * - The quotient map π: S² → ℝP² sends u ↦ [u]
 * - An operation f on ℝP² "pulls back" to an operation f̃ on S²
 * - The pullback must satisfy: π(f̃(u)) = f(π(u))
 * - For antipodal quotient, this means: f̃(u) and f̃(-u) must project to the same thing
 *
 * Implementation Strategy:
 * - UI performs action on [u] (quotient space)
 * - Core computes effects on both {u, -u} (source space)
 * - UI renders both effects
 * - The pairing is NEVER broken
 *
 * This pattern makes it impossible to accidentally violate the quotient semantics,
 * because the symmetry is enforced at the type system and module boundary level.
 */
