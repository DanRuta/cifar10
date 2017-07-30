"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var fs = require("fs");
var bp = require("babel-polyfill");

var shuffle = function shuffle(arr) {
    for (var i = arr.length; i; i--) {
        var j = Math.floor(Math.random() * i);
        var x = arr[i - 1];
        arr[i - 1] = arr[j];
        arr[j] = x;
    }
};

var indeces = {
    training: {},
    test: {}
};

var getData = function getData(type, count) {
    return new Promise(function (resolve, reject) {
        var outData = [];
        var itemsPerCategory = Math.floor(parseInt(count) / 10);

        CIFAR10.categories.forEach(function (category) {

            var sliceStart = Math.min(readIndexCounters[type][category] / 10, CIFAR10[category][type].length);
            var indecesToRead = indeces[type][category].slice(sliceStart, sliceStart + itemsPerCategory);

            if (indecesToRead.length < itemsPerCategory - 1) {
                shuffle(indeces[type][category]);
                indecesToRead = [].concat(_toConsumableArray(indecesToRead), _toConsumableArray(indeces[type][category].slice(0, itemsPerCategory - indecesToRead.length)));
                readIndexCounters[type][category] = itemsPerCategory - indecesToRead.length;
            }

            indecesToRead.sort();
            outData.push(_get.bind(CIFAR10[category], indecesToRead)());
        });

        Promise.all(outData).then(function (resolved) {
            CIFAR10.categories.forEach(function (category) {
                return readIndexCounters[type][category] += itemsPerCategory * 10;
            });
            var final = resolved.reduce(function (prev, curr) {
                return prev.concat(curr);
            }, []);
            shuffle(final);
            resolve(final);
        });
    });
};

// Maybe move the array logic into range(), with index conditions. Quicker than opening new streams for each index?
// But maybe only do it if the number of indeces is above, say ~5% of the total items, else just do it the current way
function _get(index) {
    var _this = this;

    return new Promise(function () {
        var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(resolve, reject) {
            var data;
            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (!Array.isArray(index)) {
                                _context.next = 4;
                                break;
                            }

                            Promise.all(index.map(function (i) {
                                return _this.range(i);
                            })).then(function (data) {
                                return resolve(data.map(function (items) {
                                    return items[0];
                                }));
                            });
                            _context.next = 8;
                            break;

                        case 4:
                            _context.next = 6;
                            return _this.range(index);

                        case 6:
                            data = _context.sent;

                            resolve(data[0]);

                        case 8:
                        case "end":
                            return _context.stop();
                    }
                }
            }, _callee, _this);
        }));

        return function (_x, _x2) {
            return _ref.apply(this, arguments);
        };
    }());
}

var CIFAR10 = function () {
    function CIFAR10() {
        _classCallCheck(this, CIFAR10);
    }

    _createClass(CIFAR10, null, [{
        key: "set",
        value: function set() {
            var trainingSize = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 50000;
            var testSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10000;


            trainingSize = Math.max(Math.floor(trainingSize / 10) * 10, 10);
            testSize = Math.max(Math.floor(testSize / 10) * 10, 10);

            if (trainingSize + testSize > this.dataCount) {
                console.warn("Not enough data (" + this.dataCount + ") for " + trainingSize + " training and " + testSize + " test items. Scaling down.");
                this.training.length = Math.floor(this.dataCount / (trainingSize + testSize) * trainingSize / 10) * 10;
                this.test.length = Math.floor(this.dataCount / (trainingSize + testSize) * testSize / 10) * 10;
            } else {
                this.training.length = trainingSize;
                this.test.length = testSize;
            }

            this.reset();

            if (trainingSize + testSize > this.dataCount) {
                return this.dataCount;
            }
        }
    }, {
        key: "reset",
        value: function reset() {
            var _this2 = this;

            this.categories.forEach(function (category) {

                // Generate list of indeces for entire data set, either afresh, or appended to existing
                indeces.training[category] = [].concat(_toConsumableArray(new Array(_this2[category].totalLength))).map(function (v, i) {
                    return i;
                });
                shuffle(indeces.training[category]);

                // Move some of those indeces into the test set
                indeces.test[category] = indeces.training[category].splice(_this2.training.length / 10, _this2.dataCount / 10);

                // Limit the indeces to the given .split() amount
                _this2[category].training.length = _this2.training.length / 10;
                _this2[category].test.length = _this2.test.length / 10;
            });
        }
    }]);

    return CIFAR10;
}();

