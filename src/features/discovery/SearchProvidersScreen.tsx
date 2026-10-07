import { useMemo, useState } from 'react'
import { ArrowLeft, Search, SlidersHorizontal, X } from 'lucide-react'
import { BottomNav, StatusMessage } from '../../shared/components/MobileUi'
import { ProviderCard } from '../providers/ProviderCard'
import type { ProviderProfile } from '../providers/provider.types'

const categories = ['All', 'Electrical', 'Plumbing', 'Cleaning', 'AC Repair', 'Painting', 'Carpentry']

export function SearchProvidersScreen({ providers, loading, error, initialCategory, onProvider, onNavigate }: {
  providers: ProviderProfile[]; loading: boolean; error: string | null; initialCategory: string
  onProvider: (provider: ProviderProfile) => void; onNavigate: (screen: string) => void; onFilter?: () => void
}) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(initialCategory)
  const [sort, setSort] = useState<'nearest' | 'rating' | 'price'>('rating')
  const shown = useMemo(() => {
    const text = query.trim().toLowerCase()
    const filtered = providers.filter(provider =>
      (category === 'All' || provider.category.toLowerCase() === category.toLowerCase()) &&
      (!text || [provider.display_name, provider.category, provider.location, provider.bio]
        .some(field => field.toLowerCase().includes(text))))
    return [...filtered].sort((a, b) => sort === 'price' ? a.base_price_lkr - b.base_price_lkr
      : sort === 'rating' ? b.rating_avg - a.rating_avg : a.display_name.localeCompare(b.display_name))
  }, [providers, category, query, sort])

  return <div className="m1-page"><header className="m1-screen-header"><button className="m1-icon-btn" onClick={() => onNavigate('home')} aria-label="Back"><ArrowLeft size={20}/></button>
    <strong>Search Providers</strong><button className="m1-header-action" onClick={onFilter} aria-label="Open advanced filters"><SlidersHorizontal size={18}/></button></header>
    <main className="m1-scroll"><div className="m1-search-intro"><h1>Find your trusted pro.</h1><p>Search services or professionals.</p></div>
      <label className="m1-search-input"><Search size={18}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search services or professionals" autoFocus/>
        {query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={16}/></button>}</label>
      <div className="m1-chip-row">{categories.map(item => <button key={item} className={category === item ? 'selected' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <div className="m1-search-meta"><strong>Available Nearby <span>({shown.length})</span></strong><label>Sort <select value={sort} onChange={event => setSort(event.target.value as typeof sort)}>
        <option value="rating">Top rated</option><option value="price">Lowest price</option><option value="nearest">Name</option>
      </select></label></div>
      {loading ? <StatusMessage>Loading providers…</StatusMessage> : error ? <StatusMessage kind="error">{error}</StatusMessage>
        : shown.length ? <div className="m1-provider-list">{shown.map(provider => <ProviderCard key={provider.user_id} provider={provider} onSelect={onProvider}/>)}</div>
        : <StatusMessage>No approved providers match this search.</StatusMessage>}
    </main><BottomNav kind="customer" current="search" onNavigate={onNavigate}/></div>
}
