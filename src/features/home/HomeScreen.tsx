import { ArrowRight, Bell, ChevronDown, CircleCheck, House, MapPin, Search, ShieldCheck, Sparkles, Star, Wrench, Zap, Paintbrush, Hammer, Snowflake } from 'lucide-react'
import { Brand, BottomNav, StatusMessage } from '../../shared/components/MobileUi'
import { ProviderCard } from '../providers/ProviderCard'
import type { ProviderProfile } from '../providers/provider.types'
import type { AppProfile } from '../auth/AuthProvider'

const categories = [
  { name: 'Electrical', icon: Zap }, { name: 'Cleaning', icon: Sparkles },
  { name: 'AC Repair', icon: Snowflake }, { name: 'Painting', icon: Paintbrush },
  { name: 'Carpentry', icon: Hammer }, { name: 'Plumbing', icon: Wrench },
]

export function HomeScreen({ profile, providers, loading, error, onSearch, onProvider, onNavigate }: {
  profile: AppProfile; providers: ProviderProfile[]; loading: boolean; error: string | null
  onSearch: (category?: string) => void; onProvider: (provider: ProviderProfile) => void; onNavigate: (screen: string) => void
}) {
  return <div className="m1-page">
    <header className="m1-home-top"><Brand compact/><span><button className="m1-icon-btn" aria-label="Notifications"><Bell size={17}/></button>
      <button className="m1-mini-avatar" onClick={() => onNavigate('profile')} aria-label="Profile">{(profile.full_name || '').slice(0, 1).toUpperCase()}</button></span></header>
    <main className="m1-scroll">
      <div className="m1-location"><div><small>Service Location</small><strong><MapPin size={15}/> Colombo 03, SL <ChevronDown size={14}/></strong></div><span><ShieldCheck size={17}/> 100%<br/>Guaranteed</span></div>
      <button className="m1-searchbar" onClick={() => onSearch()}><Search size={18}/><span>Search plumber, electrician, cleaning...</span><span className="m1-search-filter">☷</span></button>
      <section className="m1-home-hero"><div><small>★ Fast Domestic Dispatch</small><h1>Reliable.<br/>Verified.<br/><em>Professional.</em></h1>
        <p>Handpicked, trusted specialists right to your home when you need them.</p>
        <button onClick={() => onSearch()}>Book Now <ArrowRight size={15}/></button></div>
        <div className="m1-hero-symbol"><House size={62}/><Sparkles size={22}/></div></section>
      <section className="m1-section"><div className="m1-section-title"><h2>Service Categories</h2><button onClick={() => onSearch()}>View All</button></div>
        <div className="m1-category-grid">{categories.map(({ name, icon: Icon }) => <button key={name} onClick={() => onSearch(name)}>
          <span><Icon size={20}/></span><small>{name}</small></button>)}</div></section>
      <section className="m1-section"><div className="m1-section-title"><h2>Top Rated Providers</h2><small>Recommended</small></div>
        {loading ? <StatusMessage>Loading trusted professionals…</StatusMessage> : error ? <StatusMessage kind="error">{error}</StatusMessage>
          : providers.length ? <div className="m1-provider-list">{providers.slice(0, 3).map(provider => <ProviderCard key={provider.user_id} provider={provider} onSelect={onProvider}/>)}</div>
          : <StatusMessage>No approved providers yet. Verified professionals will appear here.</StatusMessage>}</section>
      <div className="m1-assurance"><CircleCheck size={19}/><span><strong>Home Care Protection</strong><small>All tasks are backed by service quality support.</small></span><Star size={15}/></div>
    </main>
    <BottomNav kind="customer" current="home" onNavigate={onNavigate}/>
  </div>
}
