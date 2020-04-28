'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ssm = exports.sts = exports.cloudWatchEvents = exports.cloudTrail = exports.acm = exports.autoScaling = exports.iam = exports.beanstalk = exports.s3 = undefined;
exports.default = configure;

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable import/no-mutable-exports */
var s3 = exports.s3 = {};
var beanstalk = exports.beanstalk = {};
var iam = exports.iam = {};
var autoScaling = exports.autoScaling = {};
var acm = exports.acm = {};
var cloudTrail = exports.cloudTrail = {};
var cloudWatchEvents = exports.cloudWatchEvents = {};
var sts = exports.sts = {};
var ssm = exports.ssm = {};

/* eslint-enable import/no-mutable-exports */

function configure(_ref) {
  var auth = _ref.auth,
      name = _ref.name,
      region = _ref.region;

  var options = {
    accessKeyId: auth.id,
    secretAccessKey: auth.secret,
    region: region || 'us-east-1'
  };

  _awsSdk2.default.config.update(options);

  exports.s3 = s3 = new _awsSdk2.default.S3({ params: { Bucket: `mup-${name}` }, apiVersion: '2006-03-01' });
  exports.beanstalk = beanstalk = new _awsSdk2.default.ElasticBeanstalk({ apiVersion: '2010-12-01' });
  exports.iam = iam = new _awsSdk2.default.IAM({ apiVersion: '2010-05-08' });
  exports.autoScaling = autoScaling = new _awsSdk2.default.AutoScaling({ apiVersion: '2011-01-01' });
  exports.acm = acm = new _awsSdk2.default.ACM({ apiVersion: '2015-12-08' });
  exports.cloudTrail = cloudTrail = new _awsSdk2.default.CloudTrail({ apiVersion: '2013-11-01' });
  exports.sts = sts = new _awsSdk2.default.STS({ apiVersion: '2011-06-15' });
  exports.cloudWatchEvents = cloudWatchEvents = new _awsSdk2.default.CloudWatchEvents({ apiVersion: '2015-10-07' });
  exports.ssm = ssm = new _awsSdk2.default.SSM({ apiVersion: '2014-11-06' });
}