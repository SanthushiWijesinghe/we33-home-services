import { Router } from 'express'
import { z } from 'zod'
import { userSupabase } from '../../config/supabase.js'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { requireRole } from '../../middleware/role.middleware.js'

export const adminRoutes = Router()
adminRoutes.use(requireAuth, requireRole('ADMIN'))

adminRoutes.get('/overview', async (request, response, next) => {
  try {
    const client = userSupabase(request.auth!.accessToken)
    const [pending, approved, rejected] = await Promise.all(
      ['pending', 'approved', 'rejected'].map(status => client.from('provider_profiles')
        .select('*', { count: 'exact', head: true }).eq('verification_status', status)),
    )
    for (const result of [pending, approved, rejected]) if (result.error) throw result.error
    response.json({ pending: pending.count ?? 0, approved: approved.count ?? 0, rejected: rejected.count ?? 0 })
  } catch (error) { next(error) }
})

adminRoutes.get('/providers', async (request, response, next) => {
  try {
    const status = z.enum(['pending', 'approved', 'rejected']).optional().parse(request.query.status)
    let db = userSupabase(request.auth!.accessToken).from('provider_profiles')
      .select('*').order('created_at', { ascending: false }).limit(100)
    if (status) db = db.eq('verification_status', status)
    const { data, error } = await db
    if (error) throw error
    response.json({ providers: data })
  } catch (error) { next(error) }
})

adminRoutes.get('/providers/:id/documents', async (request, response, next) => {
  try {
    const id = z.string().uuid().parse(request.params.id)
    const client = userSupabase(request.auth!.accessToken)
    const { data, error } = await client.from('provider_documents')
      .select('id, kind, storage_path, created_at').eq('provider_id', id)
    if (error) throw error
    const documents = await Promise.all(data.map(async document => {
      const result = await client.storage.from('provider-documents').createSignedUrl(document.storage_path, 60)
      if (result.error) throw result.error
      return { ...document, signed_url: result.data.signedUrl }
    }))
    response.json({ documents })
  } catch (error) { next(error) }
})

adminRoutes.patch('/providers/:id/verification', async (request, response, next) => {
  try {
    const id = z.string().uuid().parse(request.params.id)
    const input = z.object({ status: z.enum(['approved', 'rejected']), note: z.string().max(500).optional() }).parse(request.body)
    const { data, error } = await userSupabase(request.auth!.accessToken)
      .rpc('review_provider', { p_provider_id: id, p_status: input.status, p_note: input.note ?? null })
    if (error) throw error
    response.json({ provider: data })
  } catch (error) { next(error) }
})
