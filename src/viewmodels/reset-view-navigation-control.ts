import { defined, Camera, Rectangle, Cartographic } from 'cesium';
import { NavigationControl } from './navigation-control';
import { svgReset } from '../svgpaths/reset';
import type { TerraWrapper } from '../types';

/**
 * Navigation control for resetting the view
 */
export class ResetViewNavigationControl extends NavigationControl {
  navigationLocked: boolean = false;

  constructor(terria: TerraWrapper) {
    super(terria);
    
    this.name = 'Reset View';
    this.svgIcon = svgReset;
    this.svgHeight = 15;
    this.svgWidth = 15;
    this.cssClass = 'navigation-control-icon-reset';
  }

  setNavigationLocked(locked: boolean): void {
    this.navigationLocked = locked;
  }

  activate(): void {
    this.resetView();
  }

  private resetView(): void {
    if (this.navigationLocked) {
      return;
    }

    const { scene } = this.terria;
    const sscc = scene.screenSpaceCameraController;
    
    if (!sscc.enableInputs) {
      return;
    }

    this.isActive = true;

    const { camera } = scene;

    if (defined(this.terria.trackedEntity)) {
      // When tracking an entity, re-set the tracked entity to reset to its default view
      const { trackedEntity } = this.terria;
      this.terria.trackedEntity = undefined;
      this.terria.trackedEntity = trackedEntity;
    } else {
      // Reset to default position or view defined in options
      if (this.terria.options.defaultResetView) {
        if (this.terria.options.defaultResetView instanceof Cartographic) {
          camera.flyTo({
            destination: scene.globe.ellipsoid.cartographicToCartesian(
              this.terria.options.defaultResetView
            )
          });
        } else if (this.terria.options.defaultResetView instanceof Rectangle) {
          camera.flyTo({
            destination: this.terria.options.defaultResetView
          });
        }
      } else if (typeof (camera as any).flyHome === 'function') {
        (camera as any).flyHome(1);
      } else {
        camera.flyTo({
          destination: Camera.DEFAULT_VIEW_RECTANGLE,
          duration: 1
        });
      }
    }
    
    this.isActive = false;
  }
}
