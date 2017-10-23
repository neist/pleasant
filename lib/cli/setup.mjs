import path from 'path'
import glob from 'glob'
import { promisify } from 'bluebird'
import server from '../server'
import logger from '../logger'

const green = text => `\x1b[32m${text}\x1b[0m`

export default async ({ entry, port, host }) => {
  const app = server()

  if (entry && /\.js$/.test(entry)) {
    console.error(
      `You have specified an invalid entry file. "${green(
        `${entry}`
      )}" must be a .mjs file.`
    )
    process.exit()
  }

  const main =
    entry &&
    (await import(path.resolve(process.cwd(), entry)).catch(err => {
      if (err.code === 'ERR_MISSING_MODULE') {
        console.error(
          `You have specified an invalid entry file. "${green(
            `${entry}`
          )}" was not found.`
        )
        process.exit()
      } else {
        logger.error(err)
        process.exit()
      }
    }))

  const autoRegister =
    main && main.default && (await app.register([main]).then(res => res[0]))

  if (autoRegister !== false) {
    const routes = await promisify(glob)('routes/{*,*/index}.mjs')

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
