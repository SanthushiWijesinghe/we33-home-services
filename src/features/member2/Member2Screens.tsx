import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { CalendarDays, ChevronRight, CreditCard, Heart, LogOut, MapPin, Plus, Save, Search, Star, Trash2, Wallet } from 'lucide-react'
import { BottomNav, PrimaryButton, ScreenHeader, StatusMessage } from '../../shared/components/MobileUi'
import type { AppProfile } from '../auth/AuthProvider'
import type { ProviderProfile } from '../providers/provider.types'
import { deleteCustomerAddress, deletePaymentMethod, listCustomerAddresses, listCustomerFeedback, listPaymentMethods, saveCustomerAddress, savePaymentMethod, submitCustomerFeedback, updateCustomerProfile, type CustomerAddress, type CustomerFeedback, type PaymentMethod } from './member2.service'
const categories = ['All', 'Electrical', 'Plumbing', 'Cleaning', 'AC Repair', 'Painting', 'Carpentry']

function member2ErrorMessage(error: unknown, fallback: string): string {
  const message = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
    ? error.message
    : fallback
  if (message.includes('schema cache') && message.includes('public.customer_')) {
    return 'Customer data tables are missing in Supabase. Apply the Member 2 database migration, then try again.'
  }
  return message
}

export function Member2ServiceFiltersScreen({ providers, initialCategory, onProvider, onBack, onNavigate }: { providers: ProviderProfile[]; initialCategory?: string; onProvider: (provider: ProviderProfile) => void; onBack: () => void; onNavigate: (screen: string) => void }) { const [category, setCategory] = useState(initialCategory || 'All'); const [maxPrice, setMaxPrice] = useState(10000); const [minRating, setMinRating] = useState(0); const [query, setQuery] = useState(''); const shown = useMemo(() => providers.filter(p => (category === 'All' || p.category === category) && p.base_price_lkr <= maxPrice && p.rating_avg >= minRating && (!query || `${p.display_name} ${p.category} ${p.location}`.toLowerCase().includes(query.toLowerCase()))), [providers, category, maxPrice, minRating, query]); return <div className="m1-page"><ScreenHeader title="Filter Services" onBack={onBack}/><main className="m1-scroll member2-screen"><label className="m1-search-input"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search providers or services"/></label><section className="member2-card"><h2>Category</h2><div className="member2-chips">{categories.map(item => <button className={category === item ? 'selected' : ''} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div></section><section className="member2-card"><h2>Maximum price <strong>LKR {maxPrice.toLocaleString('en-LK')}</strong></h2><input type="range" min="1000" max="25000" step="500" value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))}/></section><section className="member2-card"><h2>Minimum rating</h2><div className="member2-chips">{[0, 3, 4, 4.5].map(value => <button className={minRating === value ? 'selected' : ''} key={value} onClick={() => setMinRating(value)}><Star size={13}/> {value ? `${value}+` : 'Any'}</button>)}</div></section><h2 className="member2-result-title">{shown.length} available professionals</h2>{shown.map(provider => <button className="member2-list-row" key={provider.user_id} onClick={() => onProvider(provider)}><span className="m1-mini-avatar">{(provider.display_name || '').slice(0, 1)}</span><span><strong>{provider.display_name}</strong><small>{provider.category} · {provider.location}</small></span><ChevronRight size={17}/></button>)}{!shown.length && <StatusMessage>No providers match these filters.</StatusMessage>}</main><BottomNav kind="customer" current="search" onNavigate={onNavigate}/></div> }

export function Member2ProfileScreen({ profile, onBack, onNavigate, onProfileUpdated, onSignOut }: {
  profile: AppProfile
  onBack: () => void
  onNavigate: (screen: string) => void
  onProfileUpdated: (profile: AppProfile) => void
  onSignOut: () => void
}) {
  const [name, setName] = useState(profile.full_name)
  const [phone, setPhone] = useState(profile.phone || '')
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)

  async function save(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setStatus('')
    try {
      const updatedProfile = await updateCustomerProfile(profile.id, name, phone)
      onProfileUpdated(updatedProfile as AppProfile)
      setStatus('Profile updated successfully.')
    } catch (error) {
      setStatus(member2ErrorMessage(error, 'Unable to update profile.'))
    } finally {
      setSaving(false)
    }
  }

  return <div className="m1-page">
    <ScreenHeader title="My Profile" onBack={onBack}/>
    <main className="m1-scroll member2-screen">
      <div className="member2-profile-head">
        <span className="m1-large-avatar">{(name || '').slice(0, 1).toUpperCase()}</span>
        <div><h1>{name || 'Your profile'}</h1><p>Customer account</p></div>
      </div>
      <form className="member2-card member2-form" onSubmit={save}>
        <label>Full name<input required minLength={2} value={name} onChange={e => setName(e.target.value)}/></label>
        <label>Email status<input value="Signed-in account" disabled/></label>
        <label>Phone number<input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+94 77 123 4567"/></label>
        {status && <StatusMessage kind={status.includes('successfully') ? 'success' : 'error'}>{status}</StatusMessage>}
        <PrimaryButton type="submit" disabled={saving}><Save size={16}/> {saving ? 'Saving…' : 'Save changes'}</PrimaryButton>
      </form>
      <button className="member2-link-card" onClick={() => onNavigate('location')}>
        <MapPin/><span><strong>Location settings</strong><small>Manage saved service addresses</small></span><ChevronRight/>
      </button>
      <button className="member2-link-card" onClick={() => onNavigate('payments')}>
        <Wallet/><span><strong>Payment options</strong><small>Manage safe payment preferences</small></span><ChevronRight/>
      </button>
      <button className="member2-link-card" onClick={() => onNavigate('reviews')}>
        <Star/><span><strong>Provider reviews</strong><small>Browse ratings before you book</small></span><ChevronRight/>
      </button>
      <button className="member2-link-card" onClick={() => onNavigate('feedback')}>
        <Heart/><span><strong>Send feedback</strong><small>Tell us about your experience</small></span><ChevronRight/>
      </button>
      <button className="member2-link-card" onClick={() => onNavigate('member4-support')}>
        <Heart/><span><strong>Help & Support</strong><small>Send and track support requests</small></span><ChevronRight/>
      </button>
      <button className="m1-secondary-btn" onClick={onSignOut}><LogOut size={17}/> Log out</button>
    </main>
    <BottomNav kind="customer" current="profile" onNavigate={onNavigate}/>
  </div>
}

