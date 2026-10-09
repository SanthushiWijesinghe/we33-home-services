import { requireSupabase } from '../../services/supabase/client'
import type { ProviderDocument, ProviderInput, ProviderProfile, VerificationStatus } from './provider.types'

const publicFields = 'user_id, display_name, category, location, bio, years_experience, base_price_lkr, avatar_url, rating_avg, rating_count, verification_status'

export async function listApprovedProviders(): Promise<ProviderProfile[]> {
  const { data, error } = await requireSupabase().from('provider_profiles').select(publicFields)
    .eq('verification_status', 'approved').order('rating_avg', { ascending: false }).limit(100)
  if (error) throw error
  return data as ProviderProfile[]
}

export async function getOwnProvider(userId: string): Promise<ProviderProfile | null> {
  const { data, error } = await requireSupabase().from('provider_profiles').select('*')
    .eq('user_id', userId).maybeSingle()
  if (error) throw error
  return data as ProviderProfile | null
}

export async function saveOwnProvider(userId: string, input: ProviderInput): Promise<ProviderProfile> {
  const client = requireSupabase()
  const existing = await getOwnProvider(userId)
  const { data, error } = existing
    ? await client.from('provider_profiles').update(input).eq('user_id', userId).select('*').single()
    : await client.from('provider_profiles').insert({ user_id: userId, ...input }).select('*').single()
  if (error) throw error
  return data as ProviderProfile
}

export async function uploadProviderDocument(userId: string, kind: ProviderDocument['kind'], file: File) {
  if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type) || file.size > 5 * 1024 * 1024) {
    throw new Error('Choose a JPG, PNG, or PDF under 5 MB.')
  }
  const client = requireSupabase()
  const extension = file.type === 'application/pdf' ? 'pdf' : file.type === 'image/png' ? 'png' : 'jpg'
  const path = `${userId}/${kind}-${crypto.randomUUID()}.${extension}`
  const uploaded = await client.storage.from('provider-documents').upload(path, file, { contentType: file.type })
  if (uploaded.error) throw uploaded.error
  const { error } = await client.from('provider_documents').insert({ provider_id: userId, kind, storage_path: path })
  if (error) throw error
}

export async function listAdminProviders(status?: VerificationStatus): Promise<ProviderProfile[]> {
  let query = requireSupabase().from('provider_profiles').select('*').order('created_at', { ascending: false }).limit(100)
  if (status) query = query.eq('verification_status', status)
  const { data, error } = await query
  if (error) throw error
  return data as ProviderProfile[]
}

export async function listProviderDocuments(providerId: string): Promise<ProviderDocument[]> {
  const client = requireSupabase()
  const { data, error } = await client.from('provider_documents').select('id, kind, storage_path')
    .eq('provider_id', providerId)
  if (error) throw error
  return Promise.all((data as ProviderDocument[]).map(async document => {
    const result = await client.storage.from('provider-documents').createSignedUrl(document.storage_path, 60)
    if (result.error) throw result.error
    return { ...document, signed_url: result.data.signedUrl }
  }))
}

export async function reviewProvider(providerId: string, status: 'approved' | 'rejected', note?: string) {
  const { error } = await requireSupabase().rpc('review_provider', {
    p_provider_id: providerId, p_status: status, p_note: note?.trim() || null,
  })
  if (error) throw error
}
