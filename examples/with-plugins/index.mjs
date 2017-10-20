export default async (server) => {
  await server.register([
    import('./plugins/mailer')
  ])
}