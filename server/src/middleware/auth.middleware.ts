import type { RequestHandler } from 'express'
import { publicSupabase, supabaseConfigured, userSupabase } from '../config/supabase.js'
import { ROLES, type UserRole } from '../types/roles.js'

export type AuthContext = { userId: string; role: UserRole; accessToken: string }

declare global {
  namespace Express { interface Request { auth?: AuthContext } }
}

export const requireAuth: RequestHandler = async (request, response, next) => {
  const match = request.headers.authorization?.match(/^Bearer\s+(.+)$/i)
  if (!match) {
    response.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Sign in is required' } })
    return
  }
  if (!supabaseConfigured) {
    response.status(503).json({ error: { code: 'NOT_CONFIGURED', message: 'Supabase is not configured' } })
    return
  }
  try {
    const accessToken = match[1]
    const { data: userResult, error: authError } = await publicSupabase().auth.getUser(accessToken)
    if (authError || !userResult.user) throw new Error('Invalid session')
    const { data: profile, error: profileError } = await userSupabase(accessToken)
      .from('profiles').select('role').eq('id', userResult.user.id).single()
    if (profileError || !profile || !ROLES.includes(profile.role as UserRole)) throw new Error('Profile unavailable')
    request.auth = { userId: userResult.user.id, role: profile.role as UserRole, accessToken }
    next()
  } catch {
    response.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Session is invalid or expired' } })
  }
}
