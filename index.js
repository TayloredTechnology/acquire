'use strict';

var findNodeModules = require('find-node-modules'),
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


var acquire = function acquire(basedir, opts) {
  var modules = acquire.resolve(basedir, opts);
  Object.keys(modules).forEach(function (m) {
    modules[m] = require(modules[m]);
  });
  return modules;
};


acquire.resolve = function (basedir, opts) {
  opts = opts || {};
  opts.depth = opts.depths || 1;

  var dirs = nodeModulesPaths(basedir)
        .slice(0, opts.depth)
        .reverse();

  return xtend.apply(null, dirs.map(function (dir) {
    return zipmap(fs.readdirSync(dir).map(function (module) {
      return [module, path.resolve(dir, module)];
    }));
  }));
};


module.exports = acquire;
