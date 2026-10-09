import { Router } from 'express'
import { z } from 'zod'
import { publicSupabase, userSupabase } from '../../config/supabase.js'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { requireRole } from '../../middleware/role.middleware.js'

export const member3ServiceRoutes = Router()
const serviceInput = z.object({
  category_id: z.string().uuid(),
  title: z.string().trim().min(3).max(100),
  description: z.string().trim().max(2000),
  price_lkr: z.number().int().min(0),
  duration_minutes: z.number().int().min(30).max(480).multipleOf(30),
  is_active: z.boolean(),
})

member3ServiceRoutes.get('/', async (request, response, next) => {
  try {
    const query = z.object({ providerId: z.string().uuid().optional(), categoryId: z.string().uuid().optional() }).parse(request.query)
    let db = publicSupabase().from('services').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(100)
    if (query.providerId) db = db.eq('provider_id', query.providerId)
    if (query.categoryId) db = db.eq('category_id', query.categoryId)
    const { data, error } = await db
    if (error) throw error
    response.json({ services: data })
  } catch (cause) { next(cause) }
})

member3ServiceRoutes.get('/mine', requireAuth, requireRole('SERVICE_PROVIDER'), async (request, response, next) => {
  try {
    const { data, error } = await userSupabase(request.auth!.accessToken).from('services')
      .select('*').eq('provider_id', request.auth!.userId).order('created_at', { ascending: false })
    if (error) throw error
    response.json({ services: data })
  } catch (cause) { next(cause) }
})

member3ServiceRoutes.post('/', requireAuth, requireRole('SERVICE_PROVIDER'), async (request, response, next) => {
  try {
    const input = serviceInput.parse(request.body)
    const { data, error } = await userSupabase(request.auth!.accessToken).from('services')
      .insert({ ...input, provider_id: request.auth!.userId }).select('*').single()
    if (error) throw error
    response.status(201).json({ service: data })
  } catch (cause) { next(cause) }
})

member3ServiceRoutes.patch('/:id', requireAuth, requireRole('SERVICE_PROVIDER'), async (request, response, next) => {
  try {
    const id = z.string().uuid().parse(request.params.id)
    const input = serviceInput.omit({ category_id: true }).partial()
      .refine(value => Object.keys(value).length > 0).parse(request.body)
    const { data, error } = await userSupabase(request.auth!.accessToken).from('services')
      .update(input).eq('id', id).eq('provider_id', request.auth!.userId).select('*').maybeSingle()
    if (error) throw error
    if (!data) { response.status(404).json({ error: { code: 'NOT_FOUND', message: 'Service not found' } }); return }
    response.json({ service: data })
  } catch (cause) { next(cause) }
})

member3ServiceRoutes.delete('/:id', requireAuth, requireRole('SERVICE_PROVIDER'), async (request, response, next) => {
  try {
    const id = z.string().uuid().parse(request.params.id)
    const { data, error } = await userSupabase(request.auth!.accessToken).from('services')
      .delete().eq('id', id).eq('provider_id', request.auth!.userId).select('id').maybeSingle()
    if (error) throw error
    if (!data) { response.status(404).json({ error: { code: 'NOT_FOUND', message: 'Service not found' } }); return }
    response.status(204).send()
  } catch (cause) { next(cause) }
})
