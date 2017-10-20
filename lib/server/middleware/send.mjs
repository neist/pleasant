import micro from 'micro'
import boom from 'boom'
import logger from '../../logger'

const send = (req, res) => (...args) => {
  if (args.length === 1) {
    const [data] = args
    if (data instanceof Error) {
      const boomed = data.isBoom ? data : boom.boomify(data)

      if (boomed.isServer) {
        logger.error(boomed)
      }

      return micro.send(res, boomed.output.statusCode, {
        ...boomed.output.payload,
        ...boomed.data
      })
    }
    return micro.send(res, 200, ...args)
  }
  return micro.send(res, ...args)
}

export default () => (req, res, next) => {
  res.send = send(req, res)
  next()
}