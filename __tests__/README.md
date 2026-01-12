# SEAM-VIZ Test Suite

Comprehensive test suite for the SEAM (Stochastic Eversion of Antipodal Manifolds) visualization application.

## Test Coverage

### Core Module Tests (213 tests)

#### `core/types.test.ts` (50 tests)
Tests for the Vec3 namespace and fundamental vector operations:
- Vector arithmetic (add, sub, scale)
- Dot product, norm, and normalization
- Cross product
- Angle calculations
- Approximate equality checks
- Mathematical property verification

#### `core/quotient.test.ts` (44 tests)
Tests for quotient space operations (ℝP² = S²/±):
- Quotient class creation and equality
- Antipodal identification (u ≡ -u)
- Distance metrics in projective space
- Cone membership testing
- Weight calculations for smooth falloff
- Quotient space symmetry properties

#### `core/transforms.test.ts` (56 tests)
Tests for geometric transformations:
- Matrix operations (multiplication, transpose)
- Rotation matrices (X, Y, Z axes)
- Axis-angle rotations (Rodrigues' formula)
- Rotation between vectors
- Quaternion operations
- Camera orbit system
- Screen-to-ray casting
- Ray-sphere intersection

#### `core/parity.test.ts` (52 tests)
Tests for orientation tracking (ℤ₂ group):
- Parity composition (group operations)
- Path operations with parity tracking
- Orientation-reversing transformations
- Non-orientability in ℝP²
- Group property verification

### App Module Tests (53 tests)

#### `app/colorUtils.test.ts` (53 tests)
Tests for color utilities:
- Hex to RGB conversion
- RGB to hex conversion
- Antipodal color computation
- Color interpolation (lerp)
- Brightness and contrast calculations
- Hex color validation
- Round-trip conversion verification

### Integration Tests (11 tests)

#### `integration/App.test.tsx` (11 tests)
End-to-end integration tests:
- Module import verification
- Cross-module integration
- Mathematical property preservation
- Complete data flow validation

## Running Tests

### All Tests
```bash
npm test              # Watch mode (interactive)
npm run test:run      # Single run
```

### With UI
```bash
npm run test:ui       # Opens Vitest UI in browser
```

### Coverage Report
```bash
npm run test:coverage # Generates coverage report
```

## Test Structure

```
__tests__/
├── core/              # Core mathematical modules
│   ├── types.test.ts
│   ├── quotient.test.ts
│   ├── transforms.test.ts
│   └── parity.test.ts
├── app/               # Application layer
│   └── colorUtils.test.ts
└── integration/       # Integration tests
    └── App.test.tsx
```

## Testing Framework

- **Vitest**: Fast unit test framework with native Vite support
- **React Testing Library**: Component testing utilities
- **jsdom**: DOM environment for tests
- **@testing-library/jest-dom**: Custom matchers for DOM assertions

## Test Philosophy

### Pure Functions First
The core module consists primarily of pure mathematical functions, making it ideal for unit testing. Each function is tested for:
- Correct output for various inputs
- Edge cases (zero vectors, identity operations, etc.)
- Mathematical properties (commutativity, associativity, etc.)

### Mathematical Rigor
Tests verify fundamental mathematical properties:
- Vector space axioms
- Group properties (ℤ₂)
- Geometric invariants
- Quotient space equivalence relations

### Integration Testing
Integration tests verify:
- Module boundaries work correctly
- Data flows through the system properly
- Mathematical properties are preserved across transformations

## Continuous Integration

Tests run automatically on:
- Every push to any branch matching `claude/**`
- Every pull request to main/master/develop
- Multiple Node.js versions (20.x, 22.x)

See `.github/workflows/test.yml` for CI configuration.

## Adding New Tests

When adding new features:

1. **Add unit tests** for pure functions in the appropriate test file
2. **Add integration tests** if the feature spans multiple modules
3. **Verify mathematical properties** where applicable
4. **Test edge cases** (zero values, null/undefined, extreme values)

Example test structure:
```typescript
describe('featureName', () => {
  describe('functionName', () => {
    it('handles normal case', () => {
      // Test code
    });

    it('handles edge case', () => {
      // Test code
    });

    it('maintains mathematical property', () => {
      // Property verification
    });
  });
});
```

## Test Results

Current test suite:
- ✅ 6 test files
- ✅ 266 tests passing
- ✅ 0 tests failing
- ⏱️ ~5.5s execution time

## Coverage Goals

Target coverage:
- Core modules: >90% statement coverage
- App modules: >80% statement coverage
- Integration: Key user paths covered

Run `npm run test:coverage` to see detailed coverage report.
