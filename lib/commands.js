'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.status = exports.reconfig = exports.ssl = exports.clean = exports.events = exports.restart = exports.stop = exports.start = exports.logsEb = exports.logsNginx = exports.logs = exports.deploy = exports.setup = undefined;

var _commandHandlers = require('./command-handlers');

var commandHandlers = _interopRequireWildcard(_commandHandlers);

var _aws = require('./aws');

var _aws2 = _interopRequireDefault(_aws);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var prepared = false;

function prepare(commandHandler) {
  return function handler(api) {
    if (!prepared) {
      (0, _aws2.default)(api.getConfig().app);
      prepared = true;
    }

    return commandHandler(api);
  };
}

var setup = exports.setup = {
  description: 'Prepare AWS to deploy app',
  handler: prepare(commandHandlers.setup)
};

var deploy = exports.deploy = {
  description: 'Deploy app to AWS Elastic Beanstalk',
  builder(subYargs) {
    return subYargs.option('cached-build', {
      description: 'Use build from previous deploy',
      boolean: true
    });
  },
  handler: commandHandlers.deploy
};

var logs = exports.logs = {
  description: 'View app\'s logs',
  builder(yargs) {
    return yargs.strict(false).option('tail', {
      description: 'Number of lines to show from the end of the logs',
      alias: 't',
      number: true
    }).option('follow', {
      description: 'Follow log output',
      alias: 'f',
      boolean: true
    });
  },
  handler: prepare(commandHandlers.logs)
};

var logsNginx = exports.logsNginx = {
  name: 'logs-nginx',
  description: 'View Nginx logs',
  handler: prepare(commandHandlers.logsNginx)
};

var logsEb = exports.logsEb = {
  name: 'logs-eb',
  description: 'Logs from setting up server and installing npm dependencies',
  handler: prepare(commandHandlers.logsEb)
};

var start = exports.start = {
  description: 'Start app',
  handler: prepare(commandHandlers.start)
};

var stop = exports.stop = {
  description: 'Stop app',
  handler: prepare(commandHandlers.stop)
};

var restart = exports.restart = {
  description: 'Restart app',
  handler: prepare(commandHandlers.restart)
};

var events = exports.events = {
  description: 'Environment Events',
  handler: prepare(commandHandlers.events)
};

var clean = exports.clean = {
  description: 'Remove old bundles and app versions',
  handler: prepare(commandHandlers.clean)
};

var ssl = exports.ssl = {
  description: 'Setup and view status of ssl certificate',
  handler: prepare(commandHandlers.ssl)
};

var reconfig = exports.reconfig = {
  description: 'Update env variables, instance count, and Meteor settings.json',
  handler: prepare(commandHandlers.reconfig)
};

var status = exports.status = {
  description: 'View status of app',
  handler: prepare(commandHandlers.status)
};