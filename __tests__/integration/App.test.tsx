import { describe, it, expect } from 'vitest';
import type { Vec3 } from '@/core/types';

describe('App Integration Tests', () => {
  it('successfully imports core modules', async () => {
    const { Vec3 } = await import('@/core/types');
    expect(Vec3).toBeDefined();
    expect(typeof Vec3.add).toBe('function');
  });

  it('successfully imports quotient module', async () => {
    const quotient = await import('@/core/quotient');
    expect(quotient.classOf).toBeDefined();
    expect(quotient.antipode).toBeDefined();
  });

  it('successfully imports transforms module', async () => {
    const transforms = await import('@/core/transforms');
    expect(transforms.rotationX).toBeDefined();
    expect(transforms.matVecMul).toBeDefined();
  });

  it('successfully imports parity module', async () => {
    const parity = await import('@/core/parity');
    expect(parity.composeParity).toBeDefined();
    expect(parity.PARITY_EVEN).toBeDefined();
  });

  it('successfully imports colorUtils module', async () => {
    const colorUtils = await import('@/app/ui/colorUtils');
    expect(colorUtils.getAntipodalColor).toBeDefined();
    expect(colorUtils.hexToRgbVec).toBeDefined();
  });

  it('modules work together correctly', async () => {
    const { Vec3 } = await import('@/core/types');
    const { classOf, quotientDistance } = await import('@/core/quotient');

    const v1: Vec3 = [1, 0, 0];
    const v2: Vec3 = [0, 1, 0];

    const class1 = classOf(v1);
    const class2 = classOf(v2);

    const distance = quotientDistance(class1, class2);

    // Distance between orthogonal classes should be π/2
    expect(distance).toBeCloseTo(Math.PI / 2, 5);
  });

  it('color utilities work with core types', async () => {
    const { hexToRgbVec, getAntipodalColor } = await import('@/app/ui/colorUtils');
    const { Vec3 } = await import('@/core/types');

    const red = '#ff0000';
    const rgb = hexToRgbVec(red);

    expect(Vec3.norm(rgb)).toBeGreaterThan(0);

    const cyan = getAntipodalColor(red);
    expect(cyan.toLowerCase()).toBe('#00ffff');
  });

  it('transformation pipeline works', async () => {
    const { Vec3 } = await import('@/core/types');
    const { rotationZ, matVecMul } = await import('@/core/transforms');
    const { classOf } = await import('@/core/quotient');

    // Rotate a vector
    const v: Vec3 = [1, 0, 0];
    const rot = rotationZ(Math.PI / 2);
    const rotated = matVecMul(rot, v);

    // Create quotient class
    const qClass = classOf(rotated);

    expect(qClass.canonical).toBeDefined();
    expect(Vec3.norm(qClass.canonical)).toBeCloseTo(1);
  });
});

describe('Core Type System', () => {
  it('Vec3 operations maintain mathematical properties', async () => {
    const { Vec3 } = await import('@/core/types');

    const a: Vec3 = [1, 2, 3];
    const b: Vec3 = [4, 5, 6];

    // Commutativity of addition
    const sum1 = Vec3.add(a, b);
    const sum2 = Vec3.add(b, a);
    expect(Vec3.approxEq(sum1, sum2)).toBe(true);

    // Dot product symmetry
    expect(Vec3.dot(a, b)).toBeCloseTo(Vec3.dot(b, a));
  });

  it('Quotient space operations respect antipodal symmetry', async () => {
    const { Vec3 } = await import('@/core/types');
    const { classOf, classEquals } = await import('@/core/quotient');

    const v: Vec3 = [1, 2, 3];
    const negV = Vec3.neg(v);

    const class1 = classOf(v);
    const class2 = classOf(negV);

    // v and -v should represent the same quotient class
    expect(classEquals(class1, class2)).toBe(true);
  });

  it('Parity operations form a group (Z₂)', async () => {
    const { composeParity, PARITY_EVEN, PARITY_ODD } = await import('@/core/parity');

    // Identity element
    expect(composeParity(PARITY_ODD, PARITY_EVEN)).toBe(PARITY_ODD);

    // Inverses exist
    expect(composeParity(PARITY_ODD, PARITY_ODD)).toBe(PARITY_EVEN);

    // Associativity
    const a = PARITY_ODD;
    const b = PARITY_ODD;
    const c = PARITY_ODD;
    expect(composeParity(composeParity(a, b), c)).toBe(composeParity(a, composeParity(b, c)));
  });
});
