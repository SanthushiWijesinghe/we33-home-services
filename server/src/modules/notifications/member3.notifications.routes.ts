import { Router } from 'express'
import { z } from 'zod'
import { userSupabase } from '../../config/supabase.js'
import { requireAuth } from '../../middleware/auth.middleware.js'

export const member3NotificationRoutes = Router()
member3NotificationRoutes.use(requireAuth)

member3NotificationRoutes.get('/', async (request, response, next) => {
  try {
    const { data, error } = await userSupabase(request.auth!.accessToken).from('notifications')
      .select('*').eq('recipient_id', request.auth!.userId)
      .order('created_at', { ascending: false }).limit(100)
    if (error) throw error
    response.json({ notifications: data })
  } catch (cause) { next(cause) }
})

member3NotificationRoutes.patch('/:id/read', async (request, response, next) => {
  try {
    const id = z.string().uuid().parse(request.params.id)
    const { error } = await userSupabase(request.auth!.accessToken)
      .rpc('mark_member3_notification_read', { p_notification_id: id })
    if (error) throw error
    response.status(204).send()
  } catch (cause) { next(cause) }
})
