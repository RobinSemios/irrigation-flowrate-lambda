'use strict';

const fs = require('fs');
const path = require('path');

const { lstatSync, readdirSync } = fs;
const { join } = require('path');

const isDirectory = (source) => lstatSync(source).isDirectory();
const getDirectories = source => readdirSync(source).map(name => join(source, name)).filter(isDirectory);

const toExport = {};

getDirectories(__dirname).forEach((directory) => {
  const moduleName = path.basename(directory);
  toExport[moduleName] = {};

  fs.readdirSync(directory)
    .filter((file) => file.endsWith('.sql'))
    .forEach((file) => {
      const sqlFunctionName = path.basename(file, '.sql');
      toExport[moduleName][sqlFunctionName] = fs.readFileSync(path.join(directory, file), 'utf8');
    });
});

module.exports = toExport;