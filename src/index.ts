/**
 * @znemz/cesium-navigation
 * 
 * Cesium plugin that adds compass, navigator (zoom), and distance scale to the map
 */

export { CesiumNavigation } from './cesium-navigation';
export { viewerCesiumNavigationMixin } from './viewer-cesium-navigation-mixin';
export type { CesiumNavigationOptions } from './types';
export type { ViewerWithCesiumNavigation, CesiumWidgetWithCesiumNavigation } from './viewer-cesium-navigation-mixin';

// Re-export as default for backwards compatibility
export { viewerCesiumNavigationMixin as default } from './viewer-cesium-navigation-mixin';
