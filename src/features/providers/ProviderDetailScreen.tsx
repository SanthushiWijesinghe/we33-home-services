import { ArrowRight, BadgeCheck, MapPin, ShieldCheck, Star } from 'lucide-react'
import { BottomNav, PrimaryButton, ScreenHeader, formatLkr } from '../../shared/components/MobileUi'
import type { ProviderProfile } from './provider.types'

export function ProviderDetailScreen({ provider, onBack, onNavigate }: {
  provider: ProviderProfile; onBack: () => void; onNavigate: (screen: string) => void
}) {
  return <div className="m1-page"><ScreenHeader title="Provider Details" onBack={onBack}/><main className="m1-scroll">
    <div className="m1-detail-banner"><div className="m1-detail-avatar">{provider.avatar_url ? <img src={provider.avatar_url} alt=""/> : (provider.display_name || '').slice(0, 1)}</div></div>
    <div className="m1-detail-content"><h1>{provider.display_name} <BadgeCheck size={19} fill="#e96a25" color="white"/></h1>
      <p>{provider.category} · {provider.years_experience} years experience</p>
      <div className="m1-detail-metrics"><span><Star size={17} fill="currentColor"/> {provider.rating_count ? provider.rating_avg.toFixed(1) : 'New'} rating</span>
        <span><MapPin size={17}/> {provider.location}</span></div>
      <section><h2>About this professional</h2><p>{provider.bio || 'Verified home care professional.'}</p></section>
      <section><h2>Service information</h2><p>Starting from {formatLkr(provider.base_price_lkr)}. Final price is confirmed before booking.</p></section>
      <div className="m1-assurance"><ShieldCheck size={20}/><span><strong>Verified provider</strong><small>Approved by the HomeService admin team.</small></span></div>
      <div className="m1-provider-detail-actions">
        <button className="member4-support-link" onClick={() => onNavigate('member4-provider-reviews')}><Star size={18}/> Read provider reviews <ArrowRight size={16}/></button>
        <PrimaryButton onClick={() => onNavigate('member3-provider-services')}>View services & availability <ArrowRight size={16}/></PrimaryButton>
      </div></div>
    </main><BottomNav kind="customer" current="search" onNavigate={onNavigate}/></div>
}
