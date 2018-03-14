export default async server => {
  server.route({
    method: 'GET',
    url: '/',
    handler: async ({ user }, res) => {
      res.send({ user })
    }
  })
}
