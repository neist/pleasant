import mri from 'mri'
import path from 'path'
import { promisify } from 'bluebird'
import { readFile } from 'fs'
import help from './help'
import setup from './setup'
import logger from '../logger'

export default async () => {
  const flags = mri(process.argv.slice(2), {
    default: {
      port: process.env.PORT || 3000,
      host: process.env.HOST || '0.0.0.0',
      manual: false
    },
    alias: {
      p: 'port',
      H: 'host',
      v: 'version',
      h: 'help',
      m: 'manual'
    },
    unknown(uknown) {
      console.log(help(uknown))
      process.exit(1)
    }
  })

  if (flags.help) {
    console.log(help())
    process.exit()
  }

  if (flags.version) {
    const pkg = path.resolve(__dirname, '../../package.json')
    const { version } = await promisify(readFile)(pkg)
      .then(JSON.parse)
      .catch(err => false)

    console.log(version)
    process.exit()
  }

  const entry = flags._[0] || null
  const { port, host, manual } = flags

  setup({ entry, port, host, manual }).catch(err => {
    logger.error(err)
    process.exit()
  })

  process.on('uncaughtException', err => {
    logger.error(err)
    process.exit()
  })
}
