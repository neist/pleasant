const TYPE = 'Content-Type'
const OSTREAM = 'application/octet-stream'

const sendResponse = (res, next, arg1, arg2) => {
  let headers = {}

  let code = typeof arg1 === 'number' ? arg1 : 200
  let data = (typeof arg1 === 'number' ? arg2 : arg1) || ''
  let type = res.getHeader(TYPE)

  if (!!data && data instanceof Error) {
    return next(data)
  }

  if (!!data && typeof data.pipe === 'function') {
    res.setHeader(TYPE, type || OSTREAM)
    return data.pipe(res)
  }

  if (data instanceof Buffer) {
    type = type || OSTREAM
  } else if (typeof data === 'object') {
    data = JSON.stringify(data)
    type = 'application/json;charset=utf-8'
  }

  headers[TYPE] = type || 'text/plain'
  headers['Content-Length'] = Buffer.byteLength(data)

  res.writeHead(code, headers)
  res.end(data)
}

export default () => (req, res, next) => {
  res.send = setImmediate.bind(null, sendResponse.bind(null, res, next))
  next()
}
