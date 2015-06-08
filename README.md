[![npm](https://nodei.co/npm/acquire.png)](https://nodei.co/npm/acquire/)

# acquire

[![Build Status][travis-badge]][travis] [![Dependency Status][david-badge]][david]

Using Node module resolution [algorithm](https://nodejs.org/docs/latest/api/modules.html#modules_all_together), discover `node_modules` directory and `require` or `require.resolve` all modules in it.

[travis]: https://travis-ci.org/eush77/acquire
[travis-badge]: https://travis-ci.org/eush77/acquire.svg
[david]: https://david-dm.org/eush77/acquire
[david-badge]: https://david-dm.org/eush77/acquire.png

## API

### `acquire([opts])`

Require all modules in `node_modules`, starting from `opts.basedir`.

Returns object of all the modules required:

```js
{
  foo: require(path_to_foo),
  bar: require(path_to_bar)
}
```

| Option       | Type             | Required? | Default     |
| :----------- | :--------------- | :-------: | :---------- |
| basedir      | string           | No        | `__dirname` |
| depth        | number           | No        | `1`         |
| skipFailures | boolean/function | No        | `false`     |

If `opts.depth` is finite, it specifies the number of `node_modules` directories up the directory tree to traverse into. If `opts.depth` is `Infinity`, traversal ends at the file system root.

If `opts.skipFailures` is `true`, modules that fail to `require()` (e.g. plugins for Grunt) are skipped. If `opts.skipFailures` is a function, it is called as `opts.skipFailures(moduleName, modulePath)` for each failure.

### `acquire.resolve([opts])`

Require.resolve all modules in `node_modules`, starting from `opts.basedir`.

Returns object of all the modules and corresponding paths:

```js
{
  foo: path_to_foo,
  bar: path_to_bar
}
```

## Install

```
npm install acquire
```

## License

MIT
