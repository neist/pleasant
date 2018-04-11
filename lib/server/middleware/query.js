import { parse } from 'querystring'

export default () => (req, res, next) => {
  const { query } = req._parsedUrl
  req.query = query ? parse(query) : {}
  next()
}
