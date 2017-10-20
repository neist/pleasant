export default (server) => {
  server.route({
    method: 'GET',
    url: '/hello/:name',
    handler: (req, res) => {
      const { name } = req.params
      res.send(200, { hello: name })
    }
  })
}