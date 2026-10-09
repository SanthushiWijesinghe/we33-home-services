import { useEffect, useState, type FormEvent } from 'react'
import { CalendarDays, ChevronRight, CircleHelp, Clock3, MapPin, MessageCircle, Star } from 'lucide-react'
import { BottomNav, PrimaryButton, ScreenHeader, StatusMessage, formatLkr } from '../../shared/components/MobileUi'
import { Member4DemoCheckout } from './Member4DemoCheckout'
import type { AppProfile } from '../auth/AuthProvider'
import {
  changeMember4BookingStatus, createMember4SupportRequest, deleteMember4Review, getMember4BookingReview,
  listMember4BookingEvents, listMember4Bookings, listMember4ProviderReviews, listMember4SupportRequests,
  member4Error, saveMember4Review, updateMember4SupportRequest,
} from './member4.service'
import type { Member4Booking, Member4BookingEvent, Member4PublicReview, Member4Review, Member4SupportRequest, Member4SupportStatus } from './member4.types'

const dateTime = (value: string) => new Intl.DateTimeFormat('en-LK', {
  day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
}).format(new Date(value))
const navKind = (profile: AppProfile) => profile.role === 'ADMIN' ? 'admin' : profile.role === 'SERVICE_PROVIDER' ? 'provider' : 'customer'

