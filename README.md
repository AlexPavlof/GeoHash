# GeoHash

[![NPM Version][npm-image]][npm-url] [![Build status][build-image]][build-url] [![Coverage status][coverage-image]][coverage-url] [![Dependency Status][david-image]][david-url] [![devDependency Status][david-dev-image]][david-dev-url] [![GitHub license][license-image]][license-url]

Geohash is a public domain geocoding system invented by Gustavo Niemeyer, which encodes a geographic location into a short string of letters and digits. It is a hierarchical spatial data structure which subdivides space into buckets of grid shape, which is one of the many applications of what is known as a Z-order curve, and generally space-filling curves.

Geohashes offer properties like arbitrary precision and the possibility of gradually removing characters from the end of the code to reduce its size (and gradually lose precision). As a consequence of the gradual precision degradation, nearby places will often (but not always) present similar prefixes. The longer a shared prefix is, the closer the two places are.

Read more on [Wikipedia](https://en.wikipedia.org/wiki/Geohash).

## Usage

### Standalone version

Include <code>geohash.min.js</code> which you can find in the build folder.

```html
<script src="dist/geohash-js/geohash.min.js"></script>
```

Now you can use library

```javascript
var hashedValue = geohash.encode(52.372518, 4.896977);
```

### Usage as module

#### Installation

With npm

``` bash
$ npm install @alexpavlov/geohash-js
```

or with yarn

``` bash
$ yarn add @alexpavlov/geohash-js
```

#### Add to your module

CommonJS

```javascript
var encode = require('@alexpavlov/geohash-js/build/geohash.umd').encode;

var hashedValue = encode(52.372518, 4.896977);
```
ES2015

```javascript
import { encode } from '@alexpavlov/geohash-js/build/geohash.umd';

let hashedValue = encode(52.372518, 4.896977);
```

## License

[MIT](http://opensource.org/licenses/MIT)

[npm-url]: https://www.npmjs.com/package/@alexpavlov/geohash-js
[npm-image]: https://img.shields.io/npm/v/@alexpavlov/geohash-js.svg
[david-url]: https://david-dm.org/AlexPavlof/GeoHash#info=dependencies
[david-image]: https://img.shields.io/david/AlexPavlof/GeoHash.svg
[david-dev-url]: https://david-dm.org/AlexPavlof/GeoHash#info=devDependencies
[david-dev-image]: https://img.shields.io/david/dev/AlexPavlof/GeoHash.svg
[build-url]: https://circleci.com/gh/AlexPavlof/GeoHash/tree/master
[build-image]: https://img.shields.io/circleci/project/AlexPavlof/GeoHash/master.svg
[coverage-url]: https://codecov.io/github/AlexPavlof/GeoHash?branch=master
[coverage-image]: https://img.shields.io/codecov/c/github/AlexPavlof/GeoHash/master.svg
[license-url]:https://github.com/AlexPavlof/GeoHash/blob/master/LICENSE
[license-image]: https://img.shields.io/github/license/AlexPavlof/GeoHash.svg
