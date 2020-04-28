'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ssl = exports.status = exports.events = exports.reconfig = exports.clean = exports.restart = exports.stop = exports.start = exports.logsEb = exports.logsNginx = exports.logs = exports.deploy = exports.setup = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var setup = exports.setup = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(api) {
    var config, appConfig, _names, bucketName, appName, instanceProfile, serviceRoleName, trailBucketPrefix, trailName, deregisterRuleName, environmentName, eventTargetRoleName, eventTargetPolicyName, eventTargetPassRoleName, automationDocument, _ref2, Buckets, beanstalkBucketCreated, accountId, policy, passPolicy, _ref3, Applications, params, region, regionTrailBucketPrefix, existingBucket, trailBucketName, _accountId, _policy, trailBucketCreated, _params, _ref4, trailList, createParams, createdDocument, createdRule, target, createdTarget;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            config = api.getConfig();
            appConfig = config.app;
            _names = (0, _utils.names)(config), bucketName = _names.bucket, appName = _names.app, instanceProfile = _names.instanceProfile, serviceRoleName = _names.serviceRole, trailBucketPrefix = _names.trailBucketPrefix, trailName = _names.trailName, deregisterRuleName = _names.deregisterRuleName, environmentName = _names.environment, eventTargetRoleName = _names.eventTargetRole, eventTargetPolicyName = _names.eventTargetPolicyName, eventTargetPassRoleName = _names.eventTargetPassRoleName, automationDocument = _names.automationDocument;


            (0, _utils.logStep)('=> Setting up');

            // Create bucket if needed
            _context.next = 6;
            return _aws.s3.listBuckets().promise();

          case 6:
            _ref2 = _context.sent;
            Buckets = _ref2.Buckets;
            _context.next = 10;
            return (0, _utils.ensureBucketExists)(Buckets, bucketName, appConfig.region);

          case 10:
            beanstalkBucketCreated = _context.sent;


            if (beanstalkBucketCreated) {
              console.log('  Created Bucket');
            }

            (0, _utils.logStep)('=> Ensuring IAM Roles and Instance Profiles are setup');

            // Create role and instance profile
            _context.next = 15;
            return (0, _utils.ensureRoleExists)(instanceProfile, _policies.rolePolicy);

          case 15:
            _context.next = 17;
            return (0, _utils.ensureInstanceProfileExists)(config, instanceProfile);

          case 17:
            _context.next = 19;
            return (0, _utils.ensurePoliciesAttached)(config, instanceProfile, ['arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier', 'arn:aws:iam::aws:policy/AWSElasticBeanstalkMulticontainerDocker', 'arn:aws:iam::aws:policy/AWSElasticBeanstalkWorkerTier'].concat(_toConsumableArray(appConfig.gracefulShutdown ? ['arn:aws:iam::aws:policy/service-role/AmazonEC2RoleforSSM'] : [])));

          case 19:
            _context.next = 21;
            return (0, _utils.ensureRoleAdded)(config, instanceProfile, instanceProfile);

          case 21:
            _context.next = 23;
            return (0, _utils.ensureRoleExists)(serviceRoleName, _policies.serviceRole);

          case 23:
            _context.next = 25;
            return (0, _utils.ensurePoliciesAttached)(config, serviceRoleName, ['arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkEnhancedHealth', 'arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkService']);

          case 25:
            if (!appConfig.gracefulShutdown) {
              _context.next = 37;
              break;
            }

            _context.next = 28;
            return (0, _utils.getAccountId)();

          case 28:
            accountId = _context.sent;
            policy = (0, _policies.eventTargetRolePolicy)(accountId, environmentName, appConfig.region || 'us-east-1');
            passPolicy = (0, _policies.passRolePolicy)(accountId, eventTargetRoleName);
            _context.next = 33;
            return (0, _utils.ensureRoleExists)(eventTargetRoleName, _policies.eventTargetRole, true);

          case 33:
            _context.next = 35;
            return (0, _utils.ensureInlinePolicyAttached)(eventTargetRoleName, eventTargetPolicyName, policy);

          case 35:
            _context.next = 37;
            return (0, _utils.ensureInlinePolicyAttached)(eventTargetRoleName, eventTargetPassRoleName, passPolicy);

          case 37:
            _context.next = 39;
            return _aws.beanstalk.describeApplications().promise();

          case 39:
            _ref3 = _context.sent;
            Applications = _ref3.Applications;

            if (Applications.find(function (app) {
              return app.ApplicationName === appName;
            })) {
              _context.next = 46;
              break;
            }

            params = {
              ApplicationName: appName,
              Description: `App "${appConfig.name}" managed by Meteor Up`
            };
            _context.next = 45;
            return _aws.beanstalk.createApplication(params).promise();

          case 45:
            console.log('  Created Beanstalk application');

          case 46:
            if (!appConfig.gracefulShutdown) {
              _context.next = 85;
              break;
            }

            (0, _utils.logStep)('=> Ensuring Graceful Shutdown is setup');
            region = appConfig.region || 'us-east-1';
            regionTrailBucketPrefix = `${trailBucketPrefix}-${region}`;
            existingBucket = (0, _utils.findBucketWithPrefix)(Buckets, regionTrailBucketPrefix);
            trailBucketName = existingBucket ? existingBucket.Name : (0, _utils.createUniqueName)(regionTrailBucketPrefix);
            _context.next = 54;
            return (0, _utils.getAccountId)();

          case 54:
            _accountId = _context.sent;
            _policy = (0, _policies.trailBucketPolicy)(_accountId, trailBucketName);
            _context.next = 58;
            return (0, _utils.ensureBucketExists)(Buckets, trailBucketName, appConfig.region);

          case 58:
            trailBucketCreated = _context.sent;
            _context.next = 61;
            return (0, _utils.ensureBucketPolicyAttached)(trailBucketName, _policy);

          case 61:

            if (trailBucketCreated) {
              console.log('  Created bucket for Cloud Trail');
            }

            _params = {
              trailNameList: [trailName]
            };
            _context.next = 65;
            return _aws.cloudTrail.describeTrails(_params).promise();

          case 65:
            _ref4 = _context.sent;
            trailList = _ref4.trailList;

            if (!(trailList.length === 0)) {
              _context.next = 72;
              break;
            }

            createParams = {
              Name: trailName,
              S3BucketName: trailBucketName
            };
            _context.next = 71;
            return _aws.cloudTrail.createTrail(createParams).promise();

          case 71:

            console.log('  Created CloudTrail trail');

          case 72:
            _context.next = 74;
            return (0, _utils.ensureSsmDocument)(automationDocument, (0, _policies.gracefulShutdownAutomationDocument)());

          case 74:
            createdDocument = _context.sent;

            if (createdDocument) {
              console.log('  Created SSM Automation Document');
            }

            _context.next = 78;
            return (0, _utils.ensureCloudWatchRule)(deregisterRuleName, 'Used by Meteor Up for graceful shutdown', _policies.DeregisterEvent);

          case 78:
            createdRule = _context.sent;


            if (createdRule) {
              console.log('  Created Cloud Watch rule');
            }

            target = (0, _policies.deregisterEventTarget)(environmentName, eventTargetRoleName, _accountId, region);
            _context.next = 83;
            return (0, _utils.ensureRuleTargetExists)(deregisterRuleName, target, _accountId);

          case 83:
            createdTarget = _context.sent;


            if (createdTarget) {
              console.log('  Created target for Cloud Watch rule');
            }

          case 85:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function setup(_x) {
    return _ref.apply(this, arguments);
  };
}();

