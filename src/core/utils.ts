import { Cartesian3, Cartographic, defined, Ray, SceneMode } from 'cesium';

export interface CesiumViewer {
  scene: any;
  camera: any;
  clock?: any;
  cesiumWidget?: any;
}

/**
 * Gets the focus point of the camera.
 * @param viewer The Cesium viewer instance
 * @param inWorldCoordinates Whether to return in world coordinates
 * @param result Optional result parameter
 * @returns The camera focus point
 */
export function getCameraFocus(viewer: CesiumViewer, inWorldCoordinates: boolean, result?: Cartesian3): Cartesian3 | undefined {
  const { scene } = viewer;
  const { camera } = scene;

  if (scene.mode === SceneMode.MORPHING) {
    return undefined;
  }

  const rayScratch = new Ray();
  rayScratch.origin = camera.positionWC;
  rayScratch.direction = camera.directionWC;

  const center = scene.globe.pick(rayScratch, scene, result);

  if (!defined(center)) {
    return undefined;
  }

  if (inWorldCoordinates) {
    return center;
  }

  return scene.globe.ellipsoid.cartesianToCartographic(center, new Cartographic());
}

/**
 * Formats a distance label based on the value and units.
 * @param distanceValue The distance value
 * @param units The units (kilometers, meters, miles, etc.)
 * @returns Formatted label string
 */
export function distanceLabelFormatter(distanceValue: number, units: string): string {
  if (distanceValue > 1) {
    return `${Math.round(distanceValue)} ${units}`;
  }
  
  if (distanceValue > 0.01) {
    return `${distanceValue.toFixed(2)} ${units}`;
  }
  
  return `${distanceValue.toExponential(2)} ${units}`;
}
