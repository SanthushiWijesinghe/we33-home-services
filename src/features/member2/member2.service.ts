import { requireSupabase } from '../../services/supabase/client'
export type CustomerReview = { id: string; provider_id: string; provider_name: string; reviewer_name: string; rating: number; comment: string; created_at: string }
export async function listCustomerReviews(): Promise<CustomerReview[]> {
  const { data, error } = await requireSupabase().rpc('member2_list_customer_reviews')
  if (error) throw new Error(error.message.includes('member2_list_customer_reviews') ? 'Apply 20261011_member2_reviews_profile_photos.sql in Supabase to load customer reviews.' : error.message)
  return data as CustomerReview[]
}
const customerPhotoBucket = 'customer-profile-photos'
async function signCustomerPhoto(path: string): Promise<string> {
  const { data, error } = await requireSupabase().storage.from(customerPhotoBucket).createSignedUrl(path, 3600)
  if (error) throw error
  return data.signedUrl
}
export async function getCustomerProfilePhoto(userId: string): Promise<{ path: string; url: string } | null> {
  const { data, error } = await requireSupabase().from('profiles').select('avatar_path').eq('id', userId).single()
  if (error) throw error
  return data.avatar_path ? { path: data.avatar_path, url: await signCustomerPhoto(data.avatar_path) } : null
}
export async function uploadCustomerProfilePhoto(userId: string, file: File, oldPath?: string): Promise<{ path: string; url: string }> {
  const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
  if (!extensions[file.type] || file.size === 0 || file.size > 5 * 1024 * 1024) throw new Error('Choose a JPG, PNG or WebP photo under 5 MB.')
  const client = requireSupabase()
  const path = `${userId}/${crypto.randomUUID()}.${extensions[file.type]}`
  const { error: uploadError } = await client.storage.from(customerPhotoBucket).upload(path, file, { contentType: file.type })
  if (uploadError) throw uploadError
  try {
    const url = await signCustomerPhoto(path)
    const { error } = await client.from('profiles').update({ avatar_path: path }).eq('id', userId).select('id').single()
    if (error) throw error
    if (oldPath && oldPath !== path) await client.storage.from(customerPhotoBucket).remove([oldPath]).catch(() => undefined)
    return { path, url }
  } catch (cause) {
    await client.storage.from(customerPhotoBucket).remove([path])
    throw cause
  }
}
export type CustomerAddress = { id: string; label: string; address_line: string; is_default: boolean }
export type PaymentMethod = { id: string; method_type: 'cash' | 'card' | 'mobile'; label: string; last_four: string | null; is_default: boolean }
export type CustomerFeedback = { id: string; category: string; message: string; status: string; created_at: string }
export async function updateCustomerProfile(userId: string, fullName: string, phone: string) { const { data, error } = await requireSupabase().from('profiles').update({ full_name: fullName.trim(), phone: phone.trim() }).eq('id', userId).select('id, full_name, role, phone').single(); if (error) throw error; return data }
export async function listCustomerAddresses(userId: string) { const { data, error } = await requireSupabase().from('customer_addresses').select('*').eq('user_id', userId).order('is_default', { ascending: false }); if (error) throw error; return data as CustomerAddress[] }
export async function saveCustomerAddress(userId: string, address: Omit<CustomerAddress, 'id'>, id?: string) { const c = requireSupabase(); const result = id ? await c.from('customer_addresses').update(address).eq('id', id).eq('user_id', userId).select('*').single() : await c.from('customer_addresses').insert({ user_id: userId, ...address }).select('*').single(); if (result.error) throw result.error; return result.data as CustomerAddress }
export async function deleteCustomerAddress(userId: string, id: string) { const { error } = await requireSupabase().from('customer_addresses').delete().eq('id', id).eq('user_id', userId); if (error) throw error }
export async function listPaymentMethods(userId: string) { const { data, error } = await requireSupabase().from('customer_payment_methods').select('*').eq('user_id', userId).order('is_default', { ascending: false }); if (error) throw error; return data as PaymentMethod[] }
export async function savePaymentMethod(userId: string, method: Omit<PaymentMethod, 'id'>) { const { data, error } = await requireSupabase().from('customer_payment_methods').insert({ user_id: userId, ...method }).select('*').single(); if (error) throw error; return data as PaymentMethod }
export async function deletePaymentMethod(userId: string, id: string) { const { error } = await requireSupabase().from('customer_payment_methods').delete().eq('id', id).eq('user_id', userId); if (error) throw error }
export async function submitCustomerFeedback(userId: string, category: string, message: string) { const { data, error } = await requireSupabase().from('customer_feedback').insert({ user_id: userId, category, message: message.trim() }).select('*').single(); if (error) throw error; return data as CustomerFeedback }
export async function listCustomerFeedback(userId: string) { const { data, error } = await requireSupabase().from('customer_feedback').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return data as CustomerFeedback[] }
