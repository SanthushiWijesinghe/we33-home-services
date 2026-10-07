import { Router } from 'express'
import { z } from 'zod'
import { publicSupabase, userSupabase } from '../../config/supabase.js'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { requireRole } from '../../middleware/role.middleware.js'

export const providerRoutes = Router()

const profileInput = z.object({
  display_name: z.string().trim().min(2).max(100),
  category: z.string().trim().min(2).max(80),
  location: z.string().trim().min(2).max(120),
  bio: z.string().trim().max(1000).default(''),
  years_experience: z.number().int().min(0).max(70),
  base_price_lkr: z.number().int().min(0),
})

providerRoutes.get('/', async (request, response, next) => {
  try {
    const query = z.object({ q: z.string().max(80).optional(), category: z.string().max(80).optional() }).parse(request.query)
    let db = publicSupabase().from('provider_profiles')
      .select('user_id, display_name, category, location, bio, years_experience, base_price_lkr, avatar_url, rating_avg, rating_count, verification_status')
      .eq('verification_status', 'approved').order('rating_avg', { ascending: false }).limit(100)
    if (query.category && query.category !== 'All') db = db.eq('category', query.category)
    const { data, error } = await db
    if (error) throw error
    const search = query.q?.trim().toLowerCase()
    const providers = search ? data.filter(item =>
      [item.display_name, item.category, item.location, item.bio].some(value => value?.toLowerCase().includes(search))) : data
    response.json({ providers })
  } catch (error) { next(error) }
})

providerRoutes.get('/me', requireAuth, requireRole('SERVICE_PROVIDER'), async (request, response, next) => {
  try {
    const { data, error } = await userSupabase(request.auth!.accessToken)
      .from('provider_profiles').select('*').eq('user_id', request.auth!.userId).maybeSingle()
    if (error) throw error
    response.json({ provider: data })
  } catch (error) { next(error) }
})

providerRoutes.put('/me', requireAuth, requireRole('SERVICE_PROVIDER'), async (request, response, next) => {
  try {
    const input = profileInput.parse(request.body)
    const { data, error } = await userSupabase(request.auth!.accessToken)
      .from('provider_profiles').upsert({ user_id: request.auth!.userId, ...input }, { onConflict: 'user_id' })
      .select('*').single()
    if (error) throw error
    response.json({ provider: data })
  } catch (error) { next(error) }
})

providerRoutes.get('/:id', async (request, response, next) => {
  try {
    const id = z.string().uuid().parse(request.params.id)
    const { data, error } = await publicSupabase().from('provider_profiles')
      .select('user_id, display_name, category, location, bio, years_experience, base_price_lkr, avatar_url, rating_avg, rating_count, verification_status')
      .eq('user_id', id).eq('verification_status', 'approved').maybeSingle()
    if (error) throw error
    if (!data) { response.status(404).json({ error: { code: 'NOT_FOUND', message: 'Provider not found' } }); return }
    response.json({ provider: data })
  } catch (error) { next(error) }
})
