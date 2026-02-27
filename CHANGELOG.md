# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [6.0.1](https://github.com/brickhouse-tech/cesium-navigation/compare/v6.0.0...v6.0.1) (2026-02-27)


### Bug Fixes

* **ci:** add package-lock.json for npm ci in publish workflow ([1d77e7d](https://github.com/brickhouse-tech/cesium-navigation/commit/1d77e7d7b0994ec449bb3eb055c671b6b429d7c2))

## [6.0.0](https://github.com/brickhouse-tech/cesium-navigation/compare/v1.1.7...v6.0.0) (2026-02-26)


### ⚠ BREAKING CHANGES

* Requires Node >= 20, Cesium >= 1.100

- Converted all source from JS to TypeScript (strict mode)
- Replaced Knockout.js with vanilla reactive state
- Replaced HammerJS with native PointerEvent API
- Replaced LESS with plain CSS
- Replaced Rollup 0.67 + Webpack 4 with Vite
- Replaced Jest 23 with Vitest
- Replaced Babel 6 with native ES modules
- Migrated yarn to npm
- Added GitHub Actions CI (tests, commitlint, release, publish)
- Removed markdown-it (unnecessary for map widget)
- Removed all legacy tooling
- Added FUNDING.yml

### Features

* add examples folder and gh-pages deployment ([1529713](https://github.com/brickhouse-tech/cesium-navigation/commit/1529713599e2797167f258270e5c24a212e3c265))
* modernize to TypeScript, Vite, native ES modules, zero legacy deps ([a52fea3](https://github.com/brickhouse-tech/cesium-navigation/commit/a52fea373893fe7b9ce586e2653883c28c263536)), closes [#1](https://github.com/brickhouse-tech/cesium-navigation/issues/1) [#2](https://github.com/brickhouse-tech/cesium-navigation/issues/2) [#3](https://github.com/brickhouse-tech/cesium-navigation/issues/3) [#11](https://github.com/brickhouse-tech/cesium-navigation/issues/11)
* units, distanceLabelFormatter for handling different units for ([d9a5a41](https://github.com/brickhouse-tech/cesium-navigation/commit/d9a5a413202dfc899ff2659e291321e60893327c))


### Bug Fixes

* **ci:** add @commitlint/cli and @commitlint/config-conventional ([cb0bdf3](https://github.com/brickhouse-tech/cesium-navigation/commit/cb0bdf3f2f53b99057f7f22a0c576ecc5461f3a3))
* **ci:** resolve lint errors and missing deps ([46fbb1f](https://github.com/brickhouse-tech/cesium-navigation/commit/46fbb1f86687a1240884869143bea69481e7d472))
