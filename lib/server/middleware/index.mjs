import query from 'connect-query'
import { json } from 'body-parser'
import send from './send'

export default internals => {
  internals.use(send())
  internals.use(query())
  internals.use(json({ limit: '1mb' }))
}
