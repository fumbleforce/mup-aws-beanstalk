'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.waitForHealth = exports.waitForEnvReady = exports.showEvents = exports.getLastEvent = undefined;

var getLastEvent = exports.getLastEvent = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(config) {
    var _names, environment, _ref2, Events;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _names = (0, _utils.names)(config), environment = _names.environment;
            _context.next = 3;
            return _aws.beanstalk.describeEvents({
              EnvironmentName: environment,
              MaxRecords: 5
            }).promise();

          case 3:
            _ref2 = _context.sent;
            Events = _ref2.Events;
            return _context.abrupt('return', Events[0].EventDate);

          case 6:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function getLastEvent(_x) {
    return _ref.apply(this, arguments);
  };
}();

var showEvents = exports.showEvents = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(config, lastEventDate) {
    var _names2, environment, app, _ref4, Events;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _names2 = (0, _utils.names)(config), environment = _names2.environment, app = _names2.app;
            _context2.next = 3;
            return _aws.beanstalk.describeEvents({
              EnvironmentName: environment,
              ApplicationName: app,
              StartTime: lastEventDate
            }).promise();

          case 3:
            _ref4 = _context2.sent;
            Events = _ref4.Events;


            Events.forEach(function (event) {
              if (event.EventDate.toString() === lastEventDate.toString()) {
                return;
              }
              console.log(`  Env Event: ${event.Message}`);
            });

            return _context2.abrupt('return', new Date(Events[0].EventDate));

          case 7:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function showEvents(_x2, _x3) {
    return _ref3.apply(this, arguments);
  };
}();

var checker = function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(config, prop, wantedValue, showProgress) {
    var _names3, environment, app, lastEventDate, lastStatus;

    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _names3 = (0, _utils.names)(config), environment = _names3.environment, app = _names3.app;
            lastEventDate = null;
            lastStatus = null;

            if (!showProgress) {
              _context4.next = 7;
              break;
            }

            _context4.next = 6;
            return getLastEvent(config);

          case 6:
            lastEventDate = _context4.sent;

          case 7:
            return _context4.abrupt('return', new Promise(function (resolve, reject) {
              var check = function () {
                var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
                  var result, value, text;
                  return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                      switch (_context3.prev = _context3.next) {
                        case 0:
                          result = void 0;
                          _context3.prev = 1;
                          _context3.next = 4;
                          return _aws.beanstalk.describeEnvironments({
                            EnvironmentNames: [environment],
                            ApplicationName: app
                          }).promise();

                        case 4:
                          result = _context3.sent;
                          _context3.next = 15;
                          break;

                        case 7:
                          _context3.prev = 7;
                          _context3.t0 = _context3['catch'](1);

                          console.log('in check exception');

                          if (!(0, _recheck.checkForThrottlingException)(_context3.t0)) {
                            _context3.next = 13;
                            break;
                          }

                          (0, _recheck.handleThrottlingException)();
                          return _context3.abrupt('return', setTimeout(check, (0, _recheck.getRecheckInterval)()));

                        case 13:

                          console.log(_context3.t0);
                          reject(_context3.t0);

                        case 15:
                          value = result.Environments[0][prop];

                          if (!(value !== wantedValue && value !== lastStatus)) {
                            _context3.next = 22;
                            break;
                          }

                          text = prop === 'Health' ? `be ${wantedValue}` : `finish ${value}`;


                          (0, _utils.logStep)(`=> Waiting for Beanstalk Environment to ${text.toLocaleLowerCase()}`);
                          lastStatus = value;
                          _context3.next = 25;
                          break;

                        case 22:
                          if (!(value === wantedValue)) {
                            _context3.next = 25;
                            break;
                          }

                          // TODO: run showEvents one last time
                          resolve();

                          return _context3.abrupt('return');

                        case 25:
                          if (!showProgress) {
                            _context3.next = 35;
                            break;
                          }

                          _context3.prev = 26;
                          _context3.next = 29;
                          return showEvents(config, lastEventDate);

                        case 29:
                          lastEventDate = _context3.sent;
                          _context3.next = 35;
                          break;

                        case 32:
                          _context3.prev = 32;
                          _context3.t1 = _context3['catch'](26);

                          if ((0, _recheck.checkForThrottlingException)(_context3.t1)) {
                            (0, _recheck.handleThrottlingException)();
                          } else {
                            console.log(_context3.t1);
                          }

                        case 35:

                          setTimeout(check, (0, _recheck.getRecheckInterval)());

                        case 36:
                        case 'end':
                          return _context3.stop();
                      }
                    }
                  }, _callee3, this, [[1, 7], [26, 32]]);
                }));

                return function check() {
                  return _ref6.apply(this, arguments);
                };
              }();

              check();
            }));

          case 8:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  return function checker(_x4, _x5, _x6, _x7) {
    return _ref5.apply(this, arguments);
  };
}();

var waitForEnvReady = exports.waitForEnvReady = function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(config, showProgress) {
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return checker(config, 'Status', 'Ready', showProgress);

          case 2:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, this);
  }));

  return function waitForEnvReady(_x8, _x9) {
    return _ref7.apply(this, arguments);
  };
}();

var waitForHealth = exports.waitForHealth = function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(config) {
    var health = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Green';
    var showProgress = arguments[2];
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return checker(config, 'Health', health, showProgress);

          case 2:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, this);
  }));

  return function waitForHealth(_x11) {
    return _ref8.apply(this, arguments);
  };
}();

var _utils = require('./utils');

var _aws = require('./aws');

var _recheck = require('./recheck');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }