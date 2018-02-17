export default async server => {
  const config = server.get('config')

  server.route({
    method: 'GET',
    url: '/',
    handler: async (req, res) => {
      res.send({ config })
    }
  })
}
