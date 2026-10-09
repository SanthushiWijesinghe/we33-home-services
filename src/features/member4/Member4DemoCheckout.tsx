import { useEffect, useState, type FormEvent } from 'react'
import { CreditCard, ShieldCheck } from 'lucide-react'
import { PrimaryButton, StatusMessage, formatLkr } from '../../shared/components/MobileUi'
import { requireSupabase } from '../../services/supabase/client'
import { listPaymentMethods, type PaymentMethod } from '../member2/member2.service'
import { Member2CardFields, emptyDemoCard, maskedDemoCard } from '../member2/Member2CardFields'
import type { Member4Booking } from './member4.types'

type DemoPayment = { id: string; amount_lkr: number; method_type: string; method_label: string; status: 'demo_paid'; created_at: string }
const checkoutError = (cause: unknown) => {
  const message = cause && typeof cause === 'object' && 'message' in cause ? String(cause.message) : 'Unable to record demo payment.'
  return /schema cache|does not exist|Could not find/.test(message) ? 'Apply 20261012_member4_demo_checkout_booking_reviews.sql in Supabase to enable demo checkout.' : message
}

export function Member4DemoCheckout({ booking, userId }: { booking: Pick<Member4Booking, 'id' | 'status' | 'price_lkr'>; userId: string }) {
  const [payment, setPayment] = useState<DemoPayment | null>(null)
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [method, setMethod] = useState('card')
  const [savedId, setSavedId] = useState('')
  const [card, setCard] = useState(emptyDemoCard)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    void Promise.all([
      requireSupabase().from('booking_demo_payments').select('id,amount_lkr,method_type,method_label,status,created_at').eq('booking_id', booking.id).maybeSingle(),
      listPaymentMethods(userId).catch(() => [] as PaymentMethod[]),
    ]).then(([result, saved]) => { if (!active) return; if (result.error) throw result.error; setPayment(result.data as DemoPayment | null); setMethods(saved) })
      .catch(cause => { if (active) setError(checkoutError(cause)) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [booking.id, userId])
  async function pay(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('')
    try {
      const saved = methods.find(item => item.id === savedId && item.method_type === 'card')
      const metadata = method === 'card' ? saved && /^\d{4}$/.test(saved.last_four || '') ? { label: saved.label, last_four: saved.last_four } : maskedDemoCard(card) : { label: method === 'cash' ? 'Cash — demo confirmation' : 'Mobile payment — demo confirmation', last_four: null }
      const { data, error: paymentError } = await requireSupabase().rpc('member4_record_demo_payment', { p_booking_id: booking.id, p_method: method, p_label: metadata.label, p_last_four: metadata.last_four })
      if (paymentError) throw paymentError
      setPayment(data as DemoPayment); setCard(emptyDemoCard)
    } catch (cause) { setError(checkoutError(cause)) }
    finally { setBusy(false) }
  }
  return <section className="member4-detail-card member4-demo-checkout">
    <h2><CreditCard size={20}/> Booking payment</h2>
    <div className="member2-safe-banner"><ShieldCheck size={19}/> Demo checkout only. No money will be charged or transferred.</div>
    {error && <StatusMessage kind="error">{error}</StatusMessage>}
    {loading ? <p>Loading payment…</p> : payment ? <div className="member4-demo-receipt" role="status"><strong>Demo payment recorded</strong><span>{formatLkr(payment.amount_lkr)} · {payment.method_label}</span><small>Demo receipt: {payment.id}</small><small>{new Date(payment.created_at).toLocaleString('en-LK')}</small></div> : booking.status === 'cancelled' ? <p>This booking is cancelled. Checkout is unavailable.</p> : <form className="member2-form" onSubmit={pay}>
      <div className="member4-payment-total"><span>Total</span><strong>{formatLkr(booking.price_lkr)}</strong></div>
      <label>Payment method<select value={method} disabled={busy} onChange={event => { setMethod(event.target.value); setSavedId(''); setCard(emptyDemoCard) }}><option value="card">Card — demo</option><option value="cash">Cash — demo</option><option value="mobile">Mobile payment — demo</option></select></label>
      {method === 'card' && <>
        {methods.some(item => item.method_type === 'card' && item.last_four) && <label>Card<select value={savedId} disabled={busy} onChange={event => { setSavedId(event.target.value); setCard(emptyDemoCard) }}><option value="">Enter a sample card</option>{methods.filter(item => item.method_type === 'card' && item.last_four).map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>}
        {!savedId && <Member2CardFields value={card} onChange={setCard} disabled={busy}/>}
      </>}
      <PrimaryButton type="submit" disabled={busy}>{busy ? 'Recording…' : 'Confirm demo payment'}</PrimaryButton>
    </form>}
  </section>
}
