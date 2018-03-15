import { readable } from 'is-stream'
import { Stream } from 'stream'
import logger from '../../logger'

const _send = (res, code, obj = null) => {
  res.statusCode = code

  if (obj === null) {
    res.end()
    return
  }

  if (Buffer.isBuffer(obj)) {
    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/octet-stream')
    }

    res.setHeader('Content-Length', obj.length)
    res.end(obj)
    return
  }

  if (obj instanceof Stream || readable(obj)) {
    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/octet-stream')
    }

    obj.pipe(res)
    return
  }

  let str = obj

  if (typeof obj === 'object' || typeof obj === 'number') {
    str = JSON.stringify(obj)

    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
    }
  }

  res.setHeader('Content-Length', Buffer.byteLength(str))

  res.end(str)
}

const send = (req, res, next) => (...args) => {
  if (args.length === 1) {
    const [data] = args
    if (data instanceof Error) {
      return next(data)
    }
    return setImmediate(_send, res, 200, data)
  }
  return setImmediate(_send, res, ...args)
}

export default () => (req, res, next) => {
  res.send = send(req, res, next)
  next()
}
