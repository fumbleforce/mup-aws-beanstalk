'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ensureSsmDocument = exports.ensureRuleTargetExists = exports.ensureCloudWatchRule = exports.ensureBucketPolicyAttached = exports.ensureBucketExists = exports.ensureInlinePolicyAttached = exports.ensurePoliciesAttached = exports.ensureRoleAdded = exports.ensureInstanceProfileExists = exports.ensureRoleExists = exports.attachPolicies = exports.getLogs = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var retrieveEnvironmentInfo = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(api, count) {
    var config, _names, environment, _ref2, EnvironmentInfo;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            config = api.getConfig();
            _names = names(config), environment = _names.environment;
            _context.next = 4;
            return _aws.beanstalk.retrieveEnvironmentInfo({
              EnvironmentName: environment,
              InfoType: 'tail'
            }).promise();

          case 4:
            _ref2 = _context.sent;
            EnvironmentInfo = _ref2.EnvironmentInfo;

            if (!(EnvironmentInfo.length > 0)) {
              _context.next = 10;
              break;
            }

            return _context.abrupt('return', EnvironmentInfo);

          case 10:
            if (!(count > 5)) {
              _context.next = 12;
              break;
            }

            throw new Error('No logs');

          case 12:
            return _context.abrupt('return', new Promise(function (resolve, reject) {
              setTimeout(function () {
                // The logs aren't always available, so retry until they are
                // Another option is to look for the event that says it is ready
                retrieveEnvironmentInfo(api, count + 1).then(resolve).catch(reject);
              }, (0, _recheck.getRecheckInterval)());
            }));

          case 13:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function retrieveEnvironmentInfo(_x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var getLogs = exports.getLogs = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(api) {
    var config, _names2, environment, EnvironmentInfo, logsForServer;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            config = api.getConfig();
            _names2 = names(config), environment = _names2.environment;


            logStep('=> Requesting Logs');

            _context2.next = 5;
            return _aws.beanstalk.requestEnvironmentInfo({
              EnvironmentName: environment,
              InfoType: 'tail'
            }).promise();

          case 5:
            _context2.next = 7;
            return retrieveEnvironmentInfo(api, 0);

          case 7:
            EnvironmentInfo = _context2.sent;


            logStep('=> Downloading Logs');

            logsForServer = EnvironmentInfo.reduce(function (result, info) {
              result[info.Ec2InstanceId] = info.Message;

              return result;
            }, {});
            return _context2.abrupt('return', Promise.all(Object.keys(logsForServer).map(function (key) {
              return new Promise(function (resolve, reject) {
                _axios2.default.get(logsForServer[key]).then(function (_ref4) {
                  var data = _ref4.data;

                  resolve({
                    data,
                    instance: key
                  });
                }).catch(reject);
              });
            })));

          case 11:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function getLogs(_x4) {
    return _ref3.apply(this, arguments);
  };
}();

var attachPolicies = exports.attachPolicies = function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(config, roleName, policies) {
    var promises;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            promises = [];


            policies.forEach(function (policy) {
              var promise = _aws.iam.attachRolePolicy({
                RoleName: roleName,
                PolicyArn: policy
              }).promise();

              promises.push(promise);
            });

            _context3.next = 4;
            return Promise.all(promises);

          case 4:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function attachPolicies(_x5, _x6, _x7) {
    return _ref5.apply(this, arguments);
  };
}();

var ensureRoleExists = exports.ensureRoleExists = function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(name, assumeRolePolicyDocument, ensureAssumeRolePolicy) {
    var exists, updateAssumeRolePolicy, _ref8, Role, currentAssumeRolePolicy;

    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            exists = true;
            updateAssumeRolePolicy = false;
            _context4.prev = 2;
            _context4.next = 5;
            return _aws.iam.getRole({
              RoleName: name
            }).promise();

          case 5:
            _ref8 = _context4.sent;
            Role = _ref8.Role;
            currentAssumeRolePolicy = decodeURIComponent(Role.AssumeRolePolicyDocument);
            // Make the whitespace consistent with the current document

            assumeRolePolicyDocument = JSON.stringify(JSON.parse(assumeRolePolicyDocument));

            if (currentAssumeRolePolicy !== assumeRolePolicyDocument && ensureAssumeRolePolicy) {
              updateAssumeRolePolicy = true;
            }
            _context4.next = 15;
            break;

          case 12:
            _context4.prev = 12;
            _context4.t0 = _context4['catch'](2);

            exists = false;

          case 15:
            if (exists) {
              _context4.next = 20;
              break;
            }

            _context4.next = 18;
            return _aws.iam.createRole({
              RoleName: name,
              AssumeRolePolicyDocument: assumeRolePolicyDocument
            }).promise();

          case 18:
            _context4.next = 23;
            break;

          case 20:
            if (!updateAssumeRolePolicy) {
              _context4.next = 23;
              break;
            }

            _context4.next = 23;
            return _aws.iam.updateAssumeRolePolicy({
              RoleName: name,
              PolicyDocument: assumeRolePolicyDocument
            }).promise();

          case 23:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this, [[2, 12]]);
  }));

  return function ensureRoleExists(_x8, _x9, _x10) {
    return _ref7.apply(this, arguments);
  };
}();

