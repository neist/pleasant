#!/usr/bin/env node
const semver = require('semver')
const colors = require('colors')
const { engines } = require('../package')
const version = engines.node

if (!semver.satisfies(process.version, version)) {
  console.error(
    colors.red(
      `pleasant requires node version ${version}. Not satisfied with current version ${process.version}.\n`
    )
  )
  process.exit()
}

require = require('esm')(module, { mode: 'auto', cjs: true })
require('../lib/cli/index.js').default()