var deploy = exports.deploy = function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(api) {
    var config, _names2, app, bucket, bundlePrefix, environment, version, nextVersion, bundlePath, willBuild, key, _ref6, Environments, _ref7, ConfigurationSettings, _checkLongEnvSafe, migrated;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return api.runCommand('beanstalk.setup');

          case 2:
            config = api.getConfig();
            _names2 = (0, _utils.names)(config), app = _names2.app, bucket = _names2.bucket, bundlePrefix = _names2.bundlePrefix, environment = _names2.environment;
            _context2.next = 6;
            return (0, _versions.largestVersion)(api);

          case 6:
            version = _context2.sent;
            nextVersion = version + 1;

            // Mutates the config, so the meteor.build command will have the correct build location

            config.app.buildOptions.buildLocation = config.app.buildOptions.buildLocation || (0, _utils.tmpBuildPath)(config.app.path, api);

            bundlePath = api.resolvePath(config.app.buildOptions.buildLocation, 'bundle.zip');
            willBuild = (0, _utils.shouldRebuild)(bundlePath, api.getOptions()['cached-build']);

            if (!willBuild) {
              _context2.next = 17;
              break;
            }

            _context2.next = 14;
            return api.runCommand('meteor.build');

          case 14:
            (0, _prepareBundle.injectFiles)(api, app, nextVersion, config.app);
            _context2.next = 17;
            return (0, _prepareBundle.archiveApp)(config.app.buildOptions.buildLocation, api);

          case 17:

            (0, _utils.logStep)('=> Uploading bundle');

            key = `${bundlePrefix}${nextVersion}`;
            _context2.next = 21;
            return (0, _upload2.default)(config.app, bucket, `${bundlePrefix}${nextVersion}`, bundlePath);

          case 21:

            (0, _utils.logStep)('=> Creating Version');

            _context2.next = 24;
            return _aws.beanstalk.createApplicationVersion({
              ApplicationName: app,
              VersionLabel: nextVersion.toString(),
              Description: (0, _utils.createVersionDescription)(api, config.app),
              SourceBundle: {
                S3Bucket: bucket,
                S3Key: key
              }
            }).promise();

          case 24:
            _context2.next = 26;
            return api.runCommand('beanstalk.reconfig');

          case 26:

            (0, _utils.logStep)('=> Deploying new version');

            _context2.next = 29;
            return _aws.beanstalk.updateEnvironment({
              EnvironmentName: environment,
              VersionLabel: nextVersion.toString()
            }).promise();

          case 29:
            _context2.next = 31;
            return (0, _envReady.waitForEnvReady)(config, true);

          case 31:
            _context2.next = 33;
            return _aws.beanstalk.describeEnvironments({
              ApplicationName: app,
              EnvironmentNames: [environment]
            }).promise();

          case 33:
            _ref6 = _context2.sent;
            Environments = _ref6.Environments;


            console.log(_chalk2.default.green(`App is running at ${Environments[0].CNAME}`));

            _context2.next = 38;
            return api.runCommand('beanstalk.clean');

          case 38:
            _context2.next = 40;
            return api.runCommand('beanstalk.ssl');

          case 40:
            if (!config.app.longEnvVars) {
              _context2.next = 52;
              break;
            }

            _context2.next = 43;
            return _aws.beanstalk.describeConfigurationSettings({
              EnvironmentName: environment,
              ApplicationName: app
            }).promise();

          case 43:
            _ref7 = _context2.sent;
            ConfigurationSettings = _ref7.ConfigurationSettings;
            _checkLongEnvSafe = (0, _utils.checkLongEnvSafe)(ConfigurationSettings, api.commandHistory, config.app), migrated = _checkLongEnvSafe.migrated;

            if (migrated) {
              _context2.next = 52;
              break;
            }

            (0, _utils.logStep)('=> Migrating to longEnvVars');
            _context2.next = 50;
            return (0, _envReady.waitForEnvReady)(config, true);

          case 50:
            _context2.next = 52;
            return api.runCommand('beanstalk.reconfig');

          case 52:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function deploy(_x2) {
    return _ref5.apply(this, arguments);
  };
}();

