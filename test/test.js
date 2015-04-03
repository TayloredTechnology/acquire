'use strict';

var acquire = require('..');

var test = require('tape'),
    zipmap = require('zipmap');

var path = require('path');


test(function (t) {
  var fixtures = path.join(__dirname, 'fixtures');
  var fixture = path.resolve.bind(null, fixtures);
  var unfixture = path.relative.bind(null, fixtures);

  var basedir = fixture('node_modules/foo/src');
  var paths = {
    top: fixture('node_modules/top.json'),
    middle: fixture('node_modules/foo/node_modules/middle/index.json'),
    bottom: fixture('node_modules/foo/src/node_modules/bottom.json')
  };

  check(basedir, ['bottom']);
  check(basedir, { depth: 2 }, ['middle', 'bottom']);
  check(basedir, { depth: 3 }, ['top', 'middle', 'bottom']);

  t.end();

  function check() {
    var argv = [].slice.call(arguments);
    var basedir = argv[0];
    var modules = argv.pop();

    var message = function (method) {
      return [method, 'from', unfixture(basedir),
              argv.slice(1).map(JSON.stringify)].join(' ');
    };

    t.deepEqual(acquire.resolve.apply(null, argv), zipmap(modules.map(function (m) {
      return [m, paths[m]];
    })), message('acquire.resolve'));

    t.deepEqual(acquire.apply(null, argv), zipmap(modules.map(function (m) {
      return [m, m];
    })), message('acquire'));
  }
});
