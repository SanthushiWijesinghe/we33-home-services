import { Router } from 'express'
import { z } from 'zod'
import { publicSupabase, userSupabase } from '../../config/supabase.js'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { requireRole } from '../../middleware/role.middleware.js'

export const member4ReviewRoutes = Router()
const reviewInput = z.object({ booking_id: z.string().uuid(), rating: z.number().int().min(1).max(5), comment: z.string().trim().min(10).max(1000) })

member4ReviewRoutes.get('/', async (request, response, next) => {
  try {
    const providerId = z.string().uuid().parse(request.query.provider_id)
    const { data, error } = await publicSupabase().rpc('member4_list_provider_reviews', { p_provider_id: providerId })
    if (error) throw error
    response.json({ reviews: data })
  } catch (cause) { next(cause) }
})

member4ReviewRoutes.post('/', requireAuth, requireRole('CUSTOMER'), async (request, response, next) => {
  try {
    const input = reviewInput.parse(request.body)
    const { data, error } = await userSupabase(request.auth!.accessToken).rpc('member4_save_review', {
      p_booking_id: input.booking_id, p_rating: input.rating, p_comment: input.comment,
    })
    if (error) throw error
    response.status(201).json({ review: data })
  } catch (cause) { next(cause) }
})

member4ReviewRoutes.patch('/:bookingId', requireAuth, requireRole('CUSTOMER'), async (request, response, next) => {
  try {
    const bookingId = z.string().uuid().parse(request.params.bookingId)
    const input = reviewInput.omit({ booking_id: true }).parse(request.body)
    const { data, error } = await userSupabase(request.auth!.accessToken).rpc('member4_save_review', {
      p_booking_id: bookingId, p_rating: input.rating, p_comment: input.comment,
    })
    if (error) throw error
    response.json({ review: data })
  } catch (cause) { next(cause) }
})

member4ReviewRoutes.delete('/:id', requireAuth, requireRole('CUSTOMER'), async (request, response, next) => {
  try {
    const id = z.string().uuid().parse(request.params.id)
    const { error } = await userSupabase(request.auth!.accessToken).rpc('member4_delete_review', { p_review_id: id })
    if (error) throw error
    response.status(204).send()
  } catch (cause) { next(cause) }
})
