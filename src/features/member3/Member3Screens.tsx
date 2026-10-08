import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Bell, CalendarDays, Check, ChevronRight, Clock3, Pencil, Plus, Tag, Trash2 } from 'lucide-react'
import { BottomNav, PrimaryButton, ScreenHeader, StatusMessage, formatLkr } from '../../shared/components/MobileUi'
import type { AppProfile } from '../auth/AuthProvider'
import type { ProviderProfile } from '../providers/provider.types'
import { getOwnProvider } from '../providers/provider.service'
import {
  bookMember3Slot, createMember3Slot, deleteMember3Category, deleteMember3Service, deleteMember3Slot,
  listMember3AvailableSlots, listMember3Categories, listMember3Notifications, listMember3ProviderServices,
  listMember3Slots, markMember3NotificationRead, member3Error, saveMember3Category, saveMember3Service,
  updateMember3Slot,
} from './member3.service'
import type { Member3Booking, Member3Category, Member3Notification, Member3Service, Member3ServiceInput, Member3Slot } from './member3.types'

const dateTime = (value: string) => new Intl.DateTimeFormat('en-LK', {
  day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
}).format(new Date(value))
const dateOnly = (value: string) => new Intl.DateTimeFormat('en-LK', {
  weekday: 'long', day: 'numeric', month: 'short', year: 'numeric',
}).format(new Date(value))

function localSlotFields(value: string) {
  const date = new Date(value)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString()
  return { day: local.slice(0, 10), time: local.slice(11, 16) }
}

const blankCategory = { name: '', slug: '', icon_key: 'wrench', is_active: true }

