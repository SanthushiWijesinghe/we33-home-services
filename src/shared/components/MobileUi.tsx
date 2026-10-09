import { ArrowLeft, House, Search, CalendarDays, UserRound, Bell, LayoutDashboard, ClipboardList, ShieldCheck, Settings, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function Brand({ compact = false }: { compact?: boolean }) {
  return <span className={`m1-brand ${compact ? 'm1-brand--compact' : ''}`}>
    <span className="m1-brand-mark"><House size={compact ? 15 : 23} strokeWidth={2.7}/></span>
    <span>HomeService<span className="m1-orange">.</span></span>
  </span>
}

export function ScreenHeader({ title, onBack, action }: { title: string; onBack?: () => void; action?: ReactNode }) {
  return <header className="m1-screen-header">
    {onBack ? <button className="m1-icon-btn" onClick={onBack} aria-label="Go back"><ArrowLeft size={19}/></button> : <Brand compact/>}
    <strong>{title}</strong><span className="m1-header-action">{action}</span>
  </header>
}

export function PrimaryButton({ children, onClick, type = 'button', disabled = false }: {
  children: ReactNode; onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean
}) {
  return <button className="m1-primary-btn" type={type} onClick={onClick} disabled={disabled}>{children}</button>
}

type NavItem = { key: string; label: string; icon: LucideIcon; disabled?: boolean }
const customerItems: NavItem[] = [
  { key: 'home', label: 'Home', icon: House }, { key: 'search', label: 'Search', icon: Search },
  { key: 'bookings', label: 'Bookings', icon: CalendarDays }, { key: 'profile', label: 'Profile', icon: UserRound },
]
const providerItems: NavItem[] = [
  { key: 'provider', label: 'Dashboard', icon: LayoutDashboard }, { key: 'bookings', label: 'Bookings', icon: CalendarDays },
  { key: 'earnings', label: 'Earnings', icon: ClipboardList }, { key: 'provider-register', label: 'Account', icon: UserRound },
]
const adminItems: NavItem[] = [
  { key: 'admin', label: 'Dashboard', icon: LayoutDashboard }, { key: 'verification', label: 'Queue', icon: ClipboardList },
  { key: 'verification', label: 'Providers', icon: ShieldCheck }, { key: 'settings', label: 'Settings', icon: Settings },
]

export function BottomNav({ kind, current, onNavigate }: {
  kind: 'customer' | 'provider' | 'admin'; current: string; onNavigate: (key: string) => void
}) {
  const items = kind === 'customer' ? customerItems : kind === 'provider' ? providerItems : adminItems
  return <nav className="m1-bottom-nav" aria-label="Main navigation">{items.map((item, index) => {
    const Icon = item.icon
    return <button key={`${item.key}-${index}`} className={current === item.key ? 'active' : ''}
      onClick={() => onNavigate(item.key)} disabled={item.disabled}>
      <Icon size={19} strokeWidth={current === item.key ? 2.6 : 1.9}/><span>{item.label}</span>
    </button>
  })}</nav>
}

export function NotificationButton() {
  return <button className="m1-icon-btn" aria-label="Notifications" title="Notifications"><Bell size={18}/></button>
}

export function StatusMessage({ children, kind = 'info' }: { children: ReactNode; kind?: 'info' | 'error' | 'success' }) {
  return <div className={`m1-status m1-status--${kind}`} role={kind === 'error' ? 'alert' : 'status'}>{children}</div>
}

export function formatLkr(value: number) { return `LKR ${value.toLocaleString('en-LK')}` }
