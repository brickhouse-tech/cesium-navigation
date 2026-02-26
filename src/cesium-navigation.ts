import { defined, DeveloperError, Event as CesiumEvent } from 'cesium';
import type { Viewer, CesiumWidget } from 'cesium';
import { DistanceLegendViewModel } from './viewmodels/distance-legend-view-model';
import { NavigationViewModel } from './viewmodels/navigation-view-model';
import type { CesiumNavigationOptions, TerraWrapper } from './types';
import './styles/cesium-navigation.css';

/**
 * Main CesiumNavigation plugin class
 */
export class CesiumNavigation {
  distanceLegendViewModel?: DistanceLegendViewModel;
  navigationViewModel?: NavigationViewModel;
  navigationDiv?: HTMLElement;
  distanceLegendDiv?: HTMLElement;
  terria: TerraWrapper;
  container: HTMLElement;
  
  private _onDestroyListeners: Array<() => void> = [];
  private _navigationLocked: boolean = false;

  constructor(viewerCesiumWidget: Viewer | CesiumWidget, options: CesiumNavigationOptions = {}) {
    if (!defined(viewerCesiumWidget)) {
      throw new DeveloperError('CesiumWidget or Viewer is required.');
    }

    const cesiumWidget = 'cesiumWidget' in viewerCesiumWidget
      ? viewerCesiumWidget.cesiumWidget
      : viewerCesiumWidget;

    const container = document.createElement('div');
    container.className = 'cesium-widget-cesiumNavigationContainer';
    cesiumWidget.container.appendChild(container);

    // Create terria wrapper
    this.terria = {
      scene: cesiumWidget.scene,
      camera: cesiumWidget.scene.camera,
      clock: cesiumWidget.clock,
      cesiumWidget,
      options,
      afterWidgetChanged: new CesiumEvent(),
      beforeWidgetChanged: new CesiumEvent(),
      trackedEntity: 'trackedEntity' in viewerCesiumWidget ? (viewerCesiumWidget as Viewer).trackedEntity : undefined
    };
    
    this.container = container;

    // Create distance legend
    if (options.enableDistanceLegend !== false) {
      this.distanceLegendDiv = document.createElement('div');
      container.appendChild(this.distanceLegendDiv);
      this.distanceLegendDiv.setAttribute('id', 'distanceLegendDiv');
      
      this.distanceLegendViewModel = DistanceLegendViewModel.create({
        ...options,
        container: this.distanceLegendDiv,
        terria: this.terria,
        enableDistanceLegend: true
      });
    }

    // Create navigation controls
    if (
      (options.enableZoomControls !== false) ||
      (options.enableCompass !== false)
    ) {
      this.navigationDiv = document.createElement('div');
      this.navigationDiv.setAttribute('id', 'navigationDiv');
      container.appendChild(this.navigationDiv);
      
      this.navigationViewModel = NavigationViewModel.create({
        container: this.navigationDiv,
        terria: this.terria,
        enableZoomControls: options.enableZoomControls !== false,
        enableCompass: options.enableCompass !== false
      });
    }
  }

  setNavigationLocked(locked: boolean): void {
    this._navigationLocked = locked;
    if (this.navigationViewModel) {
      this.navigationViewModel.setNavigationLocked(this._navigationLocked);
    }
  }

  getNavigationLocked(): boolean {
    return this._navigationLocked;
  }

  destroy(): void {
    if (defined(this.navigationViewModel)) {
      this.navigationViewModel.destroy();
    }
    
    if (defined(this.distanceLegendViewModel)) {
      this.distanceLegendViewModel.destroy();
    }

    if (defined(this.navigationDiv)) {
      this.navigationDiv.parentNode?.removeChild(this.navigationDiv);
      delete (this as any).navigationDiv;
    }

    if (defined(this.distanceLegendDiv)) {
      this.distanceLegendDiv.parentNode?.removeChild(this.distanceLegendDiv);
      delete (this as any).distanceLegendDiv;
    }

    if (defined(this.container)) {
      this.container.parentNode?.removeChild(this.container);
      delete (this as any).container;
    }

    for (const listener of this._onDestroyListeners) {
      listener();
    }
  }

  addOnDestroyListener(callback: () => void): void {
    if (typeof callback === 'function') {
      this._onDestroyListeners.push(callback);
    }
  }
}

export default CesiumNavigation;
