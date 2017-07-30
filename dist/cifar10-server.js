"use strict";

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var http = require("http");
var url = require("url");
var fs = require("fs");
var cifar10 = require("./cifar10")({ dataPath: "../data" });

http.createServer(function (request, response) {

    var path = url.parse(request.url).pathname;
    var jsonData = "";
    var data = "";
    path = path == "/" ? "index.html" : path;

    request.on("data", function (chunk) {
        return jsonData += chunk;
    });
    request.on("end", _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        var dataCount;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:

                        console.log(path);

                        jsonData = jsonData.length ? JSON.parse(jsonData) : jsonData;

                        _context.t0 = path;
                        _context.next = _context.t0 === "/set" ? 5 : _context.t0 === "/range" ? 8 : _context.t0 === "/reset" ? 19 : _context.t0 === "/training.get" ? 21 : _context.t0 === "/test.get" ? 38 : _context.t0 === "/training.length" ? 55 : _context.t0 === "/test.length" ? 57 : _context.t0 === "/category.training.get" ? 59 : _context.t0 === "/category.test.get" ? 76 : _context.t0 === "/category.training.length" ? 93 : _context.t0 === "/category.test.length" ? 95 : 97;
                        break;

                    case 5:
                        dataCount = cifar10.set(jsonData.training, jsonData.test);

                        data = JSON.stringify({ dataCount: dataCount });
                        return _context.abrupt("break", 98);

                    case 8:
                        _context.prev = 8;
                        _context.next = 11;
                        return cifar10[jsonData.category].range(jsonData.start, jsonData.end);

                    case 11:
                        data = _context.sent;

                        data = JSON.stringify(data);
                        _context.next = 18;
                        break;

                    case 15:
                        _context.prev = 15;
                        _context.t1 = _context["catch"](8);
                        console.log(_context.t1.stack);

                    case 18:
                        return _context.abrupt("break", 98);

                    case 19:
                        cifar10.reset();
                        return _context.abrupt("break", 98);

                    case 21:
                        _context.prev = 21;

                        if (!jsonData.indexList) {
                            _context.next = 28;
                            break;
                        }

                        _context.next = 25;
                        return cifar10.training.get(jsonData.indexList);

                    case 25:
                        data = _context.sent;
                        _context.next = 31;
                        break;

                    case 28:
                        _context.next = 30;
                        return cifar10.training.get(jsonData.count);

                    case 30:
                        data = _context.sent;

                    case 31:
                        data = JSON.stringify(data);
                        _context.next = 37;
                        break;

                    case 34:
                        _context.prev = 34;
                        _context.t2 = _context["catch"](21);
                        console.log(_context.t2.stack);

                    case 37:
                        return _context.abrupt("break", 98);

                    case 38:
                        _context.prev = 38;

                        if (!jsonData.indexList) {
                            _context.next = 45;
                            break;
                        }

                        _context.next = 42;
                        return cifar10.test.get(jsonData.indexList);

                    case 42:
                        data = _context.sent;
                        _context.next = 48;
                        break;

                    case 45:
                        _context.next = 47;
                        return cifar10.test.get(jsonData.count);

                    case 47:
                        data = _context.sent;

                    case 48:
                        data = JSON.stringify(data);
                        _context.next = 54;
                        break;

                    case 51:
                        _context.prev = 51;
                        _context.t3 = _context["catch"](38);
                        console.log(_context.t3.stack);

                    case 54:
                        return _context.abrupt("break", 98);

                    case 55:
                        data = JSON.stringify({ length: cifar10.training.length });
                        return _context.abrupt("break", 98);

                    case 57:
                        data = JSON.stringify({ length: cifar10.test.length });
                        return _context.abrupt("break", 98);

                    case 59:
                        _context.prev = 59;

                        if (!jsonData.indexList) {
                            _context.next = 66;
                            break;
                        }

                        _context.next = 63;
                        return cifar10[jsonData.category].training.get(jsonData.indexList);

                    case 63:
                        data = _context.sent;
                        _context.next = 69;
                        break;

                    case 66:
                        _context.next = 68;
                        return cifar10[jsonData.category].training.get(jsonData.count);

                    case 68:
                        data = _context.sent;

                    case 69:
                        data = JSON.stringify(data);

                        _context.next = 75;
                        break;

                    case 72:
                        _context.prev = 72;
                        _context.t4 = _context["catch"](59);
                        console.log(_context.t4.stack);

                    case 75:
                        return _context.abrupt("break", 98);

                    case 76:
                        _context.prev = 76;

                        if (!jsonData.indexList) {
                            _context.next = 83;
                            break;
                        }

                        _context.next = 80;
                        return cifar10[jsonData.category].test.get(jsonData.indexList);

                    case 80:
                        data = _context.sent;
                        _context.next = 86;
                        break;

                    case 83:
                        _context.next = 85;
                        return cifar10[jsonData.category].test.get(jsonData.count);

                    case 85:
                        data = _context.sent;

                    case 86:
                        data = JSON.stringify(data);

                        _context.next = 92;
                        break;

                    case 89:
                        _context.prev = 89;
                        _context.t5 = _context["catch"](76);
                        console.log(_context.t5.stack);

                    case 92:
                        return _context.abrupt("break", 98);

                    case 93:
                        data = JSON.stringify({ length: cifar10[jsonData.category].training.length });
                        return _context.abrupt("break", 98);

                    case 95:
                        data = JSON.stringify({ length: cifar10[jsonData.category].test.length });
                        return _context.abrupt("break", 98);

                    case 97:
                        try {
                            data = fs.readFileSync(__dirname + "/" + path);
                        } catch (e) {}

                    case 98:

                        response.end(data);

                    case 99:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, undefined, [[8, 15], [21, 34], [38, 51], [59, 72], [76, 89]]);
    })));
}).listen(1337, function () {
    return console.log("Listening on port 1337");
});
//# sourceMappingURL=cifar10-server.js.map
