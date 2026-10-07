import { useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react'
import { Brand, PrimaryButton, StatusMessage } from '../../shared/components/MobileUi'
import type { UserRole } from '../../shared/types/roles'
import { useAuth } from './AuthProvider'

type AuthScreenProps = {
  mode: 'login' | 'signup' | 'admin-login'
  role: Extract<UserRole, 'CUSTOMER' | 'SERVICE_PROVIDER'>
  onBack: () => void
  onSwitch: (mode: 'login' | 'signup') => void
}

export function AuthScreen({ mode, role, onBack, onSwitch }: AuthScreenProps) {
  const { signIn, signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const signup = mode === 'signup'
  const admin = mode === 'admin-login'

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError(''); setSuccess(''); setBusy(true)
    try {
      if (signup) {
        const signedIn = await signUp(name.trim(), email.trim(), password, role)
        if (!signedIn) setSuccess('Account created. Check your email to confirm it, then log in.')
      } else await signIn(email.trim(), password)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to continue. Please try again.') }
    finally { setBusy(false) }
  }

  return <div className="m1-auth-page">
    <header className="m1-auth-header"><button onClick={onBack} className="m1-icon-btn" aria-label="Back"><ArrowLeft size={20}/></button>
      <Brand compact/></header>
    <div className="m1-auth-inner"><div className="m1-auth-logo"><span><LockKeyhole size={27}/></span></div>
      <h1>{admin ? 'Admin Portal' : signup ? 'Create Account' : 'Welcome Back'}</h1>
      <p className="m1-muted">{admin ? 'Sign in to access the admin console' : signup
        ? 'Join thousands of homeowners getting trusted repairs' : 'Sign in to access your home services'}</p>
      <form onSubmit={submit} className="m1-auth-form">
        {signup && <label>FULL NAME<span className="m1-field"><UserRound size={17}/><input required minLength={2} value={name} onChange={event => setName(event.target.value)} placeholder="Your full name" autoComplete="name"/></span></label>}
        <label>EMAIL ADDRESS<span className="m1-field"><Mail size={17}/><input required type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="name@example.com" autoComplete="email"/></span></label>
        <label>PASSWORD<span className="m1-field"><LockKeyhole size={17}/><input required type={visible ? 'text' : 'password'} minLength={8}
          value={password} onChange={event => setPassword(event.target.value)} placeholder="At least 8 characters" autoComplete={signup ? 'new-password' : 'current-password'}/>
          <button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide password' : 'Show password'}>{visible ? <EyeOff size={17}/> : <Eye size={17}/>}</button></span></label>
        {signup && <p className="m1-terms">By creating an account, you agree to the Terms of Service &amp; Privacy Policy.</p>}
        {error && <StatusMessage kind="error">{error}</StatusMessage>}
        {success && <StatusMessage kind="success">{success}</StatusMessage>}
        <PrimaryButton type="submit" disabled={busy}>{busy ? 'Please wait…' : admin ? 'Log in to Console' : signup ? 'Create Account' : 'Log In'} <ArrowRight size={17}/></PrimaryButton>
      </form>
      {admin && <p className="m1-auth-note"><ShieldCheck size={16}/> Admin access is granted by the project owner. Public signup cannot create an admin account.</p>}
      {!admin && <p className="m1-auth-switch">{signup ? 'Already have an account?' : "Don't have an account?"} <button onClick={() => onSwitch(signup ? 'login' : 'signup')}>{signup ? 'Log In' : 'Sign Up'}</button></p>}
    </div>
  </div>
}