var ensureInstanceProfileExists = exports.ensureInstanceProfileExists = function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(config, name) {
    var exists;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            exists = true;
            _context5.prev = 1;
            _context5.next = 4;
            return _aws.iam.getInstanceProfile({
              InstanceProfileName: name
            }).promise();

          case 4:
            _context5.next = 9;
            break;

          case 6:
            _context5.prev = 6;
            _context5.t0 = _context5['catch'](1);

            exists = false;

          case 9:
            if (exists) {
              _context5.next = 12;
              break;
            }

            _context5.next = 12;
            return _aws.iam.createInstanceProfile({
              InstanceProfileName: name
            }).promise();

          case 12:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, this, [[1, 6]]);
  }));

  return function ensureInstanceProfileExists(_x11, _x12) {
    return _ref9.apply(this, arguments);
  };
}();

var ensureRoleAdded = exports.ensureRoleAdded = function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(config, instanceProfile, role) {
    var added, _ref11, InstanceProfile;

    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            added = true;
            _context6.next = 3;
            return _aws.iam.getInstanceProfile({
              InstanceProfileName: instanceProfile
            }).promise();

          case 3:
            _ref11 = _context6.sent;
            InstanceProfile = _ref11.InstanceProfile;


            if (InstanceProfile.Roles.length === 0 || InstanceProfile.Roles[0].RoleName !== role) {
              added = false;
            }

            if (added) {
              _context6.next = 9;
              break;
            }

            _context6.next = 9;
            return _aws.iam.addRoleToInstanceProfile({
              InstanceProfileName: instanceProfile,
              RoleName: role
            }).promise();

          case 9:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, this);
  }));

  return function ensureRoleAdded(_x13, _x14, _x15) {
    return _ref10.apply(this, arguments);
  };
}();

var ensurePoliciesAttached = exports.ensurePoliciesAttached = function () {
  var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(config, role, policies) {
    var _ref13, AttachedPolicies, unattachedPolicies;

    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return _aws.iam.listAttachedRolePolicies({
              RoleName: role
            }).promise();

          case 2:
            _ref13 = _context7.sent;
            AttachedPolicies = _ref13.AttachedPolicies;


            AttachedPolicies = AttachedPolicies.map(function (policy) {
              return policy.PolicyArn;
            });

            unattachedPolicies = policies.reduce(function (result, policy) {
              if (AttachedPolicies.indexOf(policy) === -1) {
                result.push(policy);
              }

              return result;
            }, []);

            if (!(unattachedPolicies.length > 0)) {
              _context7.next = 9;
              break;
            }

            _context7.next = 9;
            return attachPolicies(config, role, unattachedPolicies);

          case 9:
          case 'end':
            return _context7.stop();
        }
      }
    }, _callee7, this);
  }));

  return function ensurePoliciesAttached(_x16, _x17, _x18) {
    return _ref12.apply(this, arguments);
  };
}();

