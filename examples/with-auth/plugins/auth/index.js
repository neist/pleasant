import middleware from './middleware'

export default async server => {
  // Enable auth for the entire server (Without requiring scope)
  server.use(middleware())
}
