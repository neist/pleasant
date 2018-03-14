require = require('esm')(module, { mode: 'auto', cjs: true })
module.exports = require('./lib/server/index.js').default