export function Member2LocationScreen({ profile, onBack }: { profile: AppProfile; onBack: () => void }) {
  const [items, setItems] = useState<CustomerAddress[]>([])
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')

  async function refresh() {
    try {
      const savedAddresses = await listCustomerAddresses(profile.id)
      setItems(savedAddresses)
      setError('')
    } catch (cause) {
      setError(member2ErrorMessage(cause, 'Unable to load locations.'))
    }
  }

  useEffect(() => { void refresh() }, [profile.id])

  async function add(event: FormEvent) {
    event.preventDefault()
    try {
      const savedAddress = await saveCustomerAddress(profile.id, {
        label: 'Home',
        address_line: address.trim(),
        is_default: items.length === 0,
      })
      setItems(previous => [savedAddress, ...previous])
      setAddress('')
      setError('')
    } catch (cause) {
      setError(member2ErrorMessage(cause, 'Unable to save location.'))
    }
  }

  async function remove(addressId: string) {
    try {
      await deleteCustomerAddress(profile.id, addressId)
      setItems(previous => previous.filter(item => item.id !== addressId))
      setError('')
    } catch (cause) {
      setError(member2ErrorMessage(cause, 'Unable to delete location.'))
    }
  }

  return <div className="m1-page">
    <ScreenHeader title="Location Settings" onBack={onBack}/>
    <main className="m1-scroll member2-screen">
      <section className="member2-card">
        <h2><MapPin size={17}/> Add saved address</h2>
        <form className="member2-form" onSubmit={add}>
          <label>Address<input value={address} onChange={event => setAddress(event.target.value)} placeholder="No. 12, Colombo 03" required/></label>
          <PrimaryButton type="submit"><Plus size={16}/> Save location</PrimaryButton>
        </form>
      </section>
      {error && <StatusMessage kind="error">{error}</StatusMessage>}
      {items.map(item => <div className="member2-list-row" key={item.id}>
        <MapPin size={19}/>
        <span><strong>{item.label}</strong><small>{item.address_line}</small></span>
        <button onClick={() => void remove(item.id)} aria-label="Delete address"><Trash2 size={16}/></button>
      </div>)}
    </main>
  </div>
}

