import joi from 'joi'
import boom from 'boom'

export default async server => {
  const auth = server.get('auth-middleware')

  server.route({
    method: 'GET',
    url: '/require-missing-scope',
    handler: [
      auth('missing-scope'),
      async ({ user }, res) => {
        res.send({ user })
      }
    ]
  })
}
