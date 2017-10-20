export default (server) => {
  server.route({
    method: 'GET',
    url: '/',
    handler: (req, res) => {
      server.emit('email', {
        to: 'john-doe@gmail.com',
        message: 'This is a dummy message'
      })

      res.send({ status: 'Mail sent.' })
    }
  })
}