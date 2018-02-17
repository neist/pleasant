import boom from 'boom'

export default async server => {
  // Make sure the 404 middleware is added *after* automatically registering routes
  // We do this using the 'ready' event
  server.on('ready', () => {
    server.use((req, res, next) => {
      res.send(boom.notFound('This is a custom 404 handler'))
    })
  })
}
