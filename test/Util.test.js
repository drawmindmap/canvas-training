import {
  getColorValue,
} from '../src/Util';

describe('Util', () => {
  test('getColorValue', () => {
    const color = getColorValue('rgba(255, 0, 0, 0.5)');
    expect(color.r).toBe(255);
    expect(color.g).toBe(0);
    expect(color.b).toBe(0);
    expect(color.a).toBe(127);
  });
});
