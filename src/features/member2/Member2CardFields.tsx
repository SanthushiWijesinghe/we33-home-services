export type DemoCardDetails = { holder: string; number: string; expiry: string; cvv: string }
export const emptyDemoCard: DemoCardDetails = { holder: '', number: '', expiry: '', cvv: '' }

export function maskedDemoCard(card: DemoCardDetails) {
  const digits = card.number.replace(/\D/g, '')
  let sum = 0
  for (let index = digits.length - 1, double = false; index >= 0; index--, double = !double) {
    let value = Number(digits[index])
    if (double) { value *= 2; if (value > 9) value -= 9 }
    sum += value
  }
  if (!/^\d{13,19}$/.test(digits) || /^0+$/.test(digits) || sum % 10 !== 0) throw new Error('Enter a valid sample card number, such as 4242 4242 4242 4242.')
  const expiry = card.expiry.match(/^(0[1-9]|1[0-2])\/(\d{2})$/)
  if (!expiry || new Date(2000 + Number(expiry[2]), Number(expiry[1]), 1) <= new Date()) throw new Error('Enter a future expiry date in MM/YY format.')
  if (card.holder.trim().length < 2 || card.holder.trim().length > 60) throw new Error('Enter a cardholder name between 2 and 60 characters.')
  if (!/^\d{3,4}$/.test(card.cvv)) throw new Error('Enter a sample security code with 3 or 4 digits.')
  const brand = digits.startsWith('4') ? 'Visa' : /^5[1-5]/.test(digits) ? 'Mastercard' : 'Card'
  return { last_four: digits.slice(-4), label: `${brand} •••• ${digits.slice(-4)} · ${card.holder.trim()}` }
}

// Card number and CVV stay in component memory; only maskedDemoCard output is saved.
export function Member2CardFields({ value, onChange, disabled = false }: {
  value: DemoCardDetails; onChange: (value: DemoCardDetails) => void; disabled?: boolean
}) {
  return <div className="member2-card-fields">
    <p>Demo card entry. Use sample details, such as 4242 4242 4242 4242. No money is charged.</p>
    <label>Cardholder name<input required maxLength={60} autoComplete="off" disabled={disabled} value={value.holder} onChange={event => onChange({ ...value, holder: event.target.value })} placeholder="Sample cardholder"/></label>
    <label>Card number<input required inputMode="numeric" maxLength={23} autoComplete="off" disabled={disabled} value={value.number} onChange={event => onChange({ ...value, number: event.target.value.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim() })} placeholder="4242 4242 4242 4242"/></label>
    <div className="member2-card-field-row"><label>Expiry date<input required inputMode="numeric" maxLength={5} autoComplete="off" disabled={disabled} value={value.expiry} onChange={event => { const digits = event.target.value.replace(/\D/g, '').slice(0, 4); onChange({ ...value, expiry: digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits }) }} placeholder="MM/YY"/></label>
      <label>Security code<input required type="password" inputMode="numeric" maxLength={4} autoComplete="off" disabled={disabled} value={value.cvv} onChange={event => onChange({ ...value, cvv: event.target.value.replace(/\D/g, '').slice(0, 4) })} placeholder="123"/></label></div>
    <small>Only the card label and last four digits are saved. Card number and security code are discarded.</small>
  </div>
}
