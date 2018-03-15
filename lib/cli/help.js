import colors from 'colors'

export default unknown => {
  const usage = `\n  Usage: ${colors.green('pleasant')} [options] entry
  ${unknown
    ? `\n  The option "${unknown}" is unknown. Use one of these:\n`
    : ''}
  Options:
    ${colors.green('-p, --port <n>')}  Port to listen on (defaults to 3000)
    ${colors.green('-H, --host')}      The host on which pleasant will run
    ${colors.green('-v, --version')}   Output the version number
    ${colors.green('-h, --help')}      Show this usage information
  `

  return usage
}