var logs = exports.logs = function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(api) {
    var logsContent;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return (0, _utils.getLogs)(api);

          case 2:
            logsContent = _context3.sent;


            logsContent.forEach(function (_ref9) {
              var data = _ref9.data,
                  instance = _ref9.instance;

              data = data.split('-------------------------------------\n/var/log/');
              process.stdout.write(`${instance} `);
              process.stdout.write(data[1]);
            });

          case 4:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function logs(_x3) {
    return _ref8.apply(this, arguments);
  };
}();

var logsNginx = exports.logsNginx = function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(api) {
    var logsContent;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return (0, _utils.getLogs)(api);

          case 2:
            logsContent = _context4.sent;


            logsContent.forEach(function (_ref11) {
              var instance = _ref11.instance,
                  data = _ref11.data;

              data = data.split('-------------------------------------\n/var/log/');
              console.log(`${instance} `, data[2]);
              console.log(`${instance} `, data[4]);
            });

          case 4:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  return function logsNginx(_x4) {
    return _ref10.apply(this, arguments);
  };
}();

var logsEb = exports.logsEb = function () {
  var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(api) {
    var logsContent;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return (0, _utils.getLogs)(api);

          case 2:
            logsContent = _context5.sent;


            logsContent.forEach(function (_ref13) {
              var data = _ref13.data,
                  instance = _ref13.instance;

              data = data.split('\n\n\n-------------------------------------\n/var/log/');
              process.stdout.write(`${instance} `);
              process.stdout.write(data[2]);
            });

          case 4:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, this);
  }));

  return function logsEb(_x5) {
    return _ref12.apply(this, arguments);
  };
}();

