import Promise from 'bluebird'
import router from 'router'
import mitt from 'mitt'
import http from 'http'
import finalhandler from './finalhandler'
import middleware from './middleware'
import route from './route'
import logger from '../logger'

export default () => {
  // Prepare router
  const _router = router()

  // Apply middleware
  middleware(_router)

  // Prepare server
  const _server = http.createServer((req, res) => {
    _router(req, res, finalhandler(req, res))
  })

  // Prepare event emitter
  const _emitter = mitt()

  // Prepare store
  const _store = {}

  // Pleasant...
  class Pleasant {
    constructor() {
      this._routes = []
      this.listener = _server
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
      return _emitter.on(...arguments)
    }
    off() {
      return _emitter.off(...arguments)
    }
    emit() {
      return _emitter.emit(...arguments)
    }

    // Server
    listen() {
      this.emit('ready')
      return _server.listen(...arguments)
    }
    close() {
      return _server.close(...arguments)
    }

    // Routes
    route() {
      return route(_router, this, ...arguments)
    }
    routes() {
      return this._routes
    }

    // Middleware
    use() {
      return _router.use(...arguments)
    }

    // Store
    set(key, value) {
      _store[key] = value
    }
    get(key) {
      return key ? _store[key] : _store
    }
  }

  return new Pleasant()
}
