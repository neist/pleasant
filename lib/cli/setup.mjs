import path from 'path'
import glob from 'glob-promise'
import server from '../server'
import logger from '../logger'

export default async ({ entry, port, host }) => {
  const main = entry && (await import(path.resolve(process.cwd(), entry)))
  let autoRegister = true

  const app = server()

  if (main && main.default) {
    autoRegister = await Promise.resolve(main.default(app))
  }

  if (autoRegister !== false) {
    const routes = await glob('routes/{*,**/index}.mjs')

    await app.register(
      routes.map(route => import(path.resolve(process.cwd(), route)))
    )
  }

  app.listen(port, host, err => {
    if (err) {
      logger.error(err)
      process.exit()
    }

    const green = text => `\x1b[32m${text}\x1b[0m`

    let status = `Accepting connections on ${green(host)}:${green(port)}\n\n`
    status += `${green('Routes:')}\n`
    app.routes().forEach(route => {
      status += `* [${route.method}] ${route.url}\n`
    })

    console.log(status)
  })
}
