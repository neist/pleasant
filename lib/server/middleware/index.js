import { json } from 'body-parser'
import query from './query'
import send from './send'

export default router => {
  router.use(send())
  router.use(query())
  router.use(json({ limit: '10mb' }))
}
