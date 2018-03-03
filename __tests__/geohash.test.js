/* eslint-disable quote-props */
// @flow
import GeoHash, { BASE32_CODES, BASE32_CODES_DICT, ENCODE_AUTO } from '../src/geohash';

/**
 * Набор направлений для соседнийх областей.
 *
 * @type {*[]}
 */
const directions = [
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
    [0, -1],
    [1, -1],
];

it('Check BASE32_CODES_DICT', () => {
    Object.keys(BASE32_CODES_DICT).forEach((key) => {
        expect(BASE32_CODES.charAt(BASE32_CODES_DICT[key])).toEqual(key);
    });
});

it('Check "getKeyLength" method,', () => {
    const tests = [
        [1, 1],
        [4, 2],
        [7, 3],
        [8, 4],
        [11, 5],
        [14, 6],
        [15, 7],
        [17, 8],
        [0, 1],
    ];

    tests.forEach((test) => {
        expect(GeoHash.getKeyLength(test[0])).toEqual(test[1]);
    });
});

it('Check "encode" method', () => {
    const tests = {
        txwtvx8kp:     [43.240169, 76.882971],
        txwv82u5y:     ['43.159070', '77.008931'],
        txwv82u5y1ubg: ['43.159070', '77.008931', ENCODE_AUTO],
    };

    Object.keys(tests).forEach((expected) => {
        const data = tests[expected];

        expect(GeoHash.encode(data[0], data[1], data[2])).toEqual(expected);
    });
});

it('Check "encode" method exception', () => {
    const tests = {
        txwtvx8kp:     [43.240169, 76.882971],
        txwv82u5y:     ['43.159070', '77.008931'],
        txwv82u5y1ubg: ['43.159070', '77.008931', ENCODE_AUTO],
    };

    expect(() => {
        GeoHash.encode(tests.txwtvx8kp[0], tests.txwtvx8kp[1], ENCODE_AUTO);
    }).toThrowError(Error);
});

it('Check "encodeInt" method', () => {
    const tests = {
        '3649939969223381': [43.240169, 76.882971],
        '3649945898082055': [43.159070, 77.008931],
        '13597108':         [43.159070, 77.008931, 24],
    };

    Object.keys(tests).forEach((expected) => {
        const data = tests[expected];

        expected = parseInt(expected, 10);

        expect(GeoHash.encodeInt(data[0], data[1], data[2])).toEqual(expected);
    });
});

it('Check "decodeBbox" method', () => {
    const tests = {
        txwtvx8kp:     [43.24012756347656, 76.88296794891357, 43.2401704788208, 76.88301086425781],
        txwv82u5y:     [43.15906047821045, 77.00892448425293, 43.15910339355469, 77.00896739959717],
        txwv82u5y1ubg: [43.15906999167055, 77.00893098022789, 43.159070033580065, 77.0089310221374],
    };

    Object.keys(tests).forEach((data) => {
        expect(GeoHash.decodeBbox(data)).toEqual(tests[data]);
    });
});

it('Check "decodeBboxInt" method', () => {
    const tests = {
        '3649939969223381': [
            [43.240167796611786, 76.88296794891357, 43.2401704788208, 76.8829733133316],
        ],
        '3649945898082055': [
            [43.159068524837494, 77.00892984867096, 43.15907120704651, 77.00893521308899],
        ],
        '13597108': [[43.154296875, 76.9921875, 43.1982421875, 77.080078125], 24],
    };

    Object.keys(tests).forEach((data) => {
        data = parseInt(data, 10);

        const expected = tests[data];

        expect(GeoHash.decodeBboxInt(data, expected[1])).toEqual(expected[0]);
    });
});

it('Check "decode" method', () => {
    const tests = {
        txwtvx8kp:     [43.24014902114868, 76.8829894065857],
        txwv82u5y:     [43.15908193588257, 77.00894594192505],
        txwv82u5y1ubg: [43.15907001262531, 77.00893100118265, ENCODE_AUTO],
    };

    Object.keys(tests).forEach((data) => {
        const bbox     = GeoHash.decodeBbox(data);
        const decoded  = GeoHash.decode(data);
        const expected = tests[data];

        expect(decoded.latitude).toEqual(expected[0]);
        expect(decoded.longitude).toEqual(expected[1]);
        expect(decoded.error.latitude).toEqual(bbox[2] - decoded.latitude);
        expect(decoded.error.longitude).toEqual(bbox[3] - decoded.longitude);
    });
});

it('Check "decodeInt" method', () => {
    const tests = {
        '3649939969223381': [43.24016913771629, 76.88297063112259],
        '3649945898082055': [43.159069865942, 77.00893253087997],
        '13597108':         [43.17626953125, 77.0361328125, 24],
    };

    Object.keys(tests).forEach((data) => {
        data = parseInt(data, 10);

        const expected = tests[data];
        const bbox     = GeoHash.decodeBboxInt(data, expected[2]);
        const decoded  = GeoHash.decodeInt(data, expected[2]);

        expect(decoded.latitude).toEqual(expected[0]);
        expect(decoded.longitude).toEqual(expected[1]);
        expect(decoded.error.latitude).toEqual(bbox[2] - decoded.latitude);
        expect(decoded.error.longitude).toEqual(bbox[3] - decoded.longitude);
    });
});

