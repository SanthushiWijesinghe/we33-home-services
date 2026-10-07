export type VerificationStatus = 'pending' | 'approved' | 'rejected'

export type ProviderProfile = {
  user_id: string
  display_name: string
  category: string
  location: string
  bio: string
  years_experience: number
  base_price_lkr: number
  avatar_url: string | null
  rating_avg: number
  rating_count: number
  verification_status: VerificationStatus
  verification_note?: string | null
  created_at?: string
}

export type ProviderInput = Pick<ProviderProfile,
  'display_name' | 'category' | 'location' | 'bio' | 'years_experience' | 'base_price_lkr'>

export type ProviderDocument = {
  id: string
  kind: 'identity_front' | 'identity_back' | 'certificate'
  storage_path: string
  signed_url?: string
}
