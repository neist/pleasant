import query from 'connect-query'
import bodyParser from 'body-parser'
import send from './send'

export default internals => {
  internals.use(send())
  internals.use(query())
  internals.use(bodyParser.json({ limit: '1mb' }))
}