it('Check "neighbor" method', () => {
    const tests = {
        txwtvx8kp:     ['txwtvx8kr', 'txwtvx8s2', 'txwtvx8s0', 'txwtvx8eb', 'txwtvx87z', 'txwtvx87y', 'txwtvx8kn', 'txwtvx8kq'],
        txwv82u5y:     ['txwv82uhn', 'txwv82uhp', 'txwv82u5z', 'txwv82u5x', 'txwv82u5w', 'txwv82u5t', 'txwv82u5v', 'txwv82uhj'],
        txwv82u5y1ubg: ['txwv82u5y1uc5', 'txwv82u5y1uch', 'txwv82u5y1ubu', 'txwv82u5y1ubs', 'txwv82u5y1ube', 'txwv82u5y1ubd', 'txwv82u5y1ubf', 'txwv82u5y1uc4'],
    };

    Object.keys(tests).forEach((data) => {
        const expected = tests[data];
        const received = [];

        directions.forEach((direction) => {
            received.push(GeoHash.neighbor(data, direction));
        });

        expect(received).toEqual(expected);
    });
});

it('Check "neighborInt" method', () => {
    const tests = {
        '3649939969223381': [
            [3649939969223552, 3649939969223554, 3649939969223383, 3649939969223382,
                3649939969223380, 3649939969223294, 3649939969223295, 3649939969223466],
        ],
        '3649945898082055': [
            [3649945898082066, 3649945898082072, 3649945898082061, 3649945898082060,
                3649945898082054, 3649945898082052, 3649945898082053, 3649945898082064],
        ],
        '13597108': [
            [13597109, 13597111, 13597110, 13597107, 13597105, 13597083, 13597086, 13597087],
            24,
        ],
    };

    Object.keys(tests).forEach((data) => {
        const expected = tests[data][0];
        const received = [];

        directions.forEach((direction) => {
            received.push(GeoHash.neighborInt(
                parseInt(data, 10),
                direction,
                parseInt(tests[data][1], 10),
            ));
        });

        expect(received).toEqual(expected);
    });
});

it('Check "neighbors" method', () => {
    const tests = {
        txwtvx8kp:     ['txwtvx8kr', 'txwtvx8s2', 'txwtvx8s0', 'txwtvx8eb', 'txwtvx87z', 'txwtvx87y', 'txwtvx8kn', 'txwtvx8kq'],
        txwv82u5y:     ['txwv82uhn', 'txwv82uhp', 'txwv82u5z', 'txwv82u5x', 'txwv82u5w', 'txwv82u5t', 'txwv82u5v', 'txwv82uhj'],
        txwv82u5y1ubg: ['txwv82u5y1uc5', 'txwv82u5y1uch', 'txwv82u5y1ubu', 'txwv82u5y1ubs', 'txwv82u5y1ube', 'txwv82u5y1ubd', 'txwv82u5y1ubf', 'txwv82u5y1uc4'],
    };

    Object.keys(tests).forEach((data) => {
        expect(GeoHash.neighbors(data)).toEqual(tests[data]);
    });
});

it('Check "neighborsInt" method', () => {
    const tests = {
        '3649939969223381': [
            [3649939969223552, 3649939969223554, 3649939969223383, 3649939969223382,
                3649939969223380, 3649939969223294, 3649939969223295, 3649939969223466],
        ],
        '3649945898082055': [
            [3649945898082066, 3649945898082072, 3649945898082061, 3649945898082060,
                3649945898082054, 3649945898082052, 3649945898082053, 3649945898082064],
        ],
        '13597108': [
            [13597109, 13597111, 13597110, 13597107, 13597105, 13597083, 13597086, 13597087],
            24,
        ],
    };

    Object.keys(tests).forEach((data) => {
        data = parseInt(data, 10);

        expect(GeoHash.neighborsInt(data, tests[data][1])).toEqual(tests[data][0]);
    });
});

it('Check "bboxes" method', () => {
    const tests = [
        [
            [43.243749, 76.897481, 43.243804, 76.897717],
            ['txwwjb711', 'txwwjb714', 'txwwjb715', 'txwwjb71h', 'txwwjb71j', 'txwwjb71n', 'txwwjb713', 'txwwjb716', 'txwwjb717', 'txwwjb71k', 'txwwjb71m', 'txwwjb71q'],
        ],
        [
            [43.199405, 76.890669, 43.199484, 76.890841],
            ['txwtv8nnf', 'txwtv8nng', 'txwtv8nnu', 'txwtv8nnv', 'txwtv8nny', 'txwtv8np4', 'txwtv8np5', 'txwtv8nph', 'txwtv8npj', 'txwtv8npn'],
        ],
        [
            [43.199405, 76.890669, 43.199484, 76.890841, 8],
            ['txwtv8nn', 'txwtv8np'],
        ],
    ];

    tests.forEach((data) => {
        const received = data[0];
        const expected = data[1];

        expect(GeoHash.bboxes(
            received[0],
            received[1],
            received[2],
            received[3],
            received[4],
        )).toEqual(expected);
    });
});

it('Check "bboxesInt" method', () => {
    const tests = [
        [
            [43.243801, 76.897481, 43.243810, 76.897491],
            [3649951432053187, 3649951432053193, 3649951432053195, 3649951432053190,
                3649951432053196, 3649951432053198, 3649951432053191, 3649951432053197,
                3649951432053199, 3649951432053202, 3649951432053208, 3649951432053210],
        ],
        [
            [43.199405, 76.890669, 43.199484, 76.890841, 44],
            [14257577666887, 14257577666893, 14257577666895, 14257577666898, 14257577666904,
                14257577666906],
        ],
        [
            [43.199405, 76.890669, 43.199484, 76.890841, 24],
            [13597085],
        ],
    ];

    tests.forEach((data) => {
        const received = data[0];
        const expected = data[1];

        expect(GeoHash.bboxesInt(
            received[0],
            received[1],
            received[2],
            received[3],
            received[4],
        )).toEqual(expected);
    });
});
