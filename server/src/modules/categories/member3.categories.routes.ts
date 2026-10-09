import { Router } from 'express'
import { z } from 'zod'
import { publicSupabase, userSupabase } from '../../config/supabase.js'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { requireRole } from '../../middleware/role.middleware.js'

export const member3CategoryRoutes = Router()
const categoryInput = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  icon_key: z.string().trim().min(1).max(40),
  is_active: z.boolean(),
})

member3CategoryRoutes.get('/', async (_request, response, next) => {
  try {
    const { data, error } = await publicSupabase().from('service_categories').select('*').eq('is_active', true).order('name')
    if (error) throw error
    response.json({ categories: data })
  } catch (cause) { next(cause) }
})

member3CategoryRoutes.get('/manage', requireAuth, requireRole('ADMIN'), async (request, response, next) => {
  try {
    const { data, error } = await userSupabase(request.auth!.accessToken).from('service_categories').select('*').order('name')
    if (error) throw error
    response.json({ categories: data })
  } catch (cause) { next(cause) }
})

member3CategoryRoutes.post('/', requireAuth, requireRole('ADMIN'), async (request, response, next) => {
  try {
    const input = categoryInput.parse(request.body)
    const { data, error } = await userSupabase(request.auth!.accessToken).from('service_categories')
      .insert(input).select('*').single()
    if (error) throw error
    response.status(201).json({ category: data })
  } catch (cause) { next(cause) }
})

member3CategoryRoutes.patch('/:id', requireAuth, requireRole('ADMIN'), async (request, response, next) => {
  try {
    const id = z.string().uuid().parse(request.params.id)
    const input = categoryInput.partial().refine(value => Object.keys(value).length > 0).parse(request.body)
    const { data, error } = await userSupabase(request.auth!.accessToken).from('service_categories')
      .update(input).eq('id', id).select('*').single()
    if (error) throw error
    response.json({ category: data })
  } catch (cause) { next(cause) }
})

member3CategoryRoutes.delete('/:id', requireAuth, requireRole('ADMIN'), async (request, response, next) => {
  try {
    const id = z.string().uuid().parse(request.params.id)
    const { data, error } = await userSupabase(request.auth!.accessToken).from('service_categories')
      .delete().eq('id', id).select('id').maybeSingle()
    if (error) throw error
    if (!data) { response.status(404).json({ error: { code: 'NOT_FOUND', message: 'Category not found' } }); return }
    response.status(204).send()
  } catch (cause) { next(cause) }
})
