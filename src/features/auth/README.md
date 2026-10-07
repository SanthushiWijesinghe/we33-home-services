# auth feature

Owner: M1. `AuthProvider.tsx` manages Supabase Auth session and database profile. `EntryScreens.tsx` contains splash/onboarding/role selection; `AuthScreens.tsx` contains email login and signup. Admin accounts are assigned by a trusted operator, never public signup. Google OAuth awaits provider and deep-link setup.

