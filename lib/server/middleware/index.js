import { json } from 'body-parser'
import query from './query'
import send from './send'

export default internals => {
  internals.use(send())
  internals.use(query())
  internals.use(json({ limit: '10mb' }))
}