export function Member3CategoriesScreen({ isAdmin, onBack, onCategory, onNavigate }: {
  isAdmin: boolean; onBack: () => void; onCategory: (category: string) => void
  onNavigate: (screen: string) => void
}) {
  const [categories, setCategories] = useState<Member3Category[]>([])
  const [form, setForm] = useState(blankCategory)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function refresh() {
    try { setCategories(await listMember3Categories()); setError('') }
    catch (cause) { setError(member3Error(cause, 'Unable to load categories.')) }
    finally { setLoading(false) }
  }
  useEffect(() => { void refresh() }, [])

  async function save(event: FormEvent) {
    event.preventDefault()
    setSaving(true); setError(''); setNotice('')
    try {
      await saveMember3Category(form, editingId ?? undefined)
      setForm(blankCategory); setEditingId(null)
      setNotice('Category saved.')
      await refresh()
    } catch (cause) { setError(member3Error(cause, 'Unable to save category.')) }
    finally { setSaving(false) }
  }

  async function remove(category: Member3Category) {
    if (!window.confirm(`Delete ${category.name}? Categories used by services cannot be deleted.`)) return
    try {
      await deleteMember3Category(category.id)
      setNotice('Category deleted.'); setError('')
      await refresh()
    } catch (cause) { setError(member3Error(cause, 'Unable to delete category.')) }
  }

  return <div className="m1-page">
    <ScreenHeader title={isAdmin ? 'Manage Categories' : 'Service Categories'} onBack={onBack}/>
    <main className="m1-scroll member3-screen">
      <div className="member3-intro"><span>EXPLORE SERVICES</span><h1>{isAdmin ? 'Category catalog' : 'What do you need help with?'}</h1>
        <p>{isAdmin ? 'Add and maintain the trades shown to customers.' : 'Choose a trade to find verified professionals.'}</p></div>
      {error && <StatusMessage kind="error">{error}</StatusMessage>}
      {notice && <StatusMessage kind="success">{notice}</StatusMessage>}
      {isAdmin && <form className="member3-card member3-form" onSubmit={save}>
        <h2>{editingId ? 'Edit category' : 'Add category'}</h2>
        <label>Name<input required minLength={2} maxLength={80} value={form.name}
          onChange={event => setForm({ ...form, name: event.target.value,
            slug: editingId ? form.slug : event.target.value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') })}/></label>
        <label>Slug<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={form.slug}
          onChange={event => setForm({ ...form, slug: event.target.value })}/></label>
        <label>Icon key<input required value={form.icon_key} onChange={event => setForm({ ...form, icon_key: event.target.value })}/></label>
        <label className="member3-check"><input type="checkbox" checked={form.is_active}
          onChange={event => setForm({ ...form, is_active: event.target.checked })}/> Visible to customers</label>
        <div className="member3-actions"><PrimaryButton type="submit" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Update category' : 'Add category'}</PrimaryButton>
          {editingId && <button type="button" className="member3-outline" onClick={() => { setEditingId(null); setForm(blankCategory) }}>Cancel edit</button>}</div>
      </form>}
      <div className="member3-section-title"><h2>{isAdmin ? 'All categories' : 'Browse categories'}</h2><small>{categories.length} total</small></div>
      {loading ? <StatusMessage>Loading categories…</StatusMessage> : !categories.length ? <StatusMessage>No categories available yet.</StatusMessage>
        : categories.map(category => <div className="member3-category-row" key={category.id}>
          <span className="member3-category-icon"><Tag size={20}/></span>
          <span className="member3-row-text"><strong>{category.name}</strong><small>{isAdmin ? category.is_active ? 'Visible' : 'Hidden' : 'Verified professionals'}</small></span>
          {isAdmin ? <span className="member3-inline-actions">
            <button aria-label={`Edit ${category.name}`} onClick={() => { setEditingId(category.id); setForm({
              name: category.name, slug: category.slug, icon_key: category.icon_key, is_active: category.is_active,
            }) }}><Pencil size={17}/></button>
            <button aria-label={`Delete ${category.name}`} onClick={() => void remove(category)}><Trash2 size={17}/></button>
          </span> : <button aria-label={`Browse ${category.name}`} onClick={() => onCategory(category.name)}><ChevronRight size={19}/></button>}
        </div>)}
    </main>
    <BottomNav kind={isAdmin ? 'admin' : 'customer'} current={isAdmin ? 'admin' : 'search'} onNavigate={onNavigate}/>
  </div>
}

const blankService: Member3ServiceInput = {
  category_id: '', title: '', description: '', price_lkr: 0, duration_minutes: 60, is_active: true,
}

export function Member3ProviderServicesScreen({ profile, onBack, onNavigate }: {
  profile: AppProfile; onBack: () => void; onNavigate: (screen: string) => void
}) {
  const [services, setServices] = useState<Member3Service[]>([])
  const [categories, setCategories] = useState<Member3Category[]>([])
  const [form, setForm] = useState<Member3ServiceInput>(blankService)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [approvedTrade, setApprovedTrade] = useState('')
  const providerCategory = useMemo(() => categories.filter(item => item.is_active &&
    item.name.toLowerCase() === approvedTrade.toLowerCase()), [categories, approvedTrade])

  async function refresh() {
    try {
      const [nextCategories, nextServices, provider] = await Promise.all([
        listMember3Categories(), listMember3ProviderServices(profile.id), getOwnProvider(profile.id),
      ])
      const trade = provider?.verification_status === 'approved' ? provider.category : ''
      setCategories(nextCategories); setServices(nextServices); setApprovedTrade(trade); setError('')
      setForm(current => current.category_id && nextCategories.some(item => item.id === current.category_id && item.is_active && item.name.toLowerCase() === trade.toLowerCase()) ? current : { ...current,
        category_id: nextCategories.find(item => item.is_active && item.name.toLowerCase() === trade.toLowerCase())?.id ?? '',
      })
    } catch (cause) { setError(member3Error(cause, 'Unable to load services.')) }
    finally { setLoading(false) }
  }
  useEffect(() => { void refresh() }, [profile.id])

  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('')
    try {
      await saveMember3Service(profile.id, { ...form, title: form.title.trim(), description: form.description.trim() }, editingId ?? undefined)
      setEditingId(null); setForm({ ...blankService, category_id: providerCategory[0]?.id ?? '' })
      setNotice('Service saved.'); await refresh()
    } catch (cause) { setError(member3Error(cause, 'Unable to save service.')) }
    finally { setBusy(false) }
  }

  async function remove(service: Member3Service) {
    if (!window.confirm(`Delete ${service.title}? Booked services cannot be deleted.`)) return
    try { await deleteMember3Service(profile.id, service.id); setNotice('Service deleted.'); await refresh() }
    catch (cause) { setError(member3Error(cause, 'Unable to delete service.')) }
  }

  return <div className="m1-page"><ScreenHeader title="My Services" onBack={onBack}/>
    <main className="m1-scroll member3-screen">
      <div className="member3-intro"><span>PROVIDER CATALOG</span><h1>Your services</h1><p>Add the work you offer and set a clear price and duration.</p></div>
      {error && <StatusMessage kind="error">{error}</StatusMessage>}{notice && <StatusMessage kind="success">{notice}</StatusMessage>}
      {!loading && !approvedTrade && <StatusMessage>Your provider profile must be approved before you can add bookable services.</StatusMessage>}
      <form className="member3-card member3-form" onSubmit={save}>
        <h2>{editingId ? 'Edit service' : 'Add a service'}</h2>
        <label>Trade<select required disabled={Boolean(editingId)} value={form.category_id}
          onChange={event => setForm({ ...form, category_id: event.target.value })}>
          <option value="">Select a trade</option>{providerCategory.map(category => <option value={category.id} key={category.id}>{category.name}</option>)}
        </select></label>
        <label>Service title<input required minLength={3} maxLength={100} value={form.title}
          onChange={event => setForm({ ...form, title: event.target.value })} placeholder="Home wiring inspection"/></label>
        <label>Description<textarea maxLength={2000} rows={3} value={form.description}
          onChange={event => setForm({ ...form, description: event.target.value })} placeholder="What is included?"/></label>
        <div className="member3-form-grid">
          <label>Price (LKR)<input required type="number" min={0} value={form.price_lkr}
            onChange={event => setForm({ ...form, price_lkr: Number(event.target.value) })}/></label>
          <label>Minutes<select value={form.duration_minutes}
            onChange={event => setForm({ ...form, duration_minutes: Number(event.target.value) })}>
            {[30, 60, 90, 120, 180, 240, 360, 480].map(minutes => <option key={minutes} value={minutes}>{minutes} min</option>)}
          </select></label>
        </div>
        <label className="member3-check"><input type="checkbox" checked={form.is_active}
          onChange={event => setForm({ ...form, is_active: event.target.checked })}/> Listed for customers</label>
        <PrimaryButton type="submit" disabled={busy || loading || !providerCategory.length}>{busy ? 'Saving…' : editingId ? 'Update service' : 'Add service'}</PrimaryButton>
        {editingId && <button type="button" className="member3-outline" onClick={() => { setEditingId(null); setForm({ ...blankService, category_id: providerCategory[0]?.id ?? '' }) }}>Cancel edit</button>}
      </form>
      <div className="member3-section-title"><h2>Saved services</h2><small>{services.length} total</small></div>
      {loading ? <StatusMessage>Loading services…</StatusMessage> : !services.length ? <StatusMessage>No services yet. Add your first service above.</StatusMessage>
        : services.map(service => <article className="member3-card" key={service.id}>
          <div className="member3-card-top"><strong>{service.title}</strong><span className={service.is_active ? 'member3-pill' : 'member3-pill member3-pill--muted'}>{service.is_active ? 'Listed' : 'Hidden'}</span></div>
          <p>{service.description || 'No description yet.'}</p><small>{formatLkr(service.price_lkr)} · {service.duration_minutes} min</small>
          <div className="member3-inline-actions member3-card-actions">
            <button onClick={() => { setEditingId(service.id); setForm({
              category_id: service.category_id, title: service.title, description: service.description,
              price_lkr: service.price_lkr, duration_minutes: service.duration_minutes, is_active: service.is_active,
            }) }}><Pencil size={16}/> Edit</button>
            <button onClick={() => void remove(service)}><Trash2 size={16}/> Delete</button>
          </div>
        </article>)}
      <PrimaryButton onClick={() => onNavigate('member3-availability')}><CalendarDays size={17}/> Manage availability</PrimaryButton>
    </main><BottomNav kind="provider" current="provider" onNavigate={onNavigate}/></div>
}

export function Member3CustomerServicesScreen({ provider, onBack, onService, onNavigate }: {
  provider: ProviderProfile; onBack: () => void; onService: (service: Member3Service) => void
  onNavigate: (screen: string) => void
}) {
  const [services, setServices] = useState<Member3Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    void listMember3ProviderServices(provider.user_id).then(items => { if (active) setServices(items.filter(item => item.is_active)) })
      .catch(cause => { if (active) setError(member3Error(cause, 'Unable to load services.')) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [provider.user_id])
  return <div className="m1-page"><ScreenHeader title="Services & Prices" onBack={onBack}/>
    <main className="m1-scroll member3-screen">
      <div className="member3-intro"><span>VERIFIED PROFESSIONAL</span><h1>{provider.display_name}</h1>
        <p>{provider.category} · {provider.location}</p></div>
      {loading ? <StatusMessage>Loading services…</StatusMessage> : error ? <StatusMessage kind="error">{error}</StatusMessage>
        : !services.length ? <StatusMessage>This provider has not listed bookable services yet.</StatusMessage>
          : services.map(service => <button className="member3-service-button" key={service.id} onClick={() => onService(service)}>
            <span className="member3-category-icon"><Tag size={20}/></span>
            <span className="member3-row-text"><strong>{service.title}</strong><small>{service.description || 'View availability and booking times'}</small>
              <em>{formatLkr(service.price_lkr)} · {service.duration_minutes} min</em></span><ChevronRight size={18}/>
          </button>)}
    </main><BottomNav kind="customer" current="search" onNavigate={onNavigate}/></div>
}

export function Member3AvailabilityScreen({ profile, onBack, onNavigate }: {
  profile: AppProfile; onBack: () => void; onNavigate: (screen: string) => void
}) {
  const [services, setServices] = useState<Member3Service[]>([])
  const [slots, setSlots] = useState<Member3Slot[]>([])
  const [serviceId, setServiceId] = useState('')
  const [slotId, setSlotId] = useState<string | null>(null)
  const [day, setDay] = useState('')
  const [time, setTime] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const activeServices = services.filter(service => service.is_active)
  const selectedService = services.find(service => service.id === serviceId)
  const groupedSlots = slots.reduce<Record<string, Member3Slot[]>>((groups, slot) => {
    const dayLabel = dateOnly(slot.start_at)
    ;(groups[dayLabel] ??= []).push(slot)
    return groups
  }, {})

  async function refresh() {
    try {
      const [nextServices, nextSlots] = await Promise.all([
        listMember3ProviderServices(profile.id), listMember3Slots(profile.id),
      ])
      setServices(nextServices); setSlots(nextSlots); setError('')
      setServiceId(current => current || nextServices.find(service => service.is_active)?.id || '')
    } catch (cause) { setError(member3Error(cause, 'Unable to load availability.')) }
    finally { setLoading(false) }
  }
  useEffect(() => { void refresh() }, [profile.id])

  async function save(event: FormEvent) {
    event.preventDefault(); setError(''); setNotice('')
    if (!selectedService) { setError('Choose an active service first.'); return }
    const start = new Date(`${day}T${time}:00`)
    if (Number.isNaN(start.getTime()) || start <= new Date()) { setError('Choose a future date and time.'); return }
    const end = new Date(start.getTime() + selectedService.duration_minutes * 60000)
    setBusy(true)
    try {
      if (slotId) await updateMember3Slot(profile.id, slotId, start.toISOString(), end.toISOString())
      else await createMember3Slot(profile.id, serviceId, start.toISOString(), end.toISOString())
      setSlotId(null); setDay(''); setTime('')
      setNotice('Availability saved.'); await refresh()
    } catch (cause) { setError(member3Error(cause, 'Unable to save availability.')) }
    finally { setBusy(false) }
  }

  async function remove(slot: Member3Slot) {
    if (!window.confirm('Remove this available time?')) return
    try { await deleteMember3Slot(profile.id, slot.id); setNotice('Time removed.'); await refresh() }
    catch (cause) { setError(member3Error(cause, 'Unable to remove time.')) }
  }

  return <div className="m1-page"><ScreenHeader title="Availability Calendar" onBack={onBack}/>
    <main className="m1-scroll member3-screen">
      <div className="member3-intro"><span>PROVIDER SCHEDULE</span><h1>Open appointment times</h1>
        <p>Add one time for each service. Booked times stay locked to protect customers.</p></div>
      {error && <StatusMessage kind="error">{error}</StatusMessage>}{notice && <StatusMessage kind="success">{notice}</StatusMessage>}
      <form className="member3-card member3-form" onSubmit={save}>
        <h2>{slotId ? 'Move available time' : 'Add available time'}</h2>
        <label>Service<select required disabled={Boolean(slotId)} value={serviceId}
          onChange={event => setServiceId(event.target.value)}>
          <option value="">Choose a service</option>{activeServices.map(service => <option value={service.id} key={service.id}>{service.title} · {service.duration_minutes} min</option>)}
        </select></label>
        <div className="member3-form-grid">
          <label>Date<input type="date" required min={localSlotFields(new Date().toISOString()).day}
            value={day} onChange={event => setDay(event.target.value)}/></label>
          <label>Start time<input type="time" required value={time} onChange={event => setTime(event.target.value)}/></label>
        </div>
        <p className="member3-helper">The end time is calculated from the service duration.</p>
        <PrimaryButton type="submit" disabled={busy || loading || !activeServices.length}>
          <Plus size={17}/>{busy ? 'Saving…' : slotId ? 'Update time' : 'Add time'}
        </PrimaryButton>
        {slotId && <button type="button" className="member3-outline" onClick={() => { setSlotId(null); setDay(''); setTime('') }}>Cancel edit</button>}
        {!loading && !activeServices.length && <StatusMessage>Add an active service first, then create its available times.</StatusMessage>}
      </form>
      <div className="member3-section-title"><h2>Upcoming calendar</h2><small>{slots.length} times</small></div>
      {loading ? <StatusMessage>Loading calendar…</StatusMessage> : !slots.length ? <StatusMessage>No upcoming times yet.</StatusMessage>
        : Object.entries(groupedSlots).map(([date, daySlots]) => <section className="member3-day-group" key={date}>
          <h3><CalendarDays size={17}/>{date}</h3>
          {daySlots?.map(slot => <div className="member3-slot-row" key={slot.id}>
            <span className="member3-slot-time"><Clock3 size={16}/>{new Intl.DateTimeFormat('en-LK', { hour: 'numeric', minute: '2-digit' }).format(new Date(slot.start_at))}</span>
            <span className="member3-row-text"><strong>{services.find(service => service.id === slot.service_id)?.title || 'Service'}</strong>
              <small>{slot.status === 'booked' ? 'Booked · cannot edit' : 'Available to book'}</small></span>
            {slot.status === 'available' && <span className="member3-inline-actions">
              <button aria-label="Edit time" onClick={() => { const fields = localSlotFields(slot.start_at); setSlotId(slot.id); setServiceId(slot.service_id); setDay(fields.day); setTime(fields.time) }}><Pencil size={16}/></button>
              <button aria-label="Delete time" onClick={() => void remove(slot)}><Trash2 size={16}/></button>
            </span>}
          </div>)}
        </section>)}
      <button className="member3-outline" onClick={() => onNavigate('member3-services')}>Manage my services</button>
    </main><BottomNav kind="provider" current="provider" onNavigate={onNavigate}/></div>
}

export function Member3BookingScreen({ provider, service, onBack, onNavigate }: {
  provider: ProviderProfile; service: Member3Service; onBack: () => void
  onNavigate: (screen: string) => void
}) {
  const [slots, setSlots] = useState<Member3Slot[]>([])
  const [slotId, setSlotId] = useState('')
  const [address, setAddress] = useState('')
  const [booking, setBooking] = useState<Member3Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function refresh() {
    try { setSlots(await listMember3AvailableSlots(service.id)); setError('') }
    catch (cause) { setError(member3Error(cause, 'Unable to load available times.')) }
    finally { setLoading(false) }
  }
  useEffect(() => { void refresh() }, [service.id])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!slotId) { setError('Select an available time first.'); return }
    setBusy(true); setError('')
    try { setBooking(await bookMember3Slot(service.id, slotId, address)) }
    catch (cause) {
      setError(member3Error(cause, 'Unable to confirm booking.'))
      try {
        const nextSlots = await listMember3AvailableSlots(service.id)
        setSlots(nextSlots)
        if (!nextSlots.some(slot => slot.id === slotId)) setSlotId('')
      } catch { /* Keep the booking error visible; the next visit reloads availability. */ }
    } finally { setBusy(false) }
  }

  return <div className="m1-page"><ScreenHeader title={booking ? 'Booking Confirmed' : 'Book Service'} onBack={onBack}/>
    <main className="m1-scroll member3-screen">
      {booking ? <div className="member3-confirmed">
        <span className="member3-confirmed-icon"><Check size={27}/></span>
        <h1>Your time is reserved</h1><p>{provider.display_name} has been notified about your booking.</p>
        <div className="member3-card"><strong>{booking.service_title}</strong>
          <span>{dateTime(slots.find(slot => slot.id === booking.slot_id)?.start_at ?? new Date().toISOString())}</span>
          <span>{booking.address_text}</span><strong>{formatLkr(booking.price_lkr)}</strong></div>
        <PrimaryButton onClick={() => onNavigate('notifications')}><Bell size={17}/> View notifications</PrimaryButton>
        <button className="member3-outline" onClick={() => onNavigate('bookings')}>View my booking</button>
        <button className="member3-outline" onClick={onBack}>Back to services</button>
      </div> : <>
        <div className="member3-intro"><span>BOOK A VERIFIED PRO</span><h1>{service.title}</h1>
          <p>{provider.display_name} · {service.duration_minutes} minutes</p></div>
        <div className="member3-price"><span>Service price</span><strong>{formatLkr(service.price_lkr)}</strong></div>
        <p className="member3-helper">{service.description || 'Choose a time that works for you.'}</p>
        {error && <StatusMessage kind="error">{error}</StatusMessage>}
        <form className="member3-form" onSubmit={submit}>
          <div className="member3-section-title"><h2>Choose an available time</h2></div>
          {loading ? <StatusMessage>Loading appointment times…</StatusMessage> : !slots.length ? <StatusMessage>No open times yet. Check back later or choose another provider.</StatusMessage>
            : <div className="member3-time-grid">{slots.map(slot => <button type="button" key={slot.id}
              className={slot.id === slotId ? 'selected' : ''} onClick={() => setSlotId(slot.id)}>
              <CalendarDays size={16}/>{dateTime(slot.start_at)}</button>)}</div>}
          <label>Service address<textarea required minLength={8} maxLength={500} rows={3} value={address}
            onChange={event => setAddress(event.target.value)} placeholder="House number, street, town and directions"/></label>
          <PrimaryButton type="submit" disabled={busy || !slots.length}>{busy ? 'Confirming…' : 'Confirm booking'}</PrimaryButton>
          <p className="member3-helper">Your price and service address are saved with this booking. The selected time is reserved when you confirm.</p>
        </form>
      </>}
    </main><BottomNav kind="customer" current="search" onNavigate={onNavigate}/></div>
}

export function Member3NotificationsScreen({ profile, onBack, onNavigate }: {
  profile: AppProfile; onBack: () => void; onNavigate: (screen: string) => void
}) {
  const [items, setItems] = useState<Member3Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const unread = items.filter(item => !item.read_at).length

  async function refresh() {
    try { setItems(await listMember3Notifications(profile.id)); setError('') }
    catch (cause) { setError(member3Error(cause, 'Unable to load notifications.')) }
    finally { setLoading(false) }
  }
  useEffect(() => { void refresh() }, [profile.id])

  async function markRead(item: Member3Notification) {
    if (item.read_at) return
    try {
      await markMember3NotificationRead(item.id)
      setItems(previous => previous.map(existing => existing.id === item.id
        ? { ...existing, read_at: new Date().toISOString() } : existing))
      setError('')
    } catch (cause) { setError(member3Error(cause, 'Unable to mark notification as read.')) }
  }

  return <div className="m1-page"><ScreenHeader title="Notifications" onBack={onBack}/>
    <main className="m1-scroll member3-screen">
      <div className="member3-intro"><span>YOUR UPDATES</span><h1>Inbox</h1>
        <p>{unread ? `${unread} unread ${unread === 1 ? 'message' : 'messages'}` : 'You are all caught up.'}</p></div>
      {error && <StatusMessage kind="error">{error}</StatusMessage>}
      {loading ? <StatusMessage>Loading notifications…</StatusMessage> : !items.length
        ? <div className="member3-empty"><Bell size={25}/><h2>No notifications yet</h2><p>Booking updates will appear here.</p></div>
        : items.map(item => <button className={item.read_at ? 'member3-notification' : 'member3-notification unread'}
          key={item.id} onClick={() => void markRead(item)}>
          <span className="member3-category-icon"><Bell size={18}/></span>
          <span className="member3-row-text"><strong>{item.title}</strong><small>{item.body}</small><em>{dateTime(item.created_at)}</em></span>
          {!item.read_at && <span className="member3-unread-dot" aria-label="Unread"/>}
        </button>)}
    </main><BottomNav kind={profile.role === 'ADMIN' ? 'admin' : profile.role === 'SERVICE_PROVIDER' ? 'provider' : 'customer'}
      current={profile.role === 'ADMIN' ? 'admin' : profile.role === 'SERVICE_PROVIDER' ? 'provider' : 'home'}
      onNavigate={onNavigate}/></div>
}
