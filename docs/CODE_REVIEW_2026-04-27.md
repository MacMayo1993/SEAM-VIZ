# SEAM-VIZ Code Review (2026-04-27)

## Scope
- Reviewed React app structure, rendering paths, core geometry generation, and build output.
- Executed test suite, TypeScript check, and production build.

## Top Pain Points

### 1) `QuotientSymmetry.tsx` is a monolith (maintainability + testability risk)
- File combines page navigation, 3D rendering primitives, telemetry simulation, keyboard handling, analytics dashboard, and library content in one component tree.
- This raises cognitive load, makes targeted unit testing harder, and increases regression risk for unrelated edits.
- Recommendation:
  - Split into domain modules: `lab/`, `analytics/`, `library/`, and shared hooks (`useDriveMode`, `useTelemetry`).
  - Extract shader strings and 3D primitives to dedicated files.

### 2) Potential unbounded state growth for `fiberBundles`
- `fiberBundles` is appended on every click and during drive mode, but only the latest few are rendered.
- In long sessions this can grow memory unnecessarily.
- Recommendation:
  - Cap stored bundles at a fixed ring buffer length (for example 100–500), or prune by age.

### 3) Animation timing in `FiberBundles` is tied to React re-render cadence
- Bundle `age/progress` is computed from `Date.now()` inside a `useMemo` keyed only by `bundles`/`maxBundles`.
- If no state changes occur, animation progression may stall.
- Recommendation:
  - Move animation progress into `useFrame`/clock-based updates, or keep a ticking state (e.g., `requestAnimationFrame`) while bundles are visible.

### 4) Per-frame object allocations in `InternalCone`
- `useFrame` repeatedly constructs `Vector3` instances each frame (`targetVec`, `up`).
- This adds avoidable GC pressure.
- Recommendation:
  - Reuse memoized `Vector3` objects/refs and mutate in place.

### 5) Large production bundle and warning in build output
- Build produces very large chunks (notably Cesium), which impacts initial load and interactivity.
- Recommendation:
  - Route-level lazy loading via `React.lazy` for heavy routes (`Tutorials`).
  - Keep Cesium isolated to on-demand route and evaluate optional external hosting or deferred loading of widgets.

### 6) Secret exposure risk in Vite config
- `vite.config.ts` injects `GEMINI_API_KEY` directly into client bundle via `define`.
- Client-exposed keys are discoverable and should be considered public.
- Recommendation:
  - Remove direct key injection for sensitive credentials.
  - Proxy model calls through a server endpoint if secrecy is required.

## Additional Optimization Opportunities
- Consider replacing very large inline-style blocks in `Tutorials.tsx` with reusable class-based components to improve readability and reduce render payload churn.
- Add ESLint + performance-oriented rules (React hooks, import boundaries, complexity limits) to prevent monolith regressions.
- Add CI budget checks for bundle size to prevent silent growth.

## Quick Wins (high impact / low effort)
1. Cap `fiberBundles` length in state updates.
2. Lazy-load `Tutorials` route.
3. Remove client-side API key injection.
4. Extract `QuotientSymmetry` into smaller components/hooks.

## Validation Commands Run
- `npm run test:run`
- `npx tsc --noEmit`
- `npm run build`
