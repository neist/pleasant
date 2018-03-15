import Promise from 'bluebird'
import router from 'router'
import http from 'http'
import asynchronous from './middleware/asynchronous'
import finalhandler from './finalhandler'
import middleware from './middleware'
import route from './route'
import logger from '../logger'
import Emitter from './emitter'

export default () => {
  // Prepare internals
  const internals = {
    // Prepare router
    router: router(),

    // Prepare server
    server: http.createServer((req, res) => {
      internals.router(req, res, finalhandler(req, res))
    }),

    // Prepare event emitter
    emitter: new Emitter(),

    // Prepare store
    store: {},

    // Prepare routes array
    routes: []
  }

  // Apply middleware
  middleware(internals.router)

  // Pleasant...
  class Pleasant {
    constructor() {
      this.listener = internals.server
    }

    // Register plugins
    async register(plugins, config = {}) {
      plugins = !Array.isArray(plugins) ? [plugins] : plugins

      return Promise.resolve(plugins).mapSeries(plugin => {
        return Promise.resolve(
          (plugin.default || plugin)(this, config)
        ).catch(err => {
          logger.error(err)
          process.exit()
        })
      })
    }

    // Events
    on(...args) {
      return internals.emitter.on(...args)
    }
    off(...args) {
      return internals.emitter.off(...args)
    }
    emit(...args) {
      return internals.emitter.emit(...args)
    }

    // Server
    async listen(...args) {
      await this.emit('ready')
      return internals.server.listen(...args)
    }
    close(...args) {
      return internals.server.close(...args)
    }

    // Routes
    route(config) {
      return route(internals, config, () => internals.routes.push(config))
    }
    routes() {
      return internals.routes
    }

    // Middleware
    use(...args) {
      args = args.map(
        args => (typeof args === 'function' ? asynchronous(args) : args)
      )
      return internals.router.use(...args)
    }

    // Store
    set(key, value) {
      internals.store[key] = value
    }
    get(key) {
      return key ? internals.store[key] : internals.store
    }
  }

  return new Pleasant()
}
