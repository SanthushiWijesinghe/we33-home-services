import { Capacitor } from '@capacitor/core'
import { requireSupabase } from '../../services/supabase/client'

export const MOBILE_AUTH_REDIRECT_URL = 'lk.we33.homeservices://auth/callback'

export function getEmailRedirectUrl() {
  return Capacitor.isNativePlatform()
    ? MOBILE_AUTH_REDIRECT_URL
    : `${window.location.origin}/auth/callback`
}

export async function completeMobileAuthRedirect(incomingUrl: string): Promise<boolean> {
  let callbackUrl: URL
  try { callbackUrl = new URL(incomingUrl) } catch { return false }

  if (callbackUrl.protocol !== 'lk.we33.homeservices:' ||
      callbackUrl.hostname !== 'auth' || callbackUrl.pathname !== '/callback') return false

  const fragment = new URLSearchParams(callbackUrl.hash.slice(1))
  const failure = fragment.get('error_description') ?? callbackUrl.searchParams.get('error_description') ??
    fragment.get('error') ?? callbackUrl.searchParams.get('error')
  if (failure) throw new Error(failure)

  const code = callbackUrl.searchParams.get('code') ?? fragment.get('code')
  if (code) {
    const { error } = await requireSupabase().auth.exchangeCodeForSession(code)
    if (error) throw error
    return true
  }

  const accessToken = fragment.get('access_token')
  const refreshToken = fragment.get('refresh_token')
  if (!accessToken || !refreshToken) throw new Error('The confirmation link did not include a session. Sign in with your email and password.')

  const { error } = await requireSupabase().auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
  if (error) throw error
  return true
}
