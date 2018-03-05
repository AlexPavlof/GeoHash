/* eslint-disable no-bitwise */
// @flow
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
export const BASE32_CODES      = '0123456789bcdefghjkmnpqrstuvwxyz';
export const BASE32_CODES_DICT = {};
export const ENCODE_AUTO       = 'auto';

for (let i = 0; i < BASE32_CODES.length; i += 1) {
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
 *
 * @type {*[]}
 */
export const SIGFIG_HASH_LENGTH = [0, 5, 7, 8, 11, 12, 13, 15, 16, 17, 18];

/**
 * Default bit depth.
 *
 * @type {number}
 */
const DEFAULT_BIT_DEPTH = 52;

/**
 * Returns bit.
 *
 * @param {number} bits
 * @param {number} position
 * @return {number}
 */
export const getBit = (bits: number, position: number): number => (bits / (2 ** position)) & 0x01;

/**
 * Returns an appropriate key length for a certain zoom.
 *
 * @param {number} zoom
 * @return {number}
 */
export const getKeyLength = (zoom: number): number => {
    let key;

    if (zoom >= 17) key = 8;
    else if (zoom >= 15 && zoom < 17) key = 7;
    else if (zoom >= 13 && zoom < 15) key = 6;
    else if (zoom >= 11 && zoom < 13) key = 5;
    else if (zoom >= 8 && zoom < 11) key = 4;
    else if (zoom >= 6 && zoom < 8) key = 3;
    else if (zoom >= 3 && zoom < 6) key = 2;
    else if (zoom >= 1 && zoom < 3) key = 1;
    else key = 1; // eventually we can map the whole planet at once

    return key;
};

/**
 * Returns a Geohash out of a latitude and longitude that is `numberOfChars` long.
 *
 * @param {number|string} latitude
 * @param {number|string} longitude
 * @param {number} numberOfChars
 * @returns {string}
 */
export const encode = (
    latitude: number | string,
    longitude: number | string,
    numberOfChars: number | string,
): string => {
    if (numberOfChars === ENCODE_AUTO) {
        if (typeof (latitude) === 'number' || typeof (longitude) === 'number') {
            throw new Error('string notation required for auto precision.');
        }

        const decSigFigsLat   = latitude.split('.')[1].length;
        const decSigFigsLong  = longitude.split('.')[1].length;
        const numberOfSigFigs = Math.max(decSigFigsLat, decSigFigsLong);

        numberOfChars = SIGFIG_HASH_LENGTH[numberOfSigFigs];
    } else if (numberOfChars === undefined) {
        numberOfChars = 9;
    }

    longitude = parseFloat(longitude);
    latitude = parseFloat(latitude);
    numberOfChars = parseInt(numberOfChars, 10);

    const chars   = [];
    let bits      = 0;
    let bitsTotal = 0;
    let hashValue = 0;
    let maxLat    = 90;
    let minLat    = -90;
    let maxLon    = 180;
    let minLon    = -180;
    let mid;

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
            const code = BASE32_CODES[hashValue];
            chars.push(code);
            bits = 0;
            hashValue = 0;
        }
    }

    return chars.join('');
};

/**
 * Returns a Geohash out of a latitude and longitude that is of 'bitDepth'.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} bitDepth
 * @returns {number}
 */
export const encodeInt = (latitude: number, longitude: number, bitDepth: ?number): number => {
    bitDepth = bitDepth || DEFAULT_BIT_DEPTH;

    let bitsTotal    = 0;
    let maxLat       = 90;
    let minLat       = -90;
    let maxLon       = 180;
    let minLon       = -180;
    let mid;
    let combinedBits = 0;

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
};

/**
 * Returns decoded Bounding Box hashString into a bound box matches it. Data returned in
 * a four-element array: [minlat, minlon, maxlat, maxlon].
 *
 * @param {string} hashString
 * @returns {*[]}
 */
