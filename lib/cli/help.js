const green = text => `\x1b[32m${text}\x1b[0m`

export default unknown => {
  const usage = `\n  Usage: ${green('pleasant')} [options] [entry]
  ${unknown
    ? `\n  The option "${unknown}" is unknown. Use one of these:\n`
    : ''}
  Options:
    ${green('-p, --port <n>')}  Port to listen on (defaults to 3000)
    ${green('-H, --host')}      The host on which server will run
    ${green('-v, --version')}   Output the version number
    ${green('-h, --help')}      Show this usage information
  `

  return usage
}