var start = exports.start = function () {
  var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(api) {
    var config, _names3, environment, _ref15, EnvironmentResources, autoScalingGroup, _config$app, minInstances, maxInstances;

    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            config = api.getConfig();
            _names3 = (0, _utils.names)(config), environment = _names3.environment;


            (0, _utils.logStep)('=> Starting App');

            _context6.next = 5;
            return _aws.beanstalk.describeEnvironmentResources({
              EnvironmentName: environment
            }).promise();

          case 5:
            _ref15 = _context6.sent;
            EnvironmentResources = _ref15.EnvironmentResources;
            autoScalingGroup = EnvironmentResources.AutoScalingGroups[0].Name;
            _config$app = config.app, minInstances = _config$app.minInstances, maxInstances = _config$app.maxInstances;
            _context6.next = 11;
            return _aws.autoScaling.updateAutoScalingGroup({
              AutoScalingGroupName: autoScalingGroup,
              MaxSize: maxInstances,
              MinSize: minInstances,
              DesiredCapacity: minInstances
            }).promise();

          case 11:
            _context6.next = 13;
            return (0, _envReady.waitForHealth)(config);

          case 13:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, this);
  }));

  return function start(_x6) {
    return _ref14.apply(this, arguments);
  };
}();

var stop = exports.stop = function () {
  var _ref16 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(api) {
    var config, _names4, environment, _ref17, EnvironmentResources, autoScalingGroup;

    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            config = api.getConfig();
            _names4 = (0, _utils.names)(config), environment = _names4.environment;


            (0, _utils.logStep)('=> Stopping App');

            _context7.next = 5;
            return _aws.beanstalk.describeEnvironmentResources({
              EnvironmentName: environment
            }).promise();

          case 5:
            _ref17 = _context7.sent;
            EnvironmentResources = _ref17.EnvironmentResources;
            autoScalingGroup = EnvironmentResources.AutoScalingGroups[0].Name;
            _context7.next = 10;
            return _aws.autoScaling.updateAutoScalingGroup({
              AutoScalingGroupName: autoScalingGroup,
              MaxSize: 0,
              MinSize: 0,
              DesiredCapacity: 0
            }).promise();

          case 10:
            _context7.next = 12;
            return (0, _envReady.waitForHealth)(config, 'Grey');

          case 12:
          case 'end':
            return _context7.stop();
        }
      }
    }, _callee7, this);
  }));

  return function stop(_x7) {
    return _ref16.apply(this, arguments);
  };
}();

var restart = exports.restart = function () {
  var _ref18 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(api) {
    var config, _names5, environment;

    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            config = api.getConfig();
            _names5 = (0, _utils.names)(config), environment = _names5.environment;


            (0, _utils.logStep)('=> Restarting App');

            _context8.next = 5;
            return _aws.beanstalk.restartAppServer({
              EnvironmentName: environment
            }).promise();

          case 5:
            _context8.next = 7;
            return (0, _envReady.waitForEnvReady)(config, false);

          case 7:
          case 'end':
            return _context8.stop();
        }
      }
    }, _callee8, this);
  }));

  return function restart(_x8) {
    return _ref18.apply(this, arguments);
  };
}();

