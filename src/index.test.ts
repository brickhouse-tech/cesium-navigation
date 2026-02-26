import { describe, it, expect } from 'vitest';
import { CesiumNavigation } from './cesium-navigation';

describe('CesiumNavigation', () => {
  it('should export CesiumNavigation class', () => {
    expect(CesiumNavigation).toBeDefined();
    expect(typeof CesiumNavigation).toBe('function');
  });
});
