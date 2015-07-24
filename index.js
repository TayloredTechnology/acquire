'use strict';

var findNodeModules = require('find-node-modules'),
    getModuleName = require('filename-to-module-name'),
    validateNpmPackageName = require('validate-npm-package-name'),
    zipmap = require('zipmap'),
    xtend = require('xtend'),
    callsites = require('callsites');

var fs = require('fs'),
    path = require('path');


var nodeModulesPaths = function (basedir) {
  return findNodeModules({
    cwd: basedir,
    relative: false
  });
};


var validateModuleName = function (name) {
  var v = validateNpmPackageName(name);
  return v.validForOldPackages || v.validForNewPackages;
};


var safeResolve = function (cb, modulePath) {
  try {
    return require.resolve(modulePath);
  }
  catch (e) {
    cb && cb();
  }
};


var acquire = function acquire(opts) {
  opts = opts || {};
  opts.basedir = opts.basedir || path.dirname(callsites()[1].getFileName());

  var modules = acquire.resolve(opts);
  Object.keys(modules).forEach(function (m) {
    modules[m] = require(modules[m]);
  });
  return modules;
};


acquire.resolve = function (opts) {
  opts = opts || {};
  opts.basedir = opts.basedir || path.dirname(callsites()[1].getFileName());
  opts.depth = opts.depth || 1;
  opts.ignore = typeof opts.ignore == 'string' ? [opts.ignore] : opts.ignore || [];

  var dirs = nodeModulesPaths(opts.basedir)
        .slice(0, opts.depth)
        .reverse();

  return xtend.apply(null, dirs.map(function (dir) {
    return zipmap(fs.readdirSync(dir).map(function (basename) {
      var modulePath = path.resolve(dir, basename);
      var moduleName = getModuleName(modulePath);

      if (!validateModuleName(moduleName) || opts.ignore.indexOf(moduleName) >= 0) {
        return;
      }

      var resolve = opts.skipFailures
            ? safeResolve.bind(null,
                               typeof opts.skipFailures == 'function' &&
                               function () {
                                 opts.skipFailures(moduleName, modulePath);
                               })
            : require.resolve;

      modulePath = resolve(modulePath);
      return modulePath ? [moduleName, modulePath] : undefined;
    }).filter(Boolean));
  }));
};


module.exports = acquire;
