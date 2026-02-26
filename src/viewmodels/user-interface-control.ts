import { defined, DeveloperError } from 'cesium';
import type { TerraWrapper, NavigationControlInterface } from '../types';

/**
 * Base class for UI controls in the navigation widget
 */
export class UserInterfaceControl implements NavigationControlInterface {
  protected _terria: TerraWrapper;
  
  name: string = 'Unnamed Control';
  text?: string;
  svgIcon?: string;
  svgHeight?: number;
  svgWidth?: number;
  cssClass?: string;
  isActive: boolean = false;

  constructor(terria: TerraWrapper) {
    if (!defined(terria)) {
      throw new DeveloperError('terria is required');
    }
    this._terria = terria;
  }

  get terria(): TerraWrapper {
    return this._terria;
  }

  get hasText(): boolean {
    return defined(this.text) && typeof this.text === 'string';
  }

  activate(): void {
    throw new DeveloperError('activate must be implemented in the derived class.');
  }
}
