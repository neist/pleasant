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
    async register(...args) {
      // Get arguments
      const prefix = typeof args[0] === 'string' ? args.shift() : null
      const plugins = !Array.isArray(args[0]) ? [args[0]] : args[0]
      const config = args[1] || {}

      // Save reference to application router
      const app = internals.router

      // Prefix enabled?
      if (prefix) {
        // Attach temporary router
        internals.router = router()

        // State that router is prefixed
        internals.router.prefix = prefix
      }

      // Register plugins
      const results = await Promise.resolve(plugins).mapSeries(plugin => {
        const fn = plugin.default || plugin

        if (!fn) {
          return
        }

        return Promise.resolve(fn(this, config)).catch(err => {
          logger.error(err)
          process.exit()
        })
      })

      // Prefix enabled?
      if (prefix) {
        // Add temporary router as prefixed middleware to application router
        app.use(prefix, internals.router)

        // Change back to application router
        internals.router = app
      }

      return results
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
      return route(internals.router, config, () => {
        if (internals.router.prefix) {
          config.url = `${internals.router.prefix}${config.url}`
        }

        internals.routes.push(config)
      })
    }
    routes() {
      return internals.routes
    }

    // Middleware
    use(...args) {
      args = args.map(
        arg => (typeof arg === 'function' ? asynchronous(arg) : arg)
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
