'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (config, utils) {
  var details = [];
  details = utils.combineErrorDetails(details, _joi2.default.validate(config.app, schema, utils.VALIDATE_OPTIONS));
  if (config.app && config.app.name && config.app.name.length < 4) {
    details.push({
      message: 'must have at least 4 characters',
      path: 'name'
    });
  }

  return utils.addLocation(details, 'app');
};

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var schema = _joi2.default.object().keys({
  name: _joi2.default.string().min(1).required(),
  path: _joi2.default.string().min(1).required(),
  type: _joi2.default.string().required(),
  buildOptions: _joi2.default.object().keys({
    serverOnly: _joi2.default.bool(),
    debug: _joi2.default.bool(),
    buildLocation: _joi2.default.string(),
    mobileSettings: _joi2.default.object(),
    server: _joi2.default.string().uri(),
    allowIncompatibleUpdates: _joi2.default.boolean(),
    executable: _joi2.default.string()
  }),
  // The meteor plugin adds the docker object, which is a bug in mup
  docker: _joi2.default.object(),
  env: _joi2.default.object(),
  auth: _joi2.default.object().keys({
    id: _joi2.default.string().required(),
    secret: _joi2.default.string().required()
  }).required(),
  sslDomains: _joi2.default.array().items(_joi2.default.string()),
  forceSSL: _joi2.default.bool(),
  region: _joi2.default.string(),
  minInstances: _joi2.default.number().min(1).required(),
  maxInstances: _joi2.default.number().min(1),
  instanceType: _joi2.default.string(),
  deploymentPolicy: _joi2.default.string(),
  gracefulShutdown: _joi2.default.bool(),
  longEnvVars: _joi2.default.bool(),
  yumPackages: _joi2.default.object().pattern(/[/s/S]*/, [_joi2.default.string().allow('')]),
  additionalFiles: _joi2.default.array().items(_joi2.default.object({
    filepath: _joi2.default.string().trim().required(),
    content: _joi2.default.array().items(_joi2.default.string().allow(''))
  })),
  oldVersions: _joi2.default.number(),
  customBeanstalkConfig: _joi2.default.array().items(_joi2.default.object({
    namespace: _joi2.default.string().trim().required(),
    option: _joi2.default.string().trim().required(),
    value: _joi2.default.string().trim().required()
  }))
});