# @znemz/cesium-navigation

[![npm version](https://img.shields.io/npm/v/@znemz/cesium-navigation.svg)](https://www.npmjs.com/package/@znemz/cesium-navigation)
[![npm downloads](http://img.shields.io/npm/dm/@znemz/cesium-navigation.svg)](https://www.npmjs.com/package/@znemz/cesium-navigation)
[![Build Status](https://img.shields.io/travis/nmccready/cesium-navigation.svg?label=travis-ci)](https://travis-ci.org/nmccready/cesium-navigation)
[![GitHub stars](https://img.shields.io/github/stars/nmccready/cesium-navigation.svg?style=social)](https://github.com/nmccready/cesium-navigation)

**Compass, zoom controls, and distance scale for [CesiumJS](https://cesium.com/) — no RequireJS required.**

A Cesium plugin that adds a user-friendly compass, navigator (zoom in/out), and distance scale to your Cesium map. This fork provides a modern, npm-publishable build that works with webpack, rollup, and other modern bundlers.

![Cesium Navigation Demo](https://cesium.com/images/cesiumjs/cesium-widgets.jpg)

## Install

```bash
npm install @znemz/cesium-navigation
# or
yarn add @znemz/cesium-navigation
```

## Quick Start

```javascript
import { Rectangle, Viewer } from 'cesium';

const viewer = new Viewer('cesiumContainer');

const options = {
  enableCompass: true,
  enableZoomControls: true,
  enableDistanceLegend: true,
  defaultResetView: Rectangle.fromDegrees(71, 3, 90, 14),
};

viewer.extend(window.viewerCesiumNavigationMixin, options);
```

## Features

- **Compass** — visual compass with click-to-reset-north
- **Zoom Controls** — intuitive zoom in/out buttons
- **Distance Legend** — dynamic scale bar with configurable units
- **Lock Controls** — programmatically lock/unlock navigation
- **Customizable Units** — supports all [turf helper units](https://github.com/Turfjs/turf/blob/v5.1.6/packages/turf-helpers/index.d.ts#L20)

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `defaultResetView` | `Cartographic \| Rectangle` | — | Default view when resetting navigation |
| `enableCompass` | `boolean` | `true` | Show/hide compass |
| `enableZoomControls` | `boolean` | `true` | Show/hide zoom controls |
| `enableDistanceLegend` | `boolean` | `true` | Show/hide distance legend |
| `units` | `string` | `'kilometers'` | Distance units (turf helper units) |
| `distanceLabelFormatter` | `function` | — | Custom label: `(distance, units) => string` |

## API

### Destroy

```js
viewer.cesiumNavigation.destroy();
```

### Lock/Unlock Controls

```js
viewer.cesiumNavigation.setNavigationLocked(true);  // lock
viewer.cesiumNavigation.setNavigationLocked(false); // unlock
```

## Development

```bash
yarn install
yarn start   # dev server
yarn build   # production build
```

## Background

Based on navigation UI from [TerriaJS](https://github.com/TerriaJS), adapted to work as a standalone Cesium plugin. The original terriajs code used CommonJS/Browserify — this fork converts everything to work with modern module bundlers.

See the [Examples](./Examples/index.html) directory for working demos.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Sponsor

If you find this project useful, consider [sponsoring @nmccready](https://github.com/sponsors/nmccready) to support ongoing maintenance and development. ❤️

## [License](./LICENSE)
