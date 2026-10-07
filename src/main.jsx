import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import App from './app/MemberOneApp'
import './styles/global.css'
import './styles/foundation.css'
import './styles/member-one.css'
import './styles/member-two.css'
import './styles/member-three.css'
if (Capacitor.getPlatform() === 'android') document.body.classList.add('native-android')
createRoot(document.getElementById('root')).render(<App />)

