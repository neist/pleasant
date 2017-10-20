import prettyErrors from 'pretty-error'
const pe = new prettyErrors()

const { NODE_ENV = 'development' } = process.env

export default {
  error: err =>
    NODE_ENV === 'development'
      ? console.error(pe.render(err))
      : console.error(err)
}
