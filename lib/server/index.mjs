import Promise from 'bluebird'
import router from 'router'
import mitt from 'mitt'
import http from 'http'
import asynchronous from './middleware/asynchronous'
import finalhandler from './finalhandler'
import middleware from './middleware'
import route from './route'
import logger from '../logger'

export default () => {
  // Prepare internals
  const internals = {
    // Prepare rputer
    router: router(),

    // Prepare server
    server: http.createServer((req, res) => {
      internals.router(req, res, finalhandler(req, res))
    }),

    // Prepare event emitter
    emitter: mitt(),

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
    on() {
      return internals.emitter.on(...arguments)
    }
    off() {
      return internals.emitter.off(...arguments)
    }
    emit() {
      return internals.emitter.emit(...arguments)
    }

    // Server
    listen() {
      // Emit 'ready' event
      this.emit('ready')

      // Start the server
      return internals.server.listen(...arguments)
    }
    close() {
      return internals.server.close(...arguments)
    }

    // Routes
    route(config) {
      return route(internals, config, () => internals.routes.push(config))
    }
    routes() {
      return internals.routes
    }

    // Middleware
    use(...middlewares) {
      middlewares = middlewares.map(asynchronous)
      return internals.router.use(...middlewares)
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
