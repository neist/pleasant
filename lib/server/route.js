import http from 'http'
import validate from './middleware/validate'
import asynchronous from './middleware/asynchronous'

const methods = [...http.METHODS, 'ALL']

export default (router, route) => {
  if (!route.method) {
    throw new Error('Route: `method` not provided')
  }

  if (!methods.includes(route.method)) {
    throw new Error('Route: Invalid `method` provided')
  }

  if (!route.url) {
    throw new Error('Route: `url` not provided')
  }

  if (!route.handler) {
    throw new Error('Route: `handler` not provided')
  }

  route.handler = !Array.isArray(route.handler)
    ? [route.handler]
    : route.handler

  if (route.validate) {
    route.handler.splice(-1, 0, validate(route.validate))
  }

  route.handler = route.handler.map(asynchronous)

  router[route.method.toLowerCase()](route.url, ...route.handler)
}
