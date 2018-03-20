import mri from 'mri'
import path from 'path'
import fs from 'fs'
import help from './help'
import setup from './setup'
import logger from '../helpers/logger'

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
    const packageJson = fs.readFileSync(
      path.resolve(__dirname, '../../package.json'),
      'utf-8'
    )
    const { version } = JSON.parse(packageJson)

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
