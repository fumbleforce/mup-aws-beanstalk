'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hooks = exports.validate = exports.commands = exports.description = exports.name = undefined;
exports.prepareConfig = prepareConfig;

var _commands2 = require('./commands');

var _commands = _interopRequireWildcard(_commands2);

var _validate = require('./validate');

var _validate2 = _interopRequireDefault(_validate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var name = exports.name = 'beanstalk';
var description = exports.description = 'Deploy Meteor app to AWS Elastic Beanstalk';
var commands = exports.commands = _commands;

var validate = exports.validate = {
  app(config, utils) {
    if (config.app && config.app.type === 'aws-beanstalk') {
      return (0, _validate2.default)(config, utils);
    }

    return [];
  }
};

function prepareConfig(config) {
  if (!config.app || config.app.type !== 'aws-beanstalk') {
    return config;
  }

  var defaultBuildOptions = {
    serverOnly: true
  };

  config.app.buildOptions = config.app.buildOptions || defaultBuildOptions;

  // This will change 0 to 1. The validator will warn when the number is 0
  // To have 0 instances, `mup stop` should be used
  config.app.minInstances = config.app.minInstances || 1;
  config.app.maxInstances = config.app.maxInstances || config.app.minInstances;

  config.app.instanceType = config.app.instanceType || 't2.micro';
  config.app.deploymentPolicy = config.app.deploymentPolicy || 'RollingWithAdditionalBatch';

  config.app.env = config.app.env || {};
  config.app.env.PORT = 8081;
  config.app.env.METEOR_SIGTERM_GRACE_PERIOD_SECONDS = 30;

  config.app.oldVersions = config.app.oldVersions || 3;

  return config;
}

function isBeanstalkApp(api) {
  var config = api.getConfig();

  if (config.app && config.app.type === 'aws-beanstalk') {
    return true;
  }

  return false;
}

var hooks = exports.hooks = {
  'post.setup': function postSetup(api) {
    if (isBeanstalkApp(api)) {
      return api.runCommand('beanstalk.setup');
    }
  },
  'post.deploy': function postDeploy(api) {
    if (isBeanstalkApp(api)) {
      return api.runCommand('beanstalk.deploy');
    }
  },
  'post.logs': function postLogs(api) {
    if (isBeanstalkApp(api)) {
      return api.runCommand('beanstalk.logs');
    }
  },
  'post.start': function postStart(api) {
    if (isBeanstalkApp(api)) {
      return api.runCommand('beanstalk.start');
    }
  },
  'post.stop': function postStop(api) {
    if (isBeanstalkApp(api)) {
      return api.runCommand('beanstalk.stop');
    }
  },
  'post.restart': function postRestart(api) {
    if (isBeanstalkApp(api)) {
      return api.runCommand('beanstalk.restart');
    }
  },
  'post.reconfig': function postReconfig(api) {
    if (isBeanstalkApp(api)) {
      return api.runCommand('beanstalk.reconfig');
    }
  },
  'post.status': function postStatus(api) {
    if (isBeanstalkApp(api)) {
      return api.runCommand('beanstalk.status');
    }
  }
};