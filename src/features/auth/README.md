# auth feature

Owner: M1. `AuthProvider.tsx` manages the Supabase Auth session and database profile. `authRedirect.ts` selects the signup callback and completes Android deep links; `EntryScreens.tsx` contains splash/onboarding/role selection; `AuthScreens.tsx` contains email login and signup. The Android intent filter is in `android/app/src/main/AndroidManifest.xml`. Supabase Authentication → URL Configuration must allow `lk.we33.homeservices://auth/callback` before confirmation emails can return to the app. Admin accounts are assigned by a trusted operator, never public signup. Google OAuth awaits provider setup.

