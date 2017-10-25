import boom from 'boom'

export const auth = scope => (req, res, next) => {
  // User object already present?
  let user = req.user || false

  // Perform auth lookup - let's pretend we found this user
  if (!user) {
    user = {
      name: 'John',
      scope: ['user', 'admin']
    }
  }

  // USer not found
  if (!user) {
    return res.send(boom.forbidden(`This route requires authentication`))
  }

  // Invalid scope?
  if (scope) {
    if (!user.scope.includes(scope)) {
      return res.send(
        boom.forbidden(`This route requires '${scope}' privileges.`)
      )
    }
  }

  // Add user to req object
  req.user = user

  // Continue
  next()
}

export default async server => {
  // Make auth-middleware available through server store for easy access
  server.set('auth-middleware', auth)

  // Enable authentication for all routes without requiring scope - optional
  server.use(auth())

  // Enable authentication for subset of routes - optional
  // server.use('/admin/*', auth('admin'))
}
