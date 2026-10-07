import { useEffect, useState } from 'react'
import { App as CapacitorApp } from '@capacitor/app'
import { ArrowLeft, LogOut, UserRound } from 'lucide-react'
import { useAndroidBack } from '../navigation/useAndroidBack'
import { AuthProvider, useAuth } from '../features/auth/AuthProvider'
import { AuthScreen } from '../features/auth/AuthScreens'
import { OnboardingScreen, RoleSelectScreen, SplashScreen } from '../features/auth/EntryScreens'
import { HomeScreen } from '../features/home/HomeScreen'
import { SearchProvidersScreen } from '../features/discovery/SearchProvidersScreen'
import { ProviderDetailScreen } from '../features/providers/ProviderDetailScreen'
import { ProviderDashboardScreen, ProviderRegistrationScreen } from '../features/providers/ProviderScreens'
import { AdminDashboardScreen, AdminVerificationScreen } from '../features/admin/AdminScreens'
import { BottomNav, ScreenHeader, StatusMessage } from '../shared/components/MobileUi'
import { Member2FeedbackHistoryScreen, Member2FeedbackScreen, Member2LocationScreen, Member2PaymentScreen, Member2ProfileScreen, Member2ReviewsScreen, Member2ServiceFiltersScreen } from '../features/member2/Member2Screens'
import { listApprovedProviders } from '../features/providers/provider.service'
import type { ProviderProfile } from '../features/providers/provider.types'
import { Member3AvailabilityScreen, Member3BookingScreen, Member3CategoriesScreen, Member3CustomerServicesScreen, Member3NotificationsScreen, Member3ProviderServicesScreen } from '../features/member3/Member3Screens'
import type { Member3Service } from '../features/member3/member3.types'

type Screen = 'splash' | 'onboarding' | 'role' | 'login' | 'signup' | 'admin-login' | 'home' | 'search' |
  'provider-detail' | 'provider' | 'provider-register' | 'admin' | 'verification' | 'bookings' | 'profile' | 'earnings' | 'settings' | 'member2-filters' | 'location' | 'payments' | 'feedback' | 'feedback-history' | 'reviews' |
  'member3-categories' | 'member3-services' | 'member3-availability' | 'member3-provider-services' | 'member3-booking' | 'notifications'

