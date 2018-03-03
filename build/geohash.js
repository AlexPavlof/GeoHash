window["geohash"] =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/geohash.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/geohash.js":
/*!************************!*\
  !*** ./src/geohash.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * The Geohash algorithm was first described by Gustavo Niemeyer in February 2008. By interleaving
 * latitude and longitude information in a bitwise fashion, a composite value is generated that
 * provides a high resolution geographic point, and is well suited for storage or transmission as a
 * character string.
 *
 * Geohash also has the property that as the number of digits decreases (from the right), accuracy
 * degrades. This property can be used to do bounding box searches, as points near to one another
 * will share similar Geohash prefixes.
 *
 */
var BASE32_CODES = exports.BASE32_CODES = '0123456789bcdefghjkmnpqrstuvwxyz';
var BASE32_CODES_DICT = exports.BASE32_CODES_DICT = {};
var ENCODE_AUTO = exports.ENCODE_AUTO = 'auto';

for (var i = 0; i < BASE32_CODES.length; i += 1) {
    BASE32_CODES_DICT[BASE32_CODES.charAt(i)] = i;
}

/**
 * Significant Figure Hash Length.
 *
 * This is a quick and dirty lookup to figure out how long our hash
 * should be in order to guarantee a certain amount of trailing
 * significant figures. This was calculated by determining the error:
 * 45/2^(n-1) where n is the number of bits for a latitude or
 * longitude. Key is # of desired sig figs, value is minimum length of
 * the geohash.
 * @type {*[]}
 */
var SIGFIG_HASH_LENGTH = exports.SIGFIG_HASH_LENGTH = [0, 5, 7, 8, 11, 12, 13, 15, 16, 17, 18];

/**
 * @type {number}
 */
var DEFAULT_BIT_DEPTH = 52;

/**
 * Возвращает бит.
 *
 * @param {number} bits
 * @param {number} position
 * @return {number}
 */
// eslint-disable-next-line no-bitwise
var getBit = exports.getBit = function getBit(bits, position) {
    return bits / Math.pow(2, position) & 0x01;
};

