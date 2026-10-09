import { Router } from 'express'
import { z } from 'zod'
import { userSupabase } from '../../config/supabase.js'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { requireRole } from '../../middleware/role.middleware.js'

export const member4SupportRoutes = Router()
member4SupportRoutes.use(requireAuth)

member4SupportRoutes.get('/', async (request, response, next) => {
  try {
    const { data, error } = await userSupabase(request.auth!.accessToken).from('support_requests')
      .select('*').order('created_at', { ascending: false }).limit(100)
    if (error) throw error
    response.json({ requests: data })
  } catch (cause) { next(cause) }
})

member4SupportRoutes.post('/', requireRole('CUSTOMER', 'SERVICE_PROVIDER'), async (request, response, next) => {
  try {
    const input = z.object({ subject: z.string().trim().min(5).max(120), message: z.string().trim().min(15).max(2000) }).parse(request.body)
    const { data, error } = await userSupabase(request.auth!.accessToken).from('support_requests')
      .insert({ user_id: request.auth!.userId, ...input }).select('*').single()
    if (error) throw error
    response.status(201).json({ request: data })
  } catch (cause) { next(cause) }
})

member4SupportRoutes.patch('/:id', requireRole('ADMIN'), async (request, response, next) => {
  try {
    const id = z.string().uuid().parse(request.params.id)
    const input = z.object({ status: z.enum(['open', 'in_progress', 'resolved']), admin_note: z.string().optional() }).parse(request.body)
    const { data, error } = await userSupabase(request.auth!.accessToken).rpc('member4_update_support', {
      p_request_id: id, p_status: input.status, p_admin_note: input.admin_note ?? null,
    })
    if (error) throw error
    response.json({ request: data })
  } catch (cause) { next(cause) }
})
