import { requireSupabase } from '../../services/supabase/client'
import type { Member4Booking, Member4BookingEvent, Member4BookingStatus, Member4Review, Member4SupportRequest, Member4SupportStatus } from './member4.types'

export function member4Error(cause: unknown, fallback: string): string {
  const message = cause && typeof cause === 'object' && 'message' in cause && typeof cause.message === 'string'
    ? cause.message : fallback
  if (/schema cache|Could not find the function/.test(message) && /member4_|provider_reviews|support_requests|booking_events/.test(message)) {
    return 'Member 4 database objects are missing. Apply 20261010_member4_booking_followthrough.sql in Supabase.'
  }
  return message
}
export async function listMember4Bookings(): Promise<Member4Booking[]> {
  const { data, error } = await requireSupabase().rpc('member4_list_bookings')
  if (error) throw error
  return data as Member4Booking[]
}
export async function listMember4BookingEvents(bookingId: string): Promise<Member4BookingEvent[]> {
  const { data, error } = await requireSupabase().from('booking_events').select('*').eq('booking_id', bookingId).order('created_at')
  if (error) throw error
  return data as Member4BookingEvent[]
}
export async function changeMember4BookingStatus(id: string, status: Member4BookingStatus, reason = ''): Promise<void> {
  const { error } = await requireSupabase().rpc('member4_change_booking_status', {
    p_booking_id: id, p_status: status, p_reason: reason.trim() || null,
  })
  if (error) throw error
}
export async function getMember4BookingReview(bookingId: string): Promise<Member4Review | null> {
  const { data, error } = await requireSupabase().from('provider_reviews').select('*').eq('booking_id', bookingId).maybeSingle()
  if (error) throw error
  return data as Member4Review | null
}
export async function listMember4ProviderReviews(providerId: string): Promise<Member4Review[]> {
  const { data, error } = await requireSupabase().from('provider_reviews').select('*')
    .eq('provider_id', providerId).order('created_at', { ascending: false }).limit(100)
  if (error) throw error
  return data as Member4Review[]
}
export async function saveMember4Review(bookingId: string, rating: number, comment: string): Promise<Member4Review> {
  const { data, error } = await requireSupabase().rpc('member4_save_review', {
    p_booking_id: bookingId, p_rating: rating, p_comment: comment.trim(),
  })
  if (error) throw error
  return data as Member4Review
}
export async function deleteMember4Review(id: string): Promise<void> {
  const { error } = await requireSupabase().rpc('member4_delete_review', { p_review_id: id })
  if (error) throw error
}
export async function listMember4SupportRequests(): Promise<Member4SupportRequest[]> {
  const { data, error } = await requireSupabase().from('support_requests').select('*')
    .order('created_at', { ascending: false }).limit(100)
  if (error) throw error
  return data as Member4SupportRequest[]
}
export async function createMember4SupportRequest(userId: string, subject: string, message: string): Promise<Member4SupportRequest> {
  const { data, error } = await requireSupabase().from('support_requests')
    .insert({ user_id: userId, subject: subject.trim(), message: message.trim() }).select('*').single()
  if (error) throw error
  return data as Member4SupportRequest
}
export async function updateMember4SupportRequest(id: string, status: Member4SupportStatus, note: string): Promise<void> {
  const { error } = await requireSupabase().rpc('member4_update_support', {
    p_request_id: id, p_status: status, p_admin_note: note.trim() || null,
  })
  if (error) throw error
}