export function Member2PaymentScreen({ profile, onBack }: { profile: AppProfile; onBack: () => void }) {
  const [items, setItems] = useState<PaymentMethod[]>([])
  const [method, setMethod] = useState<PaymentMethod['method_type']>('cash')
  const [error, setError] = useState('')

  async function refresh() {
    try {
      const savedMethods = await listPaymentMethods(profile.id)
      setItems(savedMethods)
      setError('')
    } catch (cause) {
      setError(member2ErrorMessage(cause, 'Unable to load payment options.'))
    }
  }

  useEffect(() => { void refresh() }, [profile.id])

  async function add() {
    try {
      const savedMethod = await savePaymentMethod(profile.id, {
        method_type: method,
        label: method === 'cash' ? 'Cash on completion' : method === 'card' ? 'Saved card' : 'Mobile payment',
        last_four: null,
        is_default: items.length === 0,
      })
      setItems(previous => [savedMethod, ...previous])
      setError('')
    } catch (cause) {
      setError(member2ErrorMessage(cause, 'Unable to save payment option.'))
    }
  }

  async function remove(methodId: string) {
    try {
      await deletePaymentMethod(profile.id, methodId)
      setItems(previous => previous.filter(item => item.id !== methodId))
      setError('')
    } catch (cause) {
      setError(member2ErrorMessage(cause, 'Unable to delete payment option.'))
    }
  }

  return <div className="m1-page">
    <ScreenHeader title="Payment Options" onBack={onBack}/>
    <main className="m1-scroll member2-screen">
      <div className="member2-safe-banner"><CreditCard/> Payment details are protected. Full card numbers are never stored.</div>
      <section className="member2-card member2-form">
        <label>Payment method
          <select value={method} onChange={event => setMethod(event.target.value as PaymentMethod['method_type'])}>
            <option value="cash">Cash on completion</option>
            <option value="card">Card (metadata only)</option>
            <option value="mobile">Mobile payment</option>
          </select>
        </label>
        <PrimaryButton onClick={() => void add()}><Plus size={16}/> Add payment option</PrimaryButton>
      </section>
      {error && <StatusMessage kind="error">{error}</StatusMessage>}
      {items.map(item => <div className="member2-list-row" key={item.id}>
        <CreditCard size={19}/>
        <span><strong>{item.label}</strong><small>{item.is_default ? 'Default method' : 'Available at checkout'}</small></span>
        <button onClick={() => void remove(item.id)} aria-label="Delete payment method"><Trash2 size={16}/></button>
      </div>)}
    </main>
  </div>
}