var Category = function () {
    function Category(label) {
        var _this3 = this;

        _classCallCheck(this, Category);

        this.label = label;
        this.output = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.output[CIFAR10.categories.indexOf(label)] = 1;
        this.totalLength = fs.statSync(CIFAR10.dataPath + "/" + this.label + ".bin").size / 3071;
        this.length = this.totalLength;

        this.training = {
            length: 0,
            get: function get(index) {
                index = index || index == 0 ? index : Math.floor(Math.random() * _this3.training.length);
                return _get.bind(_this3, Array.isArray(index) ? index.map(function (i) {
                    return indeces.training[label][i];
                }) : index)();
            }
        };
        this.test = {
            length: 0,
            get: function get(index) {
                index = index || index == 0 ? index : Math.floor(Math.random() * _this3.test.length);
                return _get.bind(_this3, Array.isArray(index) ? index.map(function (i) {
                    return indeces.test[label][i];
                }) : index)();
            }
        };

        this.get = function (index) {
            index = index || index == 0 ? index : Math.floor(Math.random() * (_this3.length - 1));
            return _get.bind(_this3, Array.isArray(index) ? index.map(function (i) {
                return indeces.test[label][i];
            }) : index)();
        };
    }

    _createClass(Category, [{
        key: "range",
        value: function range() {
            var _this4 = this;

            var start = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            var end = arguments[1];

            return new Promise(function (resolve, reject) {
                start = parseInt(start);
                var data = [];
                var readStream = fs.createReadStream(CIFAR10.dataPath + "/" + _this4.label + ".bin", {
                    start: start * 3071,
                    end: (parseInt(end) || start + 1) * 3071,
                    highWaterMark: 3072
                });
                readStream.on("data", function (chunk) {
                    return data.push(chunk);
                });
                readStream.on("end", function () {
                    readStream.close();
                    resolve(data.map(function (d) {
                        return {
                            input: Array.from(d).map(function (v) {
                                return v / 255;
                            }),
                            output: _this4.output
                        };
                    }));
                });
            });
        }
    }]);

    return Category;
}();

CIFAR10.categories = ["airplane", "automobile", "bird", "cat", "deer", "dog", "frog", "horse", "ship", "truck"];
CIFAR10.training = { get: getData.bind(null, "training") };
CIFAR10.test = { get: getData.bind(null, "test") };
CIFAR10.dataCount = 60000;

var readIndexCounters = {
    training: CIFAR10.categories.reduce(function (p, c) {
        p[c] = 0;return p;
    }, {}),
    test: CIFAR10.categories.reduce(function (p, c) {
        p[c] = 0;return p;
    }, {})
};

module.exports = function () {
    var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref2$dataPath = _ref2.dataPath,
        dataPath = _ref2$dataPath === undefined ? __dirname : _ref2$dataPath,
        _ref2$testing = _ref2.testing,
        testing = _ref2$testing === undefined ? false : _ref2$testing;

    CIFAR10.dataPath = dataPath;
    CIFAR10.categories.forEach(function (category) {
        return CIFAR10[category] = new Category(category);
    });
    CIFAR10.set(50000, 10000);

    return testing ? {
        testing: { shuffle: shuffle, get: _get, getData: getData, indeces: indeces },
        cifar10: CIFAR10
    } : CIFAR10;
};
//# sourceMappingURL=cifar10.js.map
