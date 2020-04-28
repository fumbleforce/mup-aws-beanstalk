'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.injectFiles = injectFiles;
exports.archiveApp = archiveApp;

var _archiver = require('archiver');

var _archiver2 = _interopRequireDefault(_archiver);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _ejs = require('ejs');

var _ejs2 = _interopRequireDefault(_ejs);

var _lodash = require('lodash');

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function copy(source, destination) {
  var vars = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var contents = _fs2.default.readFileSync(source).toString();

  contents = _ejs2.default.render(contents, vars);

  _fs2.default.writeFileSync(destination, contents);
}

function injectFiles(api, name, version, appConfig) {
  var yumPackages = appConfig.yumPackages,
      forceSSL = appConfig.forceSSL,
      gracefulShutdown = appConfig.gracefulShutdown,
      buildOptions = appConfig.buildOptions,
      longEnvVars = appConfig.longEnvVars,
      additionalFiles = appConfig.additionalFiles;

  var bundlePath = buildOptions.buildLocation;

  var _names = (0, _utils.names)({ app: appConfig }),
      bucket = _names.bucket;

  var sourcePath = api.resolvePath(__dirname, './assets/package.json');
  var destPath = api.resolvePath(bundlePath, 'bundle/package.json');
  copy(sourcePath, destPath, {
    name,
    version
  });

  sourcePath = api.resolvePath(__dirname, './assets/npmrc');
  destPath = api.resolvePath(bundlePath, 'bundle/.npmrc');
  copy(sourcePath, destPath);

  sourcePath = api.resolvePath(__dirname, './assets/start.sh');
  destPath = api.resolvePath(bundlePath, 'bundle/start.sh');
  copy(sourcePath, destPath);

  try {
    _fs2.default.mkdirSync(api.resolvePath(bundlePath, 'bundle/.ebextensions'));
  } catch (e) {
    if (e.code !== 'EEXIST') {
      console.log(e);
    }
  }

  var _getNodeVersion = (0, _utils.getNodeVersion)(api, bundlePath),
      nodeVersion = _getNodeVersion.nodeVersion,
      npmVersion = _getNodeVersion.npmVersion;

  sourcePath = api.resolvePath(__dirname, './assets/node.yaml');
  destPath = api.resolvePath(bundlePath, 'bundle/.ebextensions/node.config');
  copy(sourcePath, destPath, { nodeVersion, npmVersion });

  sourcePath = api.resolvePath(__dirname, './assets/nginx.yaml');
  destPath = api.resolvePath(bundlePath, 'bundle/.ebextensions/nginx.config');
  copy(sourcePath, destPath, { forceSSL });

  if (yumPackages) {
    sourcePath = api.resolvePath(__dirname, './assets/packages.yaml');
    destPath = api.resolvePath(bundlePath, 'bundle/.ebextensions/packages.config');
    copy(sourcePath, destPath, { packages: yumPackages });
  }

  if (gracefulShutdown) {
    sourcePath = api.resolvePath(__dirname, './assets/graceful_shutdown.yaml');
    destPath = api.resolvePath(bundlePath, 'bundle/.ebextensions/graceful_shutdown.config');
    copy(sourcePath, destPath);
  }

  if (longEnvVars) {
    sourcePath = api.resolvePath(__dirname, './assets/env.yaml');
    destPath = api.resolvePath(bundlePath, 'bundle/.ebextensions/env.config');
    copy(sourcePath, destPath, {
      bucketName: bucket
    });
  }

  if (additionalFiles) {
    sourcePath = api.resolvePath(__dirname, './assets/addfiles.yaml');
    destPath = api.resolvePath(bundlePath, 'bundle/.ebextensions/addfiles.config');
    copy(sourcePath, destPath, { additionalFiles });
  }

  sourcePath = api.resolvePath(__dirname, './assets/health-check.js');
  destPath = api.resolvePath(bundlePath, 'bundle/health-check.js');
  copy(sourcePath, destPath);
}

function archiveApp(buildLocation, api) {
  var bundlePath = api.resolvePath(buildLocation, 'bundle.zip');

  try {
    _fs2.default.unlinkSync(bundlePath);
  } catch (e) {
    // empty
  }

  return new Promise(function (resolve, reject) {
    (0, _utils.logStep)('=> Archiving Bundle');
    var sourceDir = api.resolvePath(buildLocation, 'bundle');

    var output = _fs2.default.createWriteStream(bundlePath);
    var archive = (0, _archiver2.default)('zip', {
      gzip: true,
      gzipOptions: {
        level: 9
      }
    });

    archive.pipe(output);
    output.once('close', resolve);

    archive.once('error', function (err) {
      (0, _utils.logStep)('=> Archiving failed:', err.message);
      reject(err);
    });

    var nextProgress = 0.1;
    archive.on('progress', function (_ref) {
      var entries = _ref.entries;

      try {
        var progress = entries.processed / entries.total;

        if (progress > nextProgress) {
          console.log(`  ${(0, _lodash.round)(Math.floor(nextProgress * 100), -1)}% Archived`);
          nextProgress += 0.1;
        }
      } catch (e) {
        console.log(e);
      }
    });

    archive.directory(sourceDir, false).finalize();
  });
}