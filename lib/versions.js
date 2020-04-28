'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.oldVersions = exports.oldEnvVersions = exports.largestEnvVersion = exports.largestVersion = exports.s3Versions = exports.ebVersions = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var ebVersions = exports.ebVersions = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(api) {
    var config, versions, _names, app, appVersions;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            config = api.getConfig();
            versions = [0];
            _names = (0, _utils.names)(config), app = _names.app;
            _context.next = 5;
            return _aws.beanstalk.describeApplicationVersions({
              ApplicationName: app
            }).promise();

          case 5:
            appVersions = _context.sent;


            if (appVersions.ApplicationVersions.length > 0) {
              appVersions.ApplicationVersions.forEach(function (_ref2) {
                var VersionLabel = _ref2.VersionLabel;

                var parsedVersion = parseInt(VersionLabel, 10);

                versions.push(parsedVersion);
              });
            }

            return _context.abrupt('return', versions.sort(function (a, b) {
              return b - a;
            }));

          case 8:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function ebVersions(_x) {
    return _ref.apply(this, arguments);
  };
}();

var s3Versions = exports.s3Versions = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(api, prefix) {
    var config, versions, _names2, bucket, bundlePrefix, uploadedBundles;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            config = api.getConfig();
            versions = [0];
            _names2 = (0, _utils.names)(config), bucket = _names2.bucket, bundlePrefix = _names2.bundlePrefix;

            prefix = prefix || bundlePrefix;

            _context2.next = 6;
            return _aws.s3.listObjectsV2({
              Bucket: bucket,
              Prefix: prefix
            }).promise();

          case 6:
            uploadedBundles = _context2.sent;


            if (uploadedBundles.Contents.length > 0) {
              uploadedBundles.Contents.forEach(function (bundle) {
                var bundleVersion = parseInt(bundle.Key.split(prefix)[1], 10);

                versions.push(bundleVersion);
              });
            }

            return _context2.abrupt('return', versions.sort(function (a, b) {
              return b - a;
            }));

          case 9:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function s3Versions(_x2, _x3) {
    return _ref3.apply(this, arguments);
  };
}();

var largestVersion = exports.largestVersion = function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(api) {
    var _ref5, _ref6, version, _ref7, _ref8, appVersion;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return s3Versions(api);

          case 2:
            _ref5 = _context3.sent;
            _ref6 = _slicedToArray(_ref5, 1);
            version = _ref6[0];
            _context3.next = 7;
            return ebVersions(api);

          case 7:
            _ref7 = _context3.sent;
            _ref8 = _slicedToArray(_ref7, 1);
            appVersion = _ref8[0];


            if (appVersion > version) {
              version = appVersion;
            }

            return _context3.abrupt('return', version);

          case 12:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function largestVersion(_x4) {
    return _ref4.apply(this, arguments);
  };
}();

var largestEnvVersion = exports.largestEnvVersion = function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(api) {
    var versions, prefix, config, _names3, bucketName, uploadedBundles;

    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            versions = [0];
            prefix = 'env/';
            config = api.getConfig();
            _names3 = (0, _utils.names)(config), bucketName = _names3.bucket;
            _context4.next = 6;
            return _aws.s3.listObjectsV2({
              Bucket: bucketName,
              Prefix: prefix
            }).promise();

          case 6:
            uploadedBundles = _context4.sent;


            if (uploadedBundles.Contents.length > 0) {
              uploadedBundles.Contents.forEach(function (bundle) {
                var bundleVersion = parseInt(bundle.Key.split(prefix)[1], 10);

                versions.push(bundleVersion);
              });
            }

            return _context4.abrupt('return', versions.sort(function (a, b) {
              return b - a;
            })[0]);

          case 9:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  return function largestEnvVersion(_x5) {
    return _ref9.apply(this, arguments);
  };
}();

var oldEnvVersions = exports.oldEnvVersions = function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(api) {
    var keep, versions;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            keep = 10;
            _context5.next = 3;
            return s3Versions(api, 'env/');

          case 3:
            versions = _context5.sent;
            return _context5.abrupt('return', versions.slice(keep));

          case 5:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, this);
  }));

  return function oldEnvVersions(_x6) {
    return _ref10.apply(this, arguments);
  };
}();

var oldVersions = exports.oldVersions = function () {
  var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(api) {
    var keep, appVersions, bundleVersions, oldBundleVersions, oldAppVersions;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            keep = api.getConfig().app.oldVersions;
            _context6.next = 3;
            return ebVersions(api);

          case 3:
            appVersions = _context6.sent;
            _context6.next = 6;
            return s3Versions(api);

          case 6:
            bundleVersions = _context6.sent;


            // find unused bundles
            oldBundleVersions = (0, _lodash.difference)(bundleVersions, appVersions);

            // keep the 3 newest versions

            oldAppVersions = appVersions.slice(keep);
            return _context6.abrupt('return', {
              bundles: oldBundleVersions,
              versions: oldAppVersions
            });

          case 10:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, this);
  }));

  return function oldVersions(_x7) {
    return _ref11.apply(this, arguments);
  };
}();

var _lodash = require('lodash');

var _aws = require('./aws');

var _utils = require('./utils');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }