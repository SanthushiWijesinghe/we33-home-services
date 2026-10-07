import { Router } from 'express'
import { z } from 'zod'
import { userSupabase } from '../../config/supabase.js'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { requireRole } from '../../middleware/role.middleware.js'

export const member3BookingCreateRoutes = Router()

member3BookingCreateRoutes.post('/', requireAuth, requireRole('CUSTOMER'), async (request, response, next) => {
  try {
    const input = z.object({
      service_id: z.string().uuid(),
      slot_id: z.string().uuid(),
      address: z.string().trim().min(8).max(500),
    }).parse(request.body)
    const { data, error } = await userSupabase(request.auth!.accessToken).rpc('book_service_slot', {
      p_service_id: input.service_id, p_slot_id: input.slot_id, p_address: input.address,
    })
    if (error) throw error
    response.status(201).json({ booking: data })
  } catch (cause) { next(cause) }
})
