import Promise from 'bluebird'

export default middleware => {
  if (middleware.length === 4) {
    return (err, req, res, next) => {
      Promise.resolve(middleware(err, req, res, next)).catch(next)
    }
  }
  return (req, res, next) => {
    Promise.resolve(middleware(req, res, next)).catch(next)
  }
}
