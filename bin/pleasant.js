#!/usr/bin/env node
const semver = require('semver')
const { engines } = require('../package')
const version = engines.node
require = require('esm')(module, { mode: 'auto', cjs: true })

if (!semver.satisfies(process.version, version)) {
  console.error(
    '\x1b[31m',
    `pleasant requires node version ${version}. Not satisfied with current version ${process.version}.`,
    '\x1b[0m'
  )
  process.exit(1)
}

require('../lib/cli/index.js').default()