export function Member4BookingsScreen({ profile, onBack, onNavigate, initialBookingId }: {
  profile: AppProfile; onBack: () => void; onNavigate: (screen: string) => void; initialBookingId?: string | null
}) {
  const [items, setItems] = useState<Member4Booking[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(initialBookingId ?? null)
  const [history, setHistory] = useState(false)
  const [events, setEvents] = useState<Member4BookingEvent[]>([])
  const [review, setReview] = useState<Member4Review | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const booking = items.find(item => item.id === selectedId)

  async function refresh() {
    try { setItems(await listMember4Bookings()); setError('') }
    catch (cause) { setError(member4Error(cause, 'Unable to load bookings.')) }
    finally { setLoading(false) }
  }
  useEffect(() => { void refresh() }, [profile.id])
  useEffect(() => {
    if (!selectedId) return
    let active = true
    void Promise.all([listMember4BookingEvents(selectedId), getMember4BookingReview(selectedId)])
      .then(([nextEvents, nextReview]) => {
        if (!active) return
        setEvents(nextEvents); setReview(nextReview)
        setRating(nextReview?.rating ?? 5); setComment(nextReview?.comment ?? '')
      }).catch(cause => { if (active) setError(member4Error(cause, 'Unable to load booking details.')) })
    return () => { active = false }
  }, [selectedId])

  async function changeStatus(status: 'cancelled' | 'completed') {
    if (!booking) return
    if (!window.confirm(status === 'cancelled' ? 'Cancel this booking and release its time?' : 'Mark this appointment completed?')) return
    setBusy(true); setError(''); setNotice('')
    try {
      await changeMember4BookingStatus(booking.id, status, reason)
      await refresh()
      setEvents(await listMember4BookingEvents(booking.id))
      setReason(''); setNotice(`Booking ${status}.`)
    } catch (cause) { setError(member4Error(cause, 'Unable to update booking.')) }
    finally { setBusy(false) }
  }
  async function submitReview(event: FormEvent) {
    event.preventDefault()
    if (!booking) return
    setBusy(true); setError(''); setNotice('')
    try { setReview(await saveMember4Review(booking.id, rating, comment)); setNotice('Review saved. Thank you!') }
    catch (cause) { setError(member4Error(cause, 'Unable to save review.')) }
    finally { setBusy(false) }
  }
  async function removeReview() {
    if (!review || !window.confirm('Delete your review?')) return
    setBusy(true); setError(''); setNotice('')
    try { await deleteMember4Review(review.id); setReview(null); setRating(5); setComment(''); setNotice('Review deleted.') }
    catch (cause) { setError(member4Error(cause, 'Unable to delete review.')) }
    finally { setBusy(false) }
  }

  const shown = items.filter(item => history ? item.status !== 'confirmed' : item.status === 'confirmed')
  return <div className="m1-page"><ScreenHeader title={selectedId ? 'Booking Details' : profile.role === 'ADMIN' ? 'All Bookings' : 'My Bookings'}
    onBack={selectedId ? () => { setSelectedId(null); setError(''); setNotice('') } : onBack}/>
    <main className="m1-scroll member4-screen">
      <div className="member4-intro"><span>BOOKING FOLLOW-THROUGH</span><h1>{selectedId ? booking?.service_title || 'Booking' : 'Your appointments'}</h1>
        <p>{selectedId ? 'Appointment details, status and activity.' : 'Track upcoming work and browse your booking history.'}</p></div>
      {error && <StatusMessage kind="error">{error}</StatusMessage>}
      {notice && <StatusMessage kind="success">{notice}</StatusMessage>}
      {!selectedId && <>
        <div className="member4-tabs"><button className={!history ? 'active' : ''} onClick={() => setHistory(false)}>Active</button>
          <button className={history ? 'active' : ''} onClick={() => setHistory(true)}>History</button></div>
        {loading ? <StatusMessage>Loading bookings…</StatusMessage> : shown.length ? shown.map(item =>
          <button className="member4-booking-card" key={item.id} onClick={() => { setSelectedId(item.id); setError(''); setNotice('') }}>
            <span className="member4-card-head"><strong>{item.service_title}</strong><em className={`member4-pill member4-pill--${item.status}`}>{item.status}</em></span>
            <span>{profile.role === 'SERVICE_PROVIDER' ? item.customer_name : item.provider_name}</span>
            <span><CalendarDays size={17}/>{dateTime(item.start_at)}</span>
            <span className="member4-card-foot"><strong>{formatLkr(item.price_lkr)}</strong><ChevronRight size={18}/></span>
          </button>) : <div className="member4-empty"><CalendarDays size={28}/><strong>No {history ? 'past' : 'active'} bookings yet</strong>
          <p>{history ? 'Completed and cancelled bookings will appear here.' : 'Your confirmed appointments will appear here.'}</p></div>}
      </>}
      {selectedId && booking && <>
        <div className="member4-detail-card"><div className="member4-card-head"><strong>{booking.service_title}</strong>
          <em className={`member4-pill member4-pill--${booking.status}`}>{booking.status}</em></div>
          <span><CalendarDays size={18}/>{dateTime(booking.start_at)}</span>
          <span><Clock3 size={18}/>Until {dateTime(booking.end_at)}</span>
          <span><MapPin size={18}/>{booking.address_text}</span>
          <span>{profile.role === 'SERVICE_PROVIDER' ? `Customer: ${booking.customer_name}` : `Provider: ${booking.provider_name}`}</span>
          <strong>{formatLkr(booking.price_lkr)}</strong>
          {booking.cancellation_reason && <p>Cancellation note: {booking.cancellation_reason}</p>}</div>
        {profile.role === 'CUSTOMER' && <div className="member4-detail-card">
          <h2>Reviews and payment</h2>
          <button className="member4-outline" onClick={() => onNavigate('reviews')}>Read customer reviews</button>
          {booking.status !== 'cancelled' && <button className="member4-outline" onClick={() => onNavigate('payments')}>Payment options</button>}
          {booking.status === 'confirmed' && <p>Your review form and demo checkout are available below.</p>}
        </div>}
        {booking.status === 'confirmed' && new Date(booking.start_at) > new Date() &&
          <div className="member4-detail-card"><h2>Need to cancel?</h2><p>The time returns to the provider's calendar.</p>
            <label>Reason (optional)<textarea maxLength={500} rows={2} value={reason} onChange={event => setReason(event.target.value)}/></label>
            <button className="member4-danger" disabled={busy} onClick={() => void changeStatus('cancelled')}>Cancel booking</button></div>}
        {booking.status === 'confirmed' && new Date(booking.end_at) <= new Date() &&
          (profile.role === 'SERVICE_PROVIDER' || profile.role === 'ADMIN') &&
          <PrimaryButton disabled={busy} onClick={() => void changeStatus('completed')}>Mark completed</PrimaryButton>}
        <div className="member4-detail-card"><h2>Activity</h2><span><Clock3 size={17}/>Confirmed {dateTime(booking.created_at)}</span>
          {events.map(item => <span key={item.id}><Clock3 size={17}/>{item.to_status} {dateTime(item.created_at)}{item.note ? ` · ${item.note}` : ''}</span>)}</div>
        {profile.role === 'CUSTOMER' && <Member4DemoCheckout key={booking.id} booking={booking} userId={profile.id}/>}
        {booking.status !== 'cancelled' && profile.role === 'CUSTOMER' && <form className="member4-detail-card" onSubmit={submitReview}>
          <h2>{review ? 'Edit your review' : 'Rate this provider'}</h2>
          <label>Stars<select value={rating} onChange={event => setRating(Number(event.target.value))}>
            {[5, 4, 3, 2, 1].map(value => <option key={value} value={value}>{value} star{value === 1 ? '' : 's'}</option>)}</select></label>
          <label>Your review<textarea required minLength={10} maxLength={1000} rows={4} value={comment}
            onChange={event => setComment(event.target.value)} placeholder="Share your booking or service experience"/></label>
          <PrimaryButton type="submit" disabled={busy}>{review ? 'Update review' : 'Submit review'}</PrimaryButton>
          {review && <button type="button" className="member4-danger" disabled={busy} onClick={() => void removeReview()}>Delete review</button>}
        </form>}
      </>}
      <button className="member4-support-link" onClick={() => onNavigate('member4-support')}><CircleHelp size={19}/> Need help with a booking? <ChevronRight size={18}/></button>
    </main><BottomNav kind={navKind(profile)} current="bookings" onNavigate={onNavigate}/></div>
}

export function Member4ProviderReviewsScreen({ providerId, providerName, onBack }: {
  providerId: string; providerName: string; onBack: () => void
}) {
  const [reviews, setReviews] = useState<Member4PublicReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => { let active = true; void listMember4ProviderReviews(providerId)
    .then(data => { if (active) setReviews(data) })
    .catch(cause => { if (active) setError(member4Error(cause, 'Unable to load reviews.')) })
    .finally(() => { if (active) setLoading(false) }); return () => { active = false } }, [providerId])
  return <div className="m1-page"><ScreenHeader title="Provider Reviews" onBack={onBack}/><main className="m1-scroll member4-screen">
    <div className="member4-intro"><span>VERIFIED BOOKINGS</span><h1>{providerName}</h1><p>Reviews from customers who booked this provider.</p></div>
    {error && <StatusMessage kind="error">{error}</StatusMessage>}
    {loading ? <StatusMessage>Loading reviews…</StatusMessage> : reviews.length ? reviews.map(review =>
      <article className="member4-detail-card" key={review.id}><strong>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</strong>
        <p>{review.comment}</p><small>{dateTime(review.created_at)}</small></article>)
      : !error && <div className="member4-empty"><Star size={28}/><strong>No reviews yet</strong><p>Customer booking reviews will appear here.</p></div>}
  </main></div>
}