var clean = exports.clean = function () {
  var _ref19 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(api) {
    var config, _names6, app, bucket, _ref20, versions, envVersions, promises, i, _i;

    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            config = api.getConfig();
            _names6 = (0, _utils.names)(config), app = _names6.app, bucket = _names6.bucket;


            (0, _utils.logStep)('=> Finding old versions');
            _context9.next = 5;
            return (0, _versions.oldVersions)(api);

          case 5:
            _ref20 = _context9.sent;
            versions = _ref20.versions;
            _context9.next = 9;
            return (0, _versions.oldEnvVersions)(api);

          case 9:
            envVersions = _context9.sent;


            (0, _utils.logStep)('=> Removing old versions');

            promises = [];

            for (i = 0; i < versions.length; i++) {
              promises.push(_aws.beanstalk.deleteApplicationVersion({
                ApplicationName: app,
                VersionLabel: versions[i].toString(),
                DeleteSourceBundle: true
              }).promise());
            }

            for (_i = 0; _i < envVersions.length; _i++) {
              promises.push(_aws.s3.deleteObject({
                Bucket: bucket,
                Key: `env/${envVersions[_i]}.txt`
              }).promise());
            }

            // TODO: remove bundles

            _context9.next = 16;
            return Promise.all(promises);

          case 16:
          case 'end':
            return _context9.stop();
        }
      }
    }, _callee9, this);
  }));

  return function clean(_x9) {
    return _ref19.apply(this, arguments);
  };
}();

