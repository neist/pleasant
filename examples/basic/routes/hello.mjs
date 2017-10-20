export default async (server) => {
  server.route({
    method: 'GET',
    url: '/hello/:name',
    handler: (req, res) => {
      const { name } = req.params
      res.send({ hello: name })
    }
  })
}