export function Member4SupportScreen({ profile, onBack, onNavigate }: {
  profile: AppProfile; onBack: () => void; onNavigate: (screen: string) => void
}) {
  const [items, setItems] = useState<Member4SupportRequest[]>([])
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [drafts, setDrafts] = useState<Record<string, { status: Member4SupportStatus; note: string }>>({})
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  async function refresh() {
    try { setItems(await listMember4SupportRequests()); setError('') }
    catch (cause) { setError(member4Error(cause, 'Unable to load support requests.')) }
    finally { setLoading(false) }
  }
  useEffect(() => { void refresh() }, [profile.id])
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('')
    try { await createMember4SupportRequest(profile.id, subject, message); setSubject(''); setMessage('');
      setNotice('Support request sent.'); await refresh() }
    catch (cause) { setError(member4Error(cause, 'Unable to send support request.')) }
    finally { setBusy(false) }
  }
  async function update(request: Member4SupportRequest) {
    const draft = drafts[request.id] ?? { status: request.status, note: request.admin_note ?? '' }
    setBusy(true); setError(''); setNotice('')
    try { await updateMember4SupportRequest(request.id, draft.status, draft.note); setNotice('Support request updated.'); await refresh() }
    catch (cause) { setError(member4Error(cause, 'Unable to update support request.')) }
    finally { setBusy(false) }
  }
  return <div className="m1-page"><ScreenHeader title="Help & Support" onBack={onBack}/><main className="m1-scroll member4-screen">
    <div className="member4-intro"><span>WE ARE HERE TO HELP</span><h1>{profile.role === 'ADMIN' ? 'Support queue' : 'How can we help?'}</h1>
      <p>{profile.role === 'ADMIN' ? 'Review requests and keep people updated.' : 'Send us a question about your bookings or account.'}</p></div>
    {error && <StatusMessage kind="error">{error}</StatusMessage>}
    {notice && <StatusMessage kind="success">{notice}</StatusMessage>}
    {profile.role !== 'ADMIN' && <form className="member4-detail-card" onSubmit={submit}>
      <h2>New request</h2><label>Subject<input required minLength={5} maxLength={120} value={subject}
        onChange={event => setSubject(event.target.value)} placeholder="What do you need help with?"/></label>
      <label>Details<textarea required minLength={15} maxLength={2000} rows={5} value={message}
        onChange={event => setMessage(event.target.value)} placeholder="Tell us what happened…"/></label>
      <PrimaryButton type="submit" disabled={busy}>Send request</PrimaryButton></form>}
    <h2 className="member4-section-title">{profile.role === 'ADMIN' ? 'All requests' : 'Your requests'}</h2>
    {loading ? <StatusMessage>Loading requests…</StatusMessage> : items.length ? items.map(item =>
      <article className="member4-detail-card" key={item.id}>
        <div className="member4-card-head"><strong>{item.subject}</strong><em className={`member4-pill member4-pill--${item.status}`}>{item.status.replace('_', ' ')}</em></div>
        <small>{dateTime(item.created_at)}</small><p>{item.message}</p>
        {item.admin_note && <p className="member4-admin-note"><MessageCircle size={17}/> Team response: {item.admin_note}</p>}
        {profile.role === 'ADMIN' && <><label>Status<select value={drafts[item.id]?.status ?? item.status}
          onChange={event => setDrafts(previous => ({ ...previous, [item.id]: {
            status: event.target.value as Member4SupportStatus, note: previous[item.id]?.note ?? item.admin_note ?? '',
          } }))}>
          <option value="open">Open</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option>
        </select></label><label>Response<textarea rows={3} value={drafts[item.id]?.note ?? item.admin_note ?? ''}
          onChange={event => setDrafts(previous => ({ ...previous, [item.id]: {
            status: previous[item.id]?.status ?? item.status, note: event.target.value,
          } }))}/></label><button className="member4-outline" disabled={busy} onClick={() => void update(item)}>Save response</button></>}
      </article>) : !error && <div className="member4-empty"><CircleHelp size={28}/><strong>No requests yet</strong></div>}
    </main><BottomNav kind={navKind(profile)} current="" onNavigate={onNavigate}/></div>
}
