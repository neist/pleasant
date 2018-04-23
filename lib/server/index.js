import router from 'router'
import http from 'http'
import mapSeries from '../helpers/map-series'
import asynchronous from './middleware/asynchronous'
import finalhandler from './finalhandler'
import middleware from './middleware'
import route from './route'
import logger from '../helpers/logger'
import Emitter from './emitter'

export default (options = {}) => {
  // Prepare internals
  const internals = {
    // Prepare router
    router: router(),

    // Prepare server
    server: (options.server || http).createServer((req, res) => {
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

      // Save reference to top-level router
      const app = internals.router

      // Prefix enabled?
      if (prefix) {
        // Attach temporary router
        internals.router = router()

        // State that router is prefixed
        internals.router.prefix = `${app.prefix || ''}${prefix}`
      }

      // Register plugins
      await mapSeries(plugins, async plugin => {
        const fn = (plugin && plugin.default) || plugin

        if (typeof fn !== 'function') {
          return
        }

        await fn(this, config).catch(err => {
          logger.error(err)
          process.exit()
        })
      })

      // Prefix enabled?
      if (prefix) {
        // Add temporary router as prefixed middleware to application router
        app.use(prefix, internals.router)

        // Change back to top-level router
        internals.router = app
      }
    }

    // Add event handler
    on(...args) {
      return internals.emitter.on(...args)
    }

    // Remove event handler
    off(...args) {
      return internals.emitter.off(...args)
    }

    // Emit event
    emit(...args) {
      return internals.emitter.emit(...args)
    }

    // Start listeningen
    async listen(...args) {
      await this.emit('ready')
      return internals.server.listen(...args)
    }

    // Close server
    close(...args) {
      return internals.server.close(...args)
    }

    // Add route
    route(...args) {
      const { router } = internals
      const { prefix } = router

      let config = {}

      if (args.length === 1) {
        config = args[0]
      } else {
        const [method, url, ...handler] = args
        config = { method, url, handler }
      }

      route(router, config)

      if (prefix) {
        config.url = `${prefix}${config.url}`
      }

      internals.routes.push(config)
    }

    // Return list of routes
    routes() {
      return internals.routes
    }

    // Apply middleware
    use(...args) {
      // Wrap in asynchronous handler
      args = args.map(
        arg => (typeof arg === 'function' ? asynchronous(arg) : arg)
      )

      // Apply middleware
      internals.router.use(...args)

      // Make use statements chainable
      return this
    }

    // Set store value
    set(key, value) {
      internals.store[key] = value
    }

    // Get store value
    get(key) {
      return key ? internals.store[key] : internals.store
    }
  }

  // Return instance
  return new Pleasant()
}
