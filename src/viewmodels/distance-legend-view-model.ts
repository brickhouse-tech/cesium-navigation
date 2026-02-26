import {
  defined,
  DeveloperError,
  EllipsoidGeodesic,
  Cartesian2,
  getTimestamp,
  EventHelper
} from 'cesium';
import * as utils from '../core/utils';
import type { CesiumNavigationOptions, TerraWrapper } from '../types';

type Units = 'meters' | 'kilometers' | 'miles' | 'feet' | 'nauticalmiles';

const UNIT_FACTORS: Record<Units, number> = {
  meters: 1,
  kilometers: 0.001,
  miles: 0.000621371,
  feet: 3.28084,
  nauticalmiles: 0.000539957,
};

function convertLength(value: number, from: Units, to: Units): number {
  const meters = value / UNIT_FACTORS[from];
  return meters * UNIT_FACTORS[to];
}

const geodesic = new EllipsoidGeodesic();

const distances = [
  1, 2, 3, 5, 10, 20, 30, 50, 100, 200, 300, 500, 1000, 2000, 3000, 5000,
  10000, 20000, 30000, 50000, 100000, 200000, 300000, 500000, 1000000,
  2000000, 3000000, 5000000, 10000000, 20000000, 30000000, 50000000
];

/**
 * View model for the distance legend widget
 */
export class DistanceLegendViewModel {
  terria: TerraWrapper;
  private eventHelper: EventHelper;
  private _removeSubscription?: () => void;
  private _lastLegendUpdate: number = 0;
  
  distanceLabel?: string;
  barWidth?: number;
  enableDistanceLegend: boolean;
  container: HTMLElement;
  
  private distanceLabelElement?: HTMLElement;
  private barElement?: HTMLElement;
  private options: CesiumNavigationOptions;

  constructor(options: CesiumNavigationOptions & { container: HTMLElement; terria: TerraWrapper }) {
    if (!defined(options) || !defined(options.terria)) {
      throw new DeveloperError('options.terria is required.');
    }

    this.terria = options.terria;
    this.container = options.container;
    this.options = options;
    this.eventHelper = new EventHelper();
    this.enableDistanceLegend = options.enableDistanceLegend !== false;

    this.eventHelper.add(this.terria.afterWidgetChanged, () => {
      if (defined(this._removeSubscription)) {
        this._removeSubscription();
        this._removeSubscription = undefined;
      }
    });

    this.addUpdateSubscription();
    
    this.eventHelper.add(this.terria.afterWidgetChanged, () => {
      this.addUpdateSubscription();
    });
  }

  private addUpdateSubscription(): void {
    if (defined(this.terria)) {
      const { scene } = this.terria;
      this._removeSubscription = scene.postRender.addEventListener(() => {
        this.updateDistanceLegend();
      });
    }
  }

  destroy(): void {
    this.eventHelper.removeAll();
    if (this._removeSubscription) {
      this._removeSubscription();
    }
  }

  show(container: HTMLElement): void {
    const visibility = this.enableDistanceLegend ? 'visible' : 'none';
    const html = `
      <div class="distance-legend" style="display: ${visibility};">
        <div class="distance-legend-label"></div>
        <div class="distance-legend-scale-bar" style="width: 0px; left: 5px;"></div>
      </div>
    `;
    
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const element = temp.firstElementChild as HTMLElement;
    container.appendChild(element);
    
    this.distanceLabelElement = element.querySelector('.distance-legend-label') as HTMLElement;
    this.barElement = element.querySelector('.distance-legend-scale-bar') as HTMLElement;
  }

  private updateDistanceLegend(): void {
    if (!this.enableDistanceLegend) {
      this.barWidth = undefined;
      this.distanceLabel = undefined;
      return;
    }

    const now = getTimestamp();
    if (now < this._lastLegendUpdate + 250) {
      return;
    }

    this._lastLegendUpdate = now;

    const { scene } = this.terria;
    const width = scene.canvas.clientWidth;
    const height = scene.canvas.clientHeight;

    const left = scene.camera.getPickRay(
      new Cartesian2((width / 2) | 0, height - 1)
    );
    const right = scene.camera.getPickRay(
      new Cartesian2((1 + width / 2) | 0, height - 1)
    );

    if (!defined(left) || !defined(right)) {
      this.barWidth = undefined;
      this.distanceLabel = undefined;
      this.updateDOM();
      return;
    }

    const { globe } = scene;
    const leftPosition = globe.pick(left, scene);
    const rightPosition = globe.pick(right, scene);

    if (!defined(leftPosition) || !defined(rightPosition)) {
      this.barWidth = undefined;
      this.distanceLabel = undefined;
      this.updateDOM();
      return;
    }

    const leftCartographic = globe.ellipsoid.cartesianToCartographic(leftPosition);
    const rightCartographic = globe.ellipsoid.cartesianToCartographic(rightPosition);

    if (!defined(leftCartographic) || !defined(rightCartographic)) {
      this.barWidth = undefined;
      this.distanceLabel = undefined;
      this.updateDOM();
      return;
    }

    geodesic.setEndPoints(leftCartographic, rightCartographic);
    const pixelDistance = geodesic.surfaceDistance;

    const maxBarWidth = 100;
    let distance: number | undefined;
    
    for (let i = distances.length - 1; !defined(distance) && i >= 0; --i) {
      const currentDistance = distances[i];
      if (currentDistance && currentDistance / pixelDistance < maxBarWidth) {
        distance = currentDistance;
      }
    }

    if (distance !== undefined) {
      const units = this.options.units || 'kilometers';
      const convertedDistance = convertLength(distance, 'meters', units as Units);
      const formatter = this.options.distanceLabelFormatter || utils.distanceLabelFormatter;
      const label = formatter(convertedDistance, units);

      this.barWidth = (distance / pixelDistance) | 0;
      this.distanceLabel = label;
    } else {
      this.barWidth = undefined;
      this.distanceLabel = undefined;
    }

    this.updateDOM();
  }

  private updateDOM(): void {
    if (this.distanceLabelElement && this.barElement) {
      const parentElement = this.distanceLabelElement.parentElement;
      if (this.distanceLabel && this.barWidth && parentElement) {
        this.distanceLabelElement.textContent = this.distanceLabel;
        parentElement.style.display = '';
        this.barElement.style.width = `${this.barWidth}px`;
        this.barElement.style.left = `${5 + (125 - this.barWidth) / 2}px`;
      } else if (parentElement) {
        parentElement.style.display = 'none';
      }
    }
  }

  static create(options: CesiumNavigationOptions & { container: HTMLElement; terria: TerraWrapper }): DistanceLegendViewModel {
    const result = new DistanceLegendViewModel(options);
    result.show(options.container);
    return result;
  }
}
