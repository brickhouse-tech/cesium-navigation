import {
  defined,
  Math as CesiumMath,
  EventHelper,
  SceneMode,
  Cartesian2,
  Cartesian3,
  BoundingSphere,
  HeadingPitchRange
} from 'cesium';
import { ResetViewNavigationControl } from './reset-view-navigation-control';
import { ZoomNavigationControl } from './zoom-navigation-control';
import { svgCompassOuterRing } from '../svgpaths/compass-outer-ring';
import { svgCompassGyro } from '../svgpaths/compass-gyro';
import * as Utils from '../core/utils';
import type { TerraWrapper, NavigationControlInterface } from '../types';

const vectorScratch = new Cartesian2();
const centerScratch = new Cartesian3();

/**
 * View model for the navigation widget (compass and controls)
 */
export class NavigationViewModel {
  terria: TerraWrapper;
  private eventHelper: EventHelper;
  enableZoomControls: boolean;
  enableCompass: boolean;
  navigationLocked: boolean = false;
  
  controls: NavigationControlInterface[];
  showCompass: boolean;
  heading: number = 0.0;
  
  private _unsubscribeFromPostRender?: () => void;

  constructor(options: {
    terria: TerraWrapper;
    enableZoomControls?: boolean;
    enableCompass?: boolean;
    controls?: NavigationControlInterface[];
  }) {
    this.terria = options.terria;
    this.eventHelper = new EventHelper();
    this.enableZoomControls = options.enableZoomControls !== false;
    this.enableCompass = options.enableCompass !== false;

    this.controls = options.controls || [
      new ZoomNavigationControl(this.terria, true),
      new ResetViewNavigationControl(this.terria),
      new ZoomNavigationControl(this.terria, false)
    ];

    this.showCompass = defined(this.terria) && this.enableCompass;
    this.heading = this.showCompass ? this.terria.scene.camera.heading : 0.0;

    this.eventHelper.add(this.terria.afterWidgetChanged, this.widgetChange.bind(this));
    this.widgetChange();
  }

  setNavigationLocked(locked: boolean): void {
    this.navigationLocked = locked;
    if (this.controls && this.controls.length > 1) {
      const resetControl = this.controls[1] as ResetViewNavigationControl;
      if (resetControl.setNavigationLocked) {
        resetControl.setNavigationLocked(this.navigationLocked);
      }
    }
  }

  private widgetChange(): void {
    if (defined(this.terria)) {
      if (this._unsubscribeFromPostRender) {
        this._unsubscribeFromPostRender();
        this._unsubscribeFromPostRender = undefined;
      }

      this.showCompass = this.enableCompass;

      this._unsubscribeFromPostRender = this.terria.scene.postRender.addEventListener(() => {
        this.heading = this.terria.scene.camera.heading;
        this.updateDOM();
      });
    } else {
      if (this._unsubscribeFromPostRender) {
        this._unsubscribeFromPostRender();
        this._unsubscribeFromPostRender = undefined;
      }
      this.showCompass = false;
    }
  }

  destroy(): void {
    this.eventHelper.removeAll();
    if (this._unsubscribeFromPostRender) {
      this._unsubscribeFromPostRender();
    }
  }

  show(container: HTMLElement): void {
    const compassDisplay = this.showCompass && this.enableCompass ? 'block' : 'none';
    const controlsDisplay = this.enableZoomControls ? 'block' : 'none';
    
    const html = `
      <div class="compass" style="display: ${compassDisplay};" title="Drag outer ring: rotate view. Drag inner gyroscope: free orbit. Double-click: reset view.">
        <div class="compass-outer-ring-background"></div>
        <div class="compass-rotation-marker" style="display: none; transform: rotate(0rad);"></div>
        <div class="compass-outer-ring" title="Click and drag to rotate the camera">
          <svg width="145" height="145" viewBox="0 0 145 145"><path d="${svgCompassOuterRing}" fill="rgba(255,255,255,0.5)"></path></svg>
        </div>
        <div class="compass-gyro-background"></div>
        <div class="compass-gyro">
          <svg width="145" height="145" viewBox="0 0 145 145"><path d="${svgCompassGyro}" fill="#CCC"></path></svg>
        </div>
      </div>
      <div class="navigation-controls" style="display: ${controlsDisplay};"></div>
    `;
    
    const temp = document.createElement('div');
    temp.innerHTML = html;
    while (temp.firstChild) {
      container.appendChild(temp.firstChild);
    }

    // Set up event listeners
    const compassEl = container.querySelector('.compass') as HTMLElement;
    if (compassEl) {
      compassEl.addEventListener('pointerdown', (e) => this.handleMouseDown(e));
      compassEl.addEventListener('dblclick', () => this.handleDoubleClick());
    }

    // Render controls
    const controlsContainer = container.querySelector('.navigation-controls') as HTMLElement;
    if (controlsContainer && this.controls) {
      this.controls.forEach((control, index) => {
        const isLast = index === this.controls.length - 1;
        const controlEl = document.createElement('div');
        controlEl.className = isLast ? 'navigation-control-last' : 'navigation-control';
        controlEl.title = control.name;
        
        if (control.hasText && control.text) {
          const textEl = document.createElement('div');
          textEl.textContent = control.text;
          textEl.className = control.cssClass || '';
          controlEl.appendChild(textEl);
        } else if (control.svgIcon) {
          const iconEl = document.createElement('div');
          iconEl.className = control.cssClass || '';
          iconEl.innerHTML = `<svg width="${control.svgWidth}" height="${control.svgHeight}" viewBox="0 0 ${control.svgWidth} ${control.svgHeight}"><path d="${control.svgIcon}"></path></svg>`;
          controlEl.appendChild(iconEl);
        }
        
        controlEl.addEventListener('click', () => control.activate());
        controlsContainer.appendChild(controlEl);
      });
    }
  }

