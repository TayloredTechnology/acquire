'use strict';

var acquire = require('..');

var test = require('tape'),
    zipmap = require('zipmap'),
    xtend = require('xtend');

var path = require('path');


test(function (t) {
  var fixtures = path.join(__dirname, 'fixtures');
  var fixture = path.resolve.bind(null, fixtures);
  var unfixture = path.relative.bind(null, fixtures);

  var paths = {
    foo: fixture('node_modules/foo'),
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

  var failures = [];
  var collectFailure = function (name, path) {
    failures.push([name, path]);
  };
  check(opts({ depth: 3, skipFailures: collectFailure }),
        ['top', 'middle', 'bottom']);
  // One entry for acquire, one for acquire.resolve.
  t.deepEqual(failures, [['foo', paths.foo],
                         ['foo', paths.foo]],
              'failures collected');

  t.end();

  function check(opts, modules) {
    (function (msg) {
      t.deepEqual(acquire.resolve(opts), zipmap(modules.map(function (m) {
        return [m, paths[m]];
      })), msg);
    }(checkMessage('acquire.resolve', opts)));

    (function (msg) {
      t.deepEqual(acquire(opts), zipmap(modules.map(function (m) {
        return [m, m];
      })), msg);
    }(checkMessage('acquire', opts)));
  }

  function checkError(opts) {
    (function (msg) {
      t.throws(acquire.resolve.bind(null, opts), msg);
    }(checkMessage('acquire.resolve', opts) + ' (throws)'));
  }

  function checkMessage(method, opts) {
    return method + ' ' + JSON.stringify(opts, function (key, value) {
      return key == 'basedir' ? unfixture(value) : value;
    });
  }
});


test('implicit basedir', function (t) {
  var pkg = require('../package.json');
  var dependencies = Object.keys(xtend(pkg.dependencies, pkg.devDependencies));

  var modules = acquire();
  dependencies.forEach(function (module) {
    t.equal(modules[module], require(module), 'has ' + module);
  });

  t.end();
});
