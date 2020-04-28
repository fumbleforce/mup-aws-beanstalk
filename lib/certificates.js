'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _aws = require('./aws');

var _utils = require('./utils');

var _ebConfig = require('./eb-config');

var _envReady = require('./env-ready');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(config, certificateArn) {
    var _names, app, environment, ebConfig, domains, needToUpdate, _ref3, ConfigurationSettings, current, desired;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _names = (0, _utils.names)(config), app = _names.app, environment = _names.environment;
            ebConfig = [{
              Namespace: 'aws:elbv2:listener:443',
              OptionName: 'SSLCertificateArns',
              Value: certificateArn
            }, {
              Namespace: 'aws:elbv2:listener:443',
              OptionName: 'DefaultProcess',
              Value: 'default'
            }, {
              Namespace: 'aws:elbv2:listener:443',
              OptionName: 'ListenerEnabled',
              Value: 'true'
            }, {
              Namespace: 'aws:elbv2:listener:443',
              OptionName: 'Protocol',
              Value: 'HTTPS'
            }];
            domains = config.app.sslDomains;
            _context.next = 5;
            return (0, _envReady.waitForEnvReady)(config, true);

          case 5:
            if (!(!domains || domains.length === 0)) {
              _context.next = 10;
              break;
            }

            _context.next = 8;
            return _aws.beanstalk.updateEnvironment({
              EnvironmentName: environment,
              // eslint-disable-next-line arrow-body-style
              OptionsToRemove: ebConfig.map(function (_ref2) {
                var Namespace = _ref2.Namespace,
                    OptionName = _ref2.OptionName;

                return {
                  Namespace,
                  OptionName
                };
              })
            }).promise();

          case 8:
            _context.next = 23;
            break;

          case 10:
            needToUpdate = false;
            _context.next = 13;
            return _aws.beanstalk.describeConfigurationSettings({
              EnvironmentName: environment,
              ApplicationName: app
            }).promise();

          case 13:
            _ref3 = _context.sent;
            ConfigurationSettings = _ref3.ConfigurationSettings;
            current = ConfigurationSettings[0].OptionSettings.reduce(_ebConfig.convertToObject, {});
            desired = ebConfig.reduce(_ebConfig.convertToObject, {});


            Object.keys(desired).forEach(function (key) {
              if (needToUpdate || !current[key] || current[key].Value !== desired[key].Value) {
                needToUpdate = true;
              }
            });

            if (!needToUpdate) {
              _context.next = 23;
              break;
            }

            _context.next = 21;
            return _aws.beanstalk.updateEnvironment({
              EnvironmentName: environment,
              OptionSettings: ebConfig
            }).promise();

          case 21:
            _context.next = 23;
            return (0, _envReady.waitForEnvReady)(config, true);

          case 23:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  function ensureSSLConfigured(_x, _x2) {
    return _ref.apply(this, arguments);
  }

  return ensureSSLConfigured;
}();