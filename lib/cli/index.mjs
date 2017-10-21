import mri from 'mri'
import util from 'util'
import fs from 'fs'
import path from 'path'
import help from './help'
import setup from './setup'
import logger from '../logger'

const readFile = util.promisify(fs.readFile)

export default async () => {
  const flags = mri(process.argv.slice(2), {
    default: {
      port: process.env.PORT || 3000,
      host: process.env.HOST || '0.0.0.0'
    },
    alias: {
      p: 'port',
      H: 'host',
      v: 'version',
      h: 'help'
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
    const { version } = await readFile(
      path.resolve(__dirname, '../../package.json')
    )
      .then(JSON.parse)
      .catch(err => false)

    console.log(version)
    process.exit()
  }

  const entry = flags._[0] || null
  const { port, host } = flags

  setup({ entry, port, host }).catch(err => {
    logger.error(err)
    process.exit()
  })

  process.on('uncaughtException', err => {
    logger.error(err)
    process.exit()
  })
}
