import url from 'url'

export default () => (req, res, next) => {
  const { query } = url.parse(req.url, true)
  req.query = query
  next()
}