var reconfig = exports.reconfig = function () {
  var _ref21 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(api) {
    var config, _names7, app, environment, bucket, _ref22, Environments, desiredEbConfig, _ref23, SolutionStacks, solutionStack, _ref24, _ref25, version, _ref26, _ConfigurationSettings, _checkLongEnvSafe2, longEnvEnabled, safeToReconfig, nextEnvVersion, currentEnvVersion, _desiredEbConfig, _diffConfig, toRemove, toUpdate, _ref27, ConfigurationSettings;

    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            config = api.getConfig();
            _names7 = (0, _utils.names)(config), app = _names7.app, environment = _names7.environment, bucket = _names7.bucket;


            (0, _utils.logStep)('=> Configuring Beanstalk Environment');

            // check if env exists
            _context10.next = 5;
            return _aws.beanstalk.describeEnvironments({
              ApplicationName: app,
              EnvironmentNames: [environment]
            }).promise();

          case 5:
            _ref22 = _context10.sent;
            Environments = _ref22.Environments;

            if (Environments.find(function (env) {
              return env.Status !== 'Terminated';
            })) {
              _context10.next = 29;
              break;
            }

            desiredEbConfig = (0, _ebConfig.createDesiredConfig)(api.getConfig(), api.getSettings(), config.app.longEnvVars ? 1 : false);

            if (!config.app.longEnvVars) {
              _context10.next = 12;
              break;
            }

            _context10.next = 12;
            return (0, _upload.uploadEnvFile)(bucket, 1, config.app.env, api.getSettings());

          case 12:
            _context10.next = 14;
            return _aws.beanstalk.listAvailableSolutionStacks().promise();

          case 14:
            _ref23 = _context10.sent;
            SolutionStacks = _ref23.SolutionStacks;
            solutionStack = SolutionStacks.find(function (name) {
              return name.endsWith('running Node.js');
            });
            _context10.next = 19;
            return (0, _versions.ebVersions)(api);

          case 19:
            _ref24 = _context10.sent;
            _ref25 = _slicedToArray(_ref24, 1);
            version = _ref25[0];
            _context10.next = 24;
            return _aws.beanstalk.createEnvironment({
              ApplicationName: app,
              EnvironmentName: environment,
              Description: `Environment for ${config.app.name}, managed by Meteor Up`,
              VersionLabel: version.toString(),
              SolutionStackName: solutionStack,
              OptionSettings: desiredEbConfig.OptionSettings
            }).promise();

          case 24:

            console.log(' Created Environment');
            _context10.next = 27;
            return (0, _envReady.waitForEnvReady)(config, false);

          case 27:
            _context10.next = 53;
            break;

          case 29:
            _context10.next = 31;
            return _aws.beanstalk.describeConfigurationSettings({
              EnvironmentName: environment,
              ApplicationName: app
            }).promise();

          case 31:
            _ref26 = _context10.sent;
            _ConfigurationSettings = _ref26.ConfigurationSettings;
            _checkLongEnvSafe2 = (0, _utils.checkLongEnvSafe)(_ConfigurationSettings, api.commandHistory, config.app), longEnvEnabled = _checkLongEnvSafe2.enabled, safeToReconfig = _checkLongEnvSafe2.safeToReconfig;
            nextEnvVersion = 0;

            if (!safeToReconfig) {
              _context10.next = 40;
              break;
            }

            _context10.next = 38;
            return (0, _versions.largestEnvVersion)(api);

          case 38:
            currentEnvVersion = _context10.sent;

            nextEnvVersion = currentEnvVersion + 1;

          case 40:
            _desiredEbConfig = (0, _ebConfig.createDesiredConfig)(api.getConfig(), api.getSettings(), safeToReconfig ? nextEnvVersion : 0);
            _diffConfig = (0, _ebConfig.diffConfig)(_ConfigurationSettings[0].OptionSettings, _desiredEbConfig.OptionSettings), toRemove = _diffConfig.toRemove, toUpdate = _diffConfig.toUpdate;

            if (!longEnvEnabled) {
              _context10.next = 47;
              break;
            }

            _context10.next = 45;
            return (0, _upload.uploadEnvFile)(bucket, nextEnvVersion, config.app.env, api.getSettings());

          case 45:
            if (safeToReconfig) {
              _context10.next = 47;
              break;
            }

            return _context10.abrupt('return');

          case 47:
            if (!(toRemove.length > 0 || toUpdate.length > 0)) {
              _context10.next = 53;
              break;
            }

            _context10.next = 50;
            return _aws.beanstalk.updateEnvironment({
              EnvironmentName: environment,
              OptionSettings: toUpdate,
              OptionsToRemove: toRemove
            }).promise();

          case 50:
            console.log('  Updated Environment');
            _context10.next = 53;
            return (0, _envReady.waitForEnvReady)(config, true);

          case 53:
            _context10.next = 55;
            return _aws.beanstalk.describeConfigurationSettings({
              EnvironmentName: environment,
              ApplicationName: app
            }).promise();

          case 55:
            _ref27 = _context10.sent;
            ConfigurationSettings = _ref27.ConfigurationSettings;

            if (!(0, _ebConfig.scalingConfigChanged)(ConfigurationSettings[0].OptionSettings, config)) {
              _context10.next = 63;
              break;
            }

            (0, _utils.logStep)('=> Configuring scaling');
            _context10.next = 61;
            return _aws.beanstalk.updateEnvironment({
              EnvironmentName: environment,
              OptionSettings: (0, _ebConfig.scalingConfig)(config.app).OptionSettings
            }).promise();

          case 61:
            _context10.next = 63;
            return (0, _envReady.waitForEnvReady)(config, true);

          case 63:
          case 'end':
            return _context10.stop();
        }
      }
    }, _callee10, this);
  }));

  return function reconfig(_x10) {
    return _ref21.apply(this, arguments);
  };
}();

var events = exports.events = function () {
  var _ref28 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(api) {
    var _names8, environment, _ref29, envEvents;

    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            _names8 = (0, _utils.names)(api.getConfig()), environment = _names8.environment;
            _context11.next = 3;
            return _aws.beanstalk.describeEvents({
              EnvironmentName: environment
            }).promise();

          case 3:
            _ref29 = _context11.sent;
            envEvents = _ref29.Events;


            console.log(envEvents.map(function (ev) {
              return `${ev.EventDate}: ${ev.Message}`;
            }).join('\n'));

          case 6:
          case 'end':
            return _context11.stop();
        }
      }
    }, _callee11, this);
  }));

  return function events(_x11) {
    return _ref28.apply(this, arguments);
  };
}();