var ensureInlinePolicyAttached = exports.ensureInlinePolicyAttached = function () {
  var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(role, policyName, policyDocument) {
    var exists, needsUpdating, result, currentPolicyDocument;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            exists = true;
            needsUpdating = false;
            _context8.prev = 2;
            _context8.next = 5;
            return _aws.iam.getRolePolicy({
              RoleName: role,
              PolicyName: policyName
            }).promise();

          case 5:
            result = _context8.sent;
            currentPolicyDocument = decodeURIComponent(result.PolicyDocument);


            if (currentPolicyDocument !== policyDocument) {
              needsUpdating = true;
            }
            _context8.next = 13;
            break;

          case 10:
            _context8.prev = 10;
            _context8.t0 = _context8['catch'](2);

            exists = false;

          case 13:
            if (!(!exists || needsUpdating)) {
              _context8.next = 16;
              break;
            }

            _context8.next = 16;
            return _aws.iam.putRolePolicy({
              RoleName: role,
              PolicyName: policyName,
              PolicyDocument: policyDocument
            }).promise();

          case 16:
          case 'end':
            return _context8.stop();
        }
      }
    }, _callee8, this, [[2, 10]]);
  }));

  return function ensureInlinePolicyAttached(_x19, _x20, _x21) {
    return _ref14.apply(this, arguments);
  };
}();

var ensureBucketExists = exports.ensureBucketExists = function () {
  var _ref15 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(buckets, bucketName, region) {
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            if (buckets.find(function (bucket) {
              return bucket.Name === bucketName;
            })) {
              _context9.next = 4;
              break;
            }

            _context9.next = 3;
            return _aws.s3.createBucket(_extends({
              Bucket: bucketName
            }, region ? {
              CreateBucketConfiguration: {
                LocationConstraint: region
              }
            } : {})).promise();

          case 3:
            return _context9.abrupt('return', true);

          case 4:
          case 'end':
            return _context9.stop();
        }
      }
    }, _callee9, this);
  }));

  return function ensureBucketExists(_x22, _x23, _x24) {
    return _ref15.apply(this, arguments);
  };
}();

var ensureBucketPolicyAttached = exports.ensureBucketPolicyAttached = function () {
  var _ref16 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(bucketName, policy) {
    var error, currentPolicy, _ref17, Policy, params;

    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            error = false;
            currentPolicy = void 0;
            _context10.prev = 2;
            _context10.next = 5;
            return _aws.s3.getBucketPolicy({ Bucket: bucketName }).promise();

          case 5:
            _ref17 = _context10.sent;
            Policy = _ref17.Policy;

            currentPolicy = Policy;
            _context10.next = 13;
            break;

          case 10:
            _context10.prev = 10;
            _context10.t0 = _context10['catch'](2);

            error = true;

          case 13:
            if (!(error || currentPolicy !== policy)) {
              _context10.next = 17;
              break;
            }

            params = {
              Bucket: bucketName,
              Policy: policy
            };
            _context10.next = 17;
            return _aws.s3.putBucketPolicy(params).promise();

          case 17:
          case 'end':
            return _context10.stop();
        }
      }
    }, _callee10, this, [[2, 10]]);
  }));

  return function ensureBucketPolicyAttached(_x25, _x26) {
    return _ref16.apply(this, arguments);
  };
}();

var ensureCloudWatchRule = exports.ensureCloudWatchRule = function () {
  var _ref18 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(name, description, eventPattern) {
    var error;
    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            error = false;
            _context11.prev = 1;
            _context11.next = 4;
            return _aws.cloudWatchEvents.describeRule({ Name: name }).promise();

          case 4:
            _context11.next = 9;
            break;

          case 6:
            _context11.prev = 6;
            _context11.t0 = _context11['catch'](1);

            error = true;

          case 9:
            if (!error) {
              _context11.next = 13;
              break;
            }

            _context11.next = 12;
            return _aws.cloudWatchEvents.putRule({
              Name: name,
              Description: description,
              EventPattern: eventPattern
            }).promise();

          case 12:
            return _context11.abrupt('return', true);

          case 13:
            return _context11.abrupt('return', false);

          case 14:
          case 'end':
            return _context11.stop();
        }
      }
    }, _callee11, this, [[1, 6]]);
  }));

  return function ensureCloudWatchRule(_x27, _x28, _x29) {
    return _ref18.apply(this, arguments);
  };
}();

