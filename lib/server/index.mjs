import Promise from 'bluebird'
import router from 'router'
import mitt from 'mitt'
import micro from 'micro'
import boom from 'boom'
import middleware from './middleware'
import route from './route'
import logger from '../logger'

export default () => {
  // Prepare router
  const _router = router()

  // Apply middleware
  middleware(_router)

  // Prepare server
  const _server = micro((req, res) => {
    _router(req, res, err => {
      if (err) {
        return res.send(err)
      }
      
      return res.send(boom.notFound())
    })
  })

  // Prepare event emitter
  const _emitter = mitt()

  // Prepare store
  const _store = {}

  // Pleasant...
  class Pleasant {
    constructor() {
      this._routes = []
      this._server = _server
    }

    // Register plugins
    async register(plugins) {
      return Promise.resolve(plugins).mapSeries(plugin => {
        return Promise.resolve((plugin.default || plugin)(this)).catch(err => {
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

    // Server listen
    listen() {
      return _server.listen(...arguments)
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