function MemberOneContent() {
  const auth = useAuth()
  const [screen, setScreen] = useState<Screen>('splash')
  const [ready, setReady] = useState(false)
  const [roleChoice, setRoleChoice] = useState<'CUSTOMER' | 'SERVICE_PROVIDER'>('CUSTOMER')
  const [providers, setProviders] = useState<ProviderProfile[]>([])
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [searchCategory, setSearchCategory] = useState('All')
  const [selectedProvider, setSelectedProvider] = useState<ProviderProfile | null>(null)
  const [selectedService, setSelectedService] = useState<Member3Service | null>(null)
  const [notificationReturn, setNotificationReturn] = useState<Screen>('home')

  useEffect(() => { const timer = window.setTimeout(() => setReady(true), 900); return () => window.clearTimeout(timer) }, [])
  useEffect(() => {
    if (!ready || auth.loading) return
    if (auth.profile) {
      setScreen(auth.profile.role === 'ADMIN' ? 'admin' : auth.profile.role === 'SERVICE_PROVIDER' ? 'provider' : 'home')
    } else if (!auth.session) {
      setScreen(localStorage.getItem('hs-onboarding-seen') ? 'role' : 'onboarding')
    }
  }, [ready, auth.loading, auth.profile?.id, auth.session?.user.id])

  useEffect(() => {
    if (auth.profile?.role !== 'CUSTOMER') return
    let active = true
    setCatalogLoading(true)
    void listApprovedProviders().then(items => { if (active) { setProviders(items); setCatalogError(null) } })
      .catch(cause => { if (active) setCatalogError(cause instanceof Error ? cause.message : 'Unable to load providers.') })
      .finally(() => { if (active) setCatalogLoading(false) })
    return () => { active = false }
  }, [auth.profile?.id, auth.profile?.role])

  function navigate(target: string) {
    if (target === 'notifications') setNotificationReturn(screen)
    setScreen(target as Screen); window.scrollTo(0, 0)
  }
  function openSearch(category = 'All') { setSearchCategory(category); navigate('search') }
  function back() {
    if (screen === 'provider-detail') navigate('search')
    else if (screen === 'member3-categories') navigate(auth.profile?.role === 'ADMIN' ? 'admin' : 'home')
    else if (screen === 'member3-services' || screen === 'member3-availability') navigate('provider')
    else if (screen === 'member3-provider-services') navigate('provider-detail')
    else if (screen === 'member3-booking') navigate('member3-provider-services')
    else if (screen === 'notifications') navigate(notificationReturn)
    else if (screen === 'member2-filters') navigate('search')
    else if (screen === 'search' || screen === 'bookings' || screen === 'profile') navigate('home')
    else if (screen === 'location' || screen === 'payments' || screen === 'feedback' || screen === 'feedback-history' || screen === 'reviews') navigate('profile')
    else if (screen === 'provider-register' || screen === 'earnings') navigate('provider')
    else if (screen === 'verification' || screen === 'settings') navigate('admin')
    else if (screen === 'login' || screen === 'signup' || screen === 'admin-login') navigate('role')
    else if (screen === 'role') navigate('onboarding')
    else void CapacitorApp.exitApp()
  }
  useAndroidBack(back)

  function selectRole(role: 'CUSTOMER' | 'SERVICE_PROVIDER') { setRoleChoice(role); navigate('login') }
  function finishOnboarding() { localStorage.setItem('hs-onboarding-seen', '1'); navigate('role') }
  function selectProvider(provider: ProviderProfile) { setSelectedProvider(provider); navigate('provider-detail') }
  function selectService(service: Member3Service) { setSelectedService(service); navigate('member3-booking') }

  let content
  if (!ready || auth.loading) content = <SplashScreen/>
  else if (auth.error && auth.session && !auth.profile) content = <div className="m1-page"><div className="m1-setup-error">
    <StatusMessage kind="error">{auth.error}</StatusMessage><button onClick={() => void auth.signOut()}>Sign out</button></div></div>
  else if (screen === 'onboarding') content = <OnboardingScreen onContinue={finishOnboarding}/>
  else if (screen === 'role' || screen === 'splash') content = <RoleSelectScreen onCustomer={() => selectRole('CUSTOMER')}
    onProvider={() => selectRole('SERVICE_PROVIDER')} onAdmin={() => navigate('admin-login')}/>
  else if (screen === 'login' || screen === 'signup' || screen === 'admin-login') content = <AuthScreen key={screen + roleChoice}
    mode={screen} role={roleChoice} onBack={() => navigate('role')} onSwitch={mode => navigate(mode)}/>
  else if (!auth.profile) content = <SplashScreen/>
  else if (screen === 'home' && auth.profile.role === 'CUSTOMER') content = <HomeScreen profile={auth.profile} providers={providers}
    loading={catalogLoading} error={catalogError} onSearch={openSearch} onProvider={selectProvider} onNavigate={navigate}/>
  else if (screen === 'search' && auth.profile.role === 'CUSTOMER') content = <SearchProvidersScreen key={searchCategory}
    providers={providers} loading={catalogLoading} error={catalogError} initialCategory={searchCategory} onProvider={selectProvider} onNavigate={navigate} onFilter={() => navigate('member2-filters')}/>
  else if (screen === 'provider-detail' && auth.profile.role === 'CUSTOMER' && selectedProvider) content = <ProviderDetailScreen
    provider={selectedProvider} onBack={back} onNavigate={navigate}/>
  else if (screen === 'member3-categories' && (auth.profile.role === 'CUSTOMER' || auth.profile.role === 'ADMIN')) content = <Member3CategoriesScreen
    isAdmin={auth.profile.role === 'ADMIN'} onBack={back} onCategory={openSearch} onNavigate={navigate}/>
  else if (screen === 'member3-provider-services' && auth.profile.role === 'CUSTOMER' && selectedProvider) content = <Member3CustomerServicesScreen
    provider={selectedProvider} onBack={back} onService={selectService} onNavigate={navigate}/>
  else if (screen === 'member3-booking' && auth.profile.role === 'CUSTOMER' && selectedProvider && selectedService) content = <Member3BookingScreen
    provider={selectedProvider} service={selectedService} onBack={back} onNavigate={navigate}/>
  else if (screen === 'provider' && auth.profile.role === 'SERVICE_PROVIDER') content = <ProviderDashboardScreen profile={auth.profile} onNavigate={navigate}/>
  else if (screen === 'member3-services' && auth.profile.role === 'SERVICE_PROVIDER') content = <Member3ProviderServicesScreen
    profile={auth.profile} onBack={back} onNavigate={navigate}/>
  else if (screen === 'member3-availability' && auth.profile.role === 'SERVICE_PROVIDER') content = <Member3AvailabilityScreen
    profile={auth.profile} onBack={back} onNavigate={navigate}/>
  else if (screen === 'provider-register' && auth.profile.role === 'SERVICE_PROVIDER') content = <ProviderRegistrationScreen
    profile={auth.profile} onBack={back} onNavigate={navigate}/>
  else if (screen === 'admin' && auth.profile.role === 'ADMIN') content = <AdminDashboardScreen profile={auth.profile} onNavigate={navigate}/>
  else if (screen === 'verification' && auth.profile.role === 'ADMIN') content = <AdminVerificationScreen onNavigate={navigate}/>
  else if (screen === 'notifications') content = <Member3NotificationsScreen profile={auth.profile} onBack={back} onNavigate={navigate}/>
  else if (screen === 'member2-filters' && auth.profile.role === 'CUSTOMER') content = <Member2ServiceFiltersScreen providers={providers} initialCategory={searchCategory} onProvider={selectProvider} onBack={back} onNavigate={navigate}/>
  else if (screen === 'profile' && auth.profile.role === 'CUSTOMER') content = <Member2ProfileScreen profile={auth.profile} onBack={back} onNavigate={navigate} onProfileUpdated={() => { void auth.refreshProfile() }} onSignOut={() => void auth.signOut()}/>
  else if (screen === 'location' && auth.profile.role === 'CUSTOMER') content = <Member2LocationScreen profile={auth.profile} onBack={back}/>
  else if (screen === 'payments' && auth.profile.role === 'CUSTOMER') content = <Member2PaymentScreen profile={auth.profile} onBack={back}/>
  else if (screen === 'feedback' && auth.profile.role === 'CUSTOMER') content = <Member2FeedbackScreen profile={auth.profile} onBack={back} onNavigate={navigate}/>
  else if (screen === 'feedback-history' && auth.profile.role === 'CUSTOMER') content = <Member2FeedbackHistoryScreen profile={auth.profile} onBack={back}/>
  else if (screen === 'reviews' && auth.profile.role === 'CUSTOMER') content = <Member2ReviewsScreen providers={providers} onBack={back} onProvider={selectProvider}/>
  else if (screen === 'bookings' && auth.profile.role === 'CUSTOMER') content = <div className="m1-page">
    <ScreenHeader title="My Bookings" onBack={back}/><main className="m1-scroll m1-placeholder">
      <h1>Your bookings</h1><p>Your confirmed services will appear here.</p></main>
    <BottomNav kind="customer" current={screen} onNavigate={navigate}/></div>
  else if ((screen === 'earnings' && auth.profile.role === 'SERVICE_PROVIDER') || (screen === 'settings' && auth.profile.role === 'ADMIN')) content = <div className="m1-page">
    <ScreenHeader title={screen === 'settings' ? 'Admin Settings' : 'Earnings'} onBack={back}/><main className="m1-scroll m1-placeholder">
      <h1>{screen === 'settings' ? auth.profile.full_name : 'Earnings'}</h1>
      <p>{screen === 'settings' ? auth.session?.user.email : 'Completed booking earnings will appear here.'}</p>
      {screen === 'settings' && <button className="m1-secondary-btn" onClick={() => void auth.signOut()}><LogOut size={17}/> Log Out</button>}</main>
    <BottomNav kind={auth.profile.role === 'ADMIN' ? 'admin' : 'provider'} current={screen} onNavigate={navigate}/></div>
  else content = <div className="m1-page"><StatusMessage kind="error">This account cannot access that screen.</StatusMessage>
    <button className="m1-secondary-btn" onClick={back}><ArrowLeft size={16}/> Go back</button></div>

  return <div className="m1-app">{content}</div>
}

export default function MemberOneApp() { return <AuthProvider><MemberOneContent/></AuthProvider> }


