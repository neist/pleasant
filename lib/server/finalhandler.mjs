import boom from 'boom'
import logger from '../logger'

export default (req, res) => err => {
  if (err) {
    const boomed = err.isBoom ? err : boom.boomify(err)

    if (boomed.isServer) {
      logger.error(boomed)
    }

    return res.send(boomed.output.statusCode, {
      ...boomed.output.payload,
      ...boomed.data
    })
  }

  return res.send(boom.notFound())
}
