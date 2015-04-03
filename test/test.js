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
  checkError(basedir, { depth: 3 });
  check(basedir, { depth: 3, skipFailures: true }, ['top', 'middle', 'bottom']);

  t.end();

  function check() {
    var argv = [].slice.call(arguments);
    var modules = argv.pop();

    t.deepEqual(acquire.resolve.apply(null, argv), zipmap(modules.map(function (m) {
      return [m, paths[m]];
    })), checkMessage('acquire.resolve', argv));

    t.deepEqual(acquire.apply(null, argv), zipmap(modules.map(function (m) {
      return [m, m];
    })), checkMessage('acquire', argv));
  }

  function checkError() {
    var argv = [].slice.call(arguments);
    t.throws(Function.bind.apply(acquire.resolve, [null].concat(argv)),
             checkMessage('acquire.resolve', argv) + ' (throws)');
  }

  function checkMessage(method, argv) {
    return [method, 'from', unfixture(argv[0]),
            argv.slice(1).map(JSON.stringify)].join(' ');
  }
});
