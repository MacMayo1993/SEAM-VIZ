# SEAM-VIZ Architecture

**Version 2.0 - Clean-Room Refactoring**

## Overview

SEAM-VIZ is an interactive mathematical instrument for exploring projective space (ℝP²) through the lens of quotient topology. This document describes the V2 architecture, which enforces a strict separation between mathematical semantics (core) and visual presentation (app).

## Design Principles

### 1. Clean-Room Architecture

This codebase is a **clean-room reimplementation** of the SEAM-VIZ concept. While inspired by architectural patterns from other projects (like HyperbolicGames), all code is written from scratch with original structure and naming.

Key patterns adopted (conceptually, not by code copying):
- **Characteristic size calibration**: Single source of truth for UI scaling
- **Core/UI separation**: Math engine knows nothing about rendering platform
- **Transform discipline**: All coordinate transforms in one place

### 2. The Quotient Invariant

**Fundamental Rule**: The pairing between u and -u can **never** be broken.

Every operation in the system respects the equivalence relation u ≡ -u. This is enforced at multiple levels:
- **Type system**: `QuotientClass` represents [u] = {u, -u} as a single object
- **Module boundaries**: Core functions take `QuotientClass`, not raw vectors
- **Pullback semantics**: Actions on [u] automatically affect both representatives

## Directory Structure

```
seam-viz/
  core/                    # Platform-agnostic math engine
    types.ts               # Domain types (Vec3, QuotientClass, etc.)
    quotient.ts            # Quotient space operations
    calibration.ts         # Scaling and sizing
    transforms.ts          # Rotations and coordinate transforms
    selection.ts           # Selection state and directives
    pullback.ts            # Operational quotient semantics
    parity.ts              # Orientation tracking (ℤ₂)
    mesh.ts                # Mesh utilities
    shapes.ts              # Shape generation
    index.ts               # Public API

  app/                     # Web application (React + Three.js)
    ui/                    # UI components
    rendering/             # Rendering components
    main.ts                # Application entry point

  docs/                    # Documentation
    architecture.md        # This file
    pedagogy.md            # Teaching goals and philosophy

  lib/                     # Legacy modules (deprecated, will be removed)
```

## Core Module Design

### Module Hierarchy

```
types.ts (foundational types)
  ↓
quotient.ts (quotient space operations)
  ↓
calibration.ts, transforms.ts (utilities)
  ↓
selection.ts (state management)
  ↓
pullback.ts, parity.ts (advanced features)
```

### Key Abstractions

#### 1. QuotientClass

Represents an equivalence class [u] = {u, -u} in ℝP².

```typescript
interface QuotientClass {
  canonical: Vec3;           // Canonical representative
  representatives: [Vec3, Vec3];  // Both {u, -u}
}
```

**Invariant**: `representatives[1] === -representatives[0]`

#### 2. Selection Intent → Render Directive Pattern

The UI never directly computes mathematical meaning. Instead:

1. **User action** → UI generates `SelectionIntent`
2. **Intent** → Core processes it, updates `SelectionState`
3. **State** → Core generates `RenderDirective`
4. **Directive** → UI renders exactly what it's told

This enforces a clean boundary: UI is a "thin client" to the core engine.

```typescript
// Example flow
const intent: SelectionIntent = { type: 'ClickQuotient', point: [0.5, 0.7, 0.3] };
const [newState, directives] = processAndRender(state, intent);
// directives now contains spotlights, markers, etc.
```

#### 3. Pullback Semantics

Any action in quotient space "pulls back" to act symmetrically on both representatives.

```typescript
// User paints at [u] in quotient space
const action: QuotientAction = {
  type: 'Paint',
  class: someClass,
  radius: 0.1,
  color: 'red'
};

// Core automatically generates effects for BOTH u and -u
const result: PullbackResult = pullbackAction(action);
// result.effectOnU   → paint at u
// result.effectOnNegU → paint at -u
```

This pattern ensures that quotient semantics are respected by construction, not by convention.

## Calibration System

### The Characteristic Size Pattern

Inspired by "instrument feel" design: define **one** fundamental scale from viewport dimensions, and derive everything else from it.

```typescript
const calibration = createCalibration({ width, height, pixelRatio });

// Now all UI→math mappings go through calibration
const aperture = sliderToAperture(sliderValue, calibration);
const markerSize = markerSizeForAperture(aperture);
```

**Why this matters**:
- Consistent feel across devices
- Easy to change global scaling in one place
- Mathematical properties (angles, solid angles) are stable

## Transform Conventions

### Coordinate System

- **Right-handed coordinates**
- **+X**: Right
- **+Y**: Up
- **+Z**: Forward (toward viewer)
- **Camera**: Looks along -Z by default

### Transform Discipline

All rotations, camera operations, and coordinate conversions live in `core/transforms.ts`.

