/**
 * Selection Module
 *
 * This module handles the interpretation of user interactions and generates
 * render directives for the UI. It enforces the clean separation between
 * user intent and visual representation.
 *
 * Key Pattern: UI sends "intents" → Core returns "render directives"
 *
 * This ensures that the UI never directly computes mathematical meaning;
 * it only renders what the core tells it to render.
 */

import {
  Vec3,
  QuotientClass,
  SelectionIntent,
  RenderDirective,
  QuotientSelection
} from './types';
import { classOf, getBothRepresentatives } from './quotient';

/**
 * The application state that the selection system manages.
 */
export interface SelectionState {
  /**
   * The currently selected quotient class [u]
   */
  selectedClass: QuotientClass;

  /**
   * The aperture (half-angle) of the selection cone
   */
  aperture: number;

  /**
   * Colors for the two representatives [u, -u]
   */
  colors: {
    u: string;
    negU: string;
  };
}

/**
 * Default selection state
 */
export function createDefaultSelection(): SelectionState {
  return {
    selectedClass: classOf([0, 1, 0]), // Default to +Y direction
    aperture: 0.4,
    colors: {
      u: '#00e5bc',
      negU: '#6366f1'
    }
  };
}

/**
 * Processes a user interaction intent and returns an updated state.
 *
 * This is the main entry point for handling user interactions.
 *
 * @param state - The current selection state
 * @param intent - The user's interaction intent
 * @returns A new selection state
 */
export function processIntent(
  state: SelectionState,
  intent: SelectionIntent
): SelectionState {
  switch (intent.type) {
    case 'ClickQuotient':
      // User clicked on the quotient sphere → select that quotient class
      return {
        ...state,
        selectedClass: classOf(intent.point)
      };

    case 'ClickSource':
      // User clicked on the source object → select the quotient class of that direction
      return {
        ...state,
        selectedClass: classOf(intent.point)
      };

    case 'SetAperture':
      // User adjusted the aperture slider
      return {
        ...state,
        aperture: intent.value
      };

    case 'Reset':
      // User requested a reset
      return createDefaultSelection();

    case 'DragOrbit':
      // Orbit drags don't affect selection state
      return state;

    default:
      // Unknown intent type (should never happen with proper typing)
      console.warn('Unknown selection intent:', intent);
      return state;
  }
}

/**
 * Generates render directives from the current selection state.
 *
 * This is what the UI uses to decide what to draw.
 *
 * @param state - The current selection state
 * @returns Render directives for the UI
 */
export function generateRenderDirectives(state: SelectionState): RenderDirective {
  const { selectedClass, aperture, colors } = state;
  const [u, negU] = getBothRepresentatives(selectedClass);

  return {
    // Spotlights on the source object (left panel)
    spotlights: [
      {
        direction: u,
        color: colors.u,
        aperture
      },
      {
        direction: negU,
        color: colors.negU,
        aperture
      }
    ],

    // Markers on the quotient sphere (right panel)
    quotientMarkers: [
      {
        class: selectedClass,
        aperture,
        colors: [colors.u, colors.negU]
      }
    ]
  };
}

/**
 * Convenience function that processes an intent and immediately generates directives.
 *
 * @param state - The current selection state
 * @param intent - The user's interaction intent
 * @returns A tuple of [newState, renderDirectives]
 */
export function processAndRender(
  state: SelectionState,
  intent: SelectionIntent
): [SelectionState, RenderDirective] {
  const newState = processIntent(state, intent);
  const directives = generateRenderDirectives(newState);
  return [newState, directives];
}

/**
 * Updates the colors for the representatives.
 *
 * @param state - The current selection state
 * @param uColor - Color for the u representative
 * @param negUColor - Color for the -u representative
 * @returns A new selection state
 */
export function setColors(
  state: SelectionState,
  uColor: string,
  negUColor: string
): SelectionState {
  return {
    ...state,
    colors: {
      u: uColor,
      negU: negUColor
    }
  };
}

/**
 * Gets the current quotient selection (class + aperture).
 *
 * @param state - The current selection state
 * @returns A QuotientSelection object
 */
export function getCurrentSelection(state: SelectionState): QuotientSelection {
  return {
    class: state.selectedClass,
    aperture: state.aperture
  };
}

/**
 * Tests if a point on the source object is highlighted by the current selection.
 *
 * This can be used by the UI to determine which vertices to highlight.
 *
 * @param state - The current selection state
 * @param point - A point on the source object (as a direction vector)
 * @returns true if the point should be highlighted
 */
export function isPointHighlighted(state: SelectionState, point: Vec3): boolean {
  const { selectedClass, aperture } = state;
  const [u, negU] = getBothRepresentatives(selectedClass);

  const normalized = Vec3.normalize(point);
  const angleToU = Vec3.angle(normalized, u);
  const angleToNegU = Vec3.angle(normalized, negU);

  const minAngle = Math.min(angleToU, angleToNegU);
  return minAngle <= aperture;
}

/**
 * Computes a weight (0 to 1) for how strongly a point is selected.
 *
 * This can be used for smooth color transitions or intensity variations.
 *
 * @param state - The current selection state
 * @param point - A point on the source object (as a direction vector)
 * @returns A weight from 0 (not selected) to 1 (fully selected)
 */
export function selectionWeight(state: SelectionState, point: Vec3): number {
  const { selectedClass, aperture } = state;
  const [u, negU] = getBothRepresentatives(selectedClass);

  const normalized = Vec3.normalize(point);
  const angleToU = Vec3.angle(normalized, u);
  const angleToNegU = Vec3.angle(normalized, negU);

  const minAngle = Math.min(angleToU, angleToNegU);

  if (minAngle >= aperture) return 0.0;
  return 1.0 - (minAngle / aperture);
}

/**
 * Computes which representative (u or -u) a point is closer to.
 *
 * @param state - The current selection state
 * @param point - A point on the source object
 * @returns 'u' if closer to u, 'negU' if closer to -u
 */
export function closerRepresentative(
  state: SelectionState,
  point: Vec3
): 'u' | 'negU' {
  const { selectedClass } = state;
  const [u, negU] = getBothRepresentatives(selectedClass);

  const normalized = Vec3.normalize(point);
  const angleToU = Vec3.angle(normalized, u);
  const angleToNegU = Vec3.angle(normalized, negU);

  return angleToU < angleToNegU ? 'u' : 'negU';
}

/**
 * Validates that the pairing between u and -u is maintained.
 *
 * This is a semantic assertion that can be used in development/testing
 * to ensure the quotient invariant is never broken.
 *
 * @param state - The selection state to validate
 * @returns true if the state is valid
 */
export function validatePairing(state: SelectionState): boolean {
  const { selectedClass } = state;
  const [u, negU] = getBothRepresentatives(selectedClass);

  // Check that negU is indeed the antipode of u
  const expectedNegU = Vec3.neg(u);
  const isValid = Vec3.approxEq(negU, expectedNegU, 1e-6);

  if (!isValid) {
    console.error('Pairing violation detected!', { u, negU, expectedNegU });
  }

  return isValid;
}

/**
 * Creates a selection state from a quotient class.
 *
 * This is useful when programmatically setting the selection.
 *
 * @param qClass - The quotient class to select
 * @param aperture - Optional aperture (defaults to current or 0.4)
 * @returns A new selection state
 */
export function selectClass(
  qClass: QuotientClass,
  aperture?: number
): SelectionState {
  return {
    selectedClass: qClass,
    aperture: aperture ?? 0.4,
    colors: {
      u: '#00e5bc',
      negU: '#6366f1'
    }
  };
}
