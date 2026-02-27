# @znemz/cesium-navigation

[![npm version](https://badge.fury.io/js/%40znemz%2Fcesium-navigation.svg)](https://www.npmjs.com/package/@znemz/cesium-navigation)
[![tests](https://github.com/brickhouse-tech/cesium-navigation/actions/workflows/tests.yml/badge.svg)](https://github.com/brickhouse-tech/cesium-navigation/actions/workflows/tests.yml)

Cesium plugin that adds compass, navigator (zoom controls), and distance scale widgets to the map.

**v6.X** — Fully modernized with TypeScript, Vite, and zero legacy dependencies!

## Features

- 🧭 **Compass** - Interactive compass for rotation and orientation
- 🔍 **Zoom Controls** - In/out zoom buttons
- 📏 **Distance Scale** - Dynamic distance legend
- 🎯 **Reset View** - One-click return to default view
- 📱 **Responsive** - Works on desktop and mobile
- 🎨 **Customizable** - Configure which controls to display
- 💪 **TypeScript** - Full type safety
- 🌲 **Tree-shakeable** - ES modules with zero runtime dependencies

## Breaking Changes from v4.x

- **Requires Node >= 20**
- **Requires Cesium >= 1.100**
- Removed all legacy dependencies (Knockout.js, HammerJS, markdown-it)
- Native ES modules only (no CommonJS)
- TypeScript-first API
- Removed `browser_` field from package.json

## Installation

```bash
npm install @znemz/cesium-navigation cesium
```

## Usage

### ES Modules (Vite, webpack 5+)

```typescript
import * as Cesium from 'cesium';
import { viewerCesiumNavigationMixin } from '@znemz/cesium-navigation';
import '@znemz/cesium-navigation/style.css';

const viewer = new Cesium.Viewer('cesiumContainer');
viewer.extend(viewerCesiumNavigationMixin, {
  enableCompass: true,
  enableZoomControls: true,
  enableDistanceLegend: true,
  units: 'kilometers' // or 'miles', 'meters', etc.
});
```

### Direct instantiation

```typescript
import { CesiumNavigation } from '@znemz/cesium-navigation';
import '@znemz/cesium-navigation/style.css';

const viewer = new Cesium.Viewer('cesiumContainer');
const navigation = new CesiumNavigation(viewer, {
  enableCompass: true,
  enableZoomControls: true,
  enableDistanceLegend: true,
  units: 'kilometers',
  defaultResetView: Cesium.Rectangle.fromDegrees(-180, -90, 180, 90)
});

// Later, clean up
navigation.destroy();
```

### TypeScript

Full TypeScript support with strict types:

```typescript
import type { ViewerWithCesiumNavigation } from '@znemz/cesium-navigation';

const viewer = new Cesium.Viewer('cesiumContainer') as ViewerWithCesiumNavigation;
viewer.extend(viewerCesiumNavigationMixin);

// Type-safe access
viewer.cesiumNavigation.setNavigationLocked(true);
```

## Configuration Options

```typescript
interface CesiumNavigationOptions {
  /** Enable or disable the compass control (default: true) */
  enableCompass?: boolean;
  
  /** Enable or disable the zoom controls (default: true) */
  enableZoomControls?: boolean;
  
  /** Enable or disable the distance legend (default: true) */
  enableDistanceLegend?: boolean;
  
  /** Units for distance legend (default: 'kilometers') */
  units?: 'kilometers' | 'meters' | 'miles' | 'feet' | string;
  
  /** Default reset view (Rectangle or Cartographic) */
  defaultResetView?: Cesium.Rectangle | Cesium.Cartographic;
  
  /** Custom distance label formatter */
  distanceLabelFormatter?: (distance: number, units: string) => string;
}
```

## Bundler Setup

### Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import cesium from 'vite-plugin-cesium';

export default defineConfig({
  plugins: [cesium()]
});
```

### Webpack 5

```javascript
// webpack.config.js
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

module.exports = {
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'node_modules/cesium/Build/Cesium/Workers',
          to: 'cesium/Workers'
        },
        {
          from: 'node_modules/cesium/Build/Cesium/ThirdParty',
          to: 'cesium/ThirdParty'
        },
        {
          from: 'node_modules/cesium/Build/Cesium/Assets',
          to: 'cesium/Assets'
        },
        {
          from: 'node_modules/cesium/Build/Cesium/Widgets',
          to: 'cesium/Widgets'
        }
      ]
    }),
    new webpack.DefinePlugin({
      CESIUM_BASE_URL: JSON.stringify('/cesium')
    })
  ]
};
```

## Development

```bash
# Install dependencies
npm install

# Run type checking
npm run type-check

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint
npm run lint:fix
```

## Migration from v4.x

The API surface is largely the same, but with modernized internals:

**Before (v4.x):**
```javascript
const viewer = new Cesium.Viewer('cesiumContainer');
viewer.extend(viewerCesiumNavigationMixin);
```

**After (v5.x):**
```typescript
import { viewerCesiumNavigationMixin } from '@znemz/cesium-navigation';
import '@znemz/cesium-navigation/style.css';

const viewer = new Cesium.Viewer('cesiumContainer');
viewer.extend(viewerCesiumNavigationMixin);
```

## License

Apache-2.0

## Credits

- Original author: Alberto Acevedo
- Maintainer: Nick McCready (@nmccready)
- Sponsor: [Brickhouse Technologies](https://github.com/brickhouse-tech)

## Contributing

Issues and pull requests welcome! Please use conventional commits for commit messages.
