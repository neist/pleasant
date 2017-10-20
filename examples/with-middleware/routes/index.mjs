export default async (server) => {
  // const config = server.get('config')

  server.route({
    method: 'GET',
    url: '/',
    handler: (req, res) => {
      res.send({ hello: 'world' })
    }
  })
}