  handleMouseDown(e: MouseEvent | PointerEvent): boolean {
    const { scene } = this.terria;
    if (scene.mode === SceneMode.MORPHING || this.navigationLocked) {
      return true;
    }

    const compassElement = e.currentTarget as HTMLElement;
    const compassRectangle = compassElement.getBoundingClientRect();
    const maxDistance = compassRectangle.width / 2.0;
    const center = new Cartesian2(
      (compassRectangle.right - compassRectangle.left) / 2.0,
      (compassRectangle.bottom - compassRectangle.top) / 2.0
    );
    const clickLocation = new Cartesian2(
      e.clientX - compassRectangle.left,
      e.clientY - compassRectangle.top
    );
    const vector = Cartesian2.subtract(clickLocation, center, vectorScratch);
    const distanceFromCenter = Cartesian2.magnitude(vector);
    const distanceFraction = distanceFromCenter / maxDistance;

    const nominalTotalRadius = 145;
    const normalGyroRadius = 50;

    if (distanceFraction < normalGyroRadius / nominalTotalRadius) {
      // Orbit gesture - simplified implementation
      e.preventDefault();
      return false;
    } else if (distanceFraction < 1.0) {
      // Rotate gesture - simplified implementation
      e.preventDefault();
      return false;
    }
    
    return true;
  }

  handleDoubleClick(): boolean {
    const { scene } = this.terria;
    const { camera } = scene;
    const sscc = scene.screenSpaceCameraController;

    if (scene.mode === SceneMode.MORPHING || !sscc.enableInputs || this.navigationLocked) {
      return true;
    }

    const center = Utils.getCameraFocus(this.terria, true, centerScratch);

    if (!defined(center)) {
      // Reset to home view
      if (this.controls && this.controls.length > 1) {
        const resetControl = this.controls[1] as ResetViewNavigationControl;
        resetControl.activate();
      }
      return false;
    }

    const cameraPosition = scene.globe.ellipsoid.cartographicToCartesian(
      camera.positionCartographic,
      new Cartesian3()
    );
    const surfaceNormal = scene.globe.ellipsoid.geodeticSurfaceNormal(center);
    const focusBoundingSphere = new BoundingSphere(center, 0);

    camera.flyToBoundingSphere(focusBoundingSphere, {
      offset: new HeadingPitchRange(
        0,
        CesiumMath.PI_OVER_TWO - Cartesian3.angleBetween(surfaceNormal, camera.directionWC),
        Cartesian3.distance(cameraPosition, center)
      ),
      duration: 1.5
    });

    return false;
  }

  isLastControl(control: NavigationControlInterface): boolean {
    return control === this.controls[this.controls.length - 1];
  }

  private updateDOM(): void {
    // Update compass rotation
    const outerRing = document.querySelector('.compass-outer-ring') as HTMLElement;
    if (outerRing) {
      outerRing.style.transform = `rotate(-${this.heading}rad)`;
    }
  }

  static create(options: {
    container: HTMLElement;
    terria: TerraWrapper;
    enableZoomControls?: boolean;
    enableCompass?: boolean;
  }): NavigationViewModel {
    const result = new NavigationViewModel(options);
    result.show(options.container);
    return result;
  }
}
