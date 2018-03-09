import auth from '../plugins/auth-middleware'

export default async server => {
  server.route({
    method: 'GET',
    url: '/require-scope',
    handler: [
      auth('admin'),
      async ({ user }, res) => {
        res.send({ user })
      }
    ]
  })
}
