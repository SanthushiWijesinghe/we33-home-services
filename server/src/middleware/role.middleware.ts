import type { RequestHandler } from 'express'
import type { UserRole } from '../types/roles.js'

export function requireRole(...roles: UserRole[]): RequestHandler {
  return (request, response, next) => {
    if (!request.auth) {
      response.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Sign in is required' } })
      return
    }
    if (!roles.includes(request.auth.role)) {
      response.status(403).json({ error: { code: 'FORBIDDEN', message: 'You cannot access this resource' } })
      return
    }
    next()
  }
}
