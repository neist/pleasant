export default (server) => {
  server.route({
    method: 'GET',
    url: '/',
    handler: (req, res) => {
      res.send(200, { hello: 'world' })
    }
  })
}