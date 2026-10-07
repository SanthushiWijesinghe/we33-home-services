import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import App from './app/App'
import './styles/global.css'
import './styles/foundation.css'
if (Capacitor.getPlatform() === 'android') document.body.classList.add('native-android')
createRoot(document.getElementById('root')).render(<App />)
