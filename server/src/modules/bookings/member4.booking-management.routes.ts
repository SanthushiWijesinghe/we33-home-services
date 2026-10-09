import { Router } from 'express'
import { z } from 'zod'
import { userSupabase } from '../../config/supabase.js'
import { requireAuth } from '../../middleware/auth.middleware.js'

export const member4BookingManagementRoutes = Router()
member4BookingManagementRoutes.use(requireAuth)

member4BookingManagementRoutes.get('/', async (request, response, next) => {
  try {
    const { data, error } = await userSupabase(request.auth!.accessToken).rpc('member4_list_bookings')
    if (error) throw error
    response.json({ bookings: data })
  } catch (cause) { next(cause) }
})

member4BookingManagementRoutes.get('/:id/events', async (request, response, next) => {
  try {
    const id = z.string().uuid().parse(request.params.id)
    const { data, error } = await userSupabase(request.auth!.accessToken).from('booking_events')
      .select('*').eq('booking_id', id).order('created_at')
    if (error) throw error
    response.json({ events: data })
  } catch (cause) { next(cause) }
})

member4BookingManagementRoutes.patch('/:id/status', async (request, response, next) => {
  try {
    const id = z.string().uuid().parse(request.params.id)
    const input = z.object({ status: z.enum(['cancelled', 'completed']), reason: z.string().max(500).optional() }).parse(request.body)
    const { data, error } = await userSupabase(request.auth!.accessToken).rpc('member4_change_booking_status', {
      p_booking_id: id, p_status: input.status, p_reason: input.reason ?? null,
    })
    if (error) throw error
    response.json({ booking: data })
  } catch (cause) { next(cause) }
})
