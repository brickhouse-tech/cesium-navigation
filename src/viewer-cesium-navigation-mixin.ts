import { defined, DeveloperError } from 'cesium';
import type { Viewer, CesiumWidget } from 'cesium';
import { CesiumNavigation } from './cesium-navigation';
import type { CesiumNavigationOptions } from './types';
import './styles/cesium-navigation.css';

/**
 * Viewer/CesiumWidget extended with cesiumNavigation property
 */
export interface ViewerWithCesiumNavigation extends Viewer {
  cesiumNavigation: CesiumNavigation;
}

export interface CesiumWidgetWithCesiumNavigation extends CesiumWidget {
  cesiumNavigation: CesiumNavigation;
}

/**
 * Initialize the navigation widget
 */
function init(viewerCesiumWidget: Viewer | CesiumWidget, options?: CesiumNavigationOptions): CesiumNavigation {
  const cesiumNavigation = new CesiumNavigation(viewerCesiumWidget, options);

  const cesiumWidget = 'cesiumWidget' in viewerCesiumWidget
    ? viewerCesiumWidget.cesiumWidget
    : viewerCesiumWidget;

  Object.defineProperty(cesiumWidget, 'cesiumNavigation', {
    configurable: true,
    get: () => cesiumNavigation
  });

  cesiumNavigation.addOnDestroyListener(() => {
    const widget = cesiumWidget as any;
    delete widget.cesiumNavigation;
  });

  return cesiumNavigation;
}

/**
 * A mixin which adds the Compass/Navigation widget to the Viewer widget.
 * Rather than being called directly, this function is normally passed as
 * a parameter to {@link Viewer#extend}, as shown in the example below.
 *
 * @param viewer The viewer instance
 * @param options The options
 *
 * @example
 * const viewer = new Cesium.Viewer('cesiumContainer');
 * viewer.extend(viewerCesiumNavigationMixin);
 */
export function viewerCesiumNavigationMixin(viewer: Viewer, options?: CesiumNavigationOptions): void {
  if (!defined(viewer)) {
    throw new DeveloperError('viewer is required.');
  }

  const cesiumNavigation = init(viewer, options);

  cesiumNavigation.addOnDestroyListener(() => {
    delete (viewer as any).cesiumNavigation;
  });

  Object.defineProperty(viewer, 'cesiumNavigation', {
    configurable: true,
    get: () => (viewer.cesiumWidget as CesiumWidgetWithCesiumNavigation).cesiumNavigation
  });
}

/**
 * Mixin for CesiumWidget
 */
viewerCesiumNavigationMixin.mixinWidget = (
  cesiumWidget: CesiumWidget,
  options?: CesiumNavigationOptions
): CesiumNavigation => {
  return init(cesiumWidget, options);
};

export default viewerCesiumNavigationMixin;