var GeoHash = function () {
    function GeoHash() {
        _classCallCheck(this, GeoHash);
    }

    _createClass(GeoHash, null, [{
        key: 'getKeyLength',

        /**
         * Gets an appropriate key length for a certain zoom.
         *
         * @param {number} zoom
         * @return {number}
         */
        value: function getKeyLength(zoom) {
            var key = void 0;

            if (zoom >= 17) key = 8;else if (zoom >= 15 && zoom < 17) key = 7;else if (zoom >= 13 && zoom < 15) key = 6;else if (zoom >= 11 && zoom < 13) key = 5;else if (zoom >= 8 && zoom < 11) key = 4;else if (zoom >= 6 && zoom < 8) key = 3;else if (zoom >= 3 && zoom < 6) key = 2;else if (zoom >= 1 && zoom < 3) key = 1;else key = 1; // eventually we can map the whole planet at once

            return key;
        }

        /**
         * Encode
         * Create a Geohash out of a latitude and longitude that is `numberOfChars` long.
         *
         * @param {number|string} latitude
         * @param {number|string} longitude
         * @param {number} numberOfChars
         * @returns {string}
         */

    }, {
        key: 'encode',
        value: function encode(latitude, longitude, numberOfChars) {
            if (numberOfChars === ENCODE_AUTO) {
                if (typeof latitude === 'number' || typeof longitude === 'number') {
                    throw new Error('string notation required for auto precision.');
                }

                var decSigFigsLat = latitude.split('.')[1].length;
                var decSigFigsLong = longitude.split('.')[1].length;
                var numberOfSigFigs = Math.max(decSigFigsLat, decSigFigsLong);

                numberOfChars = SIGFIG_HASH_LENGTH[numberOfSigFigs];
            } else if (numberOfChars === undefined) {
                numberOfChars = 9;
            }

            longitude = parseFloat(longitude);
            latitude = parseFloat(latitude);
            numberOfChars = parseInt(numberOfChars, 10);

            var chars = [];
            var bits = 0;
            var bitsTotal = 0;
            var hashValue = 0;
            var maxLat = 90;
            var minLat = -90;
            var maxLon = 180;
            var minLon = -180;
            var mid = void 0;

            while (chars.length < numberOfChars) {
                if (bitsTotal % 2 === 0) {
                    mid = (maxLon + minLon) / 2;
                    if (longitude > mid) {
                        // eslint-disable-next-line no-bitwise
                        hashValue = (hashValue << 1) + 1;
                        minLon = mid;
                    } else {
                        // eslint-disable-next-line no-bitwise
                        hashValue = (hashValue << 1) + 0;
                        maxLon = mid;
                    }
                } else {
                    mid = (maxLat + minLat) / 2;

                    if (latitude > mid) {
                        // eslint-disable-next-line no-bitwise
                        hashValue = (hashValue << 1) + 1;
                        minLat = mid;
                    } else {
                        // eslint-disable-next-line no-bitwise
                        hashValue = (hashValue << 1) + 0;
                        maxLat = mid;
                    }
                }

                bits += 1;
                bitsTotal += 1;

                if (bits === 5) {
                    var code = BASE32_CODES[hashValue];
                    chars.push(code);
                    bits = 0;
                    hashValue = 0;
                }
            }

            return chars.join('');
        }

        /**
         * Encode Integer.
         * Create a Geohash out of a latitude and longitude that is of 'bitDepth'.
         *
         * @param {number} latitude
         * @param {number} longitude
         * @param {number} bitDepth
         *
         * @returns {number}
         */

    }, {
        key: 'encodeInt',
        value: function encodeInt(latitude, longitude, bitDepth) {
            bitDepth = bitDepth || DEFAULT_BIT_DEPTH;

            var bitsTotal = 0;
            var maxLat = 90;
            var minLat = -90;
            var maxLon = 180;
            var minLon = -180;
            var mid = void 0;
            var combinedBits = 0;

            while (bitsTotal < bitDepth) {
                combinedBits *= 2;

                if (bitsTotal % 2 === 0) {
                    mid = (maxLon + minLon) / 2;
                    if (longitude > mid) {
                        combinedBits += 1;
                        minLon = mid;
                    } else {
                        maxLon = mid;
                    }
                } else {
                    mid = (maxLat + minLat) / 2;

                    if (latitude > mid) {
                        combinedBits += 1;
                        minLat = mid;
                    } else {
                        maxLat = mid;
                    }
                }

                bitsTotal += 1;
            }
            return combinedBits;
        }

        /**
         * Decode Bounding Box.
         * Decode hashString into a bound box matches it. Data returned in a four-element array:
         * [minlat, minlon, maxlat, maxlon]
         *
         * @param {string} hashString
         * @returns {*[]}
         */

    }, {
        key: 'decodeBbox',
        value: function decodeBbox(hashString) {
            var isLon = true;
            var maxLat = 90;
            var minLat = -90;
            var maxLon = 180;
            var minLon = -180;
            var mid = void 0;
            var hashValue = 0;

            for (var _i = 0, l = hashString.length; _i < l; _i += 1) {
                var code = hashString[_i].toLowerCase();

                hashValue = BASE32_CODES_DICT[code];

                for (var bits = 4; bits >= 0; bits -= 1) {
                    // eslint-disable-next-line no-bitwise
                    var bit = hashValue >> bits & 1;

                    if (isLon) {
                        mid = (maxLon + minLon) / 2;
                        if (bit === 1) {
                            minLon = mid;
                        } else {
                            maxLon = mid;
                        }
                    } else {
                        mid = (maxLat + minLat) / 2;
                        if (bit === 1) {
                            minLat = mid;
                        } else {
                            maxLat = mid;
                        }
                    }
                    isLon = !isLon;
                }
            }
            return [minLat, minLon, maxLat, maxLon];
        }

        /**
         * Decode Bounding Box Integer.
         * Decode hash number into a bound box matches it. Data returned in a four-element array:
         * [minlat, minlon, maxlat, maxlon]
         *
         * @param {number} hashInt
         * @param {number} bitDepth
         * @returns {*[]}
         */

    }, {
        key: 'decodeBboxInt',
        value: function decodeBboxInt(hashInt, bitDepth) {
            bitDepth = bitDepth || DEFAULT_BIT_DEPTH;

            var maxLat = 90;
            var minLat = -90;
            var maxLon = 180;
            var minLon = -180;

            var latBit = 0;
            var lonBit = 0;
            var step = bitDepth / 2;

            for (var _i2 = 0; _i2 < step; _i2 += 1) {
                lonBit = getBit(hashInt, (step - _i2) * 2 - 1);
                latBit = getBit(hashInt, (step - _i2) * 2 - 2);

                if (latBit === 0) {
                    maxLat = (maxLat + minLat) / 2;
                } else {
                    minLat = (maxLat + minLat) / 2;
                }

                if (lonBit === 0) {
                    maxLon = (maxLon + minLon) / 2;
                } else {
                    minLon = (maxLon + minLon) / 2;
                }
            }
            return [minLat, minLon, maxLat, maxLon];
        }

        /**
         * Decode.
         * Decode a hash string into pair of latitude and longitude. A javascript object is returned
         * with keys `latitude`, `longitude` and `error`.
         *
         * @param {string} hashString
         * @returns {{latitude: number, longitude: number,
         * error: {latitude: number, longitude: number}}}
         */

    }, {
        key: 'decode',
        value: function decode(hashString) {
            var bbox = GeoHash.decodeBbox(hashString);
            var lat = (bbox[0] + bbox[2]) / 2;
            var lon = (bbox[1] + bbox[3]) / 2;
            var latErr = bbox[2] - lat;
            var lonErr = bbox[3] - lon;

            return {
                latitude: lat,
                longitude: lon,
                error: { latitude: latErr, longitude: lonErr }
            };
        }

        /**
         * Decode Integer.
         * Decode a hash number into pair of latitude and longitude. A javascript object is returned
         * with keys `latitude`, `longitude` and `error`.
         *
         * @param {number} hashInt
         * @param {number} bitDepth
         * @returns {{latitude: number, longitude: number,
         * error: {latitude: number, longitude: number}}}
         */

    }, {
        key: 'decodeInt',
        value: function decodeInt(hashInt, bitDepth) {
            var bbox = GeoHash.decodeBboxInt(hashInt, bitDepth);
            var lat = (bbox[0] + bbox[2]) / 2;
            var lon = (bbox[1] + bbox[3]) / 2;
            var latErr = bbox[2] - lat;
            var lonErr = bbox[3] - lon;

            return {
                latitude: lat,
                longitude: lon,
                error: { latitude: latErr, longitude: lonErr }
            };
        }

        /**
         * Neighbor
         *
         * Find neighbor of a geohash string in certain direction. Direction is a two-element array,
         * i.e. [1,0] means north, [-1,-1] means southwest.
         * direction [lat, lon], i.e.
         * [1,0] - north
         * [1,1] - northeast
         *
         * @param {string} hashString
         * @param {*[]} direction
         *
         * @returns {string}
         */

    }, {
        key: 'neighbor',
        value: function neighbor(hashString, direction) {
            var lonLat = GeoHash.decode(hashString);
            var neighborLat = lonLat.latitude + direction[0] * lonLat.error.latitude * 2;
            var neighborLon = lonLat.longitude + direction[1] * lonLat.error.longitude * 2;

            return GeoHash.encode(neighborLat, neighborLon, hashString.length);
        }

        /**
         * Neighbor Integer
         *
         * Find neighbor of a geohash integer in certain direction. Direction is a two-element array,
         * i.e. [1,0] means north, [-1,-1] means southwest.
         * direction [lat, lon], i.e.
         * [1,0] - north
         * [1,1] - northeast
         *
         * @param {number} hashInt
         * @param {*[]} direction
         * @param {number} bitDepth
         *
         * @returns {number}
         */

    }, {
        key: 'neighborInt',
        value: function neighborInt(hashInt, direction, bitDepth) {
            bitDepth = bitDepth || DEFAULT_BIT_DEPTH;

            var lonlat = GeoHash.decodeInt(hashInt, bitDepth);
            var neighborLat = lonlat.latitude + direction[0] * lonlat.error.latitude * 2;
            var neighborLon = lonlat.longitude + direction[1] * lonlat.error.longitude * 2;

            return GeoHash.encodeInt(neighborLat, neighborLon, bitDepth);
        }

        /**
         * Neighbors.
         * Returns all neighbors' hashstrings clockwise from north around to northwest
         * 7 0 1
         * 6 x 2
         * 5 4 3
         *
         * @param {string} hashString
         *
         * @returns {*[]}
         */

    }, {
        key: 'neighbors',
        value: function neighbors(hashString) {
            var hashstringLength = hashString.length;
            var lonlat = GeoHash.decode(hashString);
            var lat = lonlat.latitude;
            var lon = lonlat.longitude;
            var latErr = lonlat.error.latitude * 2;
            var lonErr = lonlat.error.longitude * 2;
            var encodeNeighbor = function encodeNeighbor(neighborLatDir, neighborLonDir) {
                var neighborLat = lat + neighborLatDir * latErr;
                var neighborLon = lon + neighborLonDir * lonErr;

                return GeoHash.encode(neighborLat, neighborLon, hashstringLength);
            };

            return [encodeNeighbor(1, 0), encodeNeighbor(1, 1), encodeNeighbor(0, 1), encodeNeighbor(-1, 1), encodeNeighbor(-1, 0), encodeNeighbor(-1, -1), encodeNeighbor(0, -1), encodeNeighbor(1, -1)];
        }

        /**
         * Neighbors Integer.
         * Returns all neighbors' hash integers clockwise from north around to northwest
         * 7 0 1
         * 6 x 2
         * 5 4 3
         *
         * @param {number} hashInt
         * @param {number} bitDepth
         *
         * @returns {*[]}
         */

    }, {
        key: 'neighborsInt',
        value: function neighborsInt(hashInt, bitDepth) {
            bitDepth = bitDepth || DEFAULT_BIT_DEPTH;

            var lonlat = GeoHash.decodeInt(hashInt, bitDepth);
            var lat = lonlat.latitude;
            var lon = lonlat.longitude;
            var latErr = lonlat.error.latitude * 2;
            var lonErr = lonlat.error.longitude * 2;
            var encodeNeighborInt = function encodeNeighborInt(neighborLatDir, neighborLonDir) {
                var neighborLat = lat + neighborLatDir * latErr;
                var neighborLon = lon + neighborLonDir * lonErr;

                return GeoHash.encodeInt(neighborLat, neighborLon, bitDepth);
            };

            return [encodeNeighborInt(1, 0), encodeNeighborInt(1, 1), encodeNeighborInt(0, 1), encodeNeighborInt(-1, 1), encodeNeighborInt(-1, 0), encodeNeighborInt(-1, -1), encodeNeighborInt(0, -1), encodeNeighborInt(1, -1)];
        }

        /**
         * Bounding Boxes
         * Return all the hashString between minLat, minLon, maxLat, maxLon in numberOfChars
         *
         * @param {number} minLat
         * @param {number} minLon
         * @param {number} maxLat
         * @param {number} maxLon
         * @param {number} numberOfChars
         *
         * @returns {*[]}
         */

    }, {
        key: 'bboxes',
        value: function bboxes(minLat, minLon, maxLat, maxLon, numberOfChars) {
            numberOfChars = numberOfChars || 9;

            var hashSouthWest = GeoHash.encode(minLat, minLon, numberOfChars);
            var hashNorthEast = GeoHash.encode(maxLat, maxLon, numberOfChars);

            var latLon = GeoHash.decode(hashSouthWest);

            var perLat = latLon.error.latitude * 2;
            var perLon = latLon.error.longitude * 2;

            var boxSouthWest = GeoHash.decodeBbox(hashSouthWest);
            var boxNorthEast = GeoHash.decodeBbox(hashNorthEast);

            var latStep = Math.round((boxNorthEast[0] - boxSouthWest[0]) / perLat);
            var lonStep = Math.round((boxNorthEast[1] - boxSouthWest[1]) / perLon);

            var hashList = [];

            for (var lat = 0; lat <= latStep; lat += 1) {
                for (var lon = 0; lon <= lonStep; lon += 1) {
                    hashList.push(GeoHash.neighbor(hashSouthWest, [lat, lon]));
                }
            }

            return hashList;
        }

        /**
         * Bounding Boxes Integer
         * Return all the hash integers between minLat, minLon, maxLat, maxLon in bitDepth.
         *
         * @param {number} minLat
         * @param {number} minLon
         * @param {number} maxLat
         * @param {number} maxLon
         * @param {number} bitDepth
         *
         * @returns {*[]}
         */

    }, {
        key: 'bboxesInt',
        value: function bboxesInt(minLat, minLon, maxLat, maxLon, bitDepth) {
            bitDepth = bitDepth || DEFAULT_BIT_DEPTH;

            var hashSouthWest = GeoHash.encodeInt(minLat, minLon, bitDepth);
            var hashNorthEast = GeoHash.encodeInt(maxLat, maxLon, bitDepth);

            var latlon = GeoHash.decodeInt(hashSouthWest, bitDepth);

            var perLat = latlon.error.latitude * 2;
            var perLon = latlon.error.longitude * 2;

            var boxSouthWest = GeoHash.decodeBboxInt(hashSouthWest, bitDepth);
            var boxNorthEast = GeoHash.decodeBboxInt(hashNorthEast, bitDepth);

            var latStep = Math.round((boxNorthEast[0] - boxSouthWest[0]) / perLat);
            var lonStep = Math.round((boxNorthEast[1] - boxSouthWest[1]) / perLon);

            var hashList = [];

            for (var lat = 0; lat <= latStep; lat += 1) {
                for (var lon = 0; lon <= lonStep; lon += 1) {
                    hashList.push(GeoHash.neighborInt(hashSouthWest, [lat, lon], bitDepth));
                }
            }

            return hashList;
        }
    }]);

    return GeoHash;
}();

exports.default = GeoHash;

/***/ })

/******/ });
//# sourceMappingURL=geohash.js.map