var status = exports.status = function () {
  var _ref30 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(api) {
    var _names9, environment, result, _ref31, InstanceHealthList, _result$ApplicationMe, RequestCount, Duration, StatusCodes, Latency;

    return regeneratorRuntime.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            _names9 = (0, _utils.names)(api.getConfig()), environment = _names9.environment;
            _context12.next = 3;
            return _aws.beanstalk.describeEnvironmentHealth({
              AttributeNames: ['All'],
              EnvironmentName: environment
            }).promise();

          case 3:
            result = _context12.sent;
            _context12.next = 6;
            return _aws.beanstalk.describeInstancesHealth({
              AttributeNames: ['All'],
              EnvironmentName: environment
            }).promise();

          case 6:
            _ref31 = _context12.sent;
            InstanceHealthList = _ref31.InstanceHealthList;
            _result$ApplicationMe = result.ApplicationMetrics, RequestCount = _result$ApplicationMe.RequestCount, Duration = _result$ApplicationMe.Duration, StatusCodes = _result$ApplicationMe.StatusCodes, Latency = _result$ApplicationMe.Latency;


            console.log(`Environment Status: ${result.Status}`);
            console.log(`Health Status: ${(0, _utils.coloredStatusText)(result.Color, result.HealthStatus)}`);
            if (result.Causes.length > 0) {
              console.log('Causes: ');
              result.Causes.forEach(function (cause) {
                return console.log(`  ${cause}`);
              });
            }
            console.log('');
            console.log(`=== Metrics For Last ${Duration || 'Unknown'} Minutes ===`);
            console.log(`  Requests: ${RequestCount}`);
            if (StatusCodes) {
              console.log('  Status Codes');
              console.log(`    2xx: ${StatusCodes.Status2xx}`);
              console.log(`    3xx: ${StatusCodes.Status3xx}`);
              console.log(`    4xx: ${StatusCodes.Status4xx}`);
              console.log(`    5xx: ${StatusCodes.Status5xx}`);
            }
            if (Latency) {
              console.log('  Latency');
              console.log(`    99.9%: ${Latency.P999}`);
              console.log(`    99%  : ${Latency.P99}`);
              console.log(`    95%  : ${Latency.P95}`);
              console.log(`    90%  : ${Latency.P90}`);
              console.log(`    85%  : ${Latency.P85}`);
              console.log(`    75%  : ${Latency.P75}`);
              console.log(`    50%  : ${Latency.P50}`);
              console.log(`    10%  : ${Latency.P10}`);
            }
            console.log('');
            console.log('=== Instances ===');
            InstanceHealthList.forEach(function (instance) {
              console.log(`  ${instance.InstanceId}: ${(0, _utils.coloredStatusText)(instance.Color, instance.HealthStatus)}`);
            });
            if (InstanceHealthList.length === 0) {
              console.log('  0 Instances');
            }

          case 21:
          case 'end':
            return _context12.stop();
        }
      }
    }, _callee12, this);
  }));

  return function status(_x12) {
    return _ref30.apply(this, arguments);
  };
}();

