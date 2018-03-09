import cors from 'cors'

export default async server => {
  // Enable cors
  server.use(cors())
}