var ensureRuleTargetExists = exports.ensureRuleTargetExists = function () {
  var _ref19 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(ruleName, target) {
    var _ref20, Targets, params;

    return regeneratorRuntime.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            _context12.next = 2;
            return _aws.cloudWatchEvents.listTargetsByRule({
              Rule: ruleName
            }).promise();

          case 2:
            _ref20 = _context12.sent;
            Targets = _ref20.Targets;

            if (Targets.find(function (_target) {
              return (0, _lodash.isEqual)(_target, target);
            })) {
              _context12.next = 9;
              break;
            }

            params = {
              Rule: ruleName,
              Targets: [target]
            };
            _context12.next = 8;
            return _aws.cloudWatchEvents.putTargets(params).promise();

          case 8:
            return _context12.abrupt('return', true);

          case 9:
          case 'end':
            return _context12.stop();
        }
      }
    }, _callee12, this);
  }));

  return function ensureRuleTargetExists(_x30, _x31) {
    return _ref19.apply(this, arguments);
  };
}();

var ensureSsmDocument = exports.ensureSsmDocument = function () {
  var _ref24 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(name, content) {
    var exists, needsUpdating, result, currentContent;
    return regeneratorRuntime.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            exists = true;
            needsUpdating = false;
            _context13.prev = 2;
            _context13.next = 5;
            return _aws.ssm.getDocument({ Name: name, DocumentVersion: '$LATEST' }).promise();

          case 5:
            result = _context13.sent;

            // If the document was created or edited on the AWS console, there is extra new
            // line characters and whitespace
            currentContent = JSON.stringify(JSON.parse(result.Content.replace(/\r?\n|\r/g, '')));

            if (currentContent !== content) {
              needsUpdating = true;
            }
            _context13.next = 13;
            break;

          case 10:
            _context13.prev = 10;
            _context13.t0 = _context13['catch'](2);

            exists = false;

          case 13:
            if (exists) {
              _context13.next = 19;
              break;
            }

            _context13.next = 16;
            return _aws.ssm.createDocument({
              Content: content,
              Name: name,
              DocumentType: 'Automation'
            }).promise();

          case 16:
            return _context13.abrupt('return', true);

          case 19:
            if (!needsUpdating) {
              _context13.next = 22;
              break;
            }

            _context13.next = 22;
            return _aws.ssm.updateDocument({
              Content: content,
              Name: name,
              DocumentVersion: '$LATEST'
            }).promise();

          case 22:
          case 'end':
            return _context13.stop();
        }
      }
    }, _callee13, this, [[2, 10]]);
  }));

  return function ensureSsmDocument(_x32, _x33) {
    return _ref24.apply(this, arguments);
  };
}();

exports.logStep = logStep;
exports.shouldRebuild = shouldRebuild;
exports.tmpBuildPath = tmpBuildPath;
exports.names = names;
exports.createUniqueName = createUniqueName;
exports.getNodeVersion = getNodeVersion;
exports.getAccountId = getAccountId;
exports.findBucketWithPrefix = findBucketWithPrefix;
exports.coloredStatusText = coloredStatusText;
exports.checkLongEnvSafe = checkLongEnvSafe;
exports.createVersionDescription = createVersionDescription;

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _lodash = require('lodash');

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _randomSeed = require('random-seed');

var _randomSeed2 = _interopRequireDefault(_randomSeed);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _child_process = require('child_process');

var _aws = require('./aws');

var _recheck = require('./recheck');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function logStep(message) {
  console.log(_chalk2.default.blue(message));
}

function shouldRebuild(bundlePath, useCachedBuild) {
  if (_fs2.default.existsSync(bundlePath) && useCachedBuild) {
    return false;
  }

  return true;
}

