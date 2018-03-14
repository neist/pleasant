import joi from 'joi'
import boom from 'boom'

export default validate => (req, res, next) => {
  let data = {}

  Object.keys(validate).forEach(key => (data[key] = req[key]))

  const { value, error } = joi.validate(data, validate, { stripUnknown: true })

  if (error) {
    if (error.isBoom) {
      return next(error)
    }

    const { message, path } = error.details[0]
    return next(boom.badRequest(message, { source: path.join('.') }))
  }

  Object.keys(value).forEach(key => (req[key] = value[key]))

  next()
}
