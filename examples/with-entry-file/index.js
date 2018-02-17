export default async server => {
  server.set('config', {
    a: 'foo',
    b: 'bar'
  })
}
