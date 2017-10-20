require = require('@std/esm')(module, { esm: 'mjs', cjs: true })
module.exports = require('./lib/server/index.mjs').default
