const semver = require('semver')
const { engines } = require('./package')
const version = engines.node;

if (!semver.satisfies(process.version, version)) {
  console.error('\x1b[31m', `pleasant requires node version ${version}. Not satisfied with current version ${process.version}.\n\n`, '\x1b[0m');
  process.exit(1);
}