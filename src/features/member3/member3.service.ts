import { requireSupabase } from '../../services/supabase/client'
import type { Member3Booking, Member3Category, Member3Notification, Member3Service, Member3ServiceInput, Member3Slot } from './member3.types'

export function member3Error(cause: unknown, fallback: string): string {
  const message = cause && typeof cause === 'object' && 'message' in cause && typeof cause.message === 'string'
    ? cause.message : fallback
  if (message.includes('schema cache') && /service_categories|availability_slots|notifications|bookings|services/.test(message)) {
    return 'Member 3 tables are missing. Apply 20261009_member3_service_booking.sql in Supabase.'
  }
  if (message.includes('member3_provider_slots_do_not_overlap')) return 'This time overlaps another availability slot.'
  return message
}

export async function listMember3Categories(): Promise<Member3Category[]> {
  const { data, error } = await requireSupabase().from('service_categories').select('*').order('name')
  if (error) throw error
  return data as Member3Category[]
}

export async function saveMember3Category(input: Pick<Member3Category, 'name' | 'slug' | 'icon_key' | 'is_active'>, id?: string): Promise<Member3Category> {
  const db = requireSupabase().from('service_categories')
  const result = id ? await db.update(input).eq('id', id).select('*').single()
    : await db.insert(input).select('*').single()
  if (result.error) throw result.error
  return result.data as Member3Category
}

export async function deleteMember3Category(id: string): Promise<void> {
  const { error } = await requireSupabase().from('service_categories').delete().eq('id', id)
  if (error) throw error
}

export async function listMember3ProviderServices(providerId: string): Promise<Member3Service[]> {
  const { data, error } = await requireSupabase().from('services').select('*')
    .eq('provider_id', providerId).order('created_at', { ascending: false })
  if (error) throw error
  return data as Member3Service[]
}

export async function saveMember3Service(providerId: string, input: Member3ServiceInput, id?: string): Promise<Member3Service> {
  const db = requireSupabase().from('services')
  const { category_id, ...changes } = input
  const result = id ? await db.update(changes).eq('id', id).eq('provider_id', providerId).select('*').single()
    : await db.insert({ provider_id: providerId, ...input }).select('*').single()
  if (result.error) throw result.error
  return result.data as Member3Service
}

export async function deleteMember3Service(providerId: string, id: string): Promise<void> {
  const { error } = await requireSupabase().from('services').delete().eq('id', id).eq('provider_id', providerId)
  if (error) throw error
}

export async function listMember3Slots(providerId: string): Promise<Member3Slot[]> {
  const { data, error } = await requireSupabase().from('availability_slots').select('*')
    .eq('provider_id', providerId).gte('start_at', new Date().toISOString()).order('start_at').limit(100)
  if (error) throw error
  return data as Member3Slot[]
}

export async function listMember3AvailableSlots(serviceId: string): Promise<Member3Slot[]> {
  const { data, error } = await requireSupabase().from('availability_slots').select('*')
    .eq('service_id', serviceId).eq('status', 'available').gt('start_at', new Date().toISOString())
    .order('start_at').limit(100)
  if (error) throw error
  return data as Member3Slot[]
}

export async function createMember3Slot(providerId: string, serviceId: string, startAt: string, endAt: string): Promise<Member3Slot> {
  const { data, error } = await requireSupabase().from('availability_slots')
    .insert({ provider_id: providerId, service_id: serviceId, start_at: startAt, end_at: endAt }).select('*').single()
  if (error) throw error
  return data as Member3Slot
}

export async function updateMember3Slot(providerId: string, id: string, startAt: string, endAt: string): Promise<Member3Slot> {
  const { data, error } = await requireSupabase().from('availability_slots')
    .update({ start_at: startAt, end_at: endAt }).eq('id', id).eq('provider_id', providerId)
    .eq('status', 'available').select('*').single()
  if (error) throw error
  return data as Member3Slot
}

export async function deleteMember3Slot(providerId: string, id: string): Promise<void> {
  const { error } = await requireSupabase().from('availability_slots').delete()
    .eq('id', id).eq('provider_id', providerId).eq('status', 'available')
  if (error) throw error
}

export async function bookMember3Slot(serviceId: string, slotId: string, address: string): Promise<Member3Booking> {
  const { data, error } = await requireSupabase().rpc('book_service_slot', {
    p_service_id: serviceId, p_slot_id: slotId, p_address: address.trim(),
  })
  if (error) throw error
  return data as Member3Booking
}

export async function listMember3Notifications(userId: string): Promise<Member3Notification[]> {
  const { data, error } = await requireSupabase().from('notifications').select('*')
    .eq('recipient_id', userId).order('created_at', { ascending: false }).limit(100)
  if (error) throw error
  return data as Member3Notification[]
}

export async function markMember3NotificationRead(id: string): Promise<void> {
  const { error } = await requireSupabase().rpc('mark_member3_notification_read', { p_notification_id: id })
  if (error) throw error
}
