'use strict';

var findNodeModules = require('find-node-modules'),
    getModuleName = require('filename-to-module-name'),
    zipmap = require('zipmap'),
    xtend = require('xtend');

var fs = require('fs'),
    path = require('path');


var nodeModulesPaths = function (basedir) {
  return findNodeModules({
    cwd: basedir,
    relative: false
  });
};


var safeResolve = function (modulePath) {
  try {
    return require.resolve(modulePath);
  }
  catch (e) {}
};


var acquire = function acquire(basedir, opts) {
  var modules = acquire.resolve(basedir, opts);
  Object.keys(modules).forEach(function (m) {
    modules[m] = require(modules[m]);
  });
  return modules;
};


acquire.resolve = function (basedir, opts) {
  opts = opts || {};
  opts.depth = opts.depth || 1;

  var dirs = nodeModulesPaths(basedir)
        .slice(0, opts.depth)
        .reverse();

  return xtend.apply(null, dirs.map(function (dir) {
    return zipmap(fs.readdirSync(dir).map(function (basename) {
      var modulePath = path.resolve(dir, basename);
      var moduleName = getModuleName(modulePath);
      modulePath = (opts.skipFailures ? safeResolve : require.resolve)(modulePath);
      return modulePath ? [moduleName, modulePath] : undefined;
    }).filter(Boolean));
  }));
};


module.exports = acquire;
