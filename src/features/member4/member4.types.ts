export type Member4BookingStatus = 'confirmed' | 'cancelled' | 'completed'
export type Member4Booking = {
  id: string; customer_id: string; provider_id: string; service_id: string; slot_id: string
  service_title: string; address_text: string; price_lkr: number; status: Member4BookingStatus
  created_at: string; updated_at: string; cancelled_at: string | null; completed_at: string | null
  cancellation_reason: string | null; start_at: string; end_at: string
  provider_name: string; customer_name: string
}
export type Member4BookingEvent = {
  id: string; booking_id: string; actor_id: string | null; from_status: string | null
  to_status: Member4BookingStatus; note: string | null; created_at: string
}
export type Member4Review = {
  id: string; booking_id: string; customer_id: string; provider_id: string
  rating: number; comment: string; created_at: string; updated_at: string
}
export type Member4SupportStatus = 'open' | 'in_progress' | 'resolved'
export type Member4SupportRequest = {
  id: string; user_id: string; subject: string; message: string
  status: Member4SupportStatus; admin_note: string | null; created_at: string; updated_at: string
}