export const decodeBbox = (hashString: string): *[] => {
    let isLon     = true;
    let maxLat    = 90;
    let minLat    = -90;
    let maxLon    = 180;
    let minLon    = -180;
    let mid;
    let hashValue = 0;

    for (let i = 0, l = hashString.length; i < l; i += 1) {
        const code = hashString[i].toLowerCase();

        hashValue = BASE32_CODES_DICT[code];

        for (let bits = 4; bits >= 0; bits -= 1) {
            // eslint-disable-next-line no-bitwise
            const bit = (hashValue >> bits) & 1;

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
};

/**
 * Returns decoded Bounding Box Integer hash number into a bound box matches it. Data
 * returned in a four-element array: [minlat, minlon, maxlat, maxlon].
 *
 * @param {number} hashInt
 * @param {number} bitDepth
 * @returns {*[]}
 */
export const decodeBboxInt = (hashInt: number, bitDepth: ?number): *[] => {
    bitDepth = bitDepth || DEFAULT_BIT_DEPTH;

    let maxLat = 90;
    let minLat = -90;
    let maxLon = 180;
    let minLon = -180;

    let latBit = 0;
    let lonBit = 0;
    const step = bitDepth / 2;

    for (let i = 0; i < step; i += 1) {
        lonBit = getBit(hashInt, ((step - i) * 2) - 1);
        latBit = getBit(hashInt, ((step - i) * 2) - 2);

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
};

/**
 * Returns decoded a hash string into pair of latitude and longitude. A javascript object
 * is returned with keys `latitude`, `longitude` and `error`.
 *
 * @param {string} hashString
 * @returns {{latitude: number, longitude: number, error: {latitude: number, longitude: number}}}
 */
export const decode = (hashString: string): Object => {
    const bbox   = decodeBbox(hashString);
    const lat    = (bbox[0] + bbox[2]) / 2;
    const lon    = (bbox[1] + bbox[3]) / 2;
    const latErr = bbox[2] - lat;
    const lonErr = bbox[3] - lon;

    return {
        latitude:  lat,
        longitude: lon,
        error:     { latitude: latErr, longitude: lonErr },
    };
};

/**
 * Returns decoded a hash number into pair of latitude and longitude. A javascript object
 * is returned with keys `latitude`, `longitude` and `error`.
 *
 * @param {number} hashInt
 * @param {number} bitDepth
 * @returns {{latitude: number, longitude: number, error: {latitude: number, longitude: number}}}
 */
export const decodeInt = (hashInt: number, bitDepth: ?number): Object => {
    const bbox   = decodeBboxInt(hashInt, bitDepth);
    const lat    = (bbox[0] + bbox[2]) / 2;
    const lon    = (bbox[1] + bbox[3]) / 2;
    const latErr = bbox[2] - lat;
    const lonErr = bbox[3] - lon;

    return {
        latitude:  lat,
        longitude: lon,
        error:     { latitude: latErr, longitude: lonErr },
    };
};

/**
 * Returns neighbor of a geohash string in certain direction. Direction is a two-element array,
 * i.e. [1,0] means north, [-1,-1] means southwest.
 * direction [lat, lon], i.e.
 * [1,0] - north
 * [1,1] - northeast
 *
 * @param {string} hashString
 * @param {*[]} direction
 * @returns {string}
 */
export const neighbor = (hashString: string, direction: *[]): string => {
    const lonLat      = decode(hashString);
    const neighborLat = lonLat.latitude + (direction[0] * lonLat.error.latitude * 2);
    const neighborLon = lonLat.longitude + (direction[1] * lonLat.error.longitude * 2);

    return encode(neighborLat, neighborLon, hashString.length);
};

/**
 * Returns neighbor of a geohash integer in certain direction. Direction is a two-element array,
 * i.e. [1,0] means north, [-1,-1] means southwest.
 * direction [lat, lon], i.e.
 * [1,0] - north
 * [1,1] - northeast
 *
 * @param {number} hashInt
 * @param {*[]} direction
 * @param {number} bitDepth
 * @returns {number}
 */
export const neighborInt = (hashInt: number, direction: *[], bitDepth: ?number): number => {
    bitDepth = bitDepth || DEFAULT_BIT_DEPTH;

    const lonlat      = decodeInt(hashInt, bitDepth);
    const neighborLat = lonlat.latitude + (direction[0] * lonlat.error.latitude * 2);
    const neighborLon = lonlat.longitude + (direction[1] * lonlat.error.longitude * 2);

    return encodeInt(neighborLat, neighborLon, bitDepth);
};

/**
 * Returns all neighbors' hashstrings clockwise from north around to northwest.
 * 7 0 1
 * 6 x 2
 * 5 4 3
 *
 * @param {string} hashString
 * @returns {*[]}
 */
export const neighbors = (hashString: string): *[] => {
    const hashstringLength = hashString.length;
    const lonlat           = decode(hashString);
    const lat              = lonlat.latitude;
    const lon              = lonlat.longitude;
    const latErr           = lonlat.error.latitude * 2;
    const lonErr           = lonlat.error.longitude * 2;
    const encodeNeighbor   = (neighborLatDir, neighborLonDir) => {
        const neighborLat = lat + (neighborLatDir * latErr);
        const neighborLon = lon + (neighborLonDir * lonErr);

        return encode(neighborLat, neighborLon, hashstringLength);
    };

    return [
        encodeNeighbor(1, 0),
        encodeNeighbor(1, 1),
        encodeNeighbor(0, 1),
        encodeNeighbor(-1, 1),
        encodeNeighbor(-1, 0),
        encodeNeighbor(-1, -1),
        encodeNeighbor(0, -1),
        encodeNeighbor(1, -1),
    ];
};

/**
 * Returns all neighbors' hash integers clockwise from north around to northwest
 * 7 0 1
 * 6 x 2
 * 5 4 3
 *
 * @param {number} hashInt
 * @param {number} bitDepth
 * @returns {*[]}
 */
export const neighborsInt = (hashInt: number, bitDepth: ?number): *[] => {
    bitDepth = bitDepth || DEFAULT_BIT_DEPTH;

    const lonlat            = decodeInt(hashInt, bitDepth);
    const lat               = lonlat.latitude;
    const lon               = lonlat.longitude;
    const latErr            = lonlat.error.latitude * 2;
    const lonErr            = lonlat.error.longitude * 2;
    const encodeNeighborInt = (neighborLatDir, neighborLonDir) => {
        const neighborLat = lat + (neighborLatDir * latErr);
        const neighborLon = lon + (neighborLonDir * lonErr);

        return encodeInt(neighborLat, neighborLon, bitDepth);
    };

    return [
        encodeNeighborInt(1, 0),
        encodeNeighborInt(1, 1),
        encodeNeighborInt(0, 1),
        encodeNeighborInt(-1, 1),
        encodeNeighborInt(-1, 0),
        encodeNeighborInt(-1, -1),
        encodeNeighborInt(0, -1),
        encodeNeighborInt(1, -1),
    ];
};

/**
 * Returns all the hashString between minLat, minLon, maxLat, maxLon in numberOfChars
 *
 * @param {number} minLat
 * @param {number} minLon
 * @param {number} maxLat
 * @param {number} maxLon
 * @param {number} numberOfChars
 * @returns {*[]}
 */
export const bboxes = (
    minLat: number,
    minLon: number,
    maxLat: number,
    maxLon: number,
    numberOfChars: ?number,
): *[] => {
    numberOfChars = numberOfChars || 9;

    const hashSouthWest = encode(minLat, minLon, numberOfChars);
    const hashNorthEast = encode(maxLat, maxLon, numberOfChars);

    const latLon = decode(hashSouthWest);

    const perLat = latLon.error.latitude * 2;
    const perLon = latLon.error.longitude * 2;

    const boxSouthWest = decodeBbox(hashSouthWest);
    const boxNorthEast = decodeBbox(hashNorthEast);

    const latStep = Math.round((boxNorthEast[0] - boxSouthWest[0]) / perLat);
    const lonStep = Math.round((boxNorthEast[1] - boxSouthWest[1]) / perLon);

    const hashList = [];

    for (let lat = 0; lat <= latStep; lat += 1) {
        for (let lon = 0; lon <= lonStep; lon += 1) {
            hashList.push(neighbor(hashSouthWest, [lat, lon]));
        }
    }

    return hashList;
};

/**
 * Returns all the hash integers between minLat, minLon, maxLat, maxLon in bitDepth.
 *
 * @param {number} minLat
 * @param {number} minLon
 * @param {number} maxLat
 * @param {number} maxLon
 * @param {number} bitDepth
 * @returns {*[]}
 */
export const bboxesInt = (
    minLat: number,
    minLon: number,
    maxLat: number,
    maxLon: number,
    bitDepth: ?number,
): *[] => {
    bitDepth = bitDepth || DEFAULT_BIT_DEPTH;

    const hashSouthWest = encodeInt(minLat, minLon, bitDepth);
    const hashNorthEast = encodeInt(maxLat, maxLon, bitDepth);

    const latlon = decodeInt(hashSouthWest, bitDepth);

    const perLat = latlon.error.latitude * 2;
    const perLon = latlon.error.longitude * 2;

    const boxSouthWest = decodeBboxInt(hashSouthWest, bitDepth);
    const boxNorthEast = decodeBboxInt(hashNorthEast, bitDepth);

    const latStep = Math.round((boxNorthEast[0] - boxSouthWest[0]) / perLat);
    const lonStep = Math.round((boxNorthEast[1] - boxSouthWest[1]) / perLon);

    const hashList = [];

    for (let lat = 0; lat <= latStep; lat += 1) {
        for (let lon = 0; lon <= lonStep; lon += 1) {
            hashList.push(neighborInt(hashSouthWest, [lat, lon], bitDepth));
        }
    }

    return hashList;
};

export default {
    getBit,
    getKeyLength,
    encode,
    encodeInt,
    decodeBbox,
    decodeBboxInt,
    decode,
    decodeInt,
    neighbor,
    neighborInt,
    neighbors,
    neighborsInt,
    bboxes,
    bboxesInt,
};
