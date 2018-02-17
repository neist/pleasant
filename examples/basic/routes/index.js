export default async server => {
  server.route({
    method: 'GET',
    url: '/',
    handler: (req, res) => {
      res.send({ hello: 'world' })
    }
  })
}