export function Member2FeedbackScreen({ profile, onBack, onNavigate }: {
  profile: AppProfile
  onBack: () => void
  onNavigate: (screen: string) => void
}) {
  const [category, setCategory] = useState('Service quality')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')
  const [items, setItems] = useState<CustomerFeedback[]>([])

  useEffect(() => {
    void listCustomerFeedback(profile.id)
      .then(setItems)
      .catch(error => setStatus(member2ErrorMessage(error, 'Unable to load feedback.')))
  }, [profile.id])

  async function submit(event: FormEvent) {
    event.preventDefault()
    setStatus('')
    try {
      const submittedFeedback = await submitCustomerFeedback(profile.id, category, message)
      setItems(previous => [submittedFeedback, ...previous])
      setMessage('')
      setStatus('Feedback submitted. Thank you.')
    } catch (error) {
      setStatus(member2ErrorMessage(error, 'Unable to submit feedback.'))
    }
  }

  return <div className="m1-page">
    <ScreenHeader title="Feedback" onBack={onBack}/>
    <main className="m1-scroll member2-screen">
      <section className="member2-card">
        <Heart size={24}/>
        <h1>We are listening.</h1>
        <p>Tell us how we can make HomeService better.</p>
        <form className="member2-form" onSubmit={submit}>
          <label>Category
            <select value={category} onChange={event => setCategory(event.target.value)}>
              <option>Service quality</option>
              <option>App experience</option>
              <option>Provider behaviour</option>
              <option>Payment</option>
            </select>
          </label>
          <label>Your feedback
            <textarea rows={5} minLength={10} required value={message} onChange={event => setMessage(event.target.value)} placeholder="Share what happened…"/>
          </label>
          <PrimaryButton type="submit">Submit feedback <ChevronRight size={17}/></PrimaryButton>
        </form>
        {status && <StatusMessage kind={status.startsWith('Feedback submitted') ? 'success' : 'error'}>{status}</StatusMessage>}
      </section>
      <button className="member2-link-card" onClick={() => onNavigate('feedback-history')}>
        <Heart/><span><strong>My submitted feedback</strong><small>{items.length ? `${items.length} previous messages` : 'Review your previous messages'}</small></span><ChevronRight/>
      </button>
    </main>
  </div>
}
export function Member2FeedbackHistoryScreen({ profile, onBack }: { profile: AppProfile; onBack: () => void }) {
  const [items, setItems] = useState<CustomerFeedback[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    void listCustomerFeedback(profile.id)
      .then(previousFeedback => { setItems(previousFeedback); setError('') })
      .catch(cause => setError(member2ErrorMessage(cause, 'Unable to load feedback.')))
      .finally(() => setLoading(false))
  }, [profile.id])

  return <div className="m1-page">
    <ScreenHeader title="My Feedback" onBack={onBack}/>
    <main className="m1-scroll member2-screen member2-feedback-history">
      <div className="member2-feedback-intro">
        <span className="member2-feedback-eyebrow">YOUR VOICE</span>
        <h1>Feedback history</h1>
        <p>See the thoughts you have shared with HomeService.</p>
        {!loading && !error && <span className="member2-feedback-count">{items.length} {items.length === 1 ? 'message' : 'messages'}</span>}
      </div>
      {error && <StatusMessage kind="error">{error}</StatusMessage>}
      {loading && <div className="member2-feedback-empty" role="status">
        <span className="member2-feedback-empty-icon"><Heart size={24}/></span>
        <h2>Loading your feedback</h2>
        <p>Your messages will appear here shortly.</p>
      </div>}
      {!loading && !error && (items.length ? items.map(item => <article className="member2-feedback-entry" key={item.id}>
        <div className="member2-feedback-entry-head">
          <span className="member2-feedback-entry-icon"><Heart size={19}/></span>
          <div className="member2-feedback-entry-heading">
            <span className="member2-feedback-entry-label">FEEDBACK</span>
            <h2>{item.category}</h2>
          </div>
          <span className={`member2-feedback-status member2-feedback-status--${item.status}`}>{item.status}</span>
        </div>
        <p className="member2-feedback-message">{item.message}</p>
        <div className="member2-feedback-entry-footer"><CalendarDays size={15}/> Submitted {new Intl.DateTimeFormat('en-LK', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(item.created_at))}</div>
      </article>) : <div className="member2-feedback-empty">
        <span className="member2-feedback-empty-icon"><Heart size={24}/></span>
        <h2>No feedback yet</h2>
        <p>Share your experience to help improve HomeService.</p>
        <button type="button" onClick={onBack}>Write feedback <ChevronRight size={16}/></button>
      </div>)}
    </main>
  </div>
}

export function Member2ReviewsScreen({ providers, onBack, onProvider }: { providers: ProviderProfile[]; onBack: () => void; onProvider: (provider: ProviderProfile) => void }) { const [query, setQuery] = useState(''); const shown = useMemo(() => providers.filter(p => !query || `${p.display_name} ${p.category} ${p.location}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => b.rating_avg - a.rating_avg), [providers, query]); return <div className="m1-page"><ScreenHeader title="Provider Reviews" onBack={onBack}/><main className="m1-scroll member2-screen"><label className="m1-search-input"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search rated providers"/></label>{shown.length ? shown.map(provider => <button className="member2-list-row" key={provider.user_id} onClick={() => onProvider(provider)}><span className="m1-mini-avatar">{(provider.display_name || '').slice(0, 1)}</span><span><strong>{provider.display_name}</strong><small>{provider.category} · {provider.rating_avg.toFixed(1)} stars ({provider.rating_count} reviews)</small></span><ChevronRight size={17}/></button>) : <StatusMessage>No provider reviews match your search.</StatusMessage>}</main></div> }

