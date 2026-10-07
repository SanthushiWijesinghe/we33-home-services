import { Router } from 'express'
import { z } from 'zod'
import { publicSupabase, userSupabase } from '../../config/supabase.js'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { requireRole } from '../../middleware/role.middleware.js'

export const member3AvailabilityRoutes = Router()
const slotInput = z.object({
  service_id: z.string().uuid(),
  start_at: z.iso.datetime({ offset: true }),
  end_at: z.iso.datetime({ offset: true }),
}).refine(value => new Date(value.start_at) < new Date(value.end_at), {
  message: 'End must be after start',
})
const timeInput = slotInput.pick({ start_at: true, end_at: true }).refine(
  value => new Date(value.start_at) < new Date(value.end_at), { message: 'End must be after start' },
)

member3AvailabilityRoutes.get('/', async (request, response, next) => {
  try {
    const serviceId = z.string().uuid().parse(request.query.serviceId)
    const { data, error } = await publicSupabase().from('availability_slots').select('*')
      .eq('service_id', serviceId).eq('status', 'available').gt('start_at', new Date().toISOString())
      .order('start_at').limit(100)
    if (error) throw error
    response.json({ slots: data })
  } catch (cause) { next(cause) }
})

member3AvailabilityRoutes.get('/mine', requireAuth, requireRole('SERVICE_PROVIDER'), async (request, response, next) => {
  try {
    const { data, error } = await userSupabase(request.auth!.accessToken).from('availability_slots')
      .select('*').eq('provider_id', request.auth!.userId).gte('start_at', new Date().toISOString())
      .order('start_at').limit(100)
    if (error) throw error
    response.json({ slots: data })
  } catch (cause) { next(cause) }
})

member3AvailabilityRoutes.post('/', requireAuth, requireRole('SERVICE_PROVIDER'), async (request, response, next) => {
  try {
    const input = slotInput.parse(request.body)
    const { data, error } = await userSupabase(request.auth!.accessToken).from('availability_slots')
      .insert({ ...input, provider_id: request.auth!.userId }).select('*').single()
    if (error) throw error
    response.status(201).json({ slot: data })
  } catch (cause) { next(cause) }
})

member3AvailabilityRoutes.patch('/:id', requireAuth, requireRole('SERVICE_PROVIDER'), async (request, response, next) => {
  try {
    const id = z.string().uuid().parse(request.params.id)
    const input = timeInput.parse(request.body)
    const { data, error } = await userSupabase(request.auth!.accessToken).from('availability_slots')
      .update(input).eq('id', id).eq('provider_id', request.auth!.userId)
      .eq('status', 'available').select('*').maybeSingle()
    if (error) throw error
    if (!data) { response.status(404).json({ error: { code: 'NOT_FOUND', message: 'Available time not found' } }); return }
    response.json({ slot: data })
  } catch (cause) { next(cause) }
})

member3AvailabilityRoutes.delete('/:id', requireAuth, requireRole('SERVICE_PROVIDER'), async (request, response, next) => {
  try {
    const id = z.string().uuid().parse(request.params.id)
    const { data, error } = await userSupabase(request.auth!.accessToken).from('availability_slots')
      .delete().eq('id', id).eq('provider_id', request.auth!.userId)
      .eq('status', 'available').select('id').maybeSingle()
    if (error) throw error
    if (!data) { response.status(404).json({ error: { code: 'NOT_FOUND', message: 'Available time not found' } }); return }
    response.status(204).send()
  } catch (cause) { next(cause) }
})
