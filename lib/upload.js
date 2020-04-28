'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = upload;
exports.uploadEnvFile = uploadEnvFile;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _shellEscape = require('shell-escape');

var _shellEscape2 = _interopRequireDefault(_shellEscape);

var _aws = require('./aws');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function upload(appConfig, bucket, key, bundlePath) {
  var params = { Bucket: bucket };
  var fileStream = _fs2.default.createReadStream(bundlePath);
  fileStream.on('error', function (err) {
    console.log(err);
  });

  params.Body = fileStream;
  params.Key = key;

  return new Promise(function (resolve, reject) {
    var lastPercentage = -1;

    var uploader = _aws.s3.upload(params);

    uploader.on('httpUploadProgress', function (progress) {
      var percentage = Math.floor(progress.loaded / progress.total * 100);

      if (percentage !== lastPercentage) {
        console.log(`  Uploaded ${percentage}%`);

        if (percentage === 100) {
          console.log('  Finishing upload. This could take a couple minutes');
        }
      }

      lastPercentage = percentage;
    });

    uploader.send(function (err, result) {
      if (err) {
        reject(err);
        return;
      }

      resolve(result);
    });
  });
}

function uploadEnvFile(bucket, version, env, settings) {
  var content = '';
  var settingsString = encodeURIComponent(JSON.stringify(settings));

  Object.keys(env).forEach(function (key) {
    var value = (0, _shellEscape2.default)([env[key]]);
    content += `export ${key}=${value}\n`;
  });

  content += `export METEOR_SETTINGS_ENCODED=${(0, _shellEscape2.default)([settingsString])}`;

  return new Promise(function (resolve, reject) {
    var uploader = _aws.s3.upload({
      Bucket: bucket,
      Body: content,
      Key: `env/${version}.txt`
    });
    uploader.send(function (err, result) {
      if (err) {
        return reject(err);
      }

      resolve(result);
    });
  });
}