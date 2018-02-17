import auth from '../plugins/auth/middleware'

export default async server => {
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
