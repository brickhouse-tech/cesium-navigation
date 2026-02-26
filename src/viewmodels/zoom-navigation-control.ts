import {
  defined,
  Ray,
  IntersectionTests,
  Cartesian3,
  SceneMode
} from 'cesium';
import { NavigationControl } from './navigation-control';
import * as Utils from '../core/utils';
import type { TerraWrapper } from '../types';

const cartesian3Scratch = new Cartesian3();

/**
 * Navigation control for zooming in/out
 */
export class ZoomNavigationControl extends NavigationControl {
  relativeAmount: number = 1;

  constructor(terria: TerraWrapper, zoomIn: boolean) {
    super(terria);
    
    this.name = `Zoom ${zoomIn ? 'In' : 'Out'}`;
    this.text = zoomIn ? '+' : '-';
    this.cssClass = `navigation-control-icon-zoom-${zoomIn ? 'in' : 'out'}`;
    
    this.relativeAmount = 2;
    if (zoomIn) {
      // Ensure zooming in is inverse of zooming out
      this.relativeAmount = 1 / this.relativeAmount;
    }
  }

  activate(): void {
    this.zoom(this.relativeAmount);
  }

  private zoom(relativeAmount: number): void {
    this.isActive = true;

    if (defined(this.terria)) {
      const { scene } = this.terria;
      const sscc = scene.screenSpaceCameraController;
      
      // Do not zoom if disabled
      if (!sscc.enableInputs || !sscc.enableZoom) {
        return;
      }

      const { camera } = scene;
      let orientation: Record<string, unknown>;

      switch (scene.mode) {
        case SceneMode.MORPHING:
          break;
          
        case SceneMode.SCENE2D:
          camera.zoomIn(
            camera.positionCartographic.height * (1 - this.relativeAmount)
          );
          break;
          
        default: {
          let focus: Cartesian3 | undefined;

          if (defined(this.terria.trackedEntity)) {
            focus = new Cartesian3();
          } else {
            focus = Utils.getCameraFocus(this.terria, false);
          }

          if (!defined(focus)) {
            // Camera not pointing at globe, use ellipsoid horizon point
            const ray = new Ray(
              camera.worldToCameraCoordinatesPoint(
                scene.globe.ellipsoid.cartographicToCartesian(
                  camera.positionCartographic
                )
              ),
              camera.directionWC
            );
            focus = IntersectionTests.grazingAltitudeLocation(
              ray,
              scene.globe.ellipsoid
            );

            orientation = {
              heading: camera.heading,
              pitch: camera.pitch,
              roll: camera.roll
            };
          } else {
            orientation = {
              direction: camera.direction,
              up: camera.up
            };
          }

          const direction = Cartesian3.subtract(
            camera.position,
            focus,
            cartesian3Scratch
          );
          const movementVector = Cartesian3.multiplyByScalar(
            direction,
            relativeAmount,
            direction
          );
          const endPosition = Cartesian3.add(focus, movementVector, focus);

          if (
            defined(this.terria.trackedEntity) ||
            scene.mode === SceneMode.COLUMBUS_VIEW
          ) {
            // Set position directly without animation
            camera.position = endPosition;
          } else {
            camera.flyTo({
              destination: endPosition,
              orientation,
              duration: 0.5,
              convert: false
            });
          }
        }
      }
    }

    this.isActive = false;
  }
}
