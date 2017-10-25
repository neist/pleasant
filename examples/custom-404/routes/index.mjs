export default async server => {
  server.route({
    method: 'GET',
    url: '/waldo',
    handler: async (req, res) => {
      res.send({ hello: 'world' })
    }
  })
}
