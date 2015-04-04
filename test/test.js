'use strict';

var acquire = require('..');

var test = require('tape'),
    zipmap = require('zipmap');

var path = require('path');


test(function (t) {
  var fixtures = path.join(__dirname, 'fixtures');
  var fixture = path.resolve.bind(null, fixtures);
  var unfixture = path.relative.bind(null, fixtures);

  var paths = {
    top: fixture('node_modules/top.json'),
    middle: fixture('node_modules/foo/node_modules/middle/index.json'),
    bottom: fixture('node_modules/foo/src/node_modules/bottom.json')
  };

  var opts = function (opts) {
    opts = opts || {};
    opts.basedir = opts.basedir || fixture('node_modules/foo/src');
    return opts;
  };

  check(opts(), ['bottom']);
  check(opts({ depth: 2 }), ['middle', 'bottom']);
  checkError(opts({ depth: 3 }));
  check(opts({ depth: 3, skipFailures: true }), ['top', 'middle', 'bottom']);

  t.end();

  function check(opts, modules) {
    t.deepEqual(acquire.resolve(opts), zipmap(modules.map(function (m) {
      return [m, paths[m]];
    })), checkMessage('acquire.resolve', opts));

    t.deepEqual(acquire(opts), zipmap(modules.map(function (m) {
      return [m, m];
    })), checkMessage('acquire', opts));
  }

  function checkError(opts) {
    t.throws(acquire.resolve.bind(null, opts),
             checkMessage('acquire.resolve', opts) + ' (throws)');
  }

  function checkMessage(method, opts) {
    var msgopts = Object.create(opts);
    Object.defineProperty(msgopts, 'basedir', {
      enumerable: true,
      value: unfixture(opts.basedir)
    });
    return method + ' ' + JSON.stringify(msgopts);
  }
});