function tmpBuildPath(appPath, api) {
  var rand = _randomSeed2.default.create(appPath);
  var uuidNumbers = [];

  for (var i = 0; i < 16; i++) {
    uuidNumbers.push(rand(255));
  }

  return api.resolvePath(_os2.default.tmpdir(), `mup-meteor-${_uuid2.default.v4({ random: uuidNumbers })}`);
}

function names(config) {
  var name = config.app.name.toLowerCase();

  return {
    bucket: `mup-${name}`,
    environment: `mup-env-${name}`,
    app: `mup-${name}`,
    bundlePrefix: `mup/bundles/${name}/`,
    instanceProfile: 'aws-elasticbeanstalk-ec2-role',
    serviceRole: 'aws-elasticbeanstalk-service-role',
    trailBucketPrefix: 'mup-graceful-st',
    trailName: 'mup-graceful-st',
    deregisterRuleName: 'mup-target-deregister',
    eventTargetRole: `mup-envoke-run-command-${name}`,
    eventTargetPolicyName: 'Invoke_Run_Command',
    eventTargetPassRoleName: 'Pass_Role',
    automationDocument: 'mup-graceful-shutdown'
  };
}

function createUniqueName() {
  var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  var randomNumbers = Math.floor(Math.random() * 10000);

  return `${prefix}-${Date.now()}-${randomNumbers}`;
}

function getNodeVersion(api, bundlePath) {
  var star = _fs2.default.readFileSync(api.resolvePath(bundlePath, 'bundle/star.json')).toString();
  var nodeVersionTxt = _fs2.default.readFileSync(api.resolvePath(bundlePath, 'bundle/.node_version.txt')).toString();

  star = JSON.parse(star);

  if (star.npmVersion) {
    return {
      nodeVersion: star.nodeVersion,
      npmVersion: star.npmVersion
    };
  }

  var nodeVersion = nodeVersionTxt.substr(1);

  if (nodeVersion.startsWith('4')) {
    return {
      nodeVersion,
      npmVersion: '4.6.1'
    };
  }

  return {
    nodeVersion,
    npmVersion: '3.10.5'
  };
}

function getAccountId() {
  return _aws.sts.getCallerIdentity().promise().then(function (_ref6) {
    var Account = _ref6.Account;
    return Account;
  });
}

function findBucketWithPrefix(buckets, prefix) {
  return buckets.find(function (bucket) {
    return bucket.Name.indexOf(prefix) === 0;
  });
}

function coloredStatusText(envColor, text) {
  if (envColor === 'Green') {
    return _chalk2.default.green(text);
  } else if (envColor === 'Yellow') {
    return _chalk2.default.yellow(text);
  } else if (envColor === 'Red') {
    return _chalk2.default.red(text);
  }
  return text;
}

// Checks if it is safe to use the environment variables from s3
function checkLongEnvSafe(currentConfig, commandHistory, appConfig) {
  var optionEnabled = appConfig.longEnvVars;
  var previouslyMigrated = currentConfig[0].OptionSettings.find(function (_ref21) {
    var Namespace = _ref21.Namespace,
        OptionName = _ref21.OptionName;
    return Namespace === 'aws:elasticbeanstalk:application:environment' && OptionName === 'MUP_ENV_FILE_VERSION';
  });
  var reconfigCount = commandHistory.filter(function (_ref22) {
    var name = _ref22.name;
    return name === 'beanstalk.reconfig';
  }).length;
  var ranDeploy = commandHistory.find(function (_ref23) {
    var name = _ref23.name;
    return name === 'beanstalk.deploy';
  }) && reconfigCount > 1;

  return {
    migrated: previouslyMigrated,
    safeToReconfig: optionEnabled && (previouslyMigrated || ranDeploy),
    enabled: optionEnabled
  };
}

function createVersionDescription(api, appConfig) {
  var appPath = api.resolvePath(api.getBasePath(), appConfig.path);
  var description = '';

  try {
    description = (0, _child_process.execSync)('git log -1 --pretty=%B', {
      cwd: appPath,
      stdio: 'pipe'
    }).toString();
  } catch (e) {
    description = `Deployed by Mup on ${new Date().toUTCString()}`;
  }
  return description.split('\n')[0].slice(0, 195);
}