var ssl = exports.ssl = function () {
  var _ref32 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(api) {
    var config, domains, _ref33, CertificateSummaryList, found, i, _CertificateSummaryLi, DomainName, CertificateArn, _ref34, Certificate, certificateArn, result, emailsProvided, checks, certificate, _ref35, _Certificate, validationOptions;

    return regeneratorRuntime.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            config = api.getConfig();

            if (!(!config.app || !config.app.sslDomains)) {
              _context13.next = 6;
              break;
            }

            (0, _utils.logStep)('=> Updating Beanstalk SSL Config');
            _context13.next = 5;
            return (0, _certificates2.default)(config);

          case 5:
            return _context13.abrupt('return');

          case 6:

            (0, _utils.logStep)('=> Checking Certificate Status');

            domains = config.app.sslDomains;
            _context13.next = 10;
            return _aws.acm.listCertificates().promise();

          case 10:
            _ref33 = _context13.sent;
            CertificateSummaryList = _ref33.CertificateSummaryList;
            found = null;
            i = 0;

          case 14:
            if (!(i < CertificateSummaryList.length)) {
              _context13.next = 25;
              break;
            }

            _CertificateSummaryLi = CertificateSummaryList[i], DomainName = _CertificateSummaryLi.DomainName, CertificateArn = _CertificateSummaryLi.CertificateArn;

            if (!(DomainName === domains[0])) {
              _context13.next = 22;
              break;
            }

            _context13.next = 19;
            return _aws.acm.describeCertificate({ // eslint-disable-line no-await-in-loop
              CertificateArn
            }).promise();

          case 19:
            _ref34 = _context13.sent;
            Certificate = _ref34.Certificate;


            if (domains.join(',') === Certificate.SubjectAlternativeNames.join(',')) {
              found = CertificateSummaryList[i];
            }

          case 22:
            i++;
            _context13.next = 14;
            break;

          case 25:
            certificateArn = void 0;

            if (found) {
              _context13.next = 32;
              break;
            }

            (0, _utils.logStep)('=> Requesting Certificate');

            _context13.next = 30;
            return _aws.acm.requestCertificate({
              DomainName: domains.shift(),
              SubjectAlternativeNames: domains.length > 0 ? domains : null
            }).promise();

          case 30:
            result = _context13.sent;


            certificateArn = result.CertificateArn;

          case 32:

            if (found) {
              certificateArn = found.CertificateArn;
            }

            emailsProvided = false;
            checks = 0;
            certificate = void 0;

            /* eslint-disable no-await-in-loop */

          case 36:
            if (!(!emailsProvided && checks < 5)) {
              _context13.next = 57;
              break;
            }

            _context13.next = 39;
            return _aws.acm.describeCertificate({
              CertificateArn: certificateArn
            }).promise();

          case 39:
            _ref35 = _context13.sent;
            _Certificate = _ref35.Certificate;
            validationOptions = _Certificate.DomainValidationOptions[0];

            if (!(typeof validationOptions.ValidationEmails === 'undefined')) {
              _context13.next = 47;
              break;
            }

            emailsProvided = true;
            certificate = _Certificate;
            _context13.next = 55;
            break;

          case 47:
            if (!(validationOptions.ValidationEmails.length > 0 || checks === 6)) {
              _context13.next = 52;
              break;
            }

            emailsProvided = true;
            certificate = _Certificate;
            _context13.next = 55;
            break;

          case 52:
            checks += 1;

            _context13.next = 55;
            return new Promise(function (resolve) {
              setTimeout(resolve, 1000 * 10);
            });

          case 55:
            _context13.next = 36;
            break;

          case 57:
            if (!(certificate.Status === 'PENDING_VALIDATION')) {
              _context13.next = 62;
              break;
            }

            console.log('Certificate is pending validation.');
            certificate.DomainValidationOptions.forEach(function (_ref36) {
              var DomainName = _ref36.DomainName,
                  ValidationEmails = _ref36.ValidationEmails,
                  ValidationDomain = _ref36.ValidationDomain,
                  ValidationStatus = _ref36.ValidationStatus;

              if (ValidationStatus === 'SUCCESS') {
                console.log(_chalk2.default.green(`${ValidationDomain || DomainName} has been verified`));
                return;
              }

              console.log(_chalk2.default.yellow(`${ValidationDomain || DomainName} is pending validation`));

              if (ValidationEmails) {
                console.log('Emails with instructions have been sent to:');

                ValidationEmails.forEach(function (email) {
                  console.log(`  ${email}`);
                });
              }

              console.log('Run "mup beanstalk ssl" after you have verified the domains, or to check the verification status');
            });
            _context13.next = 67;
            break;

          case 62:
            if (!(certificate.Status === 'ISSUED')) {
              _context13.next = 67;
              break;
            }

            console.log(_chalk2.default.green('Certificate has been issued'));
            (0, _utils.logStep)('=> Updating Beanstalk SSL Config');
            _context13.next = 67;
            return (0, _certificates2.default)(config, certificateArn);

          case 67:
          case 'end':
            return _context13.stop();
        }
      }
    }, _callee13, this);
  }));

  return function ssl(_x13) {
    return _ref32.apply(this, arguments);
  };
}();

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _aws = require('./aws');

var _certificates = require('./certificates');

var _certificates2 = _interopRequireDefault(_certificates);

var _policies = require('./policies');

var _upload = require('./upload');

var _upload2 = _interopRequireDefault(_upload);

var _prepareBundle = require('./prepare-bundle');

var _utils = require('./utils');

var _versions = require('./versions');

var _ebConfig = require('./eb-config');

var _envReady = require('./env-ready');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }