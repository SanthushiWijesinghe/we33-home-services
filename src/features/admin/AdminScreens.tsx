import { useEffect, useState } from 'react'
import { ArrowRight, BadgeCheck, Bell, Check, ClipboardList, Clock3, ShieldCheck, X } from 'lucide-react'
import { BottomNav, PrimaryButton, ScreenHeader, StatusMessage } from '../../shared/components/MobileUi'
import type { AppProfile } from '../auth/AuthProvider'
import { listAdminProviders, listProviderDocuments, reviewProvider } from '../providers/provider.service'
import type { ProviderDocument, ProviderProfile, VerificationStatus } from '../providers/provider.types'

function statusLabel(status: VerificationStatus) { return status === 'pending' ? 'Pending' : status === 'approved' ? 'Approved' : 'Rejected' }

export function AdminDashboardScreen({ profile, onNavigate }: { profile: AppProfile; onNavigate: (screen: string) => void }) {
  const [providers, setProviders] = useState<ProviderProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => { let active = true; void listAdminProviders().then(data => { if (active) setProviders(data) })
    .catch(cause => { if (active) setError(cause.message) }).finally(() => { if (active) setLoading(false) }); return () => { active = false } }, [])
  const pending = providers.filter(item => item.verification_status === 'pending')
  const approved = providers.filter(item => item.verification_status === 'approved')
  return <div className="m1-page"><ScreenHeader title="Dashboard" action={<button className="m1-icon-btn" onClick={() => onNavigate('notifications')} aria-label="Notifications"><Bell size={18}/></button>}/><main className="m1-scroll">
    <div className="m1-admin-intro"><small>LIVE OVERVIEW</small><h1>Good morning, Admin <span>👋</span></h1><p>{profile.full_name} · Keep HomeService safe and reliable.</p></div>
    {loading ? <StatusMessage>Loading dashboard…</StatusMessage> : error ? <StatusMessage kind="error">{error}</StatusMessage> : <>
      <div className="m1-admin-stats"><div><strong>{pending.length}</strong><small>Pending<br/>Approvals</small></div>
        <div><strong>{approved.length}</strong><small>Approved<br/>Providers</small></div>
        <div><strong>{providers.length}</strong><small>Total<br/>Applications</small></div></div>
      <section className="m1-urgent"><small>URGENT ACTIONS <span>Priority</span></small><h2><ClipboardList size={22}/> Review Applications</h2>
        <p>{pending.length} provider {pending.length === 1 ? 'application requires' : 'applications require'} your review.</p>
        <PrimaryButton onClick={() => onNavigate('verification')}>Open Queue <ArrowRight size={16}/></PrimaryButton></section>
      <div className="m1-section-title"><h2>Recent Approvals</h2><button onClick={() => onNavigate('verification')}>View All</button></div>
      {approved.length ? <div className="m1-provider-list">{approved.slice(0, 3).map(provider => <div className="m1-admin-provider-row" key={provider.user_id}>
        <span className="m1-mini-avatar">{(provider.display_name || '').slice(0, 1)}</span><span><strong>{provider.display_name}</strong><small>{provider.category} · {provider.location}</small></span><BadgeCheck size={18}/></div>)}</div>
        : <StatusMessage>No providers have been approved yet.</StatusMessage>}
      <div className="member3-provider-actions"><button onClick={() => onNavigate('member3-categories')}><strong>Manage service categories</strong><small>Add, edit or hide customer categories</small><ArrowRight size={17}/></button></div>
      <div className="m1-assurance"><ShieldCheck size={19}/><span><strong>Safety comes first</strong><small>Review each document before approval.</small></span></div>
    </>}</main><BottomNav kind="admin" current="admin" onNavigate={onNavigate}/></div>
}

export function AdminVerificationScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [providers, setProviders] = useState<ProviderProfile[]>([])
  const [filter, setFilter] = useState<'all' | VerificationStatus>('pending')
  const [selected, setSelected] = useState<ProviderProfile | null>(null)
  const [documents, setDocuments] = useState<ProviderDocument[]>([])
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function refresh() { setLoading(true); try { setProviders(await listAdminProviders()); setError('') }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to load providers.') } finally { setLoading(false) } }
  useEffect(() => { void refresh() }, [])
  useEffect(() => { if (!selected) { setDocuments([]); return }; let active = true
    void listProviderDocuments(selected.user_id).then(data => { if (active) setDocuments(data) })
      .catch(cause => { if (active) setError(cause.message) }); return () => { active = false }
  }, [selected?.user_id])

  async function decide(status: 'approved' | 'rejected') {
    if (!selected) return
    if (status === 'rejected' && !note.trim()) { setError('Enter a reason before rejecting a provider.'); return }
    setBusy(true); setError(''); setSuccess('')
    try { await reviewProvider(selected.user_id, status, note); setSuccess(`${(selected.display_name || '')} ${status}.`)
      setSelected(null); setNote(''); await refresh() }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Review failed.') }
    finally { setBusy(false) }
  }

  const shown = filter === 'all' ? providers : providers.filter(item => item.verification_status === filter)
  return <div className="m1-page"><ScreenHeader title="Provider Verification" onBack={() => selected ? setSelected(null) : onNavigate('admin')}/>
    <main className="m1-scroll"><div className="m1-admin-intro"><small>ADMIN CONTROL</small><h1>Provider Verification</h1><p>Review each application and its private documents.</p></div>
      {error && <StatusMessage kind="error">{error}</StatusMessage>}{success && <StatusMessage kind="success">{success}</StatusMessage>}
      {selected ? <div className="m1-review-detail"><div className="m1-review-person"><span className="m1-mini-avatar">{(selected.display_name || '').slice(0, 1)}</span>
        <div><strong>{(selected.display_name || '')}</strong><small>{selected.category} · {selected.location}</small></div><span className="m1-status-pill">{statusLabel(selected.verification_status)}</span></div>
        <div className="m1-detail-grid"><span>Experience <strong>{selected.years_experience} years</strong></span>
          <span>Starting price <strong>LKR {selected.base_price_lkr.toLocaleString('en-LK')}</strong></span></div>
        <p>{selected.bio || 'No description provided.'}</p><h2>Identity Documents</h2>
        {documents.length ? documents.map(document => <a key={document.id} href={document.signed_url} target="_blank" rel="noreferrer" className="m1-document-link">
          <ShieldCheck size={18}/>{document.kind.replace('_', ' ')} <ArrowRight size={15}/></a>)
          : <StatusMessage>No verification documents uploaded yet. Review carefully before approval.</StatusMessage>}
        <label className="m1-note-label">Decision note<textarea rows={3} maxLength={500} value={note} onChange={event => setNote(event.target.value)} placeholder="Required for rejection; optional for approval"/></label>
        <div className="m1-review-actions"><button disabled={busy} onClick={() => void decide('rejected')}><X size={16}/> Reject</button>
          <button disabled={busy} onClick={() => void decide('approved')}><Check size={16}/> Approve</button></div></div>
        : <><div className="m1-chip-row">{(['pending', 'all', 'approved', 'rejected'] as const).map(item => <button key={item}
          className={filter === item ? 'selected' : ''} onClick={() => setFilter(item)}>{item === 'all' ? 'All' : statusLabel(item)}</button>)}</div>
          {loading ? <StatusMessage>Loading applications…</StatusMessage> : shown.length ? <div className="m1-provider-list">{shown.map(provider => <button className="m1-verification-card" key={provider.user_id} onClick={() => setSelected(provider)}>
            <span className="m1-mini-avatar">{(provider.display_name || '').slice(0, 1)}</span><span><strong>{provider.display_name}</strong><small>{provider.category} · {provider.location}</small>
              <em><Clock3 size={12}/> {statusLabel(provider.verification_status)}</em></span><ArrowRight size={17}/></button>)}</div>
            : <StatusMessage>No {filter === 'all' ? '' : filter} applications found.</StatusMessage>}</>}
    </main><BottomNav kind="admin" current="verification" onNavigate={onNavigate}/></div>
}
