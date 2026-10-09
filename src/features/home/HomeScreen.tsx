import { ArrowRight, Bell, ChevronDown, CircleCheck, Droplets, House, MapPin, Search, ShieldCheck, Sparkles, Star, Wrench, Zap, Paintbrush, Hammer, Snowflake } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Brand, BottomNav, StatusMessage } from '../../shared/components/MobileUi'
import { ProviderCard } from '../providers/ProviderCard'
import type { ProviderProfile } from '../providers/provider.types'
import type { AppProfile } from '../auth/AuthProvider'
import { listMember3Categories, member3Error } from '../member3/member3.service'
import type { Member3Category } from '../member3/member3.types'

const categoryIcons = { zap: Zap, sparkles: Sparkles, snowflake: Snowflake,
  paintbrush: Paintbrush, hammer: Hammer, droplets: Droplets, wrench: Wrench }

export function HomeScreen({ profile, providers, loading, error, onSearch, onProvider, onNavigate }: {
  profile: AppProfile; providers: ProviderProfile[]; loading: boolean; error: string | null
  onSearch: (category?: string) => void; onProvider: (provider: ProviderProfile) => void; onNavigate: (screen: string) => void
}) {
  const [categories, setCategories] = useState<Member3Category[]>([])
  const [categoryLoading, setCategoryLoading] = useState(true)
  const [categoryError, setCategoryError] = useState('')
  useEffect(() => {
    let active = true
    void listMember3Categories().then(items => { if (active) setCategories(items.filter(item => item.is_active)) })
      .catch(cause => { if (active) setCategoryError(member3Error(cause, 'Unable to load categories.')) })
      .finally(() => { if (active) setCategoryLoading(false) })
    return () => { active = false }
  }, [])
  return <div className="m1-page">
    <header className="m1-home-top"><Brand compact/><span><button className="m1-icon-btn" onClick={() => onNavigate('notifications')} aria-label="Notifications"><Bell size={17}/></button>
      <button className="m1-mini-avatar" onClick={() => onNavigate('profile')} aria-label="Profile">{(profile.full_name || '').slice(0, 1).toUpperCase()}</button></span></header>
    <main className="m1-scroll">
      <div className="m1-location"><div><small>Service Location</small><strong><MapPin size={15}/> Colombo 03, SL <ChevronDown size={14}/></strong></div><span><ShieldCheck size={17}/> 100%<br/>Guaranteed</span></div>
      <button className="m1-searchbar" onClick={() => onSearch()}><Search size={18}/><span>Search plumber, electrician, cleaning...</span><span className="m1-search-filter">☷</span></button>
      <section className="m1-home-hero"><div><small>★ Fast Domestic Dispatch</small><h1>Reliable.<br/>Verified.<br/><em>Professional.</em></h1>
        <p>Handpicked, trusted specialists right to your home when you need them.</p>
        <button onClick={() => onSearch()}>Book Now <ArrowRight size={15}/></button></div>
        <div className="m1-hero-symbol"><House size={62}/><Sparkles size={22}/></div></section>
      <section className="m1-section"><div className="m1-section-title"><h2>Service Categories</h2><button onClick={() => onNavigate('member3-categories')}>View All</button></div>
        {categoryLoading ? <StatusMessage>Loading categories…</StatusMessage> : categoryError ? <StatusMessage kind="error">{categoryError}</StatusMessage>
          : categories.length ? <div className="m1-category-grid">{categories.slice(0, 6).map(category => {
            const Icon = categoryIcons[category.icon_key as keyof typeof categoryIcons] ?? Wrench
            return <button key={category.id} onClick={() => onSearch(category.name)}><span><Icon size={20}/></span><small>{category.name}</small></button>
          })}</div> : <StatusMessage>No active service categories yet.</StatusMessage>}</section>
      <section className="m1-section"><div className="m1-section-title"><h2>Top Rated Providers</h2><small>Recommended</small></div>
        {loading ? <StatusMessage>Loading trusted professionals…</StatusMessage> : error ? <StatusMessage kind="error">{error}</StatusMessage>
          : providers.length ? <div className="m1-provider-list">{providers.slice(0, 3).map(provider => <ProviderCard key={provider.user_id} provider={provider} onSelect={onProvider}/>)}</div>
          : <StatusMessage>No approved providers yet. Verified professionals will appear here.</StatusMessage>}</section>
      <div className="m1-assurance"><CircleCheck size={19}/><span><strong>Home Care Protection</strong><small>All tasks are backed by service quality support.</small></span><Star size={15}/></div>
    </main>
    <BottomNav kind="customer" current="home" onNavigate={onNavigate}/>
  </div>
}
