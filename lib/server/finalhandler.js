import boom from 'boom'
import logger from '../helpers/logger'

export default (req, res) => err => {
  if (err) {
    const boomed = err.isBoom
      ? err
      : boom.boomify(err, {
          statusCode: err.statusCode || err.status || 500
        })

    if (boomed.isServer) {
      logger.error(boomed)
    }

    res.statusCode = boomed.output.statusCode

    return res.end(
      JSON.stringify({
        ...boomed.output.payload,
        ...boomed.data
      })
    )
  }

  res.statusCode = 404

  return res.end(
    JSON.stringify({
      statusCode: 404,
      error: 'Not Found',
      message: 'Not Found'
    })
  )
}
