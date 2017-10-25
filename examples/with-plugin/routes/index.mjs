export default async server => {
  server.route({
    method: 'GET',
    url: '/',
    handler: async (req, res) => {
      await server.emit('email', {
        to: 'john-doe@gmail.com',
        message: 'This is a dummy message'
      })

      res.send({ status: 'Mail sent.' })
    }
  })
}
