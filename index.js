require = require('@std/esm')(module, { esm: 'all', cjs: true })
module.exports = require('./lib/server/index.mjs').default