**Test-driven convention**:
```typescript
// Example test (conceptual)
test('rotate 90° around Y maps +Z → +X', () => {
  const mat = rotationY(Math.PI / 2);
  const result = matVecMul(mat, [0, 0, 1]);
  expect(result).toBeCloseTo([1, 0, 0]);
});
```

This prevents "mystery rotations" from spreading throughout the codebase.

## Module Interfaces

### Core → App Communication

The core exports a **clean functional API**:

```typescript
// State is immutable
const state1 = createDefaultSelection();
const state2 = processIntent(state1, intent);  // Returns new state

// Directives are data, not commands
const directives = generateRenderDirectives(state2);
// App just renders what directives say
```

No callbacks, no mutation, no hidden state. The core is a **pure function** from intents to directives.

### App → Core Communication

The app sends **intents**, not raw data:

```typescript
type SelectionIntent =
  | { type: 'ClickQuotient'; point: Vec3 }
  | { type: 'ClickSource'; point: Vec3 }
  | { type: 'SetAperture'; value: number }
  | { type: 'Reset' };
```

This gives the core **semantic authority**: the core decides what a click *means*, the UI just reports that a click happened.

## Extensibility Points

### Future Features (Design Complete, Implementation Pending)

The architecture is designed to support these extensions without breaking changes:

1. **Paint Mode**: Users paint on [u], both u and -u get painted
   - Already implemented: `pullbackPaint()` in `pullback.ts`
   - Needed: UI for brush controls, texture storage

2. **Stamp Mode**: Place stamps at quotient points
   - Already implemented: `pullbackStamp()` in `pullback.ts`
   - Needed: Stamp library, rotation handling

3. **Path Tracing**: Draw paths that respect quotient topology
   - Already implemented: `pullbackTrace()` in `pullback.ts`
   - Parity tracking: `parity.ts` module ready

4. **Orientation Flips**: Visualize non-orientability
   - Infrastructure: `parity.ts` with ℤ₂ operations
   - Needed: UI for showing "left/right swap" when completing loops

### Adding a New Operation

To add a new quotient operation:

1. **Define the action type** in `core/types.ts`:
   ```typescript
   type QuotientAction =
     | /* existing actions */
     | { type: 'NewOperation'; class: QuotientClass; params: ... };
   ```

2. **Implement pullback** in `core/pullback.ts`:
   ```typescript
   function pullbackNewOperation(action: ...): PullbackResult {
     const [u, negU] = getBothRepresentatives(action.class);
     // Generate symmetric effects
   }
   ```

3. **Add to intent system** if needed (in `core/selection.ts`)

4. **UI renders the directives** (in `app/rendering/`)

The core architecture ensures that you **cannot** break quotient semantics by accident.

## Testing Strategy

### Unit Tests (to be implemented)

Key invariants to test:

1. **Quotient invariant**: `classOf(u) === classOf(-u)`
2. **Pullback symmetry**: Effects are antipodal
3. **Transform correctness**: Known rotations produce expected results
4. **Calibration stability**: Consistent scaling across viewport changes

### Integration Tests

1. **Selection flow**: Intent → State → Directives → Render
2. **Quotient pairing**: Clicking [u] highlights both u and -u
3. **Aperture range**: Min/max apertures produce valid cones

## Performance Considerations

### What's Fast

- **Core operations**: All O(1) or O(n) in vertices
- **Immutable state**: Enables React optimization
- **Functional API**: Easy to memoize

### What to Watch

- **Mesh generation**: Cache shape meshes, don't regenerate every frame
- **Shader compilation**: Compile once, reuse materials
- **Matrix operations**: Use Three.js built-ins where possible

## Migration Notes

### From V1 to V2

**Breaking changes**:
- `Vec3` is now `[number, number, number]`, not a class
- `Projective` module is now `quotient` with different API
- No more direct manipulation of `u` and `-u` separately

**Compatibility layer** (if needed):
```typescript
// Old code
const proj = Projective.fromVec(v);
const u = proj.u;

// New code
const qClass = classOf(v);
const u = qClass.canonical;
```

### Deprecation Timeline

- **V2.0-alpha**: New core complete, app still using old structure
- **V2.0-beta**: App refactored to use new core
- **V2.0**: Old `lib/` directory removed

## References

### Conceptual Inspirations (No Code Copied)

- **HyperbolicGames**: Characteristic size calibration, core/UI separation
- **Mathematical foundations**: Quotient topology, covering space theory

### Further Reading

- `docs/pedagogy.md`: Educational philosophy and goals
- `core/README.md`: Core API reference (to be written)
- `app/README.md`: UI component guide (to be written)

---

**Maintainer Notes**:

This architecture prioritizes **correctness** and **teachability** over performance. The goal is to make quotient space semantics impossible to violate, even for contributors unfamiliar with the mathematics.

When in doubt, ask: "Does this maintain the pairing between u and -u?" If not, it doesn't belong in this architecture.
