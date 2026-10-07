import { ArrowRight, BadgeCheck, MapPin, Star } from 'lucide-react'
import { formatLkr } from '../../shared/components/MobileUi'
import type { ProviderProfile } from './provider.types'

export function ProviderCard({ provider, onSelect }: { provider: ProviderProfile; onSelect: (provider: ProviderProfile) => void }) {
  const initials = provider.display_name.split(' ').slice(0, 2).map(part => part[0]).join('').toUpperCase()
  return <article className="m1-provider-card">
    <div className="m1-provider-avatar">{provider.avatar_url ? <img src={provider.avatar_url} alt=""/> : initials}</div>
    <div className="m1-provider-info"><div className="m1-provider-name"><strong>{provider.display_name}</strong>
      <BadgeCheck size={15} fill="#e96a25" color="white"/></div>
      <span>{provider.category} · {provider.years_experience} years</span>
      <small><MapPin size={12}/>{provider.location}</small>
      <span className="m1-provider-rating"><Star size={13} fill="currentColor"/> {provider.rating_count ? provider.rating_avg.toFixed(1) : 'New'}
        {provider.rating_count > 0 && <i> ({provider.rating_count} reviews)</i>}</span></div>
    <div className="m1-provider-side"><small>From</small><strong>{formatLkr(provider.base_price_lkr)}</strong>
      <button onClick={() => onSelect(provider)}>View <ArrowRight size={14}/></button></div>
  </article>
}
