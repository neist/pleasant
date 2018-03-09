import path from 'path'
import glob from 'glob'
import { promisify } from 'bluebird'
import server from '../server'
import logger from '../logger'

const green = text => `\x1b[32m${text}\x1b[0m`

export default async ({ entry, port, host, manual }) => {
  const app = server()

  if (entry) {
    await app.register([import(path.resolve(process.cwd(), entry))])
  }

  if (manual === false) {
    const routes = await promisify(glob)('routes/{*,*/index}.{js,mjs}')

    await app.register(
      routes.map(route => import(path.resolve(process.cwd(), route)))
    )
  }

  app.listen(port, host, err => {
    if (err) {
      logger.error(err)
      process.exit()
    }

    const routes = app.routes()

    let status = `Accepting connections on ${green(host)}:${green(port)}\n\n`
    status += `${green('Routes:')}\n`

    if (routes.length) {
      routes.forEach(route => (status += `* [${route.method}] ${route.url}\n`))
    } else {
      status += 'No routes'
    }

    console.log(status)
  })
}
