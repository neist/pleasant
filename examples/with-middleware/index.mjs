import cors from 'cors'
const { NODE_ENV } = process.env

export default async (server) => {
  // Enable cors
  server.use(cors())

  // Set config
  server.set('config', {
    dev: NODE_ENV === 'development'
  })
}