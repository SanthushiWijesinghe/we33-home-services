import { useEffect, useState, type FormEvent } from 'react'
import { ArrowRight, BadgeCheck, CalendarDays, CircleCheck, LogOut, MapPin, ShieldCheck, Star, UploadCloud, Wallet } from 'lucide-react'
import { BottomNav, PrimaryButton, ScreenHeader, StatusMessage, formatLkr } from '../../shared/components/MobileUi'
import { getOwnProvider, saveOwnProvider, uploadProviderDocument } from './provider.service'
import type { ProviderDocument, ProviderInput, ProviderProfile } from './provider.types'
import { useAuth, type AppProfile } from '../auth/AuthProvider'

const categoryOptions = ['Electrical', 'Plumbing', 'AC Repair', 'Carpentry', 'Painting', 'Cleaning']

function errorMessage(cause: unknown, fallback: string): string {
  if (cause && typeof cause === 'object' && 'message' in cause && typeof cause.message === 'string') {
    return cause.message
  }
  return fallback
}

export function ProviderDashboardScreen({ profile, onNavigate }: { profile: AppProfile; onNavigate: (screen: string) => void }) {
  const [provider, setProvider] = useState<ProviderProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => { let active = true; void getOwnProvider(profile.id).then(data => { if (active) setProvider(data) })
    .catch(cause => { if (active) setError(cause.message) }).finally(() => { if (active) setLoading(false) }); return () => { active = false } }, [profile.id])
  return <div className="m1-page"><ScreenHeader title="Provider Dashboard" action={<button className="m1-mini-avatar" onClick={() => onNavigate('provider-register')} aria-label="Account">{(profile.full_name || '').slice(0, 1)}</button>}/>
    <main className="m1-scroll"><div className="m1-provider-welcome"><span className="m1-large-avatar">{(profile.full_name || '').slice(0, 1).toUpperCase()}</span>
      <div><strong>Hello {(profile.full_name || '').split(' ')[0]} 👋</strong><small>{provider?.verification_status === 'approved' ? 'Verified Partner' : 'Service Partner'}</small></div>
      <span className="m1-rating-pill"><Star size={13} fill="currentColor"/> {provider?.rating_count ? provider.rating_avg.toFixed(1) : 'New'}</span></div>
      {loading ? <StatusMessage>Loading your workspace…</StatusMessage> : error ? <StatusMessage kind="error">{error}</StatusMessage>
        : !provider ? <div className="m1-callout"><ShieldCheck size={25}/><div><strong>Complete your provider registration</strong><p>Add service details and verification documents to join the provider directory.</p></div>
          <PrimaryButton onClick={() => onNavigate('provider-register')}>Register as Provider <ArrowRight size={16}/></PrimaryButton></div>
        : <><div className="m1-verification-banner"><BadgeCheck size={18}/><span>Verification: <strong>{provider.verification_status}</strong></span>
          <button onClick={() => onNavigate('provider-register')}>Manage profile</button></div>
          <div className="m1-stats-grid"><div><CalendarDays size={18}/><small>Today's Jobs</small><strong>—</strong></div>
            <div><Wallet size={18}/><small>Direct Earnings</small><strong>—</strong></div>
            <div><Star size={18}/><small>Your Rating</small><strong>{provider.rating_count ? provider.rating_avg.toFixed(1) : 'New'}</strong></div></div>
          <div className="m1-section-title"><h2>Direct Bookings</h2><small>Today</small></div>
          <StatusMessage>Bookings will appear here when the booking module is connected.</StatusMessage>
          <div className="m1-section-title"><h2>Service Profile</h2></div>
          <div className="m1-simple-card"><strong>{provider.category}</strong><span><MapPin size={14}/> {provider.location}</span>
            <span>Starting from {formatLkr(provider.base_price_lkr)}</span><button onClick={() => onNavigate('provider-register')}>Edit details <ArrowRight size={15}/></button></div></>}
    </main><BottomNav kind="provider" current="provider" onNavigate={onNavigate}/></div>
}

export function ProviderRegistrationScreen({ profile, onBack, onNavigate }: {
  profile: AppProfile; onBack: () => void; onNavigate: (screen: string) => void
}) {
  const { signOut } = useAuth()
  const [existing, setExisting] = useState<ProviderProfile | null>(null)
  const [form, setForm] = useState<ProviderInput>({ display_name: profile.full_name, category: 'Electrical', location: 'Colombo', bio: '', years_experience: 0, base_price_lkr: 0 })
  const [files, setFiles] = useState<Partial<Record<ProviderDocument['kind'], File>>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [logoutError, setLogoutError] = useState('')
  useEffect(() => { let active = true; void getOwnProvider(profile.id).then(data => { if (!active || !data) return; setExisting(data)
    setForm({ display_name: data.display_name, category: data.category, location: data.location, bio: data.bio,
      years_experience: data.years_experience, base_price_lkr: data.base_price_lkr })
  }).catch(cause => { if (active) setError(cause.message) }).finally(() => { if (active) setLoading(false) }); return () => { active = false } }, [profile.id])

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setSuccess(''); setSaving(true)
    try {
      const result = await saveOwnProvider(profile.id, form)
      for (const [kind, file] of Object.entries(files)) if (file) await uploadProviderDocument(profile.id, kind as ProviderDocument['kind'], file)
      setExisting(result); setFiles({}); setSuccess('Provider profile saved. The admin team can now review your details.')
    } catch (cause) { setError(errorMessage(cause, 'Unable to save provider profile.')) }
    finally { setSaving(false) }
  }
  async function logout() {
    setLogoutError(''); setSigningOut(true)
    try { await signOut() }
    catch (cause) { setLogoutError(errorMessage(cause, 'Unable to log out.')) }
    finally { setSigningOut(false) }
  }
  return <div className="m1-page"><ScreenHeader title="Provider Registration" onBack={onBack}/><main className="m1-scroll">
    <div className="m1-form-intro"><small>REGISTER YOUR SERVICE</small><h1>Become a Service Partner</h1>
      <p>Join trusted home care professionals and grow your business.</p></div>
    {loading ? <StatusMessage>Loading your profile…</StatusMessage> : <form className="m1-provider-form" onSubmit={submit}>
      {existing && <StatusMessage kind={existing.verification_status === 'approved' ? 'success' : 'info'}>
        Verification status: <strong>{existing.verification_status}</strong>{existing.verification_note && ` — ${existing.verification_note}`}</StatusMessage>}
      <section><h2><span>1</span> Personal Information</h2><label>Full Name<input required minLength={2} value={form.display_name} onChange={event => setForm({ ...form, display_name: event.target.value })}/></label>
        <label>Service Area<input required value={form.location} onChange={event => setForm({ ...form, location: event.target.value })} placeholder="Colombo 03, Sri Lanka"/></label></section>
      <section><h2><span>2</span> Primary Trade</h2><div className="m1-trade-grid">{categoryOptions.map(item => <button type="button" key={item}
        className={form.category === item ? 'selected' : ''} onClick={() => setForm({ ...form, category: item })}>{item}</button>)}</div></section>
      <section><h2><span>3</span> Service Area &amp; Coverage</h2>
        <label>Years of Experience<input required type="number" min={0} max={70} value={form.years_experience} onChange={event => setForm({ ...form, years_experience: Number(event.target.value) })}/></label>
        <label>Starting Price (LKR)<input required type="number" min={0} value={form.base_price_lkr} onChange={event => setForm({ ...form, base_price_lkr: Number(event.target.value) })}/></label>
        <label>About your service<textarea rows={4} maxLength={1000} value={form.bio} onChange={event => setForm({ ...form, bio: event.target.value })} placeholder="Describe your experience and services"/></label></section>
      <section><h2><span>4</span> Identity Verification <em>Mandatory</em></h2><p className="m1-muted">Upload JPG, PNG or PDF files under 5 MB. Documents stay private; you and admins can view them.</p>
        {(['identity_front', 'identity_back', 'certificate'] as const).map(kind => <label key={kind} className="m1-upload-row"><UploadCloud size={18}/>
          <span>{kind === 'identity_front' ? 'NIC / ID Front Side' : kind === 'identity_back' ? 'NIC / ID Back Side' : 'Trade Certificate (optional)'}
            <small>{files[kind]?.name ?? 'Choose file'}</small></span><input type="file" accept="image/jpeg,image/png,application/pdf" onChange={event => setFiles({ ...files, [kind]: event.target.files?.[0] })}/></label>)}</section>
      {error && <StatusMessage kind="error">{error}</StatusMessage>}{success && <StatusMessage kind="success">{success}</StatusMessage>}
      <PrimaryButton type="submit" disabled={saving}>{saving ? 'Saving…' : existing ? 'Update Provider Profile' : 'Register as Provider'} <ArrowRight size={16}/></PrimaryButton>
      <p className="m1-form-foot"><CircleCheck size={15}/> Your profile is visible in search only after admin approval.</p>
    </form>}
    <div className="m1-provider-logout">
      {logoutError && <StatusMessage kind="error">{logoutError}</StatusMessage>}
      <button type="button" className="m1-secondary-btn" onClick={() => void logout()} disabled={saving || signingOut}>
        <LogOut size={16}/> {signingOut ? 'Logging out…' : 'Log Out'}
      </button>
    </div></main><BottomNav kind="provider" current="provider-register" onNavigate={onNavigate}/></div>
}
