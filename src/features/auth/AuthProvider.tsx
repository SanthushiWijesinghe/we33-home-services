import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { App as CapacitorApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { requireSupabase, supabase } from '../../services/supabase/client'
import type { UserRole } from '../../shared/types/roles'
import { completeMobileAuthRedirect, getEmailRedirectUrl } from './authRedirect'

export type AppProfile = { id: string; full_name: string; role: UserRole; phone: string | null }
type SignupRole = Extract<UserRole, 'CUSTOMER' | 'SERVICE_PROVIDER'>
type AuthValue = {
  session: Session | null
  profile: AppProfile | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string, role: SignupRole) => Promise<boolean>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<AppProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) { setLoading(false); setError('Supabase environment variables are missing.'); return }
    let active = true
    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return
      setSession(data.session)
      if (sessionError) setError(sessionError.message)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) { setSession(nextSession); if (!nextSession) setProfile(null) }
    })
    return () => { active = false; listener.subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    if (!supabase || !Capacitor.isNativePlatform()) return
    let active = true
    let lastUrl: string | null = null
    const handleUrl = async (url: string) => {
      if (url === lastUrl) return
      lastUrl = url
      try {
        const handled = await completeMobileAuthRedirect(url)
        if (handled && active) setError(null)
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : 'Unable to complete email confirmation.')
      }
    }
    const subscription = CapacitorApp.addListener('appUrlOpen', event => { void handleUrl(event.url) })
    void subscription.then(async listener => {
      if (!active) { await listener.remove(); return }
      const launch = await CapacitorApp.getLaunchUrl()
      if (launch?.url) await handleUrl(launch.url)
    }).catch(cause => { if (active) setError(cause instanceof Error ? cause.message : 'Unable to open the confirmation link.') })
    return () => { active = false; void subscription.then(listener => listener.remove()).catch(() => undefined) }
  }, [])

  useEffect(() => {
    if (!session?.user.id || !supabase) { setProfile(null); return }
    let active = true
    setLoading(true)
    void supabase.from('profiles').select('id, full_name, role, phone').eq('id', session.user.id).single()
      .then(({ data, error: profileError }) => {
        if (!active) return
        setProfile(profileError ? null : data as AppProfile)
        setError(profileError ? `Account profile unavailable: ${profileError.message}. Apply the Supabase migration first.` : null)
        setLoading(false)
      })
    return () => { active = false }
  }, [session?.user.id])

  const value = useMemo<AuthValue>(() => ({
    session, profile, loading, error,
    async signIn(email, password) {
      const { error: signInError } = await requireSupabase().auth.signInWithPassword({ email, password })
      if (signInError) throw signInError
    },
    async signUp(name, email, password, role) {
      const { data, error: signupError } = await requireSupabase().auth.signUp({
        email, password, options: { data: { full_name: name, role }, emailRedirectTo: getEmailRedirectUrl() },
      })
      if (signupError) throw signupError
      return Boolean(data.session)
    },
    async signOut() {
      const { error: signoutError } = await requireSupabase().auth.signOut()
      if (signoutError) throw signoutError
      setProfile(null)
    },
    async refreshProfile() {
      if (!session) return
      const { data, error: profileError } = await requireSupabase().from('profiles')
        .select('id, full_name, role, phone').eq('id', session.user.id).single()
      if (profileError) throw profileError
      setProfile(data as AppProfile)
    },
  }), [session, profile, loading, error])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
