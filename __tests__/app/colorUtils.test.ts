import { describe, it, expect } from 'vitest';
import {
  hexToRgbVec,
  rgbVecToHex,
  getAntipodalColor,
  lerpColor,
  getBrightness,
  getContrastColor,
  isValidHex,
} from '@/app/ui/colorUtils';

describe('colorUtils module', () => {
  describe('hexToRgbVec', () => {
    it('converts pure red', () => {
      const result = hexToRgbVec('#ff0000');
      expect(result[0]).toBeCloseTo(1);
      expect(result[1]).toBeCloseTo(0);
      expect(result[2]).toBeCloseTo(0);
    });

    it('converts pure green', () => {
      const result = hexToRgbVec('#00ff00');
      expect(result[0]).toBeCloseTo(0);
      expect(result[1]).toBeCloseTo(1);
      expect(result[2]).toBeCloseTo(0);
    });

    it('converts pure blue', () => {
      const result = hexToRgbVec('#0000ff');
      expect(result[0]).toBeCloseTo(0);
      expect(result[1]).toBeCloseTo(0);
      expect(result[2]).toBeCloseTo(1);
    });

    it('converts white', () => {
      const result = hexToRgbVec('#ffffff');
      expect(result[0]).toBeCloseTo(1);
      expect(result[1]).toBeCloseTo(1);
      expect(result[2]).toBeCloseTo(1);
    });

    it('converts black', () => {
      const result = hexToRgbVec('#000000');
      expect(result[0]).toBeCloseTo(0);
      expect(result[1]).toBeCloseTo(0);
      expect(result[2]).toBeCloseTo(0);
    });

    it('converts gray', () => {
      const result = hexToRgbVec('#808080');
      expect(result[0]).toBeCloseTo(0.502, 2);
      expect(result[1]).toBeCloseTo(0.502, 2);
      expect(result[2]).toBeCloseTo(0.502, 2);
    });

    it('handles hex without # prefix', () => {
      const result = hexToRgbVec('ff0000');
      expect(result[0]).toBeCloseTo(1);
      expect(result[1]).toBeCloseTo(0);
      expect(result[2]).toBeCloseTo(0);
    });

    it('handles lowercase hex', () => {
      const result = hexToRgbVec('#ff00ff');
      expect(result[0]).toBeCloseTo(1);
      expect(result[1]).toBeCloseTo(0);
      expect(result[2]).toBeCloseTo(1);
    });
  });

  describe('rgbVecToHex', () => {
    it('converts pure red', () => {
      const result = rgbVecToHex([1, 0, 0]);
      expect(result.toLowerCase()).toBe('#ff0000');
    });

    it('converts pure green', () => {
      const result = rgbVecToHex([0, 1, 0]);
      expect(result.toLowerCase()).toBe('#00ff00');
    });

    it('converts pure blue', () => {
      const result = rgbVecToHex([0, 0, 1]);
      expect(result.toLowerCase()).toBe('#0000ff');
    });

    it('converts white', () => {
      const result = rgbVecToHex([1, 1, 1]);
      expect(result.toLowerCase()).toBe('#ffffff');
    });

    it('converts black', () => {
      const result = rgbVecToHex([0, 0, 0]);
      expect(result.toLowerCase()).toBe('#000000');
    });

    it('rounds to nearest integer', () => {
      const result = rgbVecToHex([0.5, 0.5, 0.5]);
      // 0.5 * 255 = 127.5, rounds to 128 = 0x80
      expect(result.toLowerCase()).toBe('#808080');
    });

    it('clamps values correctly', () => {
      const result = rgbVecToHex([0.2, 0.5, 0.8]);
      const rgb = hexToRgbVec(result);
      expect(rgb[0]).toBeCloseTo(0.2, 1);
      expect(rgb[1]).toBeCloseTo(0.5, 1);
      expect(rgb[2]).toBeCloseTo(0.8, 1);
    });
  });

  describe('hexToRgbVec and rgbVecToHex round trip', () => {
    it('round trips for primary colors', () => {
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffffff', '#000000'];

      colors.forEach(color => {
        const rgb = hexToRgbVec(color);
        const hex = rgbVecToHex(rgb);
        expect(hex.toLowerCase()).toBe(color.toLowerCase());
      });
    });

    it('round trips with minimal precision loss', () => {
      const original = '#a1b2c3';
      const rgb = hexToRgbVec(original);
      const result = rgbVecToHex(rgb);
      expect(result.toLowerCase()).toBe(original.toLowerCase());
    });
  });

  describe('getAntipodalColor', () => {
    it('red ↔ cyan', () => {
      const red = '#ff0000';
      const cyan = getAntipodalColor(red);
      expect(cyan.toLowerCase()).toBe('#00ffff');
    });

    it('green ↔ magenta', () => {
      const green = '#00ff00';
      const magenta = getAntipodalColor(green);
      expect(magenta.toLowerCase()).toBe('#ff00ff');
    });

    it('blue ↔ yellow', () => {
      const blue = '#0000ff';
      const yellow = getAntipodalColor(blue);
      expect(yellow.toLowerCase()).toBe('#ffff00');
    });

    it('white ↔ black', () => {
      const white = '#ffffff';
      const black = getAntipodalColor(white);
      expect(black.toLowerCase()).toBe('#000000');
    });

    it('black ↔ white', () => {
      const black = '#000000';
      const white = getAntipodalColor(black);
      expect(white.toLowerCase()).toBe('#ffffff');
    });

    it('gray ↔ gray (center of cube)', () => {
      const gray = '#808080';
      const antiGray = getAntipodalColor(gray);
      // Gray is close to center, so antipode should also be close to center
      const rgb = hexToRgbVec(antiGray);
      expect(rgb[0]).toBeCloseTo(0.498, 1);
      expect(rgb[1]).toBeCloseTo(0.498, 1);
      expect(rgb[2]).toBeCloseTo(0.498, 1);
    });

    it('is involutive (double application returns original)', () => {
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ff8800', '#88ff00'];

      colors.forEach(color => {
        const antipode1 = getAntipodalColor(color);
        const antipode2 = getAntipodalColor(antipode1);
        expect(antipode2.toLowerCase()).toBe(color.toLowerCase());
      });
    });

    it('preserves distance from center', () => {
      const color = '#ff0000';
      const antiColor = getAntipodalColor(color);

      const rgb1 = hexToRgbVec(color);
      const rgb2 = hexToRgbVec(antiColor);

      // Both should be equidistant from [0.5, 0.5, 0.5]
      const center = [0.5, 0.5, 0.5];
      const dist1 = Math.sqrt(
        (rgb1[0] - center[0]) ** 2 +
        (rgb1[1] - center[1]) ** 2 +
        (rgb1[2] - center[2]) ** 2
      );
      const dist2 = Math.sqrt(
        (rgb2[0] - center[0]) ** 2 +
        (rgb2[1] - center[1]) ** 2 +
        (rgb2[2] - center[2]) ** 2
      );

      expect(dist1).toBeCloseTo(dist2, 2);
    });
  });

  describe('lerpColor', () => {
    it('interpolates at t=0 returns first color', () => {
      const result = lerpColor('#ff0000', '#0000ff', 0);
      expect(result.toLowerCase()).toBe('#ff0000');
    });

    it('interpolates at t=1 returns second color', () => {
      const result = lerpColor('#ff0000', '#0000ff', 1);
      expect(result.toLowerCase()).toBe('#0000ff');
    });

    it('interpolates at t=0.5 returns midpoint', () => {
      const result = lerpColor('#000000', '#ffffff', 0.5);
      // Midpoint between black and white is gray
      expect(result.toLowerCase()).toBe('#808080');
    });

    it('interpolates red to blue', () => {
      const result = lerpColor('#ff0000', '#0000ff', 0.5);
      const rgb = hexToRgbVec(result);
      expect(rgb[0]).toBeCloseTo(0.5, 1);
      expect(rgb[1]).toBeCloseTo(0, 1);
      expect(rgb[2]).toBeCloseTo(0.5, 1);
    });

    it('handles arbitrary colors', () => {
      const result = lerpColor('#123456', '#abcdef', 0.3);
      const rgb = hexToRgbVec(result);

      const rgb1 = hexToRgbVec('#123456');
      const rgb2 = hexToRgbVec('#abcdef');

      expect(rgb[0]).toBeCloseTo(rgb1[0] + (rgb2[0] - rgb1[0]) * 0.3, 1);
      expect(rgb[1]).toBeCloseTo(rgb1[1] + (rgb2[1] - rgb1[1]) * 0.3, 1);
      expect(rgb[2]).toBeCloseTo(rgb1[2] + (rgb2[2] - rgb1[2]) * 0.3, 1);
    });

    it('is linear', () => {
      const start = '#000000';
      const end = '#ffffff';

      const mid = lerpColor(start, end, 0.5);
      const quarter = lerpColor(start, mid, 0.5);

      // quarter should be 0.25 of the way
      const rgb = hexToRgbVec(quarter);
      expect(rgb[0]).toBeCloseTo(0.25, 1);
      expect(rgb[1]).toBeCloseTo(0.25, 1);
      expect(rgb[2]).toBeCloseTo(0.25, 1);
    });
  });

  describe('getBrightness', () => {
    it('returns 0 for black', () => {
      expect(getBrightness('#000000')).toBeCloseTo(0);
    });

    it('returns 1 for white', () => {
      expect(getBrightness('#ffffff')).toBeCloseTo(1);
    });

    it('green is brighter than red', () => {
      const redBrightness = getBrightness('#ff0000');
      const greenBrightness = getBrightness('#00ff00');
      expect(greenBrightness).toBeGreaterThan(redBrightness);
    });

    it('green is brighter than blue', () => {
      const greenBrightness = getBrightness('#00ff00');
      const blueBrightness = getBrightness('#0000ff');
      expect(greenBrightness).toBeGreaterThan(blueBrightness);
    });

    it('uses standard luminance formula', () => {
      const brightness = getBrightness('#ff0000');
      expect(brightness).toBeCloseTo(0.299, 3);
    });

    it('computes correct luminance for arbitrary color', () => {
      const rgb = [0.5, 0.7, 0.3];
      const hex = rgbVecToHex(rgb as any);
      const brightness = getBrightness(hex);

      const expected = 0.299 * 0.5 + 0.587 * 0.7 + 0.114 * 0.3;
      expect(brightness).toBeCloseTo(expected, 2);
    });
  });

  describe('getContrastColor', () => {
    it('returns black for light colors', () => {
      expect(getContrastColor('#ffffff')).toBe('#000000');
      expect(getContrastColor('#ffff00')).toBe('#000000');
    });

    it('returns white for dark colors', () => {
      expect(getContrastColor('#000000')).toBe('#ffffff');
      expect(getContrastColor('#0000ff')).toBe('#ffffff');
    });

    it('returns black for green (bright)', () => {
      expect(getContrastColor('#00ff00')).toBe('#000000');
    });

    it('returns white for red (darker)', () => {
      const contrast = getContrastColor('#ff0000');
      // Red has brightness 0.299, which is < 0.5
      expect(contrast).toBe('#ffffff');
    });

    it('uses 0.5 threshold', () => {
      const darkGray = '#7f7f7f'; // Just below 0.5
      const lightGray = '#808080'; // Just above 0.5

      const brightness1 = getBrightness(darkGray);
      const brightness2 = getBrightness(lightGray);

      if (brightness1 < 0.5) {
        expect(getContrastColor(darkGray)).toBe('#ffffff');
      }
      if (brightness2 >= 0.5) {
        expect(getContrastColor(lightGray)).toBe('#000000');
      }
    });
  });

  describe('isValidHex', () => {
    it('accepts valid 6-digit hex with #', () => {
      expect(isValidHex('#ff0000')).toBe(true);
      expect(isValidHex('#00FF00')).toBe(true);
      expect(isValidHex('#123abc')).toBe(true);
    });

    it('rejects hex without #', () => {
      expect(isValidHex('ff0000')).toBe(false);
    });

    it('rejects 3-digit hex', () => {
      expect(isValidHex('#fff')).toBe(false);
    });

    it('rejects 8-digit hex (with alpha)', () => {
      expect(isValidHex('#ff0000ff')).toBe(false);
    });

    it('rejects invalid characters', () => {
      expect(isValidHex('#gggggg')).toBe(false);
      expect(isValidHex('#ff00zz')).toBe(false);
    });

    it('rejects non-hex strings', () => {
      expect(isValidHex('red')).toBe(false);
      expect(isValidHex('rgb(255,0,0)')).toBe(false);
      expect(isValidHex('')).toBe(false);
    });

    it('accepts mixed case', () => {
      expect(isValidHex('#FfAaBb')).toBe(true);
    });
  });

  describe('integration tests', () => {
    it('antipodal colors have complementary brightness', () => {
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];

      colors.forEach(color => {
        const antiColor = getAntipodalColor(color);
        const brightness1 = getBrightness(color);
        const brightness2 = getBrightness(antiColor);

        // Sum should be close to 1 (reflecting through center)
        expect(brightness1 + brightness2).toBeCloseTo(1, 1);
      });
    });

    it('lerp between antipodal colors passes through gray', () => {
      const red = '#ff0000';
      const cyan = getAntipodalColor(red);
      const mid = lerpColor(red, cyan, 0.5);

      const rgb = hexToRgbVec(mid);
      // Should be close to center [0.5, 0.5, 0.5]
      expect(rgb[0]).toBeCloseTo(0.5, 1);
      expect(rgb[1]).toBeCloseTo(0.5, 1);
      expect(rgb[2]).toBeCloseTo(0.5, 1);
    });

    it('contrast color swaps between antipodes', () => {
      const lightColor = '#ffffff';
      const darkColor = getAntipodalColor(lightColor); // Should be black

      const contrast1 = getContrastColor(lightColor);
      const contrast2 = getContrastColor(darkColor);

      // They should be opposite
      expect(contrast1).not.toBe(contrast2);
      expect([contrast1, contrast2].sort()).toEqual(['#000000', '#ffffff']);
    });

    it('color conversions preserve structure', () => {
      const testColors = [
        '#ff0000', '#00ff00', '#0000ff',
        '#ffff00', '#ff00ff', '#00ffff',
        '#808080', '#ffffff', '#000000'
      ];

      testColors.forEach(color => {
        // Validate
        expect(isValidHex(color)).toBe(true);

        // Round trip
        const rgb = hexToRgbVec(color);
        const hex = rgbVecToHex(rgb);
        expect(hex.toLowerCase()).toBe(color.toLowerCase());

        // Antipode involution
        const anti1 = getAntipodalColor(color);
        const anti2 = getAntipodalColor(anti1);
        expect(anti2.toLowerCase()).toBe(color.toLowerCase());
      });
    });
  });
});
