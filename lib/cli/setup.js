import path from 'path'
import colors from 'colors/safe'
import server from '../server'
import logger from '../helpers/logger'

const { red, green, cyan, bold } = colors

export default async ({ entry, port, host, manual }) => {
  const app = server()

  if (entry) {
    await app.register([import(path.resolve(process.cwd(), entry))])
  } else {
    console.log(red('No entry file specified\n'))
    process.exit()
  }

  app.listen(port, host, err => {
    if (err) {
      logger.error(err)
      process.exit()
    }

    const routes = app.routes()

    let status = bold(
      `Accepting connections on ${cyan.underline(`${host}:${port}`)}\n\n`
    )

    if (routes.length) {
      status += bold('Routes:\n')
      routes.forEach(route => {
        let method = green(route.method.padEnd(8))
        let url = route.url || route.path
        status += `- ${method} ${url}\n`
      })
    } else {
      status += red('No routes\n')
    }

    console.log(status)
  })
}
