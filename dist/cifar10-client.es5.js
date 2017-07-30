"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    var CIFAR10 = function () {
        function CIFAR10() {
            _classCallCheck(this, CIFAR10);
        }

        _createClass(CIFAR10, null, [{
            key: "set",
            value: function set(training, test) {
                fetch("/set", { method: "Post", body: JSON.stringify({ training: training, test: test }) }).then(function (r) {
                    return r.json();
                }).then(function () {
                    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                        dataCount = _ref.dataCount;

                    if (dataCount) {
                        console.warn("Not enough data (" + dataCount + ") for " + training + " training and " + test + " test items. Scaling down.");
                    }
                });
            }
        }, {
            key: "reset",
            value: function reset() {
                fetch("/reset");
            }
        }, {
            key: "render",
            value: function render(data, context) {

                var inputData = data.input.map(function (v) {
                    return v * 255;
                });
                var imageDataBuffer = new Uint8ClampedArray(32 * 32 * 4);

                for (var rowI = 0; rowI < 32; rowI++) {
                    for (var colI = 0; colI < 32; colI++) {
                        var pos = (rowI * 32 + colI) * 4;
                        imageDataBuffer[pos] = inputData[rowI * 32 + colI];
                        imageDataBuffer[pos + 1] = inputData[rowI * 32 + colI + 1024];
                        imageDataBuffer[pos + 2] = inputData[rowI * 32 + colI + 2048];
                        imageDataBuffer[pos + 3] = 255;
                    }
                }

                var imageData = context.createImageData(32, 32);
                imageData.data.set(imageDataBuffer);
                context.putImageData(imageData, 0, 0);
                context.stroke();
            }
        }]);

        return CIFAR10;
    }();

    CIFAR10.categories = ["airplane", "automobile", "bird", "cat", "deer", "dog", "frog", "horse", "ship", "truck"];

    CIFAR10.categories.forEach(function (category) {
        CIFAR10[category] = {

            range: function range(start, end) {
                return fetch("/range", {
                    method: "Post",
                    body: JSON.stringify({ category: category, start: start, end: end })
                }).then(function (r) {
                    return r.json();
                });
            },

            training: {
                get: function get() {
                    var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                        index = _ref2.index,
                        indexList = _ref2.indexList;

                    return fetch("/category.training.get", {
                        method: "Post",
                        body: JSON.stringify({ category: category, index: index, indexList: indexList, type: "training" })
                    }).then(function (r) {
                        return r.json();
                    });
                },
                length: function length() {
                    return new Promise(function (resolve, reject) {
                        fetch("/category.training.length", {
                            method: "Post",
                            body: JSON.stringify({ category: category })
                        }).then(function (r) {
                            return r.json();
                        }).then(function (_ref3) {
                            var length = _ref3.length;
                            return resolve(length);
                        });
                    });
                }
            },
            test: {
                get: function get() {
                    var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                        index = _ref4.index,
                        indexList = _ref4.indexList;

                    return fetch("/category.training.get", {
                        method: "Post",
                        body: JSON.stringify({ category: category, index: index, indexList: indexList, type: "test" })
                    }).then(function (r) {
                        return r.json();
                    });
                },
                length: function length() {
                    return new Promise(function (resolve, reject) {
                        fetch("/category.test.length", {
                            method: "Post",
                            body: JSON.stringify({ category: category })
                        }).then(function (r) {
                            return r.json();
                        }).then(function (_ref5) {
                            var length = _ref5.length;
                            return resolve(length);
                        });
                    });
                }
            }
        };
    });

    CIFAR10.training = {
        get: function get(count) {
            return fetch("/training.get", { method: "Post", body: JSON.stringify({ count: count }) }).then(function (r) {
                return r.json();
            });
        },
        length: function length() {
            return new Promise(function (resolve, reject) {
                fetch("/training.length").then(function (r) {
                    return r.json();
                }).then(function (_ref6) {
                    var length = _ref6.length;
                    return resolve(length);
                });
            });
        }
    };
    CIFAR10.test = {
        get: function get(count) {
            return fetch("/test.get", { method: "Post", body: JSON.stringify({ count: count }) }).then(function (r) {
                return r.json();
            });
        },
        length: function length() {
            return new Promise(function (resolve, reject) {
                fetch("/test.length").then(function (r) {
                    return r.json();
                }).then(function (_ref7) {
                    var length = _ref7.length;
                    return resolve(length);
                });
            });
        }
    };

    window.CIFAR10 = CIFAR10;
})();
//# sourceMappingURL=cifar10-client.es5.js.map
