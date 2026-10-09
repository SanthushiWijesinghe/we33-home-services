export type Member3Category = { id: string; name: string; slug: string; icon_key: string; is_active: boolean }
export type Member3Service = {
  id: string; provider_id: string; category_id: string; title: string; description: string
  price_lkr: number; duration_minutes: number; is_active: boolean
}
export type Member3ServiceInput = Pick<Member3Service, 'category_id' | 'title' | 'description' | 'price_lkr' | 'duration_minutes' | 'is_active'>
export type Member3Slot = {
  id: string; provider_id: string; service_id: string; start_at: string; end_at: string
  status: 'available' | 'booked'
}
export type Member3Booking = {
  id: string; customer_id: string; provider_id: string; service_id: string; slot_id: string
  service_title: string; address_text: string; price_lkr: number
  status: 'confirmed' | 'cancelled' | 'completed'; created_at: string
}
export type Member3Notification = {
  id: string; recipient_id: string; kind: 'booking_created' | 'booking_received' | 'general'
  title: string; body: string; booking_id: string | null; read_at: string | null; created_at: string
}
