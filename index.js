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


var safeResolve = function (modulePath) {
  try {
    return require.resolve(modulePath);
  }
  catch (e) {}
};


var acquire = function acquire(opts) {
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

  var dirs = nodeModulesPaths(opts.basedir)
        .slice(0, opts.depth)
        .reverse();

  return xtend.apply(null, dirs.map(function (dir) {
    return zipmap(fs.readdirSync(dir).map(function (basename) {
      if (!validateModuleName(basename)) {
        return;
      }

      var modulePath = path.resolve(dir, basename);
      var moduleName = getModuleName(modulePath);
      modulePath = (opts.skipFailures ? safeResolve : require.resolve)(modulePath);
      return modulePath ? [moduleName, modulePath] : undefined;
    }).filter(Boolean));
  }));
};


module.exports = acquire;
