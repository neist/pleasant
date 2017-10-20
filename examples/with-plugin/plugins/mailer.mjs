export default (server) => {
  server.on('email', (email) => {
    console.log('Email:', email)
  })
}