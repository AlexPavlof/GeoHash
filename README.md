# GeoHash

<p align="center">
  <a href="https://circleci.com/gh/AlexPavlof/GeoHash/tree/master"><img src="https://img.shields.io/circleci/project/AlexPavlof/GeoHash/master.svg" alt="Build Status"></a>
  <a href="https://codecov.io/github/AlexPavlof/GeoHash?branch=master"><img src="https://img.shields.io/codecov/c/github/AlexPavlof/GeoHash/master.svg" alt="Coverage Status"></a>
  <a href="https://github.com/AlexPavlof/GeoHash/issues"><img src="https://img.shields.io/github/issues/AlexPavlof/GeoHash.svg" alt="GitHub issues"></a>
  <a href="https://github.com/AlexPavlof/GeoHash/blob/master/LICENSE"><img src="https://img.shields.io/github/license/AlexPavlof/GeoHash.svg" alt="GitHub license"></a>
</p>

Geohash is a public domain geocoding system invented by Gustavo Niemeyer, which encodes a geographic location into a short string of letters and digits. It is a hierarchical spatial data structure which subdivides space into buckets of grid shape, which is one of the many applications of what is known as a Z-order curve, and generally space-filling curves.

Geohashes offer properties like arbitrary precision and the possibility of gradually removing characters from the end of the code to reduce its size (and gradually lose precision). As a consequence of the gradual precision degradation, nearby places will often (but not always) present similar prefixes. The longer a shared prefix is, the closer the two places are.

Read more on [Wikipedia](https://en.wikipedia.org/wiki/Geohash).

## Installation

With npm

``` bash
$ npm install @alexpavlov/geohash-js
```

or with yarn

``` bash
$ yarn add @alexpavlov/geohash-js
```

## License

[MIT](http://opensource.org/licenses/MIT)
