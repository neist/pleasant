#!/usr/bin/env node
require = require('@std/esm')(module, { esm: 'mjs', cjs: true })
require('../lib/cli/index.mjs').default()