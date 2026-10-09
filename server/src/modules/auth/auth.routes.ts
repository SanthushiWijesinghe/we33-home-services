import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { userSupabase } from '../../config/supabase.js'

export const authRoutes = Router()

authRoutes.get('/me', requireAuth, async (request, response, next) => {
  try {
    const { data, error } = await userSupabase(request.auth!.accessToken)
      .from('profiles').select('id, full_name, role, phone').eq('id', request.auth!.userId).single()
    if (error) throw error
    response.json({ user: data })
  } catch (error) { next(error) }
})
