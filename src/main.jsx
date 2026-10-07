import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import App from './app/MemberOneApp'
import './styles/global.css'
import './styles/foundation.css'
import './styles/member-one.css'
import './styles/member-two.css'
window.addEventListener('error', event => { console.error('GLOBAL_ERROR_STACK', event.error?.stack || event.message) })
window.addEventListener('unhandledrejection', event => { console.error('GLOBAL_REJECTION_STACK', event.reason?.stack || event.reason) })
if (Capacitor.getPlatform() === 'android') document.body.classList.add('native-android')
createRoot(document.getElementById('root')).render(<App />)

