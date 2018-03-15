import path from 'path'
import colors from 'colors'
import { promisify } from 'bluebird'
import server from '../server'
import logger from '../logger'

export default async ({ entry, port, host, manual }) => {
  const app = server()

  if (entry) {
    await app.register([import(path.resolve(process.cwd(), entry))])
  } else {
    console.log(colors.red('No entry file specified\n'))
    process.exit()
  }

  app.listen(port, host, err => {
    if (err) {
      logger.error(err)
      process.exit()
    }

    const routes = app.routes()

    let status = `Accepting connections on ${colors.green(host)}:${colors.green(
      port
    )}\n\n`

    if (routes.length) {
      status += colors.green('Routes:\n')
      routes.forEach(route => (status += `- [${route.method}] ${route.url}\n`))
    } else {
      status += colors.red('No routes')
    }

    console.log(status)
  })
}
