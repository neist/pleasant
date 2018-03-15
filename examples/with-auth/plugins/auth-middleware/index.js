import boom from 'boom'

export default scope => (req, res, next) => {
  // User object already present?
  let user = req.user || false

  // Perform auth lookup - let's pretend we found this user
  if (!user) {
    user = {
      name: 'John',
      scope: ['user', 'admin']
    }
  }

  // User not found
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