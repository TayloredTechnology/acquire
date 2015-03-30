'use strict';

var acquire = require('..');

var test = require('tape'),
    zipmap = require('zipmap');

var path = require('path');


test(function (t) {
  var fixtures = path.join(__dirname, 'fixtures');
  var basedir = fixtures + '/node_modules/foo/src';

  var paths = {
    top: path.join(fixtures, 'node_modules/top.json'),
    middle: path.join(fixtures, 'node_modules/foo/node_modules/middle/index.json'),
    bottom: path.join(fixtures, 'node_modules/foo/src/node_modules/bottom.json')
  };

  check(basedir, ['bottom']);
  check(basedir, { depth: 2 }, ['middle', 'bottom']);
  check(basedir, { depth: 3 }, ['top', 'middle', 'bottom']);

  t.end();

  function check() {
    var argv = [].slice.call(arguments);
    var modules = argv.pop();

    t.deepEqual(acquire.resolve.apply(null, argv), zipmap(modules.map(function (m) {
      return [m, paths[m]];
    })));

    t.deepEqual(acquire.apply(null, argv), zipmap(modules.map(function (m) {
      return [m, m];
    })));
  }
});
