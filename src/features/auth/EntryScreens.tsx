import { ArrowRight, BriefcaseBusiness, Check, ChevronRight, House, ShieldCheck, Sparkles, Star } from 'lucide-react'
import { Brand, PrimaryButton } from '../../shared/components/MobileUi'

export function SplashScreen() {
  return <div className="m1-entry m1-splash">
    <div className="m1-splash-center"><span className="m1-splash-icon"><House size={40} fill="currentColor"/></span>
      <h1>HomeService<span>.</span></h1><p>Trusted home services at your fingertips</p>
      <small>● Verified Care &amp; Certified Experts ●</small></div>
    <p className="m1-splash-bottom">Setting up your home space...</p>
  </div>
}

export function OnboardingScreen({ onContinue }: { onContinue: () => void }) {
  return <div className="m1-entry m1-onboarding">
    <Brand compact/>
    <div className="m1-onboarding-art"><div className="m1-art-room"><House size={74}/><span><Sparkles size={22}/> Home care, made easy</span></div></div>
    <div className="m1-feature-tags"><span><ShieldCheck size={16}/> 100% Vetted<br/>Professionals</span><span><Star size={16}/> 30m Response<br/>Guarantee</span></div>
    <p className="m1-social-proof">★★★★★ &nbsp; Loved by 45,000+ homes</p>
    <h1>Home Services,<br/><span>Made Effortless</span></h1>
    <p className="m1-muted">Book top-rated, background-checked professionals for repairs, cleaning, and maintenance in just a few taps.</p>
    <PrimaryButton onClick={onContinue}>Get Started <ArrowRight size={17}/></PrimaryButton>
  </div>
}

export function RoleSelectScreen({ onCustomer, onProvider, onAdmin }: {
  onCustomer: () => void; onProvider: () => void; onAdmin: () => void
}) {
  return <div className="m1-entry m1-role-select">
    <div className="m1-role-top"><Brand compact/><button className="m1-small-pill" onClick={onAdmin}>Admin</button></div>
    <h1>How will you use<br/><span>HomeService?</span></h1>
    <p className="m1-muted">Select how you want to use HomeService. Your account role controls access to each workspace.</p>
    <button className="m1-role-card" onClick={onCustomer}><span className="m1-role-icon"><House size={22}/></span>
      <span><strong>I Need Home Services</strong><small>Book verified electricians, plumbers &amp; pros for your home.</small>
      <em>Instant Booking · 100% Guaranteed</em></span><ChevronRight size={18}/></button>
    <button className="m1-role-card" onClick={onProvider}><span className="m1-role-icon m1-role-icon--dark"><BriefcaseBusiness size={22}/></span>
      <span><strong>Service Provider</strong><small>Grow your business, accept nearby jobs &amp; manage earnings.</small>
      <em>Verified Partners · Fair Daily Payouts</em></span><ChevronRight size={18}/></button>
    <p className="m1-role-foot"><Check size={15}/> Your account role controls access to each workspace.</p>
  </div>
}
