import type { CesiumWidget, Scene, Camera, Clock, Event as CesiumEvent } from 'cesium';

export interface CesiumNavigationOptions {
  /**
   * Enable or disable the compass control
   */
  enableCompass?: boolean;
  
  /**
   * Enable or disable the zoom controls
   */
  enableZoomControls?: boolean;
  
  /**
   * Enable or disable the distance legend
   */
  enableDistanceLegend?: boolean;
  
  /**
   * Units for distance legend (kilometers, meters, miles, etc.)
   */
  units?: string;
  
  /**
   * Default reset view (Rectangle or Cartographic)
   */
  defaultResetView?: any;
  
  /**
   * Custom distance label formatter
   */
  distanceLabelFormatter?: (distance: number, units: string) => string;
}

export interface TerraWrapper {
  scene: Scene;
  camera: Camera;
  clock: Clock;
  cesiumWidget?: CesiumWidget;
  options: CesiumNavigationOptions;
  afterWidgetChanged: CesiumEvent;
  beforeWidgetChanged: CesiumEvent;
  trackedEntity?: any;
}

export interface NavigationControlInterface {
  name: string;
  text?: string;
  svgIcon?: string;
  svgHeight?: number;
  svgWidth?: number;
  cssClass?: string;
  isActive: boolean;
  hasText: boolean;
  terria: TerraWrapper;
  activate(): void